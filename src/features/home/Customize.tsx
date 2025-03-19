
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState, useRef, ChangeEvent } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "@/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AlertBox from "@/components/ui/AlertBox";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { Checkbox } from "@/components/ui/checkbox";
import { useTheme } from "@/providers/ThemeProvider";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
 
interface FormData {
  bio: string;
  email: string;
  phone: string;
  currency: string;
  currentPassword?: string;
  newPassword?: string;
  retypeNewPassword?: string;
  notificationSettings?: {
    likes?: string;
    comments?: string;
  };
  applyToAll?: boolean;
}
 
interface AccentColorOption {
  name: string;
  value: string;
}

const Customize: React.FC = () => {
  const { userDetails, refreshUserDetails } = useAuth();
  const { 
    theme, 
    setTheme, 
    accentColor, 
    setAccentColor,
    isDarkMode,
    isLoading: themeLoading 
  } = useTheme();
 
  const accentColorOptions: AccentColorOption[] = [
    { name: "gold", value: "#C09239" },
    { name: "blue", value: "#2196F3" },
    { name: "green", value: "#4CAF50" },
    { name: "purple", value: "#9C27B0" },
    { name: "red", value: "#F44336" }
  ];

  const [pauseAll, setPauseAll] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPasswordFields, setShowPasswordFields] = useState<boolean>(false);

  const { register, handleSubmit, setValue, watch, control, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      bio: "",
      email: "",
      phone: "",
      currency: "USD",
    }
  });

  useEffect(() => {
    if (userDetails) {
      setValue("bio", userDetails.bio || "");
      setValue("email", userDetails.email || "");
      setValue("phone", userDetails.phone || "");
      setValue("currency", userDetails.currency || "USD");

      if (userDetails.profilePhotoUrl) {
        setProfileImage(userDetails.profilePhotoUrl);
      }
    }
  }, [userDetails, setValue]);

  const togglePauseAll = (): void => {
    setPauseAll(!pauseAll);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = (): void => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (): void => {
    fileInputRef.current?.click();
  };

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    if (!file || !userDetails?.id) return null;

    const timestamp = Date.now();
    const storageRef = ref(storage, `users/${userDetails.id}/profile_${timestamp}`);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleAccentColorChange = (color: string): void => {
    setAccentColor(color);
  };

  const restoreDefaultAccentColor = (): void => {
    setAccentColor("#C09239");
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system"): void => {
    setTheme(newTheme);
  };

  const onSubmit = async (data: FormData): Promise<void> => {
    if (!userDetails?.id) {
      setSuccessMessage("User information is missing. Please try again.");
      setShowSuccessDialog(true);
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, "user_registration", userDetails.id);

      let updateData: Record<string, any> = {
        bio: data.bio,
        phone: data.phone,
        currency: data.currency,
        updatedAt: serverTimestamp()
      };

      if (profileImageFile) {
        const imageURL = await uploadImageToStorage(profileImageFile);
        if (imageURL) {
          updateData.profilePhotoUrl = imageURL;
        }
      }

      await updateDoc(userDocRef, updateData);

      await refreshUserDetails();

      setSuccessMessage("Profile updated successfully!");
      setShowSuccessDialog(true);
      setProfileImageFile(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSuccessMessage("An error occurred while updating your profile. Please try again.");
      setShowSuccessDialog(true);
    } finally {
      setLoading(false);
    }
  };

  if (themeLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex w-full">
      <div className="w-full p-4 border-r-4 border-gray-100 dark:border-gray-700 mb-10">
        <div className="text-dark font-bold mb-4" style={{ fontSize: "30px", color: accentColor }}>
          CUSTOMIZE
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-2 text-lg" style={{ color: accentColor }}>Profile</div>

          <div className="flex flex-col md:flex-row w-full">
            <div className="w-full md:w-[60%]">
              <div className="flex mt-4">
                <div className="w-20 dark:text-white">Bio</div>
                <div className="w-full -mt-2">
                  <FloatingLabelInput
                    label="Bio"
                    {...register("bio")}
                    error={errors.bio?.message}
                    placeholder="Please enter bio"
                  />
                </div>
              </div>
              <div className="flex mt-6">
                <div className="w-20 dark:text-white">Email</div>
                <div className="w-full -mt-2">
                  <FloatingLabelInput
                    label="Email"
                    {...register("email")}
                    readOnly
                    className="bg-gray-100 dark:bg-gray-700"
                  />
                </div>
              </div>
              <div className="flex mt-6">
                <div className="w-20 dark:text-white">Phone</div>
                <div className="w-full -mt-2">
                  <FloatingLabelInput
                    label="Phone"
                    {...register("phone")}
                    error={errors.phone?.message}
                  />
                </div>
              </div>
              <div className="flex mt-4">
                <div className="w-20 dark:text-white">Currency</div>
                <div className="w-full -mt-2">
                  <select
                    {...register("currency")}
                    className="border dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-2 focus:outline-none w-full">
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                    <option value="JPY">Japanese Yen (¥)</option>
                    <option value="CAD">Canadian Dollar (C$)</option>
                  </select>
                </div>
              </div>
              <div className="w-full mt-4">
                <Button 
                  type="button" 
                  onClick={() => setShowPasswordFields(!showPasswordFields)} 
                  className="border-2 text-white px-8 py-2 rounded-full"
                  style={{ 
                    borderColor: accentColor, 
                    backgroundColor: showPasswordFields ? 'transparent' : accentColor, 
                    color: showPasswordFields ? accentColor : 'white' 
                  }}
                >
                  Change Password
                </Button>

                {showPasswordFields && (
                  <div className="mt-4 flex flex-col">
                    <div className="flex mt-4 items-center">
                      <div className="w-20 dark:text-white">Current Password</div>
                      <div className="w-full -mt-2">
                        <FloatingLabelInput
                          label="Current Password"
                          type="password"
                          {...register("currentPassword")}
                          error={errors.currentPassword?.message}
                        />
                      </div>
                    </div>
                    <div className="flex mt-4 items-center">
                      <div className="w-20 dark:text-white">New Password</div>
                      <div className="w-full -mt-2">
                        <FloatingLabelInput
                          label="New Password"
                          type="password"
                          {...register("newPassword")}
                          error={errors.newPassword?.message}
                        />
                      </div>
                    </div>
                    <div className="flex mt-4 items-center">
                      <div className="w-20 dark:text-white">Retype New Password</div>
                      <div className="w-full -mt-2">
                        <FloatingLabelInput
                          label="Retype New Password"
                          type="password"
                          {...register("retypeNewPassword")}
                          error={errors.retypeNewPassword?.message}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full md:w-[40%] mt-6 md:mt-0">
              <div className="flex justify-center">
                <img
                  src={profileImage || "https://via.placeholder.com/150"}
                  className="border-2 rounded-full h-[150px] w-[150px] object-cover"
                  style={{ borderColor: accentColor }}
                  alt="Profile"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div className="text-center mt-2 dark:text-white">Your Profile Picture</div>
              <div className="flex justify-center w-full mt-2">
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="flex overflow-hidden gap-2.5 justify-center items-center px-3 py-1.5 w-[150px] bg-orange-100 dark:bg-orange-900 min-h-[30px] rounded-[50px] text-xs leading-none"
                  style={{ color: accentColor }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.8152 6.1648C13.357 5.1118 12.5661 4.23811 11.5638 3.67759C10.5615 3.11708 9.40302 2.90067 8.26595 3.06153C7.12888 3.22239 6.07592 3.75164 5.26841 4.56818C4.46091 5.38472 3.94341 6.44351 3.79522 7.5823C3.08016 7.75354 2.45289 8.18142 2.03253 8.78469C1.61216 9.38796 1.42799 10.1246 1.51497 10.8547C1.60196 11.5848 1.95404 12.2576 2.50437 12.7452C3.0547 13.2328 3.76495 13.5013 4.50022 13.4998C4.69914 13.4998 4.8899 13.4208 5.03055 13.2801C5.17121 13.1395 5.25022 12.9487 5.25022 12.7498C5.25022 12.5509 5.17121 12.3601 5.03055 12.2195C4.8899 12.0788 4.69914 11.9998 4.50022 11.9998C4.1024 11.9998 3.72087 11.8418 3.43956 11.5605C3.15826 11.2792 3.00022 10.8976 3.00022 10.4998C3.00022 10.102 3.15826 9.72044 3.43956 9.43914C3.72087 9.15784 4.1024 8.9998 4.50022 8.9998C4.69914 8.9998 4.8899 8.92078 5.03055 8.78013C5.17121 8.63948 5.25022 8.44871 5.25022 8.2498C5.25214 7.36276 5.56844 6.50511 6.14293 5.82924C6.71741 5.15336 7.51289 4.70301 8.38803 4.5582C9.26318 4.4134 10.1613 4.5835 10.9229 5.03831C11.6845 5.49311 12.2602 6.20315 12.5477 7.0423C12.5906 7.17118 12.6677 7.286 12.7707 7.3745C12.8737 7.463 12.9989 7.52186 13.1327 7.5448C13.6323 7.6392 14.0851 7.9 14.4175 8.2847C14.7499 8.6694 14.9421 9.15532 14.963 9.66328C14.9839 10.1712 14.8321 10.6713 14.5324 11.082C14.2328 11.4926 13.8028 11.7897 13.3127 11.9248C13.1198 11.9745 12.9545 12.0989 12.8532 12.2705C12.752 12.4421 12.723 12.6469 12.7727 12.8398C12.8225 13.0327 12.9468 13.198 13.1184 13.2993C13.29 13.4006 13.4948 13.4295 13.6877 13.3798C14.477 13.1712 15.1767 12.7108 15.6805 12.0684C16.1843 11.426 16.4647 10.6368 16.4791 9.8205C16.4935 9.00425 16.2412 8.20558 15.7604 7.54579C15.2796 6.886 14.5967 6.40112 13.8152 6.1648ZM9.53272 7.7173C9.4614 7.64902 9.37729 7.5955 9.28522 7.5598C9.10263 7.48479 8.89782 7.48479 8.71522 7.5598C8.62316 7.5955 8.53905 7.64902 8.46772 7.7173L6.21772 9.9673C6.0765 10.1085 5.99715 10.3001 5.99715 10.4998C5.99715 10.6995 6.0765 10.8911 6.21772 11.0323C6.35895 11.1735 6.5505 11.2529 6.75022 11.2529C6.94995 11.2529 7.1415 11.1735 7.28272 11.0323L8.25022 10.0573V14.2498C8.25022 14.4487 8.32924 14.6395 8.46989 14.7801C8.61055 14.9208 8.80131 14.9998 9.00022 14.9998C9.19914 14.9998 9.3899 14.9208 9.53055 14.7801C9.67121 14.6395 9.75022 14.4487 9.75022 14.2498V10.0573L10.7177 11.0323C10.7874 11.1026 10.8704 11.1584 10.9618 11.1965C11.0532 11.2345 11.1512 11.2541 11.2502 11.2541C11.3492 11.2541 11.4473 11.2345 11.5387 11.1965C11.63 11.1584 11.713 11.1026 11.7827 11.0323C11.853 10.9626 11.9088 10.8796 11.9469 10.7882C11.985 10.6968 12.0046 10.5988 12.0046 10.4998C12.0046 10.4008 11.985 10.3028 11.9469 10.2114C11.9088 10.12 11.853 10.037 11.7827 9.9673L9.53272 7.7173Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="self-stretch my-auto">Change</span>
                </button>
              </div>
            </div>
          </div>

          <div className="w-full mt-8">
            <div className="text-lg" style={{ color: accentColor }}>
              Push Notifications
            </div>
            <div className="flex items-center mt-2 mb-4">
              <Controller
                name="applyToAll"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="applyToAll"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <label
                htmlFor="applyToAll"
                className="ml-2 block font-semibold text-sm dark:text-white"
              >
                Apply to all registered artist platform
              </label>
            </div>

            <div className="w-full md:w-[60%] flex mt-2 justify-between">
              <div className="w-20 dark:text-white">Pause all</div>

              <div
                className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer ${pauseAll ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
                onClick={togglePauseAll}
              >
                <div
                  className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ease-in-out ${pauseAll ? "translate-x-6" : ""}`}
                ></div>
              </div>
            </div>
          </div>

          <div className="w-full mt-6">
            <div className="mb-2 dark:text-white">Likes</div>
            <div>
              <label className="text-sm font-semibold dark:text-white">
                <input
                  type="radio"
                  value="off"
                  {...register("notificationSettings.likes")}
                  defaultChecked={watch("notificationSettings.likes") === "fromFollowed"}
                />
                &nbsp;From profile I follow
              </label>
            </div>
            <div>
              <label className="text-sm font-semibold dark:text-white">
                <input
                  type="radio"
                  value="fromEveryone"
                  {...register("notificationSettings.likes")}
                  defaultChecked={watch("notificationSettings.likes") === "fromEveryone"}
                />
                &nbsp;From everyone
              </label>
            </div>

            <div className="my-2 mt-4 dark:text-white">Comments</div>

            <div>
              <label className="text-sm font-semibold dark:text-white">
                <input
                  type="radio"
                  value="off"
                  {...register("notificationSettings.comments")}
                  defaultChecked={watch("notificationSettings.comments") === "off"}
                />
                &nbsp;Off
              </label>
            </div>

            <div>
              <label className="text-sm font-semibold dark:text-white">
                <input
                  type="radio"
                  value="fromFollowed"
                  {...register("notificationSettings.comments")}
                  defaultChecked={watch("notificationSettings.comments") === "fromFollowed"}
                />
                &nbsp;From profile I follow
              </label>
            </div>
            <div>
              <label className="text-sm font-semibold dark:text-white">
                <input
                  type="radio"
                  value="fromEveryone"
                  {...register("notificationSettings.comments")}
                  defaultChecked={watch("notificationSettings.comments") === "fromEveryone"}
                />
                &nbsp;From everyone
              </label>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="w-full mt-6 text-lg mb-2" style={{ color: accentColor }}>
            Site Settings
          </div>

          {/* Theme Mode Selection */}
          <div className="w-full mt-4 mb-4">
            <div className="dark:text-white mb-2">Theme Mode</div>
            <div className="flex space-x-4">
              <div 
                className={`p-4 border rounded-md cursor-pointer transition-all ${theme === 'light' ? `border-2 border-${accentColor}` : 'border-gray-300 dark:border-gray-700'}`}
                style={{ borderColor: theme === 'light' ? accentColor : undefined }} 
                onClick={() => handleThemeChange('light')}
              >
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-yellow-500">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                  <div className="dark:text-white">Light</div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-md cursor-pointer transition-all ${theme === 'dark' ? `border-2 border-${accentColor}` : 'border-gray-300 dark:border-gray-700'}`}
                style={{ borderColor: theme === 'dark' ? accentColor : undefined }} 
                onClick={() => handleThemeChange('dark')}
              >
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-blue-400">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                  <div className="dark:text-white">Dark</div>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-md cursor-pointer transition-all ${theme === 'system' ? `border-2 border-${accentColor}` : 'border-gray-300 dark:border-gray-700'}`}
                style={{ borderColor: theme === 'system' ? accentColor : undefined }} 
                onClick={() => handleThemeChange('system')}
              >
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-gray-400">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                    <line x1="8" y1="21" x2="16" y2="21"/>
                    <line x1="12" y1="17" x2="12" y2="21"/>
                  </svg>
                  <div className="dark:text-white">System</div>
                </div>
              </div>
            </div>
          </div>

          {/* Accent Color Selection */}
          <div className="flex flex-col md:flex-row md:items-center mt-6">
            <div className="dark:text-white">Accent Color</div>
            <div className="flex space-x-3 mt-2 md:ml-5 md:mt-0">
              {accentColorOptions.map((colorOption) => (
                <button
                  key={colorOption.name}
                  type="button"
                  className={`rounded-full h-[20px] w-[20px] transition-all duration-200 ${colorOption.value === accentColor ? 'ring-2 ring-offset-2 ring-gray-700 dark:ring-gray-300' : ''}`}
                  style={{ backgroundColor: colorOption.value }}
                  onClick={() => handleAccentColorChange(colorOption.value)}
                  aria-label={`Select ${colorOption.name} accent color`}
                />
              ))}
            </div>
            <div className="mt-2 md:ml-5 md:mt-0">
              <button
                type="button"
                onClick={restoreDefaultAccentColor}
                className="flex overflow-hidden gap-2.5 justify-center items-center px-3 py-1.5 w-[150px] bg-orange-100 dark:bg-orange-900 min-h-[30px] rounded-[50px] text-xs leading-none"
                style={{ color: accentColor }}
              >
                <span className="self-stretch my-auto">Restore to default</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button
              type="submit"
              className="border-2 text-white px-8 py-2 rounded-full"
              style={{ borderColor: accentColor, backgroundColor: loading ? 'gray' : accentColor }}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>

      <AlertBox
        showDialog={showSuccessDialog}
        setShowDialog={setShowSuccessDialog}
        onstepComplete={() => setShowSuccessDialog(false)}
        title="Profile Update"
        description={successMessage}
      />
    </div>
  );
};

export default Customize;