import React, { useState, useCallback, useEffect, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/providers/AuthProvider";
import { FloatingLabelCombobox } from "@/components/ui/ComboboxFloatingLabel";
import Library from "./MyLibrary";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import AlertBox from "@/components/ui/AlertBox";
import AlertBoxError from "@/components/ui/AlertBoxError";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import {
  useAddDocumentWithProperties,
  useUpdateDocumentsWithProperties,
} from "@/api/firebaseHooks";
// Import from @hello-pangea/dnd instead of react-beautiful-dnd
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

// Define a type for a selected song including track number.
interface SelectedSong {
  songID: string;
  songTitle: string;
  track: number;
}

// Define an interface for the album form values.
interface AlbumFormValues {
  albumPic?: File;
  artistName: string;
  albumName: string;
  genre: string;
  producers: { name: string }[];
  publisher: string;
  label: string;
  explicit: string;
  AlbumType: string;
  selectedSongs: SelectedSong[];
  status?: string;
  upc?: string;
  isrc?: string;
  albumID?: string;
  userId?: string;
  // Fields set after file upload:
  songPicURL?: string;
  songPicName?: string;
  // Timestamps (could use Firestore Timestamp type)
  timestamp?: any;
  updatedTimestamp?: any;
}

const UploadAlbum: React.FC = () => {
  const navigate = useNavigate();
  const { userDetails } = useAuth();
  // Derive a user ID from userDetails (adjust as needed)
  const userId: string = userDetails
    ? (userDetails as any).userId || (userDetails as any).uid
    : "";

  const genres = [
    "Jazz",
    "Hip Hop",
    "R & B",
    "Rock",
    "Pop",
    "Country",
    "Metal Rock",
    "Alternative Rock",
  ].map((genre) => ({ label: genre, value: genre }));

  // Use SelectedSong type for state
  const [selectedSongIDs, setSelectedSongIDs] = useState<SelectedSong[]>([]);
  const {
    control,
    formState: { errors },
    register,
    handleSubmit,
    setValue,
    reset,
    clearErrors,
  } = useForm<AlbumFormValues>({
    defaultValues: {
      producers: [{ name: "" }],
      explicit: "no",
      AlbumType: "album",
      selectedSongs: [],
    },
  });

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const albumData = location.state?.albumData as AlbumFormValues | undefined;
  const update = searchParams.get("update") === "true";

  // useFieldArray for dynamic producers
  const {
    fields: producers,
    append: appendProducers,
    remove: removeProducers,
  } = useFieldArray({
    control,
    name: "producers",
  });

  // Pre-populate form when updating
  useEffect(() => {
    reset();
    if (update && albumData) {
      reset({
        producers: [], // We'll append producers below.
      });
      setValue("artistName", albumData.artistName);
      setValue("albumName", albumData.albumName);
      setValue("genre", albumData.genre);
      setValue("publisher", albumData.publisher);
      setValue("label", albumData.label);
      setValue("explicit", albumData.explicit);
      setValue("AlbumType", albumData.AlbumType);
      setSelectedSongIDs([]);

      // Set preview image if available.
      if (albumData.songPicURL) {
        setFilePreview(albumData.songPicURL);
      }

      // Append each producer.
      albumData.producers.forEach((producer) =>
        appendProducers({ name: producer.name || "" })
      );

      // Set selected songs using the stored track numbers (and sort to be sure)
      if (albumData.selectedSongs && albumData.selectedSongs.length > 0) {
        const sortedSongs = [...albumData.selectedSongs].sort(
          (a, b) => a.track - b.track
        );
        setSelectedSongIDs(sortedSongs);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [dragActive, setDragActive] = useState<boolean>(false);
  const [filePreview, setFilePreview] = useState<string>("");
  const [onLoad, setOnLoading] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [showDialogUpdate, setShowDialogUpdate] = useState<boolean>(false);
  const [showDialogError, setShowDialogError] = useState<boolean>(false);
  const [showDialogErrorSongList, setShowDialogErrorSongList] =
    useState<boolean>(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  // Drag event handlers
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const fakeEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onFileChange(fakeEvent);
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("image/jpeg") && !file.type.includes("image/png")) {
      e.target.value = "";
      setShowDialogError(true);
      return;
    }
    const previewURL = URL.createObjectURL(file);
    setFilePreview(previewURL);
    setValue("albumPic", file);
    clearErrors("albumPic");
  };

  // Handlers for including and removing songs with track numbers
  const handleIncludeSong = (songID: string, songTitle: string) => {
    setSelectedSongIDs((prevIDs) => [
      ...prevIDs,
      { songID, songTitle, track: prevIDs.length + 1 },
    ]);
  };

  const handleRemoveSong = (songID: string) => {
    setSelectedSongIDs((prevIDs) =>
      prevIDs
        .filter((song) => song.songID !== songID)
        .map((song, index) => ({ ...song, track: index + 1 }))
    );
  };

  // Draggable list handler: When drag ends, update order and track numbers
  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(selectedSongIDs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    const updatedItems = items.map((song, index) => ({
      ...song,
      track: index + 1,
    }));
    setSelectedSongIDs(updatedItems);
  };

  // TanStack Query hooks for CRUD operations on AlbumUploads
  const addAlbumMutation = useAddDocumentWithProperties("AlbumUploads");
  const updateAlbumMutation = useUpdateDocumentsWithProperties("AlbumUploads", {
    albumID: albumData ? albumData.albumID! : "",
  });

  const handleFormSubmit = async (data: AlbumFormValues) => {
    setOnLoading(true);
    try {
      if (selectedSongIDs.length === 0) {
        setShowDialogErrorSongList(true);
        setOnLoading(false);
        return;
      }

      data.status = "active";
      const storage = getStorage();
      const uploads: { [key: string]: any } = {};
      // Save selected songs with track numbers
      data.selectedSongs = selectedSongIDs;

      const { albumPic, ...formDataWithoutFiles } = data;

      if (!update) {
        // Create new album
        if (albumPic) {
          const songPicRef = ref(storage, `images/${albumPic.name}`);
          await uploadBytes(songPicRef, albumPic);
          const songPicURL = await getDownloadURL(songPicRef);
          uploads.songPicURL = songPicURL;
          uploads.songPicName = albumPic.name;
        }

        const updatedFormData: AlbumFormValues = {
          ...formDataWithoutFiles,
          albumID: uuidv4(),
          upc: "",
          isrc: "",
          selectedSongs: data.selectedSongs,
          userId: userId,
        };

        const newAlbumData = {
          ...updatedFormData,
          ...uploads,
          timestamp: serverTimestamp(),
          updatedTimestamp: "",
        };

        await addAlbumMutation.mutateAsync(newAlbumData);
        setOnLoading(false);
        setShowDialog(true);
      } else {
        // Update existing album
        const updateData: Partial<AlbumFormValues> = {};
        if (albumPic) {
          const songPicRef = ref(storage, `images/${albumPic.name}`);
          await uploadBytes(songPicRef, albumPic);
          const songPicURL = await getDownloadURL(songPicRef);
          updateData.songPicURL = songPicURL;
          updateData.songPicName = albumPic.name;
        }
        const updatedFormData: Partial<AlbumFormValues> = {
          ...formDataWithoutFiles,
          upc: "",
          isrc: "",
          updatedTimestamp: serverTimestamp(),
        };
        const combinedUpdateData = { ...updateData, ...updatedFormData };

        await updateAlbumMutation.mutateAsync(combinedUpdateData);
        setOnLoading(false);
        setShowDialogUpdate(true);
      }
    } catch (error) {
      console.error("Error adding/updating document: ", error);
      alert("error");
      setOnLoading(false);
    }
  };

  return (
    <div>
      {onLoad && <LoadingSpinner />}
      <div
        className="text-dark font-bold text-accent mb-4"
        style={{ fontSize: "30px" }}
      >
        UPLOAD ALBUM
      </div>
      <div className="mt-2">
        <span className="text-accent">Recommended images</span> are 3000x3000
        square JPG format. This is just a recommendation though – we accept most
        image sizes. <span className="text-accent">Stores will reject</span>{" "}
        artwork that contains a website address (URL), Twitter name, or any
        image that's pixelated, related, or poor quality. They'll also reject
        artwork with prices or store logos. Also, please don't reuse the same
        artwork for multiple albums.{" "}
        <span className="text-accent">You own this artwork</span> and everything
        in it. Stores will reject your artwork if it contains images you don't
        have the explicit right to use.
      </div>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="flex mt-4">
          <div className="w-[30%]">
            <div
              className={`flex z-10 flex-col items-center justify-center border-2 border-dashed transition-all duration-300 ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300"
              } relative ${filePreview ? "p-0" : "px-14 py-20"}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Album cover"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <>
                  <Icon
                    icon="mdi:upload"
                    width="40"
                    height="40"
                    color="#C08B24"
                  />
                  <p className="mt-2 text-gray-600">Drag & Drop</p>
                </>
              )}
            </div>
            <input
              {...register("albumPic", {
                required: update === false ? "Album image is required." : false,
              })}
              ref={uploadRef}
              type="file"
              accept=".jpg,.png"
              style={{ display: "none" }}
              onChange={onFileChange}
            />
            <Button
              type="button"
              className="flex-1 bg-accent hover:bg-accent/90 text-white w-full mt-2"
              onClick={() => uploadRef.current?.click()}
            >
              <Icon icon="mdi:upload" width="18" height="18" color="white" />
              <span className="self-stretch my-auto">Select Song Image</span>
            </Button>
            <ErrorMessage
              errors={errors}
              name="albumPic"
              render={({ message }) => (
                <div className="w-full text-red-500 text-lg ml-1">
                  {message}
                </div>
              )}
            />
          </div>
          <div className="w-[70%] px-4">
            <div className="mb-3">
              <FloatingLabelInput
                label="Artist Name"
                {...register("artistName", {
                  required: "Artist name is required",
                })}
                error={errors.artistName?.message}
              />
            </div>
            <div className="mb-3">
              <FloatingLabelInput
                label="Album Name"
                {...register("albumName", {
                  required: "Album name is required",
                })}
                error={errors.albumName?.message}
              />
            </div>
            <div className="mb-3">
              <Controller
                name="genre"
                control={control}
                rules={{ required: "Genre is required" }}
                render={({ field }) => (
                  <FloatingLabelCombobox
                    label="Genre"
                    options={genres}
                    error={errors.genre?.message}
                    {...field}
                  />
                )}
              />
            </div>
            <div className="w-full mb-3">
              {producers.map((field, index) => (
                <div key={field.id} className="w-full">
                  <div className="flex w-full">
                    <div className="w-[90%] mb-3">
                      <FloatingLabelInput
                        {...register(`producers.${index}.name` as const, {
                          required: "This field is required",
                        })}
                        label="Producer"
                        error={errors.producers?.[index]?.name?.message}
                      />
                    </div>
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => removeProducers(index)}
                        className="ml-2"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendProducers({ name: "" })}
                className="text-accent"
              >
                Add more producer
              </button>
            </div>
            <div className="mb-3">
              <FloatingLabelInput
                label="Publisher"
                {...register("publisher", {
                  required: "Publisher is required",
                })}
                error={errors.publisher?.message}
              />
            </div>
            <div className="mb-3">
              <FloatingLabelInput
                label="Label"
                {...register("label", { required: "Label is required" })}
                error={errors.label?.message}
              />
            </div>
            <div className="flex">
              <div className="text-lg mb-1 font-semibold">Explicit Content</div>
              <div>
                <label className="text-sm pl-3 font-semibold">
                  <input type="radio" value="no" {...register("explicit")} />
                  &nbsp;No
                </label>
              </div>
              <div>
                <label className="text-sm pl-3 font-semibold">
                  <input type="radio" value="yes" {...register("explicit")} />
                  &nbsp;Yes
                </label>
              </div>
            </div>
            <div className="flex">
              <div className="text-lg mb-1 font-semibold">Type</div>
              <div>
                <label className="text-sm pl-3 font-semibold">
                  <input
                    type="radio"
                    value="album"
                    {...register("AlbumType")}
                  />
                  &nbsp;Album
                </label>
              </div>
              <div>
                <label className="text-sm pl-3 font-semibold">
                  <input type="radio" value="EP" {...register("AlbumType")} />
                  &nbsp;EP
                </label>
              </div>
            </div>
            <div className="mt-1">
              Include Songs
              <Library
                imported={true}
                onIncludeSong={handleIncludeSong}
                selectedSongIDs={selectedSongIDs}
              />
            </div>
            <div className="text-lg mb-1 font-semibold">Music list</div>
            <div>
              {selectedSongIDs.length > 0 ? (
                <DragDropContext onDragEnd={handleOnDragEnd}>
                  <Droppable droppableId="selectedSongs">
                    {(provided) => (
                      <ul {...provided.droppableProps} ref={provided.innerRef}>
                        {selectedSongIDs.map((song, index) => (
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
                                  {song.track}. {song.songTitle}
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
            <div className="my-4 text-right">
              <Button
                type="submit"
                className="flex-1 bg-accent hover:bg-accent/90 text-white"
              >
                {update ? "Update Album" : "Create Album"}
              </Button>
            </div>
          </div>
        </div>
      </form>
      <AlertBox
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        onstepComplete={() => {
          setShowDialog(false);
          setSelectedSongIDs([]);
          reset();
          setFilePreview("");
        }}
        title="Success!"
        description="You have successfully created your album!"
      />
      <AlertBox
        showDialog={showDialogUpdate}
        setShowDialog={setShowDialogUpdate}
        onstepComplete={() => {
          navigate(`/music/library`);
        }}
        title="Success!"
        description="You have successfully updated your album!"
      />
      <AlertBoxError
        showDialog={showDialogError}
        setShowDialog={setShowDialogError}
        onstepComplete={() => {}}
        title="Error!"
        description="Please upload valid image format (e.g. JPEG, PNG)"
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

export default UploadAlbum;
