import { FloatingLabelCombobox } from '@/components/ui/ComboboxFloatingLabel';
import { Button } from '@/components/ui/button';
import { FloatingLabelInput } from '@/components/ui/FloatingLabelInput';
import { Country, State } from 'country-state-city';
import { useEffect, useState } from 'react';
import { Controller, useForm, FieldErrors } from 'react-hook-form';
import { UserData } from '../Registration';

interface LocationOption {
  value: string;
  label: string;
}

interface RegistrationStep0Props {
  onStepComplete: (data: Partial<UserData>) => void;
  userData?: Partial<UserData>;
}

const RegistrationStep0: React.FC<RegistrationStep0Props> = ({ onStepComplete, userData = {} }) => {
    const [validId, setValidId] = useState<string | ArrayBuffer | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [selectedCountry, setSelectedCountry] = useState<string>(userData?.street_country || '');
    const [countryOptions, setCountryOptions] = useState<LocationOption[]>([]);
    const [stateOptions, setStateOptions] = useState<LocationOption[]>([]);

    const {
        register,
        handleSubmit,
        watch,
        control,
        formState: { errors },
        reset,
        setValue
    } = useForm<UserData>({
        defaultValues: {
            dob: userData?.dob || '',
            publishing_company: userData?.publishing_company || '',
            citizenship: userData?.citizenship || '',
            ssn: userData?.ssn || '',
            label_organization: userData?.label_organization || '',
            bank_name: userData?.bank_name || '',
            routing_number: userData?.routing_number || '',
            account_name: userData?.account_name || '',
            account_number: userData?.account_number || '',
            first_name: userData?.first_name || '',
            last_name: userData?.last_name || '',
            email: userData?.email || '',
            phone: userData?.phone || '',
            street_address_1: userData?.street_address_1 || '',
            street_address_2: userData?.street_address_2 || '',
            street_city: userData?.street_city || '',
            street_state: userData?.street_state || '',
            street_country: userData?.street_country || '',
            street_zip: userData?.street_zip || '',
            searchableName: userData?.searchableName || '',
        }
    });

    // Watch first name and last name fields
    const watchFirstName = watch('first_name');
    const watchLastName = watch('last_name');

    // Update searchableName when first_name or last_name changes
    useEffect(() => {
        if (watchFirstName || watchLastName) {
            const firstName = watchFirstName?.toLowerCase() || '';
            const lastName = watchLastName?.toLowerCase() || '';
            setValue('searchableName', `${firstName} ${lastName}`.trim());
        }
    }, [watchFirstName, watchLastName, setValue]);

    useEffect(() => {
        // Get all countries and create a modified list with US first
        const allCountries = Country.getAllCountries();
        const usCountry = allCountries.find(country => country.isoCode === 'US');
        const otherCountries = allCountries.filter(country => country.isoCode !== 'US');

        if (usCountry) {
            const countries: LocationOption[] = [
                // Place US first
                { value: usCountry.isoCode, label: 'United States' },
                // Then add all other countries
                ...otherCountries.map(country => ({
                    value: country.isoCode,
                    label: country.name
                }))
            ];
            setCountryOptions(countries);
        }
    }, []);

    const watchCountry = watch('street_country');
    useEffect(() => {
        if (watchCountry !== selectedCountry) {
            setSelectedCountry(watchCountry);

            if (watchCountry) {
                const states = State.getStatesOfCountry(watchCountry).map(state => ({
                    value: state.isoCode,
                    label: state.name
                }));
                setStateOptions(states);
            } else {
                setStateOptions([]);
            }
        }
    }, [watchCountry, selectedCountry]);

    useEffect(() => {
        if (userData && Object.keys(userData).length > 0) {
            reset({
                dob: userData?.dob || '',
                publishing_company: userData?.publishing_company || '',
                citizenship: userData?.citizenship || '',
                ssn: userData?.ssn || '',
                label_organization: userData?.label_organization || '',
                bank_name: userData?.bank_name || '',
                routing_number: userData?.routing_number || '',
                account_name: userData?.account_name || '',
                account_number: userData?.account_number || '',
                first_name: userData?.first_name || '',
                last_name: userData?.last_name || '',
                email: userData?.email || '',
                phone: userData?.phone || '',
                street_address_1: userData?.street_address_1 || '',
                street_address_2: userData?.street_address_2 || '',
                street_city: userData?.street_city || '',
                street_state: userData?.street_state || '',
                street_country: userData?.street_country || '',
                street_zip: userData?.street_zip || '',
                searchableName: `${userData.first_name?.toLowerCase() || ''} ${userData.last_name?.toLowerCase() || ''}`.trim(),
            });
            if (userData?.validIdUrl) {
                setValidId(userData?.validIdUrl);
            }
        }
    }, [userData, reset]);

    const onSubmit = (data: UserData): void => {
        const completeData = { ...data, validId };
        onStepComplete(completeData);
        console.log("data in RegistrationStep0", completeData);
    };

    const handleFile = (file: File | undefined): void => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setValidId(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle file input change (for click upload)
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        handleFile(file);
    };

    // Drag and drop event handlers
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        handleFile(file);
    };

    const renderStateInput = (): JSX.Element => {
        if (selectedCountry === 'US') {
            return (
                <Controller
                    name="street_state"
                    control={control}
                    rules={{ required: "State is required" }}
                    render={({ field }) => (
                        <FloatingLabelCombobox
                            label="State"
                            value={field.value}
                            onChange={field.onChange}
                            options={stateOptions}
                            error={errors.street_state?.message}
                            disabled={!selectedCountry}
                        />
                    )}
                />
            );
        }

        return (
            <FloatingLabelInput
                label="State/Province"
                type="text"
                {...register("street_state")}
                error={errors.street_state?.message}
            />
        );
    };

    return (
        <>
            <div className="text-center mb-8">
                <div className="text-dark font-bold text-accent mb-4" style={{ fontSize: "30px" }}>
                    MUSIC IS PERSONAL
                </div>
                <p className="text-accent">Rest easy. We secure your personal information.</p>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mt-4">
                    <div className="w-6 h-4 rounded-full bg-accent"></div>
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="">
                <h2 className="text-xl font-bold font-poppins text-accent mb-2">Personal Information</h2>

                <div className="grid grid-cols-2 grid-rows-2 gap-4 mb-5">
                    <div>
                        <FloatingLabelInput
                            label="First Name"
                            {...register("first_name", { required: "First Name is required" })}
                            error={errors.first_name?.message}
                        />
                    </div>
                    <div>
                        <FloatingLabelInput
                            label="Last Name"
                            {...register("last_name", { required: "Last Name is required" })}
                            error={errors.last_name?.message}
                        />
                    </div>
                    <div>
                        <FloatingLabelInput
                            label="Email"
                            type="email"
                            {...register("email", { required: "Email is required" })}
                            error={errors.email?.message}
                            readOnly
                        />
                    </div>
                    <div>
                        <FloatingLabelInput
                            label="Phone Number"
                            type="tel"
                            {...register("phone", { required: "Phone is required" })}
                            error={errors.phone?.message}
                        />
                    </div>
                </div>

                <h2 className="text-xl font-bold font-poppins text-accent mb-2">Address</h2>
                <div className="grid grid-cols-4 grid-rows-3 gap-4 mb-5">
                    <div className="col-span-4">
                        <FloatingLabelInput
                            label="Address Line 1"
                            type="text"
                            {...register("street_address_1", { required: "Address is required" })}
                            error={errors.street_address_1?.message}
                        />
                    </div>
                    <div className="col-span-4">
                        <FloatingLabelInput
                            label="Address Line 2"
                            type="text"
                            {...register("street_address_2")}
                        />
                    </div>
                    <div className="row-start-3">
                        <FloatingLabelInput
                            label="City"
                            type="text"
                            {...register("street_city")}
                        />
                    </div>
                    <div className="row-start-3">
                        {renderStateInput()}
                    </div>
                    <div className="row-start-3">
                        <Controller
                            name="street_country"
                            control={control}
                            rules={{ required: "Country is required" }}
                            render={({ field }) => (
                                <FloatingLabelCombobox
                                    label="Country"
                                    value={field.value}
                                    onChange={(value: string) => {
                                        field.onChange(value);
                                        setSelectedCountry(value);
                                    }}
                                    options={countryOptions}
                                    error={errors.street_country?.message}
                                />
                            )}
                        />
                    </div>
                    <div className="row-start-3">
                        <FloatingLabelInput
                            label="ZIP"
                            type="text"
                            {...register("street_zip")}
                        />
                    </div>
                </div>

                <h2 className="text-xl font-bold font-poppins text-accent mb-2">Identity</h2>
                <div className="grid grid-cols-3 grid-rows-3 gap-4">
                    {/* Drag and Drop Area */}
                    <div
                        className={`relative border-2 border-dashed rounded-lg row-span-3 cursor-pointer transition-colors duration-200 h-full ${isDragging
                            ? 'border-[#C09239] bg-[#C09239]/10'
                            : 'border-gray-300 hover:border-[#C09239] hover:bg-[#C09239]/5'
                            }`}
                        onClick={() => document.getElementById("fileInput")?.click()}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="fileInput"
                            className="hidden"
                            onChange={handlePhotoChange}
                            accept="image/*"
                        />
                        <div className="flex flex-col items-center justify-center h-full">
                            {validId ? (
                                <div className="w-full h-full relative">
                                    <img
                                        src={validId as string}
                                        alt="Header"
                                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                    />
                                </div>
                            ) : (
                                <div className="p-4 text-center">
                                    <div className="text-lg font-medium mb-4">
                                        {isDragging ? 'Drop your file here' : 'DRAG AND DROP'}
                                    </div>
                                    <Button
                                        type="button"
                                        className="bg-[#C09239] hover:bg-[#A77E2D] text-white mb-2"
                                    >
                                        Add New File
                                    </Button>
                                    <p className="text-sm text-gray-500">
                                        or drag and drop your image here
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <FloatingLabelInput
                        label="Date of Birth"
                        type="date"
                        {...register("dob", { required: "Date of Birth is required" })}
                        error={errors.dob?.message}
                    />
                    <FloatingLabelInput
                        label="Publishing Company"
                        {...register("publishing_company", { required: "Publishing Company is required" })}
                        error={errors.publishing_company?.message}
                    />

                    <FloatingLabelInput
                        className="col-start-2"
                        label="Citizenship"
                        {...register("citizenship", { required: "Citizenship is required" })}
                        error={errors.citizenship?.message}
                    />
                    <FloatingLabelInput
                        className="col-start-3"
                        label="SSN"
                        type="password"
                        {...register("ssn", { required: "SSN is required" })}
                        error={errors.ssn?.message}
                    />
                    <FloatingLabelInput
                        className="col-start-2 row-start-3"
                        label="Label / Organizations"
                        {...register("label_organization", { required: "Label/Organizations is required" })}
                        error={errors.label_organization?.message}
                    />
                </div>

                {/* Action Buttons */}
                <div className="text-right mt-14 flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="px-20 py-3 rounded-2xl dark:bg-gray-800 hover:bg-inherit dark:text-white border-[black] text-[black] hover:border-[#C09239] hover:text-black"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="px-20 py-3 rounded-2xl bg-accent hover:bg-gray-800 hover:text-white hover:bg-inherit hover:text-black dark:hover:text-accent border-2 border-accent text-white"
                    >
                        Continue
                    </Button>
                </div>
            </form>
        </>
    );
};

export default RegistrationStep0;