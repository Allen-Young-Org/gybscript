import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Heart, MessageCircle, Pause, Play, Send } from 'lucide-react';

import profilePic1 from '../../assets/image/feed/profilePic1.png';
import avatar1 from '../../assets/image/feed/avatar1.png';
import avatar2 from '../../assets/image/feed/avatar2.png';
import avatar3 from '../../assets/image/feed/avatar3.png';
import avatar4 from '../../assets/image/feed/avatar4.png';
import avatar5 from '../../assets/image/feed/avatar5.png';
import avatar6 from '../../assets/image/feed/avatar6.png';
import TrackImage1 from '../../assets/image/feed/TrackImage1.png';
import TrackImage2 from '../../assets/image/feed/TrackImage2.png';
import followIcon from '../../assets/image/feed/followIcon.png';
import dots from '../../assets/image/feed/dots.png';
import uil_play from '../../assets/image/feed/uil_play.png';
import heartFill from '../../assets/image/feed/heartFill.png';
import test1 from '../../assets/image/feed/test1.mp3';
import test2 from '../../assets/image/feed/test2.mp3';


interface Songwriter {
  firstName: string;
  lastName: string;
  middleName: string;
}

interface MediaAttached {
  type: string;
  image: string;
  length: string;
  songId: number;
  title: string;
  genre: string;
  play: number;
  audioUrl: string;

}

interface Song {
  id: number;
  title: string;
  trackNumber: string;
  upc: string;
  isrc: string;
  featuredArtists: string[];
  songWriters: Songwriter[];
  mediaAttached: MediaAttached;
}

interface Comment {
  id: number;
  attachedTo: number;
  avatar: string;
  dateCommented: string;
  comment: string;
  commenter: string;
  likes: number;
}

interface Post {
  id: number;
  name: string;
  avatar: string;
  datePosted: string;
  caption: string;
  mediaAttached?: MediaAttached;
  likes: number;
  comments: Comment[];
}

interface CreatePostProps {
  onPostSubmit: (post: Post) => void;
}

interface RenderCommentProps {
  comment: Comment;
}

interface PostProps {
  post: Post;
  currentUserAvatar: string;
  onUpdatePost: (updatedPost: Post) => void;
}


export const formatPlayCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export const renderHastag = (text: string): React.ReactNode => {
  if (!text) return null;

  const words = text.split(' ');
  return (
    <>
      {words.map((word, index) => {
        if (word.startsWith('#')) {
          return <span key={index} className="text-blue-500">{word} </span>;
        }
        return word + ' ';
      })}
    </>
  );
};

export const songs: Song[] = [
  {
    id: 1,
    title: "Falling In Love With You",
    trackNumber: "",
    upc: "123456789012",
    isrc: "ISRC001",
    featuredArtists: ["Elvis Presley", "Paul Macarthney"],
    songWriters: [
      { firstName: "Allen", lastName: "Young", middleName: "Dacanay" },
      { firstName: "Michael", lastName: "Jordan", middleName: "" },
    ],
    mediaAttached: {
      type: "mp3",
      image: TrackImage2,
      length: "03:15",
      songId: 6,
      title: "Falling In Love With You",
      genre: "Pop",
      play: 1662,
      audioUrl: test2,
    },
  }
];

const mockData: Post[] = [
  {
    id: 1,
    name: "John Smith",
    avatar: avatar1,
    datePosted: "Feb 24, 2024",
    caption: "Fork This Beat & Tag Me! #hiphop #rap #soundlab #raw #fire #trap #music #trending #freestyle #beat #lit #bars #rap #instrumental #love #rnb #rock #like #artist #newmusic #follow #chill #hiphopbeat #uk #country #lofi #guitar #flow #acousting #mixing",
    mediaAttached: {
      type: "mp3",
      image: TrackImage1,
      length: "02:21",
      songId: 5,
      title: "FREAKY (REMASTERED)",
      genre: "Hip Hop",
      play: 1908678,
      audioUrl: test1
    },
    likes: 142,
    comments: [
      {
        id: 1,
        attachedTo: 1,
        avatar: avatar2,
        dateCommented: "Feb 25, 2024",
        comment: "Wow! Good job, really amazing!",
        commenter: "Alex Rodriguez",
        likes: 2
      },
      {
        id: 2,
        attachedTo: 1,
        avatar: avatar3,
        dateCommented: "Feb 25, 2024",
        comment: "Nice! That's a hit.",
        commenter: "Sarah Thompson",
        likes: 5
      },
      {
        id: 5,
        attachedTo: 1,
        avatar: avatar3,
        dateCommented: "Feb 25, 2024",
        comment: "Nice! That's a hit.",
        commenter: "Sarah Thompson",
        likes: 2
      },
      {
        id: 6,
        attachedTo: 1,
        avatar: avatar3,
        dateCommented: "Feb 25, 2024",
        comment: "Nice! That's a hit.",
        commenter: "Sarah Thompson",
        likes: 2
      }
    ]
  },
  {
    id: 2,
    name: "John Denver",
    avatar: avatar4,
    datePosted: "Feb 23, 2024",
    caption: "Here's a new song that I've built over this month! Hope you like it as much as I do. #pop #rehnew #vibes",
    mediaAttached: {
      type: "mp3",
      image: TrackImage2,
      length: "03:15",
      songId: 6,
      title: "Take Me Home, Country Roads",
      genre: "Pop",
      play: 1662,
      audioUrl: test2
    },
    likes: 350,
    comments: [
      {
        id: 3,
        attachedTo: 2,
        avatar: avatar5,
        dateCommented: "Feb 25, 2024",
        comment: "Like how you smoothen the bridge with a lullaby!",
        commenter: "Hugh Hill",
        likes: 6
      },
      {
        id: 4,
        attachedTo: 2,
        avatar: avatar6,
        dateCommented: "Feb 25, 2024",
        comment: "I really like this one! ❤️❤️",
        commenter: "melanieleonie",
        likes: 7
      }
    ]
  }
];

const CreatePost: React.FC<CreatePostProps> = ({ onPostSubmit }) => {
  const [postData, setPostData] = useState<{
    caption: string;
    selectedSongId: string;
  }>({
    caption: '',
    selectedSongId: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setPostData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!postData.caption.trim()) {
      alert("Please enter a caption");
      return;
    }

    const selectedSong = postData.selectedSongId
      ? songs.find(song => song.id === parseInt(postData.selectedSongId))
      : null;

    const newPost: Post = {
      id: Date.now(),
      name: "John Smith",
      avatar: profilePic1,
      datePosted: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      caption: postData.caption,
      mediaAttached: selectedSong ? selectedSong.mediaAttached : undefined,
      likes: 0,
      comments: []
    };

    onPostSubmit(newPost);
    setPostData({
      caption: '',
      selectedSongId: ''
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg">
      <div className="text-dark font-bold text-[#C09239] mb-4" style={{ fontSize: "30px" }}>
        FEED
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex dark:text-white dark:bg-gray-800 items-start mb-4">
          <img
            src={profilePic1}
            alt="User Avatar"
            className="w-14 h-14 rounded-full mr-3 flex-shrink-0"
          />
          <textarea
            name="caption"
            value={postData.caption}
            onChange={handleChange}
            className="w-full dark:bg-gray-800 dark:text-white px-2 pr-4 rounded-2xl text-sm resize-none
            overflow-y-auto scrollbar-thin scrollbar-thumb-transparent scrollbar-track-transparent border"
            placeholder="What's new?"
            style={{
              paddingBottom: postData.caption.split('\n').length > 1 ? '10%' : '0px',
            }}
          />
        </div>
        <div className="mb-4">
          <select
            name="selectedSongId"
            value={postData.selectedSongId}
            onChange={handleChange}
            className="w-full px-2 py-1 dark:bg-gray-800 dark:text-white rounded border"
          >
            <option value="">Select a song (optional)</option>
            {songs.map(song => (
              <option key={song.id} value={song.id}>
                {song.title} - {song.featuredArtists.join(', ')}
              </option>
            ))}
          </select>
        </div>
        <div className="text-right">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
            disabled={!postData.caption.trim()}
          >
            Post
          </button>
        </div>
      </form>
    </div>
  );
};

const RenderComment: React.FC<RenderCommentProps> = ({ comment }) => (
  <div className="mb-3 pl-4 tracking-wide flex items-center border-gray-200">
    <img src={comment.avatar} alt={comment.commenter} className="w-8 h-8 rounded-full mr-3 mb-3" />
    <div className='w-full tracking-wide'>
      <div className='flex justify-between items-center tracking-wide mb-2'>
        <p className="font-bold !tracking-wide dark:text-white">{comment.commenter}</p>
        <div className='text-xs text-[#767676] tracking-wide'>{comment.dateCommented}</div>
      </div>
      <p className='!tracking-wide'>{comment.comment}</p>
      <div className="flex items-center justify-between text-sm text-gray-500 mt-1">
        <div className='flex items-center'>
          <button className="mr-3">Reply</button>
          <button className="mr-3 flex items-center">Like</button>
        </div>
        <div className='flex items-center text-[#767676]'>
          <img src={heartFill} alt="heart" width={17} className="mr-1" />
          {comment.likes}
        </div>
      </div>
    </div>
  </div>
);

const Post: React.FC<PostProps> = ({ post, currentUserAvatar, onUpdatePost }) => {
  const [newComment, setNewComment] = useState<string>('');
  const [showAllComments, setShowAllComments] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  useEffect(() => {
    if (wavesurfer) {
      wavesurfer.destroy();
    }

    if (waveformRef.current) {
      waveformRef.current.innerHTML = '';
    }

    if (waveformRef.current && !wavesurfer && post.mediaAttached?.audioUrl) {
      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'violet',
        progressColor: 'purple',
        cursorColor: 'navy',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 75,
        barGap: 3,
      });

      ws.load(post.mediaAttached.audioUrl);
      setWavesurfer(ws);
      ws.on('finish', () => setIsPlaying(false));
    }

    return () => {
      if (wavesurfer) {
        wavesurfer.destroy();
      }
    };
  }, [post.mediaAttached?.audioUrl]);

  const togglePlay = (): void => {
    if (wavesurfer) {
      wavesurfer.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObj: Comment = {
      id: Date.now(),
      attachedTo: post.id,
      avatar: currentUserAvatar,
      dateCommented: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      comment: newComment,
      commenter: post.name,
      likes: 0
    };

    const updatedPost: Post = {
      ...post,
      comments: [newCommentObj, ...post.comments]
    };

    onUpdatePost(updatedPost);
    setNewComment('');
  };

  const handleLike = (): void => {
    const updatedPost: Post = {
      ...post,
      likes: isLiked ? post.likes - 1 : post.likes + 1
    };
    setIsLiked(!isLiked);
    onUpdatePost(updatedPost);
  };

  const visibleComments = showAllComments ? post.comments : post.comments.slice(0, 2);
  const hiddenCommentsCount = post.comments.length - 2;
  const shouldRenderMedia = post.mediaAttached && post.mediaAttached.audioUrl && post.mediaAttached.audioUrl !== "";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 p-4">
      <div className='flex justify-between items-center'>
        <div className="flex items-center mb-2">
          <img src={post.avatar} alt={post.name} className="w-12 h-12 rounded-full mr-2" />
          <div>
            <h3 className="m-0 tracking-wide">{post.name}</h3>
            <p className="text-sm text-gray-500 !tracking-wide">{post.datePosted}</p>
          </div>
        </div>
        <div className='flex gap-2 items-center'>
          <button className='px-3 py-1 bg-[#FFF5DA] rounded-lg text-[#C08B24] flex items-center tracking-wide gap-1'>
            <img src={followIcon} alt="Follow" /> Follow
          </button>
          <img src={dots} alt="Options" width={25} height={25} className='cursor-pointer' />
        </div>
      </div>
      <p className="mb-4">{renderHastag(post.caption)}</p>
      {shouldRenderMedia && (
        <div className="bg-[#DCDAEF] rounded-lg p-4 mb-2">
          <div className='flex items-center gap-2'>
            <div className='w-36'>
              <img src={post.mediaAttached?.image} alt={post.mediaAttached?.title} className="bg-gray-300 rounded-lg" />
            </div>
            <div className='w-full'>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div>
                    <h4 className="font-bold flex items-center gap-2 tracking-wide">
                      {post.mediaAttached?.title || 'No Title'}
                      <span className='text-xs bg-[#E3E0E0] px-2 py-1 w-14 text-center rounded-full'>
                        {post.mediaAttached?.genre || 'Unknown Genre'}
                      </span>
                    </h4>
                    <p className="text-sm mb-2 !tracking-wide">{post.name}</p>
                    <p className="text-sm mb-2 !tracking-wide">{post.mediaAttached?.length || 'Unknown Length'}</p>
                  </div>
                </div>
                <p className='flex items-center gap-2 text-sm'>
                  <span><img src={uil_play} alt="Play count" width={15} height={15} /></span>
                  {formatPlayCount(post.mediaAttached?.play || 0)}
                </p>
              </div>
              <div className="flex items-center">
                <button
                  onClick={togglePlay}
                  className="mr-2 bg-blue-500 text-white p-2 rounded-full"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <div ref={waveformRef} className="w-full h-20" />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between text-gray-500 mb-4">
        <div className="flex items-center text-sm px-3 py-1 w-20 text-center rounded-full">
          <button
            onClick={handleLike}
            className={`flex items-center text-sm ${isLiked ? 'bg-blue-100 text-blue-500' : 'bg-[#EDEDED]'} px-3 py-1 w-20 text-center rounded-full transition-colors duration-200`}
          >
            <Heart className="mr-1" width={20} height={20} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{post.likes}</span>
          </button>
        </div>
        <div className="flex items-center">
          <MessageCircle className="mr-1" />
          <span>{post.comments.length} comments</span>
        </div>
      </div>
      <div className="mb-4">
        <form onSubmit={handleCommentSubmit} className="flex items-center pb-4">
          <div className="relative flex-grow">
            <img
              src={currentUserAvatar}
              alt="Your avatar"
              className="w-8 h-8 rounded-full mr-2 absolute right-2 top-1/2 left-1 transform -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="Leave a comment..."
              className="w-full py-2 pl-10 pr-10 border border-gray-300 rounded-full"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
        {visibleComments.map(comment => (
          <RenderComment key={comment.id} comment={comment} />
        ))}
        {!showAllComments && hiddenCommentsCount > 0 && (
          <button
            onClick={() => setShowAllComments(true)}
            className="text-[#324054] -mt-10 pl-14"
          >
            View {hiddenCommentsCount} comment{hiddenCommentsCount !== 1 ? 's' : ''}
          </button>
        )}
      </div>
    </div>
  );
};

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(mockData);

  const handleNewPost = (newPost: Post): void => {
    setPosts(prevData => [newPost, ...prevData]);
  };

  const handleUpdatePost = (updatedPost: Post): void => {
    setPosts(prevData =>
      prevData.map(post => post.id === updatedPost.id ? updatedPost : post)
    );
  };

  return (
    <div className="w-full p-4 border-r-4 border-gray-100">
      <div className="mx-auto">
        <CreatePost onPostSubmit={handleNewPost} />
        {posts.map(post => (
          <Post
            key={post.id}
            post={post}
            currentUserAvatar={post.avatar}
            onUpdatePost={handleUpdatePost}
          />
        ))}
      </div>
    </div>
  );
};

export default Feed;