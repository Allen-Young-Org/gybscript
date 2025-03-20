/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { serverTimestamp } from "firebase/firestore";

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

// Define interfaces for your data
interface BandMember {
  name: string;
}

interface Band {
  id: string; // document id from Firestore
  bandName: string;
  bandMembers: BandMember[];
  bandID: string;
  status: string;
}

interface AddBandComponentProps {
  redirectEdit: (page: string, item?: Band) => void;
}

const AddBandComponent: React.FC<AddBandComponentProps> = ({
  redirectEdit,
}) => {
  const { userDetails } = useAuth();

  // State for deletion
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [showDialogDelete, setShowDialogDelete] = useState<boolean>(false);
  const [showDialogError, setShowDialogError] = useState<boolean>(false);
  const [showDialogDeleteSuccess, setShowDialogDeleteSuccess] =
    useState<boolean>(false);

  // Use your custom hook to fetch bands for the current user where status is active.

  const {
    data: bandsData,
    isLoading: isBandsLoading,
    refetch: refetchBands,
  } = useDocumentByFields("bands", {
    userId: (userDetails as any)?.userId,
    status: "active",
  });

  const bands: Band[] = bandsData
    ? bandsData.map((doc: any) => ({
      id: doc.id, // assuming your document has an id
      bandName: doc.bandName,
      bandMembers: doc.bandMembers,
      bandID: doc.bandID,
      status: doc.status,
    }))
    : [];

  // For updating a band (i.e. marking as inactive) we create a mutation.
  // Note: Our custom hook 'useUpdateDocumentsWithProperties' expects fixed query fields.
  // Since the band to delete is dynamic, we conditionally call the mutation only when toDelete is set.
  const updateBandMutation = useUpdateDocumentsWithProperties("bands", {
    bandID: toDelete || "", // if toDelete is null, we pass an empty string (and won't call mutation)
  });

  // Handler when user clicks delete icon.
  const handleDelete = (bandID: string) => {
    setToDelete(bandID);
    setShowDialogDelete(true);
  };

  const handleEdit = (item: Band) => {
    redirectEdit("Add Band", item);
  };

  // Called after confirming deletion in the AlertBoxOption dialog.
  const deleteBand = async () => {
    // Only proceed if a bandID is selected
    if (!toDelete) return;
    try {
      // Call our mutation to update (mark inactive) the band(s) with the matching bandID.
      updateBandMutation.mutate(
        { status: "inactive", updatedTimestamp: serverTimestamp() },
        {
          onSuccess: () => {
            // On success, refetch bands and show success dialog.
            refetchBands();
            setShowDialogDeleteSuccess(true);
          },
          onError: () => {
            setShowDialogError(true);
          },
        }
      );
    } catch (error) {
      console.error("Error deleting band:", error);
      setShowDialogError(true);
    }
  };

  return (
    <div className="mt-2">
      {isBandsLoading && <LoadingSpinner />}
      <table className="w-full rounded-md">
        <thead className="text-[#324054] dark:text-white dark:bg-gray-600/50 bg-gray-100 rounded-md border-2 border-gray-300">
          <tr>
            <th className="p-3 text-left">Band Name</th>
            <th className="p-3 text-left">Members</th>
            <th className="p-3 text-left"></th>
          </tr>
        </thead>
        <tbody>
          {bands.map((item, index) => (
            <tr
              key={index}
              className="text-md leading-none dark:text-white dark:bg-gray-600/0 dark:border-gray-200/20 border-b border-gray-200 bg-white"
            >
              <td className="p-3 whitespace-normal">{item.bandName}</td>
              <td className="p-3 whitespace-normal">
                {item.bandMembers.map((member, idx) => (
                  <span key={idx}>
                    {member.name}
                    {idx < item.bandMembers.length - 1 && ", "}
                  </span>
                ))}
              </td>
              <td className="p-3 whitespace-normal">
                <span className="flex justify-end">
                  {item.status !== "previous" && (
                    <>
                      <img
                        src={pen}
                        className="mr-2 cursor-pointer"
                        onClick={() => handleEdit(item)}
                        alt="edit"
                      />
                      <img
                        src={trash}
                        className="mr-2 cursor-pointer"
                        onClick={() => handleDelete(item.bandID)}
                        alt="delete"
                      />
                    </>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirm Delete Alert */}
      <AlertBoxOption
        showDialog={showDialogDelete}
        setShowDialog={setShowDialogDelete}
        onstepComplete={() => {
          deleteBand();
        }}
        title="Warning!"
        description="Are you sure to delete this band?!"
      />

      {/* Error Alert */}
      <AlertBoxError
        showDialog={showDialogError}
        setShowDialog={setShowDialogError}
        onstepComplete={() => { }}
        title="Error!"
        description="No such band found!"
      />

      {/* Success Alert */}
      <AlertBox
        showDialog={showDialogDeleteSuccess}
        setShowDialog={setShowDialogDeleteSuccess}
        onstepComplete={() => { }}
        title="Success!"
        description="You have deleted your band!"
      />
    </div>
  );
};

export default AddBandComponent;
