import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { ImageIcon } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';

interface RegistrationStep3Props {
  onBack: () => void;
  onStepComplete: (data: any) => void;
  userData?: any;
}

 
const MenuButton = ({ 
  onClick, 
  isActive = false, 
  children 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  children: React.ReactNode; 
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 ${isActive ? 'bg-accent/20 text-accent' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} rounded`}
  >
    {children}
  </button>
);

const RegistrationStep3 = ({ onBack, onStepComplete, userData = {} }: RegistrationStep3Props) => {
  const [headerPhoto, setHeaderPhoto] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isDraggingHeader, setIsDraggingHeader] = useState<boolean>(false);
  const [isDraggingProfile, setIsDraggingProfile] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      alt_name: userData?.alt_name || '',
      artist_band_name: userData?.artist_band_name || '',
      bio: userData?.bio || '',
      website_link: userData?.website_link || '',
      twitter_link: userData?.twitter_link || '',
      facebook_link: userData?.facebook_link || '',
      tiktok_link: userData?.tiktok_link || '',
      instagram_link: userData?.instagram_link || '',
      youtube_link: userData?.youtube_link || '',
    }
  });

  useEffect(() => {
    // Only reset if userData has actual values
    if (userData && Object.keys(userData).length > 0) {
      reset({
        alt_name: userData?.alt_name || '',
        artist_band_name: userData?.artist_band_name || '',
        bio: userData?.bio || '',
        website_link: userData?.website_link || '',
        twitter_link: userData?.twitter_link || '',
        facebook_link: userData?.facebook_link || '',
        tiktok_link: userData?.tiktok_link || '',
        instagram_link: userData?.instagram_link || '',
        youtube_link: userData?.youtube_link || '',
      });
      
      if (userData?.headerPhotoUrl) {
        setHeaderPhoto(userData?.headerPhotoUrl);
      }
      
      if (userData?.profilePhotoUrl) {
        setProfilePhoto(userData?.profilePhotoUrl);
      }
    }
  }, [userData, reset]);

  // Centralized file handling function
  const handleFile = (file: File | undefined, setPhoto: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Header photo event handlers
  const handleHeaderPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file, setHeaderPhoto);
  };

  const handleHeaderDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingHeader(true);
  };

  const handleHeaderDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingHeader(false);
  };

  const handleHeaderDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleHeaderDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingHeader(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file, setHeaderPhoto);
  };

  // Profile photo event handlers
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file, setProfilePhoto);
  };

  const handleProfileDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingProfile(true);
  };

  const handleProfileDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingProfile(false);
  };

  const handleProfileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleProfileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingProfile(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file, setProfilePhoto);
  };

  const onSubmit = (data: any) => {
    if (onStepComplete) {
      onStepComplete({ ...data, headerPhoto, profilePhoto });
    }
    console.log("data", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto">
      {/* Header section */}
      <div className="text-center mb-8">
        <div className="text-dark font-bold text-accent mb-4" style={{ fontSize: "30px" }}>
          FINISHING TOUCHES
        </div>
        <p className="text-accent">Bells and whistles to complete your profile.</p>

        <div className="flex justify-center gap-2 mt-4">
          {[1, 2, 3, 4, 5].map((dot, index) => (
            <div
              key={dot}
              className={`w-4 h-4 rounded-full ${index === 3 ? "w-6 bg-accent" : "bg-gray-300"}`}
            ></div>
          ))}
        </div>
      </div>

      {/* Enhanced Photo upload section */}
      <div className="mb-8">
        <div
          className={`relative w-full h-48 bg-white dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center cursor-pointer overflow-hidden transition-colors duration-200
              ${isDraggingHeader
                ? 'border-2 border-dashed border-[#C09239] bg-[#C09239]/10'
                : 'border border-gray-500 hover:border-accent hover:bg-[#C09239]/5'}`}
          onClick={() => document.getElementById("headerPhoto")?.click()}
          onDragEnter={handleHeaderDragEnter}
          onDragLeave={handleHeaderDragLeave}
          onDragOver={handleHeaderDragOver}
          onDrop={handleHeaderDrop}
        >
          {headerPhoto ? (
            <img src={headerPhoto} alt="Header" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <span className="text-gray-500">
                {isDraggingHeader ? 'Drop header photo here' : 'Header Photo'}
              </span>
              <p className="text-sm text-gray-400 mt-1">
                Click or drag and drop
              </p>
            </div>
          )}
          <input
            type="file"
            id="headerPhoto"
            accept="image/*"
            className="hidden"
            onChange={handleHeaderPhotoChange}
          />
        </div>

        <div
          className={`relative w-24 h-24 bg-white rounded-full -mt-16 ml-8 flex items-center justify-center cursor-pointer overflow-hidden transition-colors duration-200
              ${isDraggingProfile
                ? 'border-2 border-dashed border-accent bg-[#C09239]/10'
                : 'border border-gray-500 hover:border-accent hover:bg-[#C09239]/5'}`}
          onClick={() => document.getElementById("profilePhoto")?.click()}
          onDragEnter={handleProfileDragEnter}
          onDragLeave={handleProfileDragLeave}
          onDragOver={handleProfileDragOver}
          onDrop={handleProfileDrop}
        >
          {profilePhoto ? (
            <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center">
              <ImageIcon className="w-6 h-6 mx-auto text-gray-400" />
              <span className="text-xs text-gray-500">
                {isDraggingProfile ? 'Drop here' : 'Profile Photo'}
              </span>
            </div>
          )}
          <input
            type="file"
            id="profilePhoto"
            accept="image/*"
            className="hidden"
            onChange={handleProfilePhotoChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <FloatingLabelInput
          {...register("alt_name")}
          label="Alternative Name"
          error={errors.alt_name?.message}
        />
        <FloatingLabelInput
          {...register("artist_band_name")}
          label="Band Name"
          error={errors.artist_band_name?.message}
        />
      </div>

      <div className="mt-6">
        <div className="relative">
          <label className="absolute dark:bg-gray-800 dark:text-accent text-accent -top-3 left-3 bg-white px-1 text-sm text-gray-500 z-10 font-poppins">
            BIO
          </label>
          <Controller
            name="bio"
            control={control}
            render={({ field }) => (
              <div className="border rounded-md border-black overflow-hidden">
                <TipTapEditor
                  onChange={field.onChange}
                  content={field.value}
                />
              </div>
            )}
          />
          {errors.bio?.message && (
            <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6">
        <FloatingLabelInput
          {...register("website_link")}
          label="Website Link"
          error={errors.website_link?.message}
        />
        <FloatingLabelInput
          {...register("twitter_link")}
          label="Twitter Link"
          error={errors.twitter_link?.message}
        />
        <FloatingLabelInput
          {...register("facebook_link")}
          label="Facebook Link"
          error={errors.facebook_link?.message}
        />
      </div>

      <div className="grid grid-cols-3 gap-6 mt-6">
        <FloatingLabelInput
          {...register("tiktok_link")}
          label="Tiktok Link"
          error={errors.tiktok_link?.message}
        />
        <FloatingLabelInput
          {...register("instagram_link")}
          label="Instagram Link"
          error={errors.instagram_link?.message}
        />
        <FloatingLabelInput
          {...register("youtube_link")}
          label="Youtube Link"
          error={errors.youtube_link?.message}
        />
      </div>

      <div className="flex items-center justify-between mt-8">
        <Button
          type="button"
          variant="ghost"
          className="text-gray-500 hover:text-gray-700"
          onClick={() => {
            if (onStepComplete) {
              onStepComplete(null);
            }
          }}
        >
          Skip
        </Button>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="px-20 py-3 dark:bg-gray-800 hover:bg-inherit dark:text-white rounded-2xl border-black text-black hover:border-[#C09239] hover:text-black"
            onClick={onBack}
          >
            Previous
          </Button>
          <Button
            type="submit"
            className="px-20 py-3 rounded-2xl bg-accent hover:bg-inherit dark:hover:bg-gray-800 hover:text-white dark:hover:text-white hover:text-black border-2 border-accent text-white"
          >
            Save & Continue
          </Button>
        </div>
      </div>
    </form>
  );
};

// TipTap Editor Component
const TipTapEditor = ({ onChange, content = '' }: { onChange: (value: string) => void; content: string }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: 'Write a bio about yourself or your band...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-editor">
      <div className="border-b p-2 flex flex-wrap gap-1">
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
        >
          <span className="font-bold">B</span>
        </MenuButton>
        
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
        >
          <span className="italic">I</span>
        </MenuButton>
        
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
        >
          <span className="underline">U</span>
        </MenuButton>
        
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
        >
          <span className="text-xl">H1</span>
        </MenuButton>
        
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
        >
          <span className="text-lg">H2</span>
        </MenuButton>
        
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
        >
          • List
        </MenuButton>
        
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
        >
          1. List
        </MenuButton>
      </div>
      
      <EditorContent 
        editor={editor} 
        className="prose max-w-none p-4 min-h-[120px] dark:text-white"
      />
    </div>
  );
};

export default RegistrationStep3;