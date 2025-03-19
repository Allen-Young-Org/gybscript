/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../../firebase";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import AlertBoxOption from "@/components/ui/AlertBoxOption";
import AlertBoxError from "@/components/ui/AlertBoxError";
import AlertBox from "@/components/ui/AlertBox";
import { useAuth } from "@/providers/AuthProvider";
import pen from "../../../assets/image/gybLive/pen.png";
import trash from "../../../assets/image/gybLive/trash.png";
import {
  useDocumentByFields,
  useUpdateDocumentsWithProperties,
} from "@/api/firebaseHooks";

// Define a SetList interface for our data
interface SetList {
  docId: string;
  setListName: string;
  setListID: string;
  songs?: any[];
  songTitles: string[];
  status: string;
  // Add any extra fields as needed
}

interface SetListProps {
  redirectEdit: (page: string, item?: SetList) => void;
}

const SetListComponent: React.FC<SetListProps> = ({ redirectEdit }) => {
  const { userDetails } = useAuth();

  // State to hold the mapped setlists with updated song titles
  const [setLists, setSetLists] = useState<SetList[]>([]);

  // States for deletion dialogs
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [showDialogDelete, setShowDialogDelete] = useState<boolean>(false);
  const [showDialogError, setShowDialogError] = useState<boolean>(false);
  const [showDialogDeleteSuccess, setShowDialogDeleteSuccess] =
    useState<boolean>(false);

  // Fetch setlists using your custom hook following the same pattern as the bands query.
  const {
    data: setListsData,
    isLoading: isSetListsLoading,
    refetch: refetchSetLists,
  } = useDocumentByFields("GYBsetList", {
    userId: (userDetails as any)?.userId,
    status: "active",
  });

  // Map fetched documents into typed SetList items and update song titles.
  useEffect(() => {
    const updateSongTitles = async () => {
      if (!setListsData) return;

      // Map each document into a basic SetList item.
      const initialLists: SetList[] = setListsData.map((doc: any) => ({
        docId: doc.id,
        setListName: doc.setListName,
        setListID: doc.setListID,
        songs: doc.songs,
        songTitles: [], // initial empty array; we'll update below
        status: doc.status,
      }));

      // For each setlist, fetch the song titles from "musicUploads"
      const musicUploadsRef = collection(db, "musicUploads");
      const updatedLists = await Promise.all(
        initialLists.map(async (list) => {
          if (list.songs && list.songs.length > 0) {
            const songGroup = list.songs.map(
              (indiSong: any) => indiSong.songID
            );
            if (songGroup.length === 0) {
              return { ...list, songTitles: [] };
            }
            const songsQuery = query(
              musicUploadsRef,
              where("songID", "in", songGroup)
            );
            const songsSnapshot = await getDocs(songsQuery);
            const songTitles = songsSnapshot.docs.map(
              (doc) => (doc.data() as any).SongTitle
            );
            return { ...list, songTitles };
          }
          return { ...list, songTitles: [] };
        })
      );
      setSetLists(updatedLists);
    };

    updateSongTitles();
  }, [setListsData]);

  // Mutation hook to update (i.e. "delete" by marking inactive) a setlist.
  // We pass the query field object using the setListID to match.
  const deleteSetlistMutation = useUpdateDocumentsWithProperties("GYBsetList", {
    setListID: toDelete || "",
  });

  const handleDelete = (setListID: string) => {
    setToDelete(setListID);
    setShowDialogDelete(true);
  };

  const handleEdit = (item: SetList) => {
    redirectEdit("Add Setlist", item);
  };

  const deleteSetlist = async () => {
    if (!toDelete) return;
    try {
      deleteSetlistMutation.mutate(
        { status: "inactive", updatedTimestamp: serverTimestamp() },
        {
          onSuccess: () => {
            refetchSetLists();
            setShowDialogDeleteSuccess(true);
          },
          onError: () => {
            setShowDialogError(true);
          },
        }
      );
    } catch (error) {
      console.error("Error deleting setlist:", error);
      setShowDialogError(true);
    }
  };

  return (
    <div className="mt-2">
      {isSetListsLoading && <LoadingSpinner />}
      <table className="w-full rounded-md">
        <thead className="text-[#324054] dark:text-white dark:bg-gray-600/50 bg-gray-100 rounded-md border-2 border-gray-300">
          <tr>
            <th className="p-3 text-left">Set list name</th>
            <th className="p-3 text-left">Songs</th>
            <th className="p-3 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {setLists.map((item, index) => (
            <tr
              key={index}
              className="text-md dark:text-white dark:bg-gray-600/0 dark:border-gray-200/20 leading-none border-b border-gray-200 bg-white"
            >
              <td className="p-3 whitespace-normal">{item.setListName}</td>
              <td className="p-3 whitespace-normal">
                {item.songTitles &&
                  item.songTitles.map((song, idx) => (
                    <span key={idx}>
                      {song}
                      {idx < item.songTitles.length - 1 && ", "}
                    </span>
                  ))}
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
                        onClick={() => handleDelete(item.setListID)}
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
        onstepComplete={deleteSetlist}
        title="Warning!"
        description="Are you sure to delete this setlist?!"
      />

      <AlertBoxError
        showDialog={showDialogError}
        setShowDialog={setShowDialogError}
        onstepComplete={() => {}}
        title="Error!"
        description="No such setlist found!"
      />

      <AlertBox
        showDialog={showDialogDeleteSuccess}
        setShowDialog={setShowDialogDeleteSuccess}
        onstepComplete={() => {}}
        title="Success!"
        description="You have deleted your setlist!"
      />
    </div>
  );
};

export default SetListComponent;
