import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { serverTimestamp } from "firebase/firestore";
//import { useAuth } from "../../context/AuthContext";
import { useAuth } from "@/providers/AuthProvider";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import AlertBoxOption from "@/components/ui/AlertBoxOption";
import AlertBoxError from "@/components/ui/AlertBoxError";
import AlertBox from "@/components/ui/AlertBox";
import {
  useDocumentByFields,
  useUpdateDocumentsWithProperties,
} from "@/api/firebaseHooks";

// Define interfaces for props and data models
interface MyLibraryProps {
  imported: boolean;
  onIncludeSong: (songID: string) => void;
  selectedSongIDs: { songID: string }[];
  fromLyrics: boolean;
  fromPromote: boolean;
  setActiveTab: (tab: string) => void;
  setPromotionType: (type: string) => void;
  setSelectedSongs: (songs: any[]) => void;
  setSelectedAlbums: (albums: any[]) => void;
  filtered: string;
  setFiltered: (value: string) => void;
}

export interface Song {
  songID: string;
  SongTitle: string;
  songPicURL: string;
  audioFileURL: string;
  featuredArtists?: string[];
  // Additional fields as needed
}

export interface Album {
  albumID: string;
  albumName: string;
  songPicURL: string;
  selectedSongs: { songID: string }[];
  // Additional fields as needed
}

const MyLibrary: React.FC<MyLibraryProps> = ({
  imported,
  onIncludeSong,
  selectedSongIDs,
  fromLyrics,
  fromPromote,
  setActiveTab,
  setPromotionType,
  setSelectedSongs,
  setSelectedAlbums,
  filtered,
  setFiltered,
}) => {
  const {
    control,
    formState: { errors },
    register,
    handleSubmit,
    setValue,
    reset,
  } = useForm();
  const { userDetails } = useAuth();
  const navigate = useNavigate();

  // Local component states
  const [filter, setFilter] = useState<string>("single");
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [toDeleteAlbum, setToDeleteAlbum] = useState<string | null>(null);
  const [onLoad, setOnLoading] = useState<boolean>(false);
  const [showDialogUpdate, setShowDialogUpdate] = useState<boolean>(false);
  const [showDialogUpdateAlbum, setShowDialogUpdateAlbum] =
    useState<boolean>(false);
  const [showDialogError, setShowDialogError] = useState<boolean>(false);
  const [showDialogDeleteSuccess, setShowDialogDeleteSuccess] =
    useState<boolean>(false);
  const [showDialogDeleteSuccessAlbum, setShowDialogDeleteSuccessAlbum] =
    useState<boolean>(false);
  const [searchTermImported, setSearchTermImported] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchTermAlbum, setSearchTermAlbum] = useState<string>("");
  const [playSongPic, setPlaySongPic] = useState<string | null>(null);
  const [playSongPlay, setPlaySongPlay] = useState<string | null>(null);
  const [playSongTitle, setPlaySongTitle] = useState<string | null>(null);
  const [playAlbumPic, setPlayAlbumPic] = useState<string | null>(null);
  const [playAlbumTitle, setPlayAlbumTitle] = useState<string | null>(null);
  const [playAlbumSongs, setPlayAlbumSongs] = useState<Album["selectedSongs"]>(
    []
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;

  // Fetch songs and albums using TanStack Query hooks
  const { data: songsData, isLoading: songsLoading } = useDocumentByFields(
    "musicUploads",
    {
      userId: userDetails ? (userDetails as any).userId : "",
      status: "active",
    }
  );
  const { data: albumsData, isLoading: albumsLoading } = useDocumentByFields(
    "AlbumUploads",
    {
      userId: userDetails ? (userDetails as any).userId : "",
      status: "active",
    }
  );

  const songs: Song[] = (songsData as Song[]) || [];
  const albums: Album[] = (albumsData as Album[]) || [];

  // Imported songs filtering and pagination
  const filteredSongsImported = useMemo(() => {
    return searchTermImported
      ? songs.filter((song) =>
          song.SongTitle.toLowerCase().includes(
            searchTermImported.toLowerCase()
          )
        )
      : songs;
  }, [searchTermImported, songs]);

  const totalPages = Math.ceil(filteredSongsImported.length / itemsPerPage);
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentSongs = filteredSongsImported.slice(firstIndex, lastIndex);

  const handlePageChange = (direction: "next" | "prev") => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTermImported]);

  const includeSong = (songID: string) => {
    onIncludeSong(songID);
  };

  const isSongSelected = (songID: string) => {
    return selectedSongIDs.some((song) => song.songID === songID);
  };

  const filters = (filter: string) => {
    setFilter(filter);
    setSearchTerm("");
    setSearchTermAlbum("");
  };

  const playSong = (songPic: string, songPlay: string, songTitle: string) => {
    setFilter("soloPlay");
    setPlaySongPic(songPic);
    setPlaySongPlay(songPlay);
    setPlaySongTitle(songTitle);
  };

  const closePlaySong = () => {
    setFilter("single");
    setPlaySongPic(null);
    setPlaySongPlay(null);
    setPlaySongTitle(null);
  };

  const playAlbum = (
    albumPic: string,
    albumSongs: Album["selectedSongs"],
    albumTitle: string
  ) => {
    setFilter("albumPlay");
    setPlayAlbumPic(albumPic);
    setPlayAlbumTitle(albumTitle);
    setPlayAlbumSongs(albumSongs);
  };

  const closePlayAlbum = () => {
    setFilter("album");
    setPlayAlbumPic(null);
    setPlayAlbumTitle(null);
    setPlayAlbumSongs([]);
  };

  const matchedSongs = useMemo(() => {
    if (filter === "albumPlay" && playAlbumSongs.length > 0) {
      return playAlbumSongs
        .map((albumSong) => {
          const match = songs.find((song) => song.songID === albumSong.songID);
          if (match) {
            return {
              songTitle: match.SongTitle,
              audioFileURL: match.audioFileURL,
              songPic: match.songPicURL,
            };
          }
          return null;
        })
        .filter(Boolean) as {
        songTitle: string;
        audioFileURL: string;
        songPic: string;
      }[];
    }
    return [];
  }, [filter, playAlbumSongs, songs]);

  const handlePromote = (item: Song | Album, type: string) => {
    if (type === "single") {
      setSelectedSongs([
        {
          songID: (item as Song).songID,
          title: (item as Song).SongTitle,
          featuredArtists: (item as Song).featuredArtists,
        },
      ]);
    } else {
      setSelectedAlbums([
        {
          albumID: (item as Album).albumID,
          albumName: (item as Album).albumName,
          songPicURL: (item as Album).songPicURL,
          timestamp: "", // Adjust if needed
          songs: (item as Album).selectedSongs || [],
        },
      ]);
    }
    setPromotionType(type);
    setActiveTab("New Edit");
    setFiltered(type === "single" ? "single" : "album");
  };

  const handleEdit = (song: Song) => {
    const currentPath = window.location.pathname;
    const isFromLyricsPage = currentPath.includes("lyrics");
    const destinationPath = isFromLyricsPage
      ? `/music/uploadsong?update=true#lyrics`
      : `/music/uploadsong?update=true`;

    navigate(destinationPath, {
      state: { songData: song },
    });

    if (isFromLyricsPage) {
      setTimeout(() => {
        const lyricsSection = document.getElementById("lyrics");
        if (lyricsSection) {
          lyricsSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  const handleEditAlbum = (album: Album) => {
    navigate(`/music/uploadalbum?update=true`, {
      state: { albumData: album },
    });
  };

  // Delete operations using TanStack Query hooks for updating status to "inactive"
  const deleteMusicMutation = useUpdateDocumentsWithProperties("musicUploads", {
    songID: toDelete || "",
  });
  const deleteAlbumMutation = useUpdateDocumentsWithProperties("AlbumUploads", {
    albumID: toDeleteAlbum || "",
  });

  const handleDelete = (song: Song) => {
    setToDelete(song.songID);
    setShowDialogUpdate(true);
  };

  const handleDeleteAlbum = (album: Album) => {
    setToDeleteAlbum(album.albumID);
    setShowDialogUpdateAlbum(true);
  };

  const deleteMusic = async () => {
    try {
      setOnLoading(true);
      await deleteMusicMutation.mutateAsync({
        status: "inactive",
        updatedTimestamp: serverTimestamp(),
      });
      setOnLoading(false);
      setShowDialogDeleteSuccess(true);
    } catch (error) {
      console.error("Error deleting music:", error);
      setShowDialogError(true);
      setOnLoading(false);
    }
  };

  const deleteAlbum = async () => {
    try {
      setOnLoading(true);
      await deleteAlbumMutation.mutateAsync({
        status: "inactive",
        updatedTimestamp: serverTimestamp(),
      });
      setOnLoading(false);
      setShowDialogDeleteSuccessAlbum(true);
    } catch (error) {
      console.error("Error deleting album:", error);
      setShowDialogError(true);
      setOnLoading(false);
    }
  };

  return (
    <div className="w-full">
      {(songsLoading || albumsLoading || onLoad) && <LoadingSpinner />}

      {imported ? (
        // Render when imported === true
        <div className="w-full mt-5">
          <FloatingLabelInput
            className="w-full"
            label="Search Song"
            value={searchTermImported}
            onChange={(e) => setSearchTermImported(e.target.value)}
          />
          <div className="flex flex-wrap gap-4 mt-4 w-full">
            {currentSongs.length > 0 ? (
              currentSongs.map((song) => (
                <div key={song.songID}>
                  <div
                    className={`${
                      isSongSelected(song.songID)
                        ? "bg-accent dark:bg-accent border-accent"
                        : "bg-white dark:bg-gray-600/0 cursor-pointer"
                    } shadow border-[1px] p-4`}
                    onClick={() =>
                      !isSongSelected(song.songID) && includeSong(song.songID)
                    }
                  >
                    <img
                      src={song.songPicURL}
                      alt={song.SongTitle}
                      className="h-36 w-36"
                    />
                  </div>
                  <div
                    className={`${
                      isSongSelected(song.songID) ? "" : "cursor-pointer"
                    } justify-center text-sm mt-2 flex space-x-1 max-w-44 truncate`}
                    onClick={() =>
                      !isSongSelected(song.songID) && includeSong(song.songID)
                    }
                  >
                    <div className="truncate">{song.SongTitle}</div>
                    <div>|</div>
                    <div>Year</div>
                    <div>|</div>
                    <div>1 song</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-600 mt-4">
                No songs uploaded
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center space-x-4 mt-4">
              <button
                type="button"
                className={`text-accent ${
                  currentPage === 1 ? "text-gray-500" : ""
                }`}
                onClick={() => handlePageChange("prev")}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => handlePageChange("next")}
                className={`text-accent ${
                  currentPage === totalPages ? "text-gray-500" : ""
                }`}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        // Render when imported !== true
        <div>
          {fromLyrics !== true && (
            <div
              className="text-dark font-bold text-accent mb-4"
              style={{ fontSize: "30px" }}
            >
              MY LIBRARY
            </div>
          )}
          <div className="flex mt-4 justify-between">
            {filter === "albumPlay" && (
              <div
                className="text-accent cursor-pointer"
                onClick={closePlayAlbum}
              >
                Go Back
              </div>
            )}
            {filter === "soloPlay" && (
              <div
                className="text-accent cursor-pointer"
                onClick={closePlaySong}
              >
                Go Back
              </div>
            )}
            {filter !== "soloPlay" && filter !== "albumPlay" && (
              <div className="flex space-x-4">
                {fromLyrics !== true && (
                  <>
                    <div
                      className={`cursor-pointer ${
                        filter === "single" ? "text-accent" : "text-gray-600"
                      }`}
                      onClick={() => filters("single")}
                    >
                      Singles and EPs
                    </div>
                    <div>|</div>
                    <div
                      className={`cursor-pointer ${
                        filter === "album" ? "text-accent" : "text-gray-600"
                      }`}
                      onClick={() => filters("album")}
                    >
                      Album
                    </div>
                  </>
                )}
              </div>
            )}
            {filter === "single" && (
              <FloatingLabelInput
                label="Search Song"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            )}
            {filter === "album" && (
              <FloatingLabelInput
                label="Search Album"
                value={searchTermAlbum}
                onChange={(e) => setSearchTermAlbum(e.target.value)}
              />
            )}
          </div>
          {filter === "soloPlay" && (
            <div className="mt-12">
              <div className="flex space-x-4">
                <div className="w-[30%]">
                  <img
                    src={playSongPic || ""}
                    alt={playSongTitle || ""}
                    className="h-80 w-80"
                  />
                </div>
                <div className="w-[70%]">
                  <div className="font-semibold text-3xl">{playSongTitle}</div>
                  <audio
                    key={playSongPlay || ""}
                    controls
                    className="w-full mt-2"
                  >
                    <source src={playSongPlay || ""} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            </div>
          )}
          {filter === "albumPlay" && (
            <div className="mt-12">
              <div className="flex space-x-4">
                <div className="w-[30%]">
                  <img
                    src={playAlbumPic || ""}
                    alt={playAlbumTitle || ""}
                    className="h-80 w-80"
                  />
                </div>
                <div className="w-[70%]">
                  <div className="font-semibold text-3xl mb-3">
                    {playAlbumTitle}
                  </div>
                  {matchedSongs.length > 0 ? (
                    matchedSongs.map((song, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 shadow border-[1px] border-accent rounded flex mb-4"
                      >
                        <div className="w-[20%]">
                          <img
                            src={song.songPic}
                            alt={song.songTitle}
                            className="h-24 w-24"
                          />
                        </div>
                        <div className="w-full">
                          <div>{song.songTitle}</div>
                          <audio
                            key={song.audioFileURL}
                            controls
                            className="w-full mt-2"
                          >
                            <source src={song.audioFileURL} type="audio/mpeg" />
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">No matching songs found.</p>
                  )}
                </div>
              </div>
            </div>
          )}
          {filter === "single" && (
            <div className="mt-7">
              <div className="flex flex-wrap gap-4 mt-4">
                {songs.length > 0 ? (
                  songs
                    .filter((song) =>
                      song.SongTitle.toLowerCase().includes(
                        searchTerm.toLowerCase()
                      )
                    )
                    .map((song) => (
                      <div key={song.songID}>
                        <div
                          className="bg-white dark:bg-gray-600/0 dark:text-white shadow border-[1px] border-accent p-4 cursor-pointer"
                          onClick={() =>
                            playSong(
                              song.songPicURL,
                              song.audioFileURL,
                              song.SongTitle
                            )
                          }
                        >
                          <img
                            src={song.songPicURL}
                            alt={song.SongTitle}
                            className="h-36 w-36"
                          />
                        </div>
                        <div className="cursor-pointer text-center w-40 truncate">
                          {song.SongTitle}
                        </div>
                        <div className="justify-center text-sm flex space-x-1">
                          <div>Year</div>
                          <div>|</div>
                          <div>1 song</div>
                        </div>
                        <div className="flex text-sm justify-center items-center space-x-2">
                          <div
                            className="text-[#C09239] cursor-pointer"
                            onClick={() => handleEdit(song)}
                          >
                            Edit
                          </div>
                          {fromLyrics !== true && (
                            <>
                              <div
                                className="text-red-500 cursor-pointer"
                                onClick={() => handleDelete(song)}
                              >
                                Delete
                              </div>
                              {fromPromote !== true && (
                                <div
                                  className="text-green-500 cursor-pointer"
                                  onClick={() => handlePromote(song, filter)}
                                >
                                  Promote
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center text-gray-600 mt-4">
                    No songs to show
                  </div>
                )}
              </div>
            </div>
          )}
          {filter === "album" && (
            <div className="mt-7">
              <div className="flex flex-wrap gap-4 mt-4">
                {albums.length > 0 ? (
                  albums.map((album) => (
                    <div key={album.albumID}>
                      <div
                        className="bg-white shadow border-[1px] border-accent p-4 cursor-pointer"
                        onClick={() =>
                          playAlbum(
                            album.songPicURL,
                            album.selectedSongs,
                            album.albumName
                          )
                        }
                      >
                        <img
                          src={album.songPicURL}
                          alt={album.albumName}
                          className="h-36 w-36"
                        />
                      </div>
                      <div className="cursor-pointer text-center w-40 truncate">
                        {album.albumName}
                      </div>
                      <div className="justify-center text-sm flex space-x-1">
                        <div>Year</div>
                        <div>|</div>
                        <div>{album.selectedSongs.length} songs</div>
                      </div>
                      <div className="flex text-sm justify-center space-x-2">
                        <div
                          className="text-[#C09239] cursor-pointer"
                          onClick={() => handleEditAlbum(album)}
                        >
                          Edit
                        </div>
                        <div
                          className="text-red-500 cursor-pointer"
                          onClick={() => handleDeleteAlbum(album)}
                        >
                          Delete
                        </div>
                        {fromPromote !== true && (
                          <div
                            className="text-green-500 cursor-pointer"
                            onClick={() => handlePromote(album, filter)}
                          >
                            Promote
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-600 mt-4">
                    No album to show
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <AlertBoxOption
        showDialog={showDialogUpdate}
        setShowDialog={setShowDialogUpdate}
        onstepComplete={deleteMusic}
        title="Warning!"
        description="Are you sure to delete your music?!"
      />
      <AlertBoxOption
        showDialog={showDialogUpdateAlbum}
        setShowDialog={setShowDialogUpdateAlbum}
        onstepComplete={deleteAlbum}
        title="Warning!"
        description="Are you sure to delete your album?!"
      />
      <AlertBoxError
        showDialog={showDialogError}
        setShowDialog={setShowDialogError}
        onstepComplete={() => {}}
        title="Error!"
        description="No such music found!"
      />
      <AlertBox
        showDialog={showDialogDeleteSuccess}
        setShowDialog={setShowDialogDeleteSuccess}
        onstepComplete={() => {}}
        title="Success!"
        description="You have deleted your song!"
      />
      <AlertBox
        showDialog={showDialogDeleteSuccessAlbum}
        setShowDialog={setShowDialogDeleteSuccessAlbum}
        onstepComplete={() => {}}
        title="Success!"
        description="You have deleted your album!"
      />
    </div>
  );
};

export default MyLibrary;
