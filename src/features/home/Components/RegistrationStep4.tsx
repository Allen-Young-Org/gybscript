import { useState } from 'react';
import { doc, collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

import { Button } from '@/components/ui/button';
import AlertBox from '@/components/ui/AlertBox';
import { db, storage } from '@/firebase';
import { useAuth } from '@/providers/AuthProvider';

interface ImageData {
  validIdImageId?: string;
  validIdUrl?: string;
  headerPhotoImageId?: string;
  headerPhotoUrl?: string;
  profilePhotoImageId?: string;
  profilePhotoUrl?: string;
  [key: string]: any;
}

interface UserData {
  validId?: string;
  headerPhoto?: string;
  profilePhoto?: string;
  ssn?: string;
  dob?: string;
  label_organization?: string;
  citizenship?: string;
  publishing_company?: string;
  account_number?: string;
  account_name?: string;
  registering_type?: string;
  business_title?: string;
  performer_ch_both?: string;
  isOver18?: boolean;
  artist_band_name?: string;
  alt_name?: string;
  bio?: string;
  website_link?: string;
  twitter_link?: string;
  facebook_link?: string;
  tiktok_link?: string;
  instagram_link?: string;
  youtube_link?: string;
  [key: string]: any; // To allow for dynamic fields
}

interface RegistrationStep4Props {
  userData: UserData;
  onBack: () => void;
  onEdit: () => void;
  onStepComplete: (data: any) => void;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

const RegistrationStep4: React.FC<RegistrationStep4Props> = ({ 
  userData, 
  onBack, 
  onEdit, 
  onStepComplete, 
  isSubmitting, 
  setIsSubmitting 
}) => {
  const { userDetails } = useAuth();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  const uploadImageToStorage = async (imageData: string, imageType: string): Promise<string> => {
    try {
      if (imageData.startsWith('https://firebasestorage.googleapis.com')) {
        console.log(`${imageType} is already a Firebase URL, no need to re-upload`);
        return imageData; // Return the existing URL
      }

      const timestamp = Date.now();
      const filePath = `users/${userDetails?.id}/${imageType}_${timestamp}`;
      const storageRef = ref(storage, filePath);

      let base64DataOnly = imageData;
      if (imageData.includes('base64,')) {
        base64DataOnly = imageData.split('base64,')[1];
      }

      await uploadString(storageRef, base64DataOnly, 'base64');
      const downloadURL = await getDownloadURL(storageRef);
      console.log(`Successfully uploaded ${imageType}:`, downloadURL);
      return downloadURL;
    } catch (error) {
      console.error(`Error handling ${imageType}:`, error);
      throw error;
    }
  };

  const storeImageMetadata = async (imageUrl: string, imageType: string): Promise<{ id: string, url: string }> => {
    try {
      const imageData = {
        createdAt: serverTimestamp(),
        imageType: imageType,
        ownerID: userDetails?.id,
        url: imageUrl
      };

      const docRef = await addDoc(collection(db, "images"), imageData);
      return {
        id: docRef.id,
        url: imageUrl
      };
    } catch (error) {
      console.error(`Error storing ${imageType} metadata:`, error);
      throw error;
    }
  };

  const processImages = async (userData: UserData): Promise<ImageData> => {
    const imageData: ImageData = {};

    try {
      // Process validId
      if (userData.validId) {
        const validIdUrl = await uploadImageToStorage(userData.validId, 'validID');
        const validIdData = await storeImageMetadata(validIdUrl, 'validID');
        imageData.validIdImageId = validIdData.id;
        imageData.validIdUrl = validIdData.url;
      }

      // Process headerPhoto
      if (userData.headerPhoto) {
        const headerPhotoUrl = await uploadImageToStorage(userData.headerPhoto, 'headerPhoto');
        const headerPhotoData = await storeImageMetadata(headerPhotoUrl, 'headerPhoto');
        imageData.headerPhotoImageId = headerPhotoData.id;
        imageData.headerPhotoUrl = headerPhotoData.url;
      }

      // Process profilePhoto
      if (userData.profilePhoto) {
        const profilePhotoUrl = await uploadImageToStorage(userData.profilePhoto, 'profilePhoto');
        const profilePhotoData = await storeImageMetadata(profilePhotoUrl, 'profilePhoto');
        imageData.profilePhotoImageId = profilePhotoData.id;
        imageData.profilePhotoUrl = profilePhotoData.url;
      }

      return imageData;
    } catch (error) {
      console.error('Error processing images:', error);
      throw error;
    }
  };

  const handleSubmit = async (): Promise<void> => {
    setIsSubmitting(true);

    try {
      const imageData = await processImages(userData);
      const { validId, headerPhoto, profilePhoto, ...registrationData } = userData;
      
      if (!userDetails?.id) {
        throw new Error("User ID not available");
      }
      
      const finalRegistrationData = {
        ...registrationData,
        ...imageData,
        userId: userDetails.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const userRegistrationRef = doc(db, 'user_registration', userDetails.id);
      await updateDoc(userRegistrationRef, finalRegistrationData);
      
      if (onStepComplete) {
        onStepComplete(finalRegistrationData);
      }
    } catch (error) {
      console.error("Error during registration:", error);
    } finally {
      setIsSubmitting(false);
      setShowDialog(true);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <div className="text-dark font-bold text-accent mb-4" style={{ fontSize: "30px" }}>
          REGISTRATION SUMMARY
        </div>
        <p className="text-accent">Review your information to ensure your registration.</p>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {[1, 2, 3, 4, 5].map((dot, index) => (
            <div
              key={dot}
              className={`w-4 h-4 rounded-full ${index === 4 ? 'w-6 bg-accent' : 'bg-gray-300'}`}
            ></div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end gap-4 mt-8">
        <Button
          type="button"
          variant="outline"
          className="px-20 py-3 dark:bg-gray-800 hover:bg-inherit dark:text-white rounded-2xl border-black text-black hover:border-[#C09239] hover:text-black"
          onClick={onBack}
        >
          Previous
        </Button>
        <Button
          type="button"
          className="px-20 py-3 rounded-2xl bg-accent hover:bg-inherit border-accent border-2 hover:text-black dark:hover:text-white text-white"
          onClick={onEdit}
        >
          Edit
        </Button>
        <Button
          type="button"
          className="px-20 py-3 rounded-2xl bg-accent hover:bg-inherit border-accent border-2 hover:text-black dark:hover:text-white text-white"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
      
      {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-[#C09239] h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 text-center mt-2">
            Uploading files... {uploadProgress}%
          </p>
        </div>
      )}
      
      {/* Basic Information */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-accent font-poppins">Basic Information</h2>
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-md dark:text-white text-black">First Name</label>
            <p className="font-medium dark:text-white text-gray-500">{userDetails?.first_name || '-'}</p>
          </div>
          <div>
            <label className="block text-md dark:text-white text-black">Middle Name</label>
            <p className="font-medium dark:text-white text-gray-500">{userDetails?.middle_name || '-'}</p>
          </div>
          <div>
            <label className="block dark:text-white text-md text-black">Last Name</label>
            <p className="font-medium dark:text-white text-gray-500">{userDetails?.last_name || '-'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-md dark:text-white text-black">Email</label>
            <p className="font-medium dark:text-white text-gray-500">{userDetails?.email || '-'}</p>
          </div>
          <div>
            <label className="block dark:text-white text-md text-black">Phone</label>
            <p className="font-medium dark:text-white text-gray-500">{userDetails?.phone || '-'}</p>
          </div>
        </div>
        
        <div className='mt-8'>
          <label className="block text-md dark:text-white text-black">Street Address</label>
          <p className="font-medium dark:text-white text-gray-500">
            {[
              userDetails?.street_address_1,
              userDetails?.street_address_2,
              userDetails?.street_city,
              userDetails?.street_state,
              userDetails?.street_zip,
              userDetails?.street_country
            ].filter(Boolean).join(', ') || '-'}
          </p>
        </div>
        
        <div className='mt-8'>
          <label className="block text-md dark:text-white text-black">Mailing Address</label>
          <p className="font-medium dark:text-white text-gray-500">
            {[
              userDetails?.mailing_address_1,
              userDetails?.mailing_address_2,
              userDetails?.mailing_city,
              userDetails?.mailing_state,
              userDetails?.mailing_zip,
              userDetails?.mailing_country
            ].filter(Boolean).join(', ') || '-'}
          </p>
        </div>
      </div>

      <div className="space-y-8 mt-12">
        {/* Bank Information */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-accent font-poppins">Royalties Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-md dark:text-white text-black">SSN</label>
              <p className="font-medium dark:text-white text-gray-500">{userData.ssn || '-'}</p>
            </div>
            <div>
              <label className="block text-md dark:text-white text-black">Date Of Birth</label>
              <p className="font-medium dark:text-white text-gray-500">{userData.dob || '-'}</p>
            </div>
            <div>
              <label className="block text-md dark:text-white text-black">Label / Organizations</label>
              <p className="font-medium dark:text-white text-gray-500">{userData.label_organization || '-'}</p>
            </div>
            <div>
              <label className="block text-md dark:text-white text-black">Citizenship</label>
              <p className="font-medium dark:text-white text-gray-500">{userData.citizenship || '-'}</p>
            </div>
            <div>
              <label className="block text-md dark:text-white text-black">Name Your Publishing Company</label>
              <p className="font-medium dark:text-white text-gray-500">{userData.publishing_company || '-'}</p>
            </div>
            <div>
              <label className="block text-md dark:text-white text-black">Photo of Valid Id</label>
              <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                {userData.validId ? (
                  <img
                    src={userData.validId}
                    alt="Valid ID"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No Valid Id</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-md dark:text-white text-black">Account Number</label>
              <p className="font-medium dark:text-white text-gray-500">
                ••••••{userData.account_number?.slice(-4) || ''}
              </p>
            </div>
            <div>
              <label className="block text-md dark:text-white text-black">Account Name</label>
              <p className="font-medium dark:text-white text-gray-500">{userData.account_name || '-'}</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-accent font-poppins mt-12">Profile Information</h2>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-md dark:text-white text-black">
                Are you registering yourself or for someone else?
              </label>
              <p className="font-medium dark:text-white text-gray-500">{userData.registering_type || '-'}</p>
            </div>
            <div>
              <label className="block text-md dark:text-white text-black">Business Title?</label>
              <p className="font-medium dark:text-white text-gray-500">{userData.business_title || '-'}</p>
            </div>
          </div>
          
          <div className='mb-8'>
            <label className="block text-md dark:text-white text-black">
              Are you a performer or a sound recording copyright holder or both?
            </label>
            <p className="font-medium dark:text-white text-gray-500">{userData.performer_ch_both || '-'}</p>
          </div>
          
          <div className='flex space-x-2 text-center mb-12'>
            <input 
              type="checkbox" 
              className="peer" 
              id="age-checkbox" 
              checked={userData.isOver18} 
              readOnly 
            />
            <label className="block text-md dark:text-white text-black">
              I certify I am at least 18 years of age.
            </label>
          </div>
          
          {/* Profile & Header Photos */}
          <div className="mb-8">
            <div className="relative">
              <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                {userData.headerPhoto ? (
                  <img
                    src={userData.headerPhoto}
                    alt="Header"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400">No header photo</span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-6 left-8">
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-100">
                  {userData.profilePhoto ? (
                    <img
                      src={userData.profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No photo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-md dark:text-white text-black">Band Name</label>
              <p className="font-medium dark:text-white text-gray-500 truncate">{userData.artist_band_name || '-'}</p>
            </div>
            <div>
              <label className="block text-md dark:text-white text-black">Alternative Name</label>
              <p className="font-medium dark:text-white text-gray-500 truncate">{userData.alt_name || '-'}</p>
            </div>
            <div className="mt-4">
              <label className="block text-sm dark:text-white text-black mb-2">Bio</label>
              <div
                className="prose max-w-none dark:text-white text-gray-500"
                dangerouslySetInnerHTML={{ __html: userData.bio || '-' }}
              />
            </div>
          </div>
          
          {/* Social Links */}
          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-md dark:text-white text-black">Website</label>
              <p className="font-medium dark:text-white text-gray-500 truncate">{userData.website_link || '-'}</p>
            </div>
            <div>
              <label className="block text-md dark:text-white text-black">Twitter</label>
              <p className="font-medium dark:text-white text-gray-500 truncate">{userData.twitter_link || '-'}</p>
            </div>
            <div>
              <label className="block text-md dark:text-white text-black">Facebook</label>
              <p className="font-medium dark:text-white text-gray-500 truncate">{userData.facebook_link || '-'}</p>
            </div>
            <div>
              <label className="block text-md dark:text-white text-black">TikTok</label>
              <p className="font-medium dark:text-white text-gray-500 truncate">{userData.tiktok_link || '-'}</p>
            </div>
            <div>
              <label className="block text-md dark:text-white text-black">Instagram</label>
              <p className="font-medium dark:text-white text-gray-500 truncate">{userData.instagram_link || '-'}</p>
            </div>
            <div>
              <label className="block text-md dark:text-white text-black">YouTube</label>
              <p className="font-medium dark:text-white text-gray-500 truncate">{userData.youtube_link || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <AlertBox
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        onstepComplete={() => {}}
        title="Success!"
        description="You have successfully Registered your account!"
      />
    </>
  );
};

export default RegistrationStep4;