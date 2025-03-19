import React, { useState, useCallback, useEffect, useRef } from "react";
import { useForm, useFieldArray, FieldErrors } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@/providers/AuthProvider";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import AlertBox from "@/components/ui/AlertBox";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import AlertBoxError from "@/components/ui/AlertBoxError";
import {
  useAddDocumentWithProperties,
  useUpdateDocumentsWithProperties,
} from "@/api/firebaseHooks";
interface FeaturedArtist {
  name: string;
}

interface Songwriter {
  firstName: string;
  lastName: string;
  middleName?: string;
}

interface FormValues {
  showArtists: string;
  versionTitle: string;
  songWriter: string;
  dolbyAtmos: string;
  explicit: string;
  instrumental: string;
  radioEdit: string;
  clipStart: string;
  SongTitle?: string;
  trackPrice?: number;
  lyrics?: string;
  credits?: string;
  dateOfRelease?: string;
  songPic?: File;
  audioFile?: FileList;
  dolbyAtmosFile?: FileList;
  featuredArtists?: FeaturedArtist[];
  songwriters?: Songwriter[];
  status?: string;
}

function UploadMusic() {
  const navigate = useNavigate();
  const { userDetails } = useAuth();
  const {
    control,
    formState: { errors },
    register,
    handleSubmit,
    setValue,
    clearErrors,
    watch,
    reset,
    unregister,
  } = useForm<FormValues>({
    defaultValues: {
      showArtists: "no",
      versionTitle: "normal",
      songWriter: "Iwrote",
      dolbyAtmos: "no",
      explicit: "no",
      instrumental: "no",
      radioEdit: "no",
      clipStart: "streamingDecide",
    },
  });

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const songData = location.state?.songData;
  const update = searchParams.get("update") === "true";
  const {
    fields: featuredArtists,
    append: appendFeaturedArtist,
    remove: removeFeaturedArtist,
  } = useFieldArray({
    control,
    name: "featuredArtists",
  });

  const addDocumentMutation = useAddDocumentWithProperties("musicUploads");
  const updateDocumentMutation = useUpdateDocumentsWithProperties(
    "musicUploads",
    {
      songID: songData?.songID,
    }
  );

  useEffect(() => {
    reset();
    if (update === true && songData) {
      reset({
        songwriters: [],
      });
      setValue("SongTitle", songData.SongTitle);
      setValue("showArtists", songData.showArtists);
      setValue("dateOfRelease", songData.dateOfRelease);
      setValue("featuredArtists", []);
      setValue("versionTitle", songData.versionTitle);
      setValue("songWriter", songData.songWriter);
      setValue("dolbyAtmos", songData.dolbyAtmos);
      setValue("explicit", songData.explicit);
      setValue("instrumental", songData.instrumental);
      setValue("radioEdit", songData.radioEdit);
      setValue("clipStart", songData.clipStart);
      setValue("trackPrice", songData.trackPrice);
      setValue("lyrics", songData.lyrics);
      setValue("credits", songData.credits);

      setFilePreview(songData.songPicURL);
      setFilePreviewAudio(songData.audioFileName);
      setAudioSrc(songData.audioFileURL);
      if (songData.dolbyAtmos === "yes") {
        setFilePreviewDolby(songData.dolbyAtmosFileName);
        setAudioSrcSpatial(songData.dolbyAtmosFileURL);
      }

      songData.songwriters.forEach((writer: Songwriter) =>
        appendSongwriter({
          firstName: writer.firstName || "",
          middleName: writer.middleName || "",
          lastName: writer.lastName || "",
        })
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [showDialogError, setShowDialogError] = useState(false);
  const [showDialogErrorSong, setShowDialogErrorSong] = useState(false);
  const [showDialogErrorDolby, setShowDialogErrorDolby] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [filePreview, setFilePreview] = useState<string>("");
  const [filePreviewAudio, setFilePreviewAudio] = useState<string | null>(null);
  const [filePreviewDolby, setFilePreviewDolby] = useState<string>("");
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [audioSrcSpatial, setAudioSrcSpatial] = useState<string | null>(null);
  const dolbyAtmosShow = watch("dolbyAtmos");
  const [onLoad, setOnLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showDialogUpdate, setShowDialogUpdate] = useState(false);
  const {
    fields: songwriters,
    append: appendSongwriter,
    remove: removeSongwriter,
  } = useFieldArray({
    control,
    name: "songwriters",
  });
  const uploadRef = useRef<HTMLInputElement>(null);
  const uploadRefDolby = useRef<HTMLInputElement>(null);
  const uploadRefMainSOng = useRef<HTMLInputElement>(null);
  const showAddArtist = watch("showArtists");

  const handleAddSongwriter = () => {
    appendSongwriter({ firstName: "", lastName: "", middleName: "" });
  };

  useEffect(() => {
    setValue("featuredArtists", []); // Always clear first

    if (showAddArtist === "yes") {
      if (songData?.featuredArtists?.length > 0) {
        songData.featuredArtists.forEach((artist: FeaturedArtist) => {
          appendFeaturedArtist({ name: artist.name });
        });
      } else {
        appendFeaturedArtist({ name: "" });
      }
    }
  }, [showAddArtist]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (dolbyAtmosShow === "no") {
      setValue("dolbyAtmosFile", undefined);
      clearErrors("dolbyAtmosFile");
      unregister("dolbyAtmosFile");
    }
  }, [dolbyAtmosShow, clearErrors, setValue, unregister]);

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
        target: {
          files: [file],
        },
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
    setValue("songPic", file);
    clearErrors("songPic");
  };

  const onFileChangeAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("audio/mpeg") && !file.type.includes("audio/wav")) {
      e.target.value = "";
      setShowDialogErrorSong(true);
      return;
    }
    setAudioSrc(null);
    const audioURL = URL.createObjectURL(file);
    setAudioSrc(audioURL);
    if (e.target.files) {
      setValue("audioFile", e.target.files);
    }
    clearErrors("audioFile");
    setFilePreviewAudio(file.name);
  };

  const onFileChangeDolbyAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("audio/mpeg") && !file.type.includes("audio/wav")) {
      e.target.value = "";
      setShowDialogErrorDolby(true);
      return;
    }
    setAudioSrcSpatial(null);
    const audioURL = URL.createObjectURL(file);
    setAudioSrcSpatial(audioURL);
    if (e.target.files) {
      setValue("dolbyAtmosFile", e.target.files);
    }
    clearErrors("dolbyAtmosFile");
    setFilePreviewDolby(file.name);
  };

  {
    /*}
  const handleFormSubmit = async (data: FormValues) => {
    setOnLoading(true);
    try {
      const storage = getStorage();
      const firestore = getFirestore();
      const uploads: Record<string, any> = {};
      data.status = "active" as any;
      if (update === false) {
        if (data.songPic) {
          const songPicRef = ref(storage, `images/${data.songPic.name}`);
          await uploadBytes(songPicRef, data.songPic);
          const songPicURL = await getDownloadURL(songPicRef);
          uploads.songPicURL = songPicURL;
          uploads.songPicName = data.songPic.name;
        }

        if (data.audioFile && data.audioFile[0]) {
          const audioFileRef = ref(storage, `audio/${data.audioFile[0].name}`);
          await uploadBytes(audioFileRef, data.audioFile[0]);
          const audioFileURL = await getDownloadURL(audioFileRef);
          uploads.audioFileURL = audioFileURL;
          uploads.audioFileName = data.audioFile[0].name;
        }

        if (data.dolbyAtmosFile && data.dolbyAtmosFile[0]) {
          const dolbyFileRef = ref(
            storage,
            `audio/${data.dolbyAtmosFile[0].name}`
          );
          await uploadBytes(dolbyFileRef, data.dolbyAtmosFile[0]);
          const dolbyFileURL = await getDownloadURL(dolbyFileRef);
          uploads.dolbyAtmosFileURL = dolbyFileURL;
          uploads.dolbyAtmosFileName = data.dolbyAtmosFile[0].name;
        } else {
          uploads.dolbyAtmosFileURL = "";
          uploads.dolbyAtmosFileName = "";
        }

        const { songPic, audioFile, dolbyAtmosFile, ...formDataWithoutFiles } =
          data;
        const updatedFormData = {
          ...formDataWithoutFiles,
          songID: uuidv4(),
          upc: "",
          isrc: "",
          userId: (userDetails as any).userId,
        };

        const docRef = await addDoc(collection(firestore, "musicUploads"), {
          ...updatedFormData,
          ...uploads,
          timestamp: serverTimestamp(),
          updatedTimestamp: "",
        });

        setOnLoading(false);
        setShowDialog(true);
      } else {
        const songsCollection = collection(firestore, "musicUploads");
        const q = query(
          songsCollection,
          where("songID", "==", songData.songID)
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          alert("No data found!");
          return;
        }
        const docRef = querySnapshot.docs[0].ref;

        if (data.songPic) {
          const songPicRef = ref(storage, `images/${data.songPic.name}`);
          await uploadBytes(songPicRef, data.songPic);
          const songPicURL = await getDownloadURL(songPicRef);
          await updateDoc(docRef, {
            songPicURL: songPicURL,
            songPicName: data.songPic.name,
          });
        }

        if (data.audioFile && data.audioFile[0]) {
          const audioFileRef = ref(storage, `audio/${data.audioFile[0].name}`);
          await uploadBytes(audioFileRef, data.audioFile[0]);
          const audioFileURL = await getDownloadURL(audioFileRef);
          await updateDoc(docRef, {
            audioFileURL: audioFileURL,
            audioFileName: data.audioFile[0].name,
          });
        }

        if (data.dolbyAtmosFile && data.dolbyAtmosFile[0]) {
          const dolbyFileRef = ref(
            storage,
            `audio/${data.dolbyAtmosFile[0].name}`
          );
          await uploadBytes(dolbyFileRef, data.dolbyAtmosFile[0]);
          const dolbyFileURL = await getDownloadURL(dolbyFileRef);
          await updateDoc(docRef, {
            dolbyAtmosFileURL: dolbyFileURL,
            dolbyAtmosFileName: data.dolbyAtmosFile[0].name,
          });
        }

        if (data.dolbyAtmos === "no") {
          await updateDoc(docRef, {
            dolbyAtmosFileURL: "",
            dolbyAtmosFileName: "",
          });
        }

        const { songPic, audioFile, dolbyAtmosFile, ...formDataWithoutFiles } =
          data;
        const updatedFormData = {
          ...formDataWithoutFiles,
          upc: "",
          isrc: "",
          updatedTimestamp: serverTimestamp(),
        };

        await updateDoc(docRef, updatedFormData);

        setOnLoading(false);
        setShowDialogUpdate(true);
      }
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("error");
      setOnLoading(false);
    }
  };
*/
  }
  const handleFormSubmit = async (data: FormValues) => {
    setOnLoading(true);
    try {
      const storage = getStorage();
      const uploads: Record<string, any> = {};

      // Set status field
      data.status = "active";

      if (!update) {
        // ===== INSERT / ADD NEW DOCUMENT =====

        // Upload song picture if provided
        if (data.songPic) {
          const songPicRef = ref(storage, `images/${data.songPic.name}`);
          await uploadBytes(songPicRef, data.songPic);
          const songPicURL = await getDownloadURL(songPicRef);
          uploads.songPicURL = songPicURL;
          uploads.songPicName = data.songPic.name;
        }

        // Upload audio file if provided
        if (data.audioFile && data.audioFile[0]) {
          const audioFileRef = ref(storage, `audio/${data.audioFile[0].name}`);
          await uploadBytes(audioFileRef, data.audioFile[0]);
          const audioFileURL = await getDownloadURL(audioFileRef);
          uploads.audioFileURL = audioFileURL;
          uploads.audioFileName = data.audioFile[0].name;
        }

        // Upload Dolby Atmos file if provided
        if (data.dolbyAtmosFile && data.dolbyAtmosFile[0]) {
          const dolbyFileRef = ref(
            storage,
            `audio/${data.dolbyAtmosFile[0].name}`
          );
          await uploadBytes(dolbyFileRef, data.dolbyAtmosFile[0]);
          const dolbyFileURL = await getDownloadURL(dolbyFileRef);
          uploads.dolbyAtmosFileURL = dolbyFileURL;
          uploads.dolbyAtmosFileName = data.dolbyAtmosFile[0].name;
        } else {
          uploads.dolbyAtmosFileURL = "";
          uploads.dolbyAtmosFileName = "";
        }

        if (!userDetails) {
          throw new Error("User details are not available.");
        }
        // Remove file objects from data
        const { songPic, audioFile, dolbyAtmosFile, ...formDataWithoutFiles } =
          data;
        const updatedFormData = {
          ...formDataWithoutFiles,
          songID: uuidv4(),
          upc: "",
          isrc: "",
          userId: (userDetails as any).userId
        };

        const newDocumentData = {
          ...updatedFormData,
          ...uploads,
          timestamp: serverTimestamp(),
          updatedTimestamp: "",
        };

        // Insert document via the TanStack Query hook
        await addDocumentMutation.mutateAsync(newDocumentData);
        setShowDialog(true);
      } else {
        // ===== UPDATE EXISTING DOCUMENT =====

        const updateData: Record<string, any> = {};

        if (data.songPic) {
          const songPicRef = ref(storage, `images/${data.songPic.name}`);
          await uploadBytes(songPicRef, data.songPic);
          const songPicURL = await getDownloadURL(songPicRef);
          updateData.songPicURL = songPicURL;
          updateData.songPicName = data.songPic.name;
        }

        if (data.audioFile && data.audioFile[0]) {
          const audioFileRef = ref(storage, `audio/${data.audioFile[0].name}`);
          await uploadBytes(audioFileRef, data.audioFile[0]);
          const audioFileURL = await getDownloadURL(audioFileRef);
          updateData.audioFileURL = audioFileURL;
          updateData.audioFileName = data.audioFile[0].name;
        }

        if (data.dolbyAtmosFile && data.dolbyAtmosFile[0]) {
          const dolbyFileRef = ref(
            storage,
            `audio/${data.dolbyAtmosFile[0].name}`
          );
          await uploadBytes(dolbyFileRef, data.dolbyAtmosFile[0]);
          const dolbyFileURL = await getDownloadURL(dolbyFileRef);
          updateData.dolbyAtmosFileURL = dolbyFileURL;
          updateData.dolbyAtmosFileName = data.dolbyAtmosFile[0].name;
        }

        if (data.dolbyAtmos === "no") {
          updateData.dolbyAtmosFileURL = "";
          updateData.dolbyAtmosFileName = "";
        }

        const { songPic, audioFile, dolbyAtmosFile, ...formDataWithoutFiles } =
          data;
        const updatedFormData = {
          ...formDataWithoutFiles,
          upc: "",
          isrc: "",
          updatedTimestamp: serverTimestamp(),
        };

        const combinedUpdateData = { ...updateData, ...updatedFormData };

        // Update document via the TanStack Query hook
        await updateDocumentMutation.mutateAsync(combinedUpdateData);
        setShowDialogUpdate(true);
      }
      setOnLoading(false);
    } catch (error) {
      console.error("Error in CRUD operation:", error);
      alert("An error occurred");
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
        UPLOAD SONG
      </div>
      <div className="mt-2">
        <span className="text-accent">Recommended images</span> are 3000x3000
        square JPG format. This is just a recommendation though– we accept most
        image sizes. <span className="text-accent">Stores will reject</span>{" "}
        artwork that contains a website address (URL). Twitter name, or any
        image that's pixelated, related, or poor quality. They'll also reject
        artwork with prices or store logos (don't put an iTunes or Spotify logo
        on your artwork). Also, please don't reuse the same artwork for multiple
        albums. <span className="text-accent">You own this artwork</span> and
        everything in it. Stores will reject your artwork if it contains images
        you found online that you don't have the explicit right to use.
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
              {...register("songPic", {
                required: update === false ? "Song image is required." : false,
              })}
              ref={uploadRef}
              type="file"
              accept=".jpg,.png"
              style={{ display: "none" }}
              onChange={onFileChange}
            />

            <Button
              type="button"
              className="flex-1 bg-[#C09239] hover:bg-[#C09239]/90 text-white w-full mt-2"
              onClick={() => uploadRef.current?.click()}
            >
              <Icon icon="mdi:upload" width="18" height="18" color="white" />
              <span className="self-stretch my-auto">Select Song Image</span>
            </Button>

            <ErrorMessage
              errors={errors as FieldErrors<FormValues>}
              name="songPic"
              render={({ message }) => (
                <div className="w-full text-red-500 text-lg ml-1">
                  {message}
                </div>
              )}
            />
          </div>

          <div className="w-[70%]">
            <div className="px-4">
              <FloatingLabelInput
                label="Song Title"
                {...register("SongTitle", {
                  required: "Song title is required",
                })}
                error={(errors as FieldErrors<FormValues>).SongTitle?.message}
              />
              <div className="text-sm pt-2">
                <div className="flex space-x-1 ">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.2086 2.26331C10.6337 1.79055 9.96063 1.45207 9.23835 1.27258C8.51606 1.09309 7.76281 1.07711 7.03356 1.22581C6.06254 1.42194 5.17168 1.9021 4.47398 2.60536C3.77629 3.30861 3.30323 4.20326 3.11481 5.17581C2.97721 5.90501 3.00221 6.65559 3.18803 7.37401C3.37385 8.09244 3.71591 8.76102 4.18981 9.33206C4.62961 9.82835 4.8817 10.463 4.90231 11.1258V13.0008C4.90231 13.4981 5.09985 13.975 5.45148 14.3266C5.80311 14.6783 6.28003 14.8758 6.77731 14.8758H9.27731C9.77459 14.8758 10.2515 14.6783 10.6031 14.3266C10.9548 13.975 11.1523 13.4981 11.1523 13.0008V11.2446C11.1733 10.5128 11.4421 9.80982 11.9148 9.25081C12.743 8.22629 13.1334 6.91632 13.0012 5.60557C12.8689 4.29483 12.2247 3.08924 11.2086 2.25081V2.26331ZM9.90231 13.0008C9.90231 13.1666 9.83646 13.3255 9.71925 13.4427C9.60204 13.56 9.44307 13.6258 9.27731 13.6258H6.77731C6.61155 13.6258 6.45258 13.56 6.33537 13.4427C6.21816 13.3255 6.15231 13.1666 6.15231 13.0008V12.3758H9.90231V13.0008ZM10.9461 8.47581C10.3176 9.22118 9.95097 10.1521 9.90231 11.1258H8.65231V9.25081C8.65231 9.08505 8.58646 8.92607 8.46925 8.80886C8.35204 8.69165 8.19307 8.62581 8.02731 8.62581C7.86155 8.62581 7.70258 8.69165 7.58537 8.80886C7.46816 8.92607 7.40231 9.08505 7.40231 9.25081V11.1258H6.15231C6.13582 10.1684 5.78165 9.24753 5.15231 8.52581C4.73708 8.0283 4.45786 7.43169 4.34188 6.79415C4.22589 6.1566 4.27709 5.49988 4.49049 4.88801C4.70389 4.27615 5.0722 3.73002 5.55951 3.30288C6.04682 2.87575 6.6365 2.58218 7.27106 2.45081C7.8164 2.33852 8.37991 2.34908 8.92066 2.48172C9.46142 2.61437 9.96585 2.86576 10.3973 3.21765C10.8288 3.56954 11.1765 4.0131 11.4152 4.51613C11.6539 5.01916 11.7776 5.56902 11.7773 6.12581C11.7819 6.98197 11.488 7.81297 10.9461 8.47581Z"
                      fill="#E99C06"
                    />
                  </svg>
                  <span className="font-semibold">
                    Don't include featured artists here.
                  </span>
                  &nbsp;
                  <span>Add them below, instead.</span>
                </div>
              </div>
              <div className="text-sm pt-2 flex space-x-1">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.2086 2.26331C10.6337 1.79055 9.96063 1.45207 9.23835 1.27258C8.51606 1.09309 7.76281 1.07711 7.03356 1.22581C6.06254 1.42194 5.17168 1.9021 4.47398 2.60536C3.77629 3.30861 3.30323 4.20326 3.11481 5.17581C2.97721 5.90501 3.00221 6.65559 3.18803 7.37401C3.37385 8.09244 3.71591 8.76102 4.18981 9.33206C4.62961 9.82835 4.8817 10.463 4.90231 11.1258V13.0008C4.90231 13.4981 5.09985 13.975 5.45148 14.3266C5.80311 14.6783 6.28003 14.8758 6.77731 14.8758H9.27731C9.77459 14.8758 10.2515 14.6783 10.6031 14.3266C10.9548 13.975 11.1523 13.4981 11.1523 13.0008V11.2446C11.1733 10.5128 11.4421 9.80982 11.9148 9.25081C12.743 8.22629 13.1334 6.91632 13.0012 5.60557C12.8689 4.29483 12.2247 3.08924 11.2086 2.25081V2.26331ZM9.90231 13.0008C9.90231 13.1666 9.83646 13.3255 9.71925 13.4427C9.60204 13.56 9.44307 13.6258 9.27731 13.6258H6.77731C6.61155 13.6258 6.45258 13.56 6.33537 13.4427C6.21816 13.3255 6.15231 13.1666 6.15231 13.0008V12.3758H9.90231V13.0008ZM10.9461 8.47581C10.3176 9.22118 9.95097 10.1521 9.90231 11.1258H8.65231V9.25081C8.65231 9.08505 8.58646 8.92607 8.46925 8.80886C8.35204 8.69165 8.19307 8.62581 8.02731 8.62581C7.86155 8.62581 7.70258 8.69165 7.58537 8.80886C7.46816 8.92607 7.40231 9.08505 7.40231 9.25081V11.1258H6.15231C6.13582 10.1684 5.78165 9.24753 5.15231 8.52581C4.73708 8.0283 4.45786 7.43169 4.34188 6.79415C4.22589 6.1566 4.27709 5.49988 4.49049 4.88801C4.70389 4.27615 5.0722 3.73002 5.55951 3.30288C6.04682 2.87575 6.6365 2.58218 7.27106 2.45081C7.8164 2.33852 8.37991 2.34908 8.92066 2.48172C9.46142 2.61437 9.96585 2.86576 10.3973 3.21765C10.8288 3.56954 11.1765 4.0131 11.4152 4.51613C11.6539 5.01916 11.7776 5.56902 11.7773 6.12581C11.7819 6.98197 11.488 7.81297 10.9461 8.47581Z"
                    fill="#E99C06"
                  />
                </svg>
                <span className="font-semibold">
                  If a cover song, don't include original artist's name
                </span>
              </div>
              <div className="text-sm pt-2 flex space-x-1">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.2086 2.26331C10.6337 1.79055 9.96063 1.45207 9.23835 1.27258C8.51606 1.09309 7.76281 1.07711 7.03356 1.22581C6.06254 1.42194 5.17168 1.9021 4.47398 2.60536C3.77629 3.30861 3.30323 4.20326 3.11481 5.17581C2.97721 5.90501 3.00221 6.65559 3.18803 7.37401C3.37385 8.09244 3.71591 8.76102 4.18981 9.33206C4.62961 9.82835 4.8817 10.463 4.90231 11.1258V13.0008C4.90231 13.4981 5.09985 13.975 5.45148 14.3266C5.80311 14.6783 6.28003 14.8758 6.77731 14.8758H9.27731C9.77459 14.8758 10.2515 14.6783 10.6031 14.3266C10.9548 13.975 11.1523 13.4981 11.1523 13.0008V11.2446C11.1733 10.5128 11.4421 9.80982 11.9148 9.25081C12.743 8.22629 13.1334 6.91632 13.0012 5.60557C12.8689 4.29483 12.2247 3.08924 11.2086 2.25081V2.26331ZM9.90231 13.0008C9.90231 13.1666 9.83646 13.3255 9.71925 13.4427C9.60204 13.56 9.44307 13.6258 9.27731 13.6258H6.77731C6.61155 13.6258 6.45258 13.56 6.33537 13.4427C6.21816 13.3255 6.15231 13.1666 6.15231 13.0008V12.3758H9.90231V13.0008ZM10.9461 8.47581C10.3176 9.22118 9.95097 10.1521 9.90231 11.1258H8.65231V9.25081C8.65231 9.08505 8.58646 8.92607 8.46925 8.80886C8.35204 8.69165 8.19307 8.62581 8.02731 8.62581C7.86155 8.62581 7.70258 8.69165 7.58537 8.80886C7.46816 8.92607 7.40231 9.08505 7.40231 9.25081V11.1258H6.15231C6.13582 10.1684 5.78165 9.24753 5.15231 8.52581C4.73708 8.0283 4.45786 7.43169 4.34188 6.79415C4.22589 6.1566 4.27709 5.49988 4.49049 4.88801C4.70389 4.27615 5.0722 3.73002 5.55951 3.30288C6.04682 2.87575 6.6365 2.58218 7.27106 2.45081C7.8164 2.33852 8.37991 2.34908 8.92066 2.48172C9.46142 2.61437 9.96585 2.86576 10.3973 3.21765C10.8288 3.56954 11.1765 4.0131 11.4152 4.51613C11.6539 5.01916 11.7776 5.56902 11.7773 6.12581C11.7819 6.98197 11.488 7.81297 10.9461 8.47581Z"
                    fill="#E99C06"
                  />
                </svg>
                <span className="font-semibold">No year/dates.</span>
                &nbsp;
                <span>
                  Do not include any year info (ex:2023) in your song title.
                </span>
              </div>

              <div className="mt-4">
                <FloatingLabelInput
                  label="Date of release"
                  type="date"
                  {...register("dateOfRelease", {
                    required: "Date is required",
                  })}
                  error={
                    (errors as FieldErrors<FormValues>).dateOfRelease?.message
                  }
                />
              </div>

              <div className="mt-2">
                <div className="text-lg font-semibold">
                  Add featured artist to song title?
                </div>
                <div className="text-sm text-gray-400">
                  Featured artist or remixer other than Callon B
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold">
                  <input type="radio" value="no" {...register("showArtists")} />
                  &nbsp;No, don't show any other artists in song title
                </label>
              </div>

              <div>
                <label className="text-sm font-semibold">
                  <input
                    type="radio"
                    value="yes"
                    {...register("showArtists")}
                  />
                  &nbsp;Yes, add featured artists to track title (please
                  specify...)
                </label>
              </div>

              {showAddArtist === "yes" && (
                <div className="w-full mt-2">
                  {featuredArtists.map((field, index) => (
                    <div key={field.id} className="w-full">
                      <div className="my-2 flex w-full">
                        <div className="w-[90%]">
                          <FloatingLabelInput
                            label="Featured Artist Name"
                            {...register(
                              `featuredArtists.${index}.name` as const,
                              {
                                required: "This field is required",
                              }
                            )}
                            error={
                              (errors.featuredArtists?.[index] as any)?.name
                                ?.message
                            }
                          />
                        </div>
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => removeFeaturedArtist(index)}
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
                    onClick={() => appendFeaturedArtist({ name: "" })}
                    className="mt-4 text-[#e49f4a]"
                  >
                    Add more featured artist
                  </button>
                </div>
              )}

              <div className="mt-4">
                <div className="text-lg font-semibold">
                  Add "version" info to song title?
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    <input
                      type="radio"
                      value="normal"
                      {...register("versionTitle")}
                    />
                    &nbsp;No, this is the normal version
                  </label>
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    <input
                      type="radio"
                      value="radioEdit"
                      {...register("versionTitle")}
                    />
                    &nbsp;Radio Edit
                  </label>
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    <input
                      type="radio"
                      value="other"
                      {...register("versionTitle")}
                    />
                    &nbsp;Other
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-lg mb-2 font-semibold">Audio File</div>
                {audioSrc && (
                  <audio key={audioSrc} controls className="w-full">
                    <source src={audioSrc} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
                <div>
                  <input
                    {...register("audioFile", {
                      required:
                        update === false ? "The song file is required." : false,
                    })}
                    ref={uploadRefMainSOng}
                    type="file"
                    accept=".mp3,.wav"
                    style={{ display: "none" }}
                    onChange={onFileChangeAudio}
                  />

                  <div
                    className="border-2 border-dashed border-blue-300 p-2 mx-3 mb-2 mt-2 cursor-pointer"
                    onClick={() => uploadRefMainSOng.current?.click()}
                  >
                    <div className="flex justify-center">
                      {filePreviewAudio ? (
                        <div>
                          <div className="flex justify-center text-blue-600">
                            Click to change song uploaded.
                          </div>
                        </div>
                      ) : (
                        <Icon
                          icon="mdi:upload"
                          width="24"
                          height="24"
                          className="text-blue-600"
                        />
                      )}
                    </div>

                    <div>
                      {filePreviewAudio ? (
                        <div className="w-full text-center">
                          {filePreviewAudio}
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-center text-blue-600">
                            Select an audio file
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <ErrorMessage
                  errors={errors as FieldErrors<FormValues>}
                  name="audioFile"
                  render={({ message }) => (
                    <div className="w-full text-red-500 text-lg ml-1">
                      {message}
                    </div>
                  )}
                />
              </div>

              <div className="mt-4">
                <div className="text-lg font-semibold mb-1">Songwriter</div>

                <div>
                  <label className="text-sm font-semibold">
                    <input
                      type="radio"
                      value="Iwrote"
                      {...register("songWriter")}
                    />
                    &nbsp;I wrote this song, or manage the songwriter (it's an
                    original tune)
                  </label>
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    <input
                      type="radio"
                      value="AnotherArtist"
                      {...register("songWriter")}
                    />
                    &nbsp;Another artist wrote it (it's a cover song)
                  </label>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-lg font-semibold mb-1">
                  Songwriter(s) real name
                </div>
                <div className="mb-1 text-sm">
                  <span className="text-gray-400">
                    Real names, not stage names
                  </span>{" "}
                  <span className="text-blue-600">Tell me more</span>
                </div>
                {songwriters?.map((songwriter, index) => (
                  <div
                    key={songwriter.id}
                    className="flex items-center gap-2 py-2"
                  >
                    <FloatingLabelInput
                      label="First Name"
                      {...register(`songwriters.${index}.firstName` as const, {
                        required: "This field is required",
                      })}
                      error={
                        (errors.songwriters?.[index] as any)?.firstName?.message
                      }
                    />

                    <FloatingLabelInput
                      label="Last Name"
                      {...register(`songwriters.${index}.lastName` as const, {
                        required: "This field is required",
                      })}
                      error={
                        (errors.songwriters?.[index] as any)?.lastName?.message
                      }
                    />

                    <FloatingLabelInput
                      label="Middle Name"
                      {...register(`songwriters.${index}.middleName` as const)}
                      error={
                        (errors.songwriters?.[index] as any)?.middleName
                          ?.message
                      }
                    />

                    <button
                      type="button"
                      onClick={() => removeSongwriter(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div
                  className="mt-2 text-[#e49f4a] cursor-pointer"
                  onClick={handleAddSongwriter}
                >
                  + Add another songwriter
                </div>
              </div>

              <div className="mt-4">
                <div className="text-lg font-semibold mb-1">
                  Dolby Atmos/Spatial audio
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    <input
                      type="radio"
                      value="no"
                      {...register("dolbyAtmos")}
                    />
                    &nbsp;No
                  </label>
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    <input
                      type="radio"
                      value="yes"
                      {...register("dolbyAtmos")}
                    />
                    &nbsp;Yes
                  </label>
                </div>
                {dolbyAtmosShow === "yes" && (
                  <div>
                    {audioSrcSpatial && (
                      <audio key={audioSrcSpatial} controls className="w-full">
                        <source src={audioSrcSpatial} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    )}

                    <input
                      {...register("dolbyAtmosFile", {
                        required:
                          (update === false && dolbyAtmosShow === "yes") ||
                          (update === true &&
                            dolbyAtmosShow === "yes" &&
                            !songData.dolbyAtmosFileURL.trim())
                            ? "Dolby Atmos audio file is required."
                            : false,
                      })}
                      ref={uploadRefDolby}
                      type="file"
                      accept=".mp3,.wav"
                      style={{ display: "none" }}
                      onChange={onFileChangeDolbyAudio}
                    />

                    <div className="pl-4 py-1">
                      Dolby Atmos audio file{" "}
                      <span style={{ color: "#50b976" }}>($26.99 each)</span>
                    </div>

                    <div className="pl-4 py-1">WAV (Format: "ADMBWF")</div>
                    <div
                      className="border-2 border-dashed border-blue-300 p-2 mx-3 mb-2 mt-2 cursor-pointer"
                      onClick={() => uploadRefDolby.current?.click()}
                    >
                      <div className="flex justify-center">
                        {filePreviewDolby ? (
                          <div>
                            <div className="flex justify-center text-blue-600">
                              Click to change Dolby Audio uploaded!
                            </div>
                          </div>
                        ) : (
                          <Icon
                            icon="mdi:upload"
                            width="24"
                            height="24"
                            className="text-blue-600"
                          />
                        )}
                      </div>

                      {filePreviewDolby ? (
                        <div className="w-full text-center">
                          {filePreviewDolby}
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-center text-blue-600">
                            Select an audio file
                          </div>
                        </div>
                      )}
                    </div>

                    <ErrorMessage
                      errors={errors as FieldErrors<FormValues>}
                      name="dolbyAtmosFile"
                      render={({ message }) => (
                        <div className="w-full text-red-500 text-lg ml-1">
                          {message}
                        </div>
                      )}
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 border-b-2 border-dashed border-black pb-4">
                <div className="text-lg font-semibold mb-1">
                  Explicit lyrics
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    <input type="radio" value="no" {...register("explicit")} />
                    &nbsp;No
                  </label>
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    <input type="radio" value="yes" {...register("explicit")} />
                    &nbsp;Yes
                  </label>
                </div>
              </div>

              <div className="mt-4" id="lyrics">
                <div className="text-lg mb-2 font-semibold">Lyrics</div>
                <textarea
                  className="border border-gray-300 dark:bg-gray-600/0 dark:text-white rounded-2xl px-4 py-2 focus:outline-none w-full h-[200px]"
                  style={{ resize: "none" }}
                  {...register("lyrics")}
                ></textarea>
              </div>

              <div className="mt-4">
                <div className="text-lg mb-2 font-semibold">Credits</div>
                <textarea
                  className="border border-gray-300 dark:bg-gray-600/0 dark:text-white rounded-2xl px-4 py-2 focus:outline-none w-full h-[100px]"
                  style={{ resize: "none" }}
                  {...register("credits")}
                ></textarea>
              </div>

              <div className="mt-4 border-b-2 border-dashed border-black pb-4">
                <div className="text-lg font-semibold mb-1">
                  Is this a "radio edit"?
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    <input type="radio" value="no" {...register("radioEdit")} />
                    &nbsp;No - This song is clean, and always has been
                  </label>
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    <input
                      type="radio"
                      value="yes"
                      {...register("radioEdit")}
                    />
                    &nbsp;Yes - There is an explicit version of this song, but
                    this is the clean (or censored) version of it
                  </label>
                </div>
              </div>

              <div className="mt-2 border-b-2 border-dashed border-black pb-4">
                <div className="text-lg font-semibold mb-1">Instrumental?</div>

                <div>
                  <label className="text-sm font-semibold">
                    <input
                      type="radio"
                      value="no"
                      {...register("instrumental")}
                    />
                    &nbsp;This song contains Lyrics
                  </label>
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    <input
                      type="radio"
                      value="yes"
                      {...register("instrumental")}
                    />
                    &nbsp;This song is instrumental and contains no lyrics
                  </label>
                </div>
              </div>

              <div className="mt-2 border-b-2 border-dashed border-black pb-4">
                <div className="text-lg font-semibold mb-1">
                  Preview clip start time (Tiktok, Apple Music, iTunes)
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    <input
                      type="radio"
                      value="streamingDecide"
                      {...register("clipStart")}
                    />
                    &nbsp;Let streaming service decide
                  </label>
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    <input
                      type="radio"
                      value="meDecide"
                      {...register("clipStart")}
                    />
                    &nbsp;Let me specify when the good part starts
                  </label>
                </div>
              </div>

              <div className="mt-2">
                <div className="text-lg font-semibold mb-1">Track Price</div>
                <div className="text-sm text-gray-400">Itunes and Amazon</div>
                <div>
                  <FloatingLabelInput
                    label="Track Price"
                    {...register("trackPrice")}
                    type="number"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="my-4 text-right">
          <Button
            type="submit"
            className="flex-1 bg-accent hover:bg-accent/90 text-white"
          >
            {update ? "Update Song" : "Submit Song"}
          </Button>
        </div>
      </form>

      <AlertBox
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        onstepComplete={() => {
          setShowDialog(false);
          reset();
          setFilePreview("");
          setFilePreviewAudio(null);
          setFilePreviewDolby("");
          setAudioSrc(null);
          setAudioSrcSpatial(null);
        }}
        title="Success!"
        description="You have successfully uploaded your music!"
      />

      <AlertBox
        showDialog={showDialogUpdate}
        setShowDialog={setShowDialogUpdate}
        onstepComplete={() => {
          navigate(`/music/library`);
        }}
        title="Success!"
        description="You have successfully updated your music!"
      />

      <AlertBoxError
        showDialog={showDialogError}
        setShowDialog={setShowDialogError}
        onstepComplete={() => {}}
        title="Error!"
        description="Please upload valid image format (e.g. JPEG,PNG)"
      />

      <AlertBoxError
        showDialog={showDialogErrorSong}
        setShowDialog={setShowDialogErrorSong}
        onstepComplete={() => {}}
        title="Error!"
        description="Please upload valid image format (Invalid file type. Only MP3 or WAV allowed.)"
      />

      <AlertBoxError
        showDialog={showDialogErrorDolby}
        setShowDialog={setShowDialogErrorDolby}
        onstepComplete={() => {}}
        title="Error!"
        description="Please upload valid image format (Invalid file type. Only MP3 or WAV allowed.)"
      />
    </div>
  );
}

export default UploadMusic;
