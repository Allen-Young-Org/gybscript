/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Country, State } from "country-state-city";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase"; 
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { Checkbox } from "@/components/ui/checkbox";
import { FloatingLabelCombobox } from "@/components/ui/ComboboxFloatingLabel"; 
import { useAuth } from "@/providers/AuthProvider"; 
import { UserDetails } from "@/types/auth";

interface SignUpStep3Props {
  onBack: () => void;
  onStepComplete: (data: Partial<UserDetails>) => void;
  userData: UserDetails | null;
}

interface FormValues {
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone: string;
  street_address_1: string;
  street_address_2?: string;
  street_country: string;
  street_city: string;
  street_state: string;
  street_zip: string;
  mailing_address_1: string;
  mailing_address_2?: string;
  mailing_country: string;
  mailing_city: string;
  mailing_state: string;
  mailing_zip: string;
}

interface LocationOption {
  value: string;
  label: string;
}

const SignUpStep3 = ({ onBack, onStepComplete, userData }: SignUpStep3Props) => {
  const [sameAsResidential, setSameAsResidential] = useState<boolean>(true);
  const [countries, setCountries] = useState<LocationOption[]>([]);
  const [states, setStates] = useState<LocationOption[]>([]);
  const [mailing_states, setmailing_states] = useState<LocationOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      first_name: userData?.first_name?.toLowerCase() || "",
      last_name: userData?.last_name?.toLowerCase() || "",
      middle_name: userData?.middle_name || "",
      phone: userData?.phone || "",
      street_address_1: userData?.street_address_1?.toLowerCase() || "",
      street_address_2: userData?.street_address_2?.toLowerCase() || "",
      street_country: userData?.street_country?.toLowerCase() || "",
      street_city: userData?.street_city?.toLowerCase() || "",
      street_state: userData?.street_state?.toLowerCase() || "",
      street_zip: userData?.street_zip || "",
      mailing_address_1: userData?.mailing_address_1?.toLowerCase() || "",
      mailing_address_2: userData?.mailing_address_2?.toLowerCase() || "",
      mailing_country: userData?.mailing_country?.toLowerCase() || "",
      mailing_city: userData?.mailing_city?.toLowerCase() || "",
      mailing_state: userData?.mailing_state?.toLowerCase() || "",
      mailing_zip: userData?.mailing_zip || "",
    }
  });

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      navigate('/user_sign_in');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  
  const selectedCountry = watch("street_country");
  const selectedmailing_country = watch("mailing_country");
  const streetFields = watch([
    'street_address_1',
    'street_address_2',
    'street_country',
    'street_city',
    'street_state',
    'street_zip'
  ]);

 
  useEffect(() => {
    try {
      const countryList = Country.getAllCountries().map(country => ({
        value: country.isoCode,
        label: country.name
      }));
      setCountries(countryList);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading countries:", error);
      setIsLoading(false);
    }
  }, []);

  
  useEffect(() => {
    if (selectedCountry) {
      try {
        const stateList = State.getStatesOfCountry(selectedCountry).map(state => ({
          value: state.isoCode,
          label: state.name
        }));
        setStates(stateList);
      } catch (error) {
        console.error("Error loading states:", error);
        setStates([]);
      }
    } else {
      setStates([]);
    }
  }, [selectedCountry]);

 
  useEffect(() => {
    if (selectedmailing_country) {
      try {
        const stateList = State.getStatesOfCountry(selectedmailing_country).map(state => ({
          value: state.isoCode,
          label: state.name
        }));
        setmailing_states(stateList);
      } catch (error) {
        console.error("Error loading mailing states:", error);
        setmailing_states([]);
      }
    } else {
      setmailing_states([]);
    }
  }, [selectedmailing_country]);

  
  useEffect(() => {
    if (sameAsResidential && streetFields.some(field => field !== undefined)) {
      setTimeout(() => {
        setValue("mailing_address_1", streetFields[0] || "");
        setValue("mailing_address_2", streetFields[1] || "");
        setValue("mailing_country", streetFields[2] || "");
        setValue("mailing_city", streetFields[3] || "");
        setValue("mailing_state", streetFields[4] || "");
        setValue("mailing_zip", streetFields[5] || "");
      }, 0);
    }
  }, [sameAsResidential, streetFields, setValue]);

 
  const submitUserData = useCallback(async (data: FormValues): Promise<void> => {
    if (isSubmitting || !userData?.id) return;
    
    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, "user_registration", userData.id);

      const mailingAddressData = sameAsResidential ? {
        mailing_address_1: data.street_address_1.toLowerCase(),
        mailing_address_2: data.street_address_2?.toLowerCase() || "",
        mailing_country: data.street_country.toLowerCase(),
        mailing_city: data.street_city.toLowerCase(),
        mailing_state: data.street_state.toLowerCase(),
        mailing_zip: data.street_zip
      } : {
        mailing_address_1: data.mailing_address_1.toLowerCase(),
        mailing_address_2: data.mailing_address_2?.toLowerCase() || "",
        mailing_country: data.mailing_country.toLowerCase(),
        mailing_city: data.mailing_city.toLowerCase(),
        mailing_state: data.mailing_state.toLowerCase(),
        mailing_zip: data.mailing_zip
      };

      const updateData = {
        first_name: data.first_name.toLowerCase(),
        last_name: data.last_name.toLowerCase(),
        phone: data.phone,
        street_address_1: data.street_address_1.toLowerCase(),
        street_address_2: data.street_address_2?.toLowerCase() || "",
        street_country: data.street_country.toLowerCase(),
        street_city: data.street_city.toLowerCase(),
        street_state: data.street_state.toLowerCase(),
        street_zip: data.street_zip,
        searchableName: `${data.first_name.toLowerCase()} ${data.last_name.toLowerCase()}`,
        ...mailingAddressData
      };

      await updateDoc(userDocRef, updateData);
       
      setTimeout(() => {
        onStepComplete(updateData);
      }, 0);
    } catch (error) {
      console.error("Error updating user profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [userData, sameAsResidential, isSubmitting, onStepComplete]);
 
  const onSubmit = (data: FormValues): void => {
    submitUserData(data);
  };
 
  const handleSameAddressChange = (checked: boolean): void => {
    setSameAsResidential(checked);
    
    if (!checked) {
 
      setTimeout(() => {
        setValue("mailing_address_1", "");
        setValue("mailing_address_2", "");
        setValue("mailing_country", "");
        setValue("mailing_city", "");
        setValue("mailing_state", "");
        setValue("mailing_zip", "");
      }, 0);
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6"> 
      <h2 className="text-2xl text-[#C09239] font-bold mb-2 text-center">COMPLETE YOUR PROFILE</h2>
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className={`w-3 h-3 rounded-full ${dot === 3 ? "bg-[#C09239]" : "bg-gray-300"}`}
          />
        ))}
      </div>
 
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Personal Information */}
        <div className="grid grid-cols-2 gap-4">
          <FloatingLabelInput
            label="First Name"
            {...register("first_name", {
              required: "First name is required"
            })}
            error={errors.first_name?.message}
          />

          <FloatingLabelInput
            label="Last Name"
            {...register("last_name", {
              required: "Last name is required"
            })}
            error={errors.last_name?.message}
          />
        </div>

        <FloatingLabelInput
          label="Phone Number"
          type="tel"
          {...register("phone", {
            required: "Phone number is required",
            pattern: {
              value: /^\+?\d{10,14}$/,
              message: "Invalid phone number"
            }
          })}
          error={errors.phone?.message}
        />

        {/* Residential Address Section */}
        <FloatingLabelInput
          label="Address Line 1"
          {...register("street_address_1", {
            required: "Address is required"
          })}
          error={errors.street_address_1?.message}
        />

        <FloatingLabelInput
          label="Address Line 2 (Optional)"
          {...register("street_address_2")}
        />

        <div className="grid grid-cols-2 gap-4 font-poppins">
          <Controller
            name="street_country"
            control={control}
            rules={{ required: "Country is required" }}
            render={({ field }) => (
              <FloatingLabelCombobox
                label="Country"
                value={field.value}
                onChange={field.onChange}
                options={countries}
                error={errors.street_country?.message}
              />
            )}
          />
          <FloatingLabelInput
            label="City"
            {...register("street_city", {
              required: "City is required"
            })}
            error={errors.street_city?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="street_state"
            control={control}
            rules={{ required: "State is required" }}
            render={({ field }) => (
              <FloatingLabelCombobox
                label="State/Province"
                value={field.value}
                onChange={field.onChange}
                options={states}
                error={errors.street_state?.message}
                disabled={!selectedCountry}
              />
            )}
          />
          <FloatingLabelInput
            label="ZIP/Postal Code"
            {...register("street_zip", {
              required: "ZIP code is required",
              pattern: {
                value: /^\d{5}(-\d{4})?$/,
                message: "Invalid ZIP code"
              }
            })}
            error={errors.street_zip?.message}
          />
        </div>

        {/* Mailing Address Checkbox */}
        <div className="flex items-center space-x-2 pt-4">
          <Checkbox
            id="sameAsResidential"
            checked={sameAsResidential}
            onCheckedChange={(checked) => handleSameAddressChange(checked === true)}
          />
          <label
            htmlFor="sameAsResidential"
            className="text-sm font-poppins text-gray-600"
          >
            Mailing address same as residential address
          </label>
        </div>

        {/* Mailing Address Section */}
        {!sameAsResidential && (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold text-gray-700">Mailing Address</h3>
            <FloatingLabelInput
              label="Address Line 1"
              {...register("mailing_address_1", {
                required: !sameAsResidential ? "Mailing address is required" : false
              })}
              error={errors.mailing_address_1?.message}
            />

            <FloatingLabelInput
              label="Address Line 2 (Optional)"
              {...register("mailing_address_2")}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="mailing_country"
                control={control}
                rules={{
                  required: !sameAsResidential ? "Country is required" : false
                }}
                render={({ field }) => (
                  <FloatingLabelCombobox
                    label="Country"
                    value={field.value}
                    onChange={field.onChange}
                    options={countries}
                    error={errors.mailing_country?.message}
                  />
                )}
              />
              <FloatingLabelInput
                label="City"
                {...register("mailing_city", {
                  required: !sameAsResidential ? "City is required" : false
                })}
                error={errors.mailing_city?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="mailing_state"
                control={control}
                rules={{
                  required: !sameAsResidential ? "State is required" : false
                }}
                render={({ field }) => (
                  <FloatingLabelCombobox
                    label="State/Province"
                    value={field.value}
                    onChange={field.onChange}
                    options={mailing_states}
                    error={errors.mailing_state?.message}
                    disabled={!selectedmailing_country}
                  />
                )}
              />
              <FloatingLabelInput
                label="ZIP/Postal Code"
                {...register("mailing_zip", {
                  required: !sameAsResidential ? "ZIP code is required" : false,
                  pattern: {
                    value: /^\d{5}(-\d{4})?$/,
                    message: "Invalid ZIP code"
                  }
                })}
                error={errors.mailing_zip?.message}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 !bg-inherit text-black border-black"
            onClick={handleLogout}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-[#C09239] hover:bg-[#C09239]/90 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SignUpStep3;