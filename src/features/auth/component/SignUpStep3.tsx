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
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  streetAddress1: string;
  streetAddress2?: string;
  streetCountry: string;
  streetCity: string;
  streetState: string;
  streetZip: string;
  mailingAddress1: string;
  mailingAddress2?: string;
  mailingCountry: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
}

interface LocationOption {
  value: string;
  label: string;
}

const SignUpStep3 = ({ onBack, onStepComplete, userData }: SignUpStep3Props) => {
  const [sameAsResidential, setSameAsResidential] = useState<boolean>(true);
  const [countries, setCountries] = useState<LocationOption[]>([]);
  const [states, setStates] = useState<LocationOption[]>([]);
  const [mailingStates, setMailingStates] = useState<LocationOption[]>([]);
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
      firstName: userData?.firstName?.toLowerCase() || "",
      lastName: userData?.lastName?.toLowerCase() || "",
      middleName: userData?.middleName || "",
      phone: userData?.phone || "",
      streetAddress1: userData?.streetAddress1?.toLowerCase() || "",
      streetAddress2: userData?.streetAddress2?.toLowerCase() || "",
      streetCountry: userData?.streetCountry?.toLowerCase() || "",
      streetCity: userData?.streetCity?.toLowerCase() || "",
      streetState: userData?.streetState?.toLowerCase() || "",
      streetZip: userData?.streetZip || "",
      mailingAddress1: userData?.mailingAddress1?.toLowerCase() || "",
      mailingAddress2: userData?.mailingAddress2?.toLowerCase() || "",
      mailingCountry: userData?.mailingCountry?.toLowerCase() || "",
      mailingCity: userData?.mailingCity?.toLowerCase() || "",
      mailingState: userData?.mailingState?.toLowerCase() || "",
      mailingZip: userData?.mailingZip || "",
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

  
  const selectedCountry = watch("streetCountry");
  const selectedMailingCountry = watch("mailingCountry");
  const streetFields = watch([
    'streetAddress1',
    'streetAddress2',
    'streetCountry',
    'streetCity',
    'streetState',
    'streetZip'
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
    if (selectedMailingCountry) {
      try {
        const stateList = State.getStatesOfCountry(selectedMailingCountry).map(state => ({
          value: state.isoCode,
          label: state.name
        }));
        setMailingStates(stateList);
      } catch (error) {
        console.error("Error loading mailing states:", error);
        setMailingStates([]);
      }
    } else {
      setMailingStates([]);
    }
  }, [selectedMailingCountry]);

  
  useEffect(() => {
    if (sameAsResidential && streetFields.some(field => field !== undefined)) {
      setTimeout(() => {
        setValue("mailingAddress1", streetFields[0] || "");
        setValue("mailingAddress2", streetFields[1] || "");
        setValue("mailingCountry", streetFields[2] || "");
        setValue("mailingCity", streetFields[3] || "");
        setValue("mailingState", streetFields[4] || "");
        setValue("mailingZip", streetFields[5] || "");
      }, 0);
    }
  }, [sameAsResidential, streetFields, setValue]);

 
  const submitUserData = useCallback(async (data: FormValues): Promise<void> => {
    if (isSubmitting || !userData?.id) return;
    
    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, "user_registration", userData.id);

      const mailingAddressData = sameAsResidential ? {
        mailingAddress1: data.streetAddress1.toLowerCase(),
        mailingAddress2: data.streetAddress2?.toLowerCase() || "",
        mailingCountry: data.streetCountry.toLowerCase(),
        mailingCity: data.streetCity.toLowerCase(),
        mailingState: data.streetState.toLowerCase(),
        mailingZip: data.streetZip
      } : {
        mailingAddress1: data.mailingAddress1.toLowerCase(),
        mailingAddress2: data.mailingAddress2?.toLowerCase() || "",
        mailingCountry: data.mailingCountry.toLowerCase(),
        mailingCity: data.mailingCity.toLowerCase(),
        mailingState: data.mailingState.toLowerCase(),
        mailingZip: data.mailingZip
      };

      const updateData = {
        firstName: data.firstName.toLowerCase(),
        lastName: data.lastName.toLowerCase(),
        phone: data.phone,
        streetAddress1: data.streetAddress1.toLowerCase(),
        streetAddress2: data.streetAddress2?.toLowerCase() || "",
        streetCountry: data.streetCountry.toLowerCase(),
        streetCity: data.streetCity.toLowerCase(),
        streetState: data.streetState.toLowerCase(),
        streetZip: data.streetZip,
        searchableName: `${data.firstName.toLowerCase()} ${data.lastName.toLowerCase()}`,
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
        setValue("mailingAddress1", "");
        setValue("mailingAddress2", "");
        setValue("mailingCountry", "");
        setValue("mailingCity", "");
        setValue("mailingState", "");
        setValue("mailingZip", "");
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
            {...register("firstName", {
              required: "First name is required"
            })}
            error={errors.firstName?.message}
          />

          <FloatingLabelInput
            label="Last Name"
            {...register("lastName", {
              required: "Last name is required"
            })}
            error={errors.lastName?.message}
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
          {...register("streetAddress1", {
            required: "Address is required"
          })}
          error={errors.streetAddress1?.message}
        />

        <FloatingLabelInput
          label="Address Line 2 (Optional)"
          {...register("streetAddress2")}
        />

        <div className="grid grid-cols-2 gap-4 font-poppins">
          <Controller
            name="streetCountry"
            control={control}
            rules={{ required: "Country is required" }}
            render={({ field }) => (
              <FloatingLabelCombobox
                label="Country"
                value={field.value}
                onChange={field.onChange}
                options={countries}
                error={errors.streetCountry?.message}
              />
            )}
          />
          <FloatingLabelInput
            label="City"
            {...register("streetCity", {
              required: "City is required"
            })}
            error={errors.streetCity?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="streetState"
            control={control}
            rules={{ required: "State is required" }}
            render={({ field }) => (
              <FloatingLabelCombobox
                label="State/Province"
                value={field.value}
                onChange={field.onChange}
                options={states}
                error={errors.streetState?.message}
                disabled={!selectedCountry}
              />
            )}
          />
          <FloatingLabelInput
            label="ZIP/Postal Code"
            {...register("streetZip", {
              required: "ZIP code is required",
              pattern: {
                value: /^\d{5}(-\d{4})?$/,
                message: "Invalid ZIP code"
              }
            })}
            error={errors.streetZip?.message}
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
              {...register("mailingAddress1", {
                required: !sameAsResidential ? "Mailing address is required" : false
              })}
              error={errors.mailingAddress1?.message}
            />

            <FloatingLabelInput
              label="Address Line 2 (Optional)"
              {...register("mailingAddress2")}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="mailingCountry"
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
                    error={errors.mailingCountry?.message}
                  />
                )}
              />
              <FloatingLabelInput
                label="City"
                {...register("mailingCity", {
                  required: !sameAsResidential ? "City is required" : false
                })}
                error={errors.mailingCity?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="mailingState"
                control={control}
                rules={{
                  required: !sameAsResidential ? "State is required" : false
                }}
                render={({ field }) => (
                  <FloatingLabelCombobox
                    label="State/Province"
                    value={field.value}
                    onChange={field.onChange}
                    options={mailingStates}
                    error={errors.mailingState?.message}
                    disabled={!selectedMailingCountry}
                  />
                )}
              />
              <FloatingLabelInput
                label="ZIP/Postal Code"
                {...register("mailingZip", {
                  required: !sameAsResidential ? "ZIP code is required" : false,
                  pattern: {
                    value: /^\d{5}(-\d{4})?$/,
                    message: "Invalid ZIP code"
                  }
                })}
                error={errors.mailingZip?.message}
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