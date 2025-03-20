import { useState, useEffect } from "react";
import {
  collection,
  serverTimestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "@/firebase";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import AlertBoxOption from "@/components/ui/AlertBoxOption";
import AlertBoxError from "@/components/ui/AlertBoxError";
import AlertBox from "@/components/ui/AlertBox";
import { useAuth } from "@/providers/AuthProvider";
import pen from "@/assets/image/gybLive/pen.png";
import trash from "@/assets/image/gybLive/trash.png";
import {
  useDocumentByFields,
  useUpdateDocumentsWithProperties,
} from "@/api/firebaseHooks";


// Define the Performance interface (including computed fields)
interface Performance {
  docId: string;
  performanceName: string;
  eventType: string;
  setList: string;
  band: string;
  dateOfRelease: string;
  venueId: string;
  performanceID: string;
  status: string;
  // Computed fields:
  setName?: string;
  bandName?: string;
  venueName?: string;
  venueCity?: string;
  venueState?: string;
  venueStreetAddress?: string;
  venueZip?: string;
  [key: string]: any;
}

interface PerformanceListProps {
  redirectEdit: (page: string, item?: Performance) => void;
}

// Helper: chunk an array into smaller arrays of size chunkSize
const chunkArray = <T,>(arr: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
};

const PerformanceList: React.FC<PerformanceListProps> = ({ redirectEdit }) => {
  const { userDetails } = useAuth();


  const [performance, setPerformance] = useState<Performance[]>([]);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [showDialogDelete, setShowDialogDelete] = useState<boolean>(false);
  const [showDialogError, setShowDialogError] = useState<boolean>(false);
  const [showDialogDeleteSuccess, setShowDialogDeleteSuccess] =
    useState<boolean>(false);

  // Fetch performances using your custom hook:
  const {
    data: performanceData,
    isLoading: isPerformanceLoading,
    refetch: refetchPerformance,
  } = useDocumentByFields("performances", {
    userId: (userDetails as any)?.userId,
    status: "active",
  });

  // Process the fetched performance data, adding additional details:
  useEffect(() => {
    const processPerformanceData = async () => {
      if (!performanceData) return;

      // Map raw data into Performance objects (include the Firestore document id)
      const performanceList: Performance[] = performanceData.map(
        (doc: any) => ({
          ...doc,
          docId: doc.id,
        })
      );

      // Extract unique ids from the performance list for bands, setlists, and venues:
      const uniqueBandIds = Array.from(
        new Set(performanceList.map((p) => p.band))
      );
      const uniqueSetIDs = Array.from(
        new Set(performanceList.map((p) => p.setList))
      );
      const uniqueVenueIDs = Array.from(
        new Set(performanceList.map((p) => p.venueId))
      );

      const chunkSize = 10;
      const bandChunks = chunkArray(uniqueBandIds, chunkSize);
      const setChunks = chunkArray(uniqueSetIDs, chunkSize);
      const venueChunks = chunkArray(uniqueVenueIDs, chunkSize);

      // Create maps for band names, set names, and venue details:
      const bandsMap: Record<string, string> = {};
      for (const chunk of bandChunks) {
        const bandsQuery = query(
          collection(db, "bands"),
          where("bandID", "in", chunk)
        );
        const bandsSnapshot = await getDocs(bandsQuery);
        bandsSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          bandsMap[data.bandID] = data.bandName;
        });
      }

      const setMap: Record<string, string> = {};
      for (const chunk of setChunks) {
        const setQuery = query(
          collection(db, "GYBsetList"),
          where("setListID", "in", chunk)
        );
        const setSnapshot = await getDocs(setQuery);
        setSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          setMap[data.setListID] = data.setListName;
        });
      }

      const venueMap: Record<
        string,
        {
          venueName: string;
          venueCity: string;
          venueState: string;
          venueStreetAddress: string;
          venueZip: string;
        }
      > = {};
      for (const chunk of venueChunks) {
        const venueQuery = query(
          collection(db, "venues"),
          where("venueId", "in", chunk)
        );
        const venueSnapshot = await getDocs(venueQuery);
        venueSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          venueMap[data.venueId] = {
            venueName: data.venueName,
            venueCity: data.venueCity,
            venueState: data.venueState,
            venueStreetAddress: data.venueStreetAddress,
            venueZip: data.venueZip,
          };
        });
      }

      // Map each performance to include computed fields:
      const performanceListWithDetails = performanceList.map((p) => ({
        ...p,
        bandName: bandsMap[p.band] || "Unknown Band",
        setName: setMap[p.setList] || "Unknown Set",
        venueName: venueMap[p.venueId]?.venueName || "Unknown Venue",
        venueCity: venueMap[p.venueId]?.venueCity || "Unknown City",
        venueState: venueMap[p.venueId]?.venueState || "Unknown State",
        venueStreetAddress: venueMap[p.venueId]?.venueStreetAddress || "",
        venueZip: venueMap[p.venueId]?.venueZip || "",
      }));

      setPerformance(performanceListWithDetails);
    };

    processPerformanceData();
  }, [performanceData]);

  // Mutation: Delete (mark inactive) a performance using your custom hook.
  const deletePerformanceMutation = useUpdateDocumentsWithProperties(
    "performances",
    {
      performanceID: toDelete || "",
    }
  );

  const handleDelete = (performanceID: string) => {
    setToDelete(performanceID);
    setShowDialogDelete(true);
  };

  const handleEdit = (item: Performance) => {
    if (redirectEdit) {
      redirectEdit("Add Performance", item);
    }
  };

  const deletePerformance = async () => {
    if (!toDelete) return;
    try {
      deletePerformanceMutation.mutate(
        { status: "inactive", updatedTimestamp: serverTimestamp() },
        {
          onSuccess: () => {
            refetchPerformance();
            setShowDialogDeleteSuccess(true);
          },
          onError: () => {
            setShowDialogError(true);
          },
        }
      );
    } catch (error) {
      console.error("Error deleting performance:", error);
      setShowDialogError(true);
    }
  };

  return (
    <div className="mt-2">
      {isPerformanceLoading && <LoadingSpinner />}
      <table className="w-full rounded-md">
        <thead className="text-[#324054] dark:text-white dark:bg-gray-600/50 bg-gray-100 rounded-md border-2 border-gray-300">
          <tr>
            <th className="p-3 text-left">Performance name</th>
            <th className="p-3 text-left">Event type</th>
            <th className="p-3 text-left">Setlist</th>
            <th className="p-3 text-left">Band</th>
            <th className="p-3 text-left">Release date</th>
            <th className="p-3 text-left">Venue</th>
            <th className="p-3 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {performance.map((item, index) => (
            <tr
              key={index}
              className="text-md leading-none dark:text-white dark:bg-gray-600/0 dark:border-gray-200/20 border-b border-gray-200 bg-white"
            >
              <td className="p-3 whitespace-normal">{item.performanceName}</td>
              <td className="p-3 whitespace-normal">{item.eventType}</td>
              <td className="p-3 whitespace-normal">{item.setName}</td>
              <td className="p-3 whitespace-normal">{item.bandName}</td>
              <td className="p-3 whitespace-normal">{item.dateOfRelease}</td>
              <td className="p-3 whitespace-normal break-words max-w-24">
                {`${item.venueName} ${item.venueStreetAddress || ""}, ${
                  item.venueCity || ""
                } ${item.venueState || ""}, ${item.venueZip || ""}`}
              </td>
              <td className="p-3 whitespace-normal">
                <span className="flex justify-end">
                  {item.status !== "previous" && (
                    <>
                      <img
                        src={pen}
                        alt="Edit"
                        className="mr-2 cursor-pointer"
                        onClick={() => handleEdit(item)}
                      />
                      <img
                        src={trash}
                        alt="Delete"
                        className="mr-2 cursor-pointer"
                        onClick={() => handleDelete(item.performanceID)}
                      />
                    </>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AlertBoxOption
        showDialog={showDialogDelete}
        setShowDialog={setShowDialogDelete}
        onstepComplete={deletePerformance}
        title="Warning!"
        description="Are you sure to delete this performance?!"
      />
      <AlertBoxError
        showDialog={showDialogError}
        setShowDialog={setShowDialogError}
        onstepComplete={() => {}}
        title="Error!"
        description="Performance not found or could not be deleted!"
      />
      <AlertBox
        showDialog={showDialogDeleteSuccess}
        setShowDialog={setShowDialogDeleteSuccess}
        onstepComplete={() => {}}
        title="Success!"
        description="You have deleted your performance!"
      />
    </div>
  );
};

export default PerformanceList;
