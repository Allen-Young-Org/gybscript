/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { serverTimestamp } from "firebase/firestore";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import AlertBoxError from "@/components/ui/AlertBoxError";
import AlertBox from "@/components/ui/AlertBox";
import Library from "../MyLibrary";
import { useAuth } from "@/providers/AuthProvider";
import { v4 as uuidv4 } from "uuid";
import {
  useAddDocumentWithProperties,
  useUpdateDocumentsWithProperties
} from "@/api/firebaseHooks";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

// ----- Type Definitions -----
interface SongEntry {
  songID: string;
  title: string;
  track: number;
}

interface SetListData {
  setListName: string;
  songs: SongEntry[];
  setListID: string;
}

interface SetListFormValues {
  setListName: string;
}

interface AddSetListProps {
  item?: SetListData;
  clearItem?: () => void;
  redirectEdit?: (destination: string) => void;
}

// ----- Component -----
const AddSetList: React.FC<AddSetListProps> = ({
  item,
  clearItem,
  redirectEdit,
}) => {
  const { userDetails } = useAuth();
  const {
    formState: { errors },
    register,
    handleSubmit,
    setValue,
    reset,
  } = useForm<SetListFormValues>({ defaultValues: {} });

  const [onLoad, setOnLoading] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [selectedSong, setSelectedSong] = useState<SongEntry[]>([]);
  const [showDialogErrorSongList, setShowDialogErrorSongList] =
    useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>(
    "You have successfully created your set list!"
  );
  //const [songs, setSongs] = useState<any[]>([]);

  // Pre-populate form if updating
  useEffect(() => {
    reset();
    if (item) {
      setValue("setListName", item.setListName);
      if (item.songs && item.songs.length > 0) {
        setSelectedSong(item.songs);
      }
      setSuccessMessage("You have successfully updated your setlist!");
    }
  }, [item, reset, setValue]);

  //  Handlers for including and removing songs with track numbers
  const handleIncludeSong = (songID: string, songTitle: string) => {
    setSelectedSong((prevIDs) => [
      ...prevIDs,
      { songID, title: songTitle, track: prevIDs.length + 1 },
    ]);
  };

  const handleRemoveSong = (songID: string) => {
    setSelectedSong((prevIDs) =>
      prevIDs
        .filter((song) => song.songID !== songID)
        .map((song, index) => ({ ...song, track: index + 1 }))
    );
  };

  // After successful submit, clear form and selected songs
  const successSubmit = () => {
    setSelectedSong([]);
    reset();
    if (clearItem) {
      clearItem();
    }
    if (redirectEdit) {
      redirectEdit("Setlists");
    }
  };

  // --- TanStack Query CRUD Hooks Integration ---
  // Create a mutation hook for adding a new setlist
  const addSetListMutation = useAddDocumentWithProperties("GYBsetList");
  // Create a mutation hook for updating a setlist using item?.setListID as query field.
  const updateSetListMutation = useUpdateDocumentsWithProperties("GYBsetList", {
    setListID: item ? item.setListID : "",
  });

  // Form submission handler using TanStack Query hooks
  const handleFormSubmit: SubmitHandler<SetListFormValues> = async (data) => {
    if (selectedSong.length === 0) {
      setShowDialogErrorSongList(true);
      return;
    }
    setOnLoading(true);
    try {
      if (item) {
        // Update existing setlist using the update mutation hook
        const updateData = {
          setListName: data.setListName,
          songs: selectedSong,
          updatedTimestamp: serverTimestamp(),
        };
        await updateSetListMutation.mutateAsync(updateData);
      } else {
        // Create new setlist using the add mutation hook
        const newSetListData = {
          setListName: data.setListName,
          songs: selectedSong,
          status: "active",
          timestamp: serverTimestamp(),
          updatedTimestamp: serverTimestamp(),
          userId: userDetails ? (userDetails as any).userId : "",
          setListID: uuidv4(),
        };
        await addSetListMutation.mutateAsync(newSetListData);
      }
      setOnLoading(false);
      setShowDialog(true);
    } catch (error) {
      console.error("Error saving setlist:", error);
      setOnLoading(false);
    }
  };

  const handleCancel = () => {
    if (clearItem) {
      clearItem();
    }
    if (redirectEdit) {
      redirectEdit("Setlists");
    }
  };

  // Draggable list handler: When drag ends, update order and track numbers
  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(selectedSong);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    const updatedItems = items.map((song, index) => ({
      ...song,
      track: index + 1,
    }));
    setSelectedSong(updatedItems);
  };

  return (
    <div>
      {onLoad && <LoadingSpinner />}
      <form className="mt-8" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="w-full">
          <FloatingLabelInput
            className="w-full"
            label="Set list name"
            {...register("setListName", {
              required: "Set List name is required",
            })}
            error={errors.setListName?.message}
          />
        </div>
        <div>
          <div>
            <div className="text-lg mb-1 font-semibold">Music list</div>
            <div>
              {selectedSong.length > 0 ? (
                <DragDropContext onDragEnd={handleOnDragEnd}>
                  <Droppable droppableId="selectedSongs">
                    {(provided) => (
                      <ul {...provided.droppableProps} ref={provided.innerRef}>
                        {selectedSong.map((song, index) => (
                          <Draggable
                            key={song.songID}
                            draggableId={song.songID}
                            index={index}
                          >
                            {(provided) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="flex dark:text-white justify-between items-center mb-2 p-2 border border-gray-300 rounded"
                              >
                                <span className="dark:text-white">
                                  {song.track}. {song.title}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSong(song.songID)}
                                  className="ml-2 text-red-500"
                                >
                                  Remove
                                </button>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <p>No songs selected.</p>
              )}
            </div>
          </div>
          <div className="w-[70%] flex justify-end">
            <div className="flex justify-end mt-2 w-full">
              <Library
                imported={true}
                onIncludeSong={handleIncludeSong}
                selectedSongIDs={selectedSong.map((song) => ({
                  songID: song.songID,
                  songTitle: song.title,
                }))}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          {item ? (
            <div className="flex space-x-2">
              <Button
                type="button"
                onClick={handleCancel}
                className="bg-red-600 hover:bg-red-600/90 text-white w-24 mt-2 ml-2"
              >
                <span className="self-stretch my-auto">Cancel</span>
              </Button>
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-white w-24 mt-2"
              >
                <span className="self-stretch my-auto">Update</span>
              </Button>
            </div>
          ) : (
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-white w-24 mt-2"
            >
              <span className="self-stretch my-auto">Save setlist</span>
            </Button>
          )}
        </div>
      </form>
      <AlertBox
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        onstepComplete={() => {
          setShowDialog(false);
          successSubmit();
        }}
        title="Success!"
        description={successMessage}
      />
      <AlertBoxError
        showDialog={showDialogErrorSongList}
        setShowDialog={setShowDialogErrorSongList}
        onstepComplete={() => {}}
        title="Error!"
        description="Please pick at least one song!"
      />
    </div>
  );
};

export default AddSetList;
