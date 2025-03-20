/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import {
  serverTimestamp
} from "firebase/firestore";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import AlertBox from "@/components/ui/AlertBox";
import { FloatingLabelCombobox } from "@/components/ui/ComboboxFloatingLabel";
import { State } from "country-state-city";
import { v4 as uuidv4 } from "uuid";
import {
  useAddDocumentWithProperties,
  useUpdateDocumentsWithProperties,
  useDocumentByFields,
} from "@/api/firebaseHooks";
// --- Type Definitions ---
interface Option {
  label: string;
  value: string;
}
interface IState {
  name: string;
  isoCode: string;
  countryCode: string;
}
interface PerformanceFormValues {
  performanceName: string;
  eventType: string;
  setList: string;
  band: string;
  dateOfRelease: string;
  // Venue fields for creating a new venue:
  venueName?: string;
  venueStreet?: string;
  venueCity?: string;
  venueState?: string;
  venueZip?: string;
  // For using an existing venue:
  previousVenue?: string;
  // Additional dynamic properties if needed
  [key: string]: any;
}

interface PerformanceData {
  performanceName: string;
  eventType: string;
  setList: string;
  band: string;
  dateOfRelease: string;
  performanceID: string;
  venueId: string;
  // Optionally include venue details if needed:
  venueName?: string;
  venueStreetAddress?: string;
  venueCity?: string;
  venueState?: string;
  venueZip?: string;
}

interface AddPerformanceProps {
  item?: PerformanceData;
  clearItem?: () => void;
  redirectEdit?: (destination: string) => void;
}

// --- Component ---
const AddPerformance: React.FC<AddPerformanceProps> = ({
  item,
  clearItem,
  redirectEdit,
}) => {
  const {
    control,
    formState: { errors },
    register,
    handleSubmit,
    setValue,
    reset,
  } = useForm<PerformanceFormValues>({ defaultValues: {} });

  const [onLoad, setOnLoading] = useState<boolean>(false);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [newVenue, setNewVenue] = useState<boolean>(true);
  const [states, setStates] = useState<IState[]>([]);
  const [successMessage, setSuccessMessage] = useState<string>(
    "You have successfully created your GYB Performance!"
  );

  const { userDetails } = useAuth();

  // --- TanStack Queries for Fetching Data ---
  const { data: setListsData, isLoading: isSetListsLoading } =
    useDocumentByFields("GYBsetList", {
      userId: (userDetails as any)?.userId,
      status: "active",
    });

  const setLists: Option[] = setListsData
    ? setListsData.map((doc: any) => ({
      label: doc.setListName,
      value: doc.setListID,
    }))
    : [];

  // Venues query using your useDocumentByFields hook
  const { data: venuesData, isLoading: isVenuesLoading } = useDocumentByFields(
    "venues",
    {
      userId: (userDetails as any)?.userId,
    }
  );
  const venues: Option[] = venuesData
    ? venuesData.map((doc: any) => ({
      label: doc.venueName,
      value: doc.venueId,
    }))
    : [];

  // Bands query using your useDocumentByFields hook
  const { data: bandsData, isLoading: isBandsLoading } = useDocumentByFields(
    "bands",
    {
      userId: (userDetails as any)?.userId,
      status: "active",
    }
  );
  const bands: Option[] = bandsData
    ? bandsData.map((doc: any) => ({
      label: doc.bandName,
      value: doc.bandID,
    }))
    : [];

  // --- TanStack Mutations ---
  // Mutation for adding a new venue
  const addVenueMutation = useAddDocumentWithProperties("venues");
  // Mutation for adding a performance
  const addPerformanceMutation = useAddDocumentWithProperties("performances");
  // Mutation for updating a performance (using performanceID as the query field)
  const updatePerformanceMutation = useUpdateDocumentsWithProperties(
    "performances",
    { performanceID: item ? item.performanceID : "" }
  );

  // --- Effect to Set US States & Prepopulate Form if Editing ---
  useEffect(() => {
    const usStates = State.getStatesOfCountry("US");
    setStates(usStates);

    if (item) {
      setOnLoading(true);
      setSuccessMessage("You have successfully updated your performance!");

      setValue("performanceName", item.performanceName);
      setValue("eventType", item.eventType);
      setValue("setList", item.setList);
      setValue("band", item.band);
      setValue("dateOfRelease", item.dateOfRelease);

      if (item.venueId) {
        setNewVenue(false);
        setValue("previousVenue", item.venueId);
      } else {
        setNewVenue(true);
        // Pre-populate venue details if they exist on the item.
        if ((item as any).venueName) {
          setValue("venueName", (item as any).venueName);
          setValue("venueStreet", (item as any).venueStreetAddress);
          setValue("venueCity", (item as any).venueCity);
          setValue("venueState", (item as any).venueState);
          setValue("venueZip", (item as any).venueZip);
        }
      }
      setOnLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, setValue]);

  // --- Form Submission ---
  const handleFormSubmit: SubmitHandler<PerformanceFormValues> = async (
    data
  ) => {
    setOnLoading(true);
    try {
      // Destructure venue fields from form data
      const {
        venueName,
        venueStreet,
        venueCity,
        venueState,
        venueZip,
        previousVenue,
        ...filteredData
      } = data;

      let venueId: string;
      if (newVenue) {
        venueId = uuidv4();
        // Use the TanStack mutation to create a new venue
        await addVenueMutation.mutateAsync({
          createdAt: serverTimestamp(),
          userId: (userDetails as any)?.userId,
          venueId,
          venueName,
          venueStreetAddress: venueStreet,
          venueCity,
          venueState,
          venueZip,
        });
      } else {
        venueId = previousVenue as string;
      }

      filteredData.venueId = venueId;
      filteredData.status = "active";

      if (item) {
        // Update performance using the update mutation
        await updatePerformanceMutation.mutateAsync({
          ...filteredData,
          updatedTimestamp: serverTimestamp(),
        });
      } else {
        // Create performance using the add mutation
        await addPerformanceMutation.mutateAsync({
          ...filteredData,
          timestamp: serverTimestamp(),
          updatedTimestamp: "",
          userId: (userDetails as any)?.userId,
          performanceID: uuidv4(),
        });
      }

      setOnLoading(false);
      setShowDialog(true);
    } catch (error) {
      console.error("Error saving performance:", error);
      setOnLoading(false);
    }
  };

  const toggleVenue = (theBool: boolean): void => {
    setNewVenue(theBool);
  };

  const handleCancel = (): void => {
    if (clearItem) {
      clearItem();
    }
    if (redirectEdit) {
      redirectEdit("Performances");
    }
  };

  const successSubmit = (): void => {
    reset();
    if (clearItem) {
      clearItem();
    }
    if (redirectEdit) {
      redirectEdit("Performances");
    }
  };

  // --- Derived Loading Flag (if any query is still loading) ---
  const dataLoading = isSetListsLoading || isVenuesLoading || isBandsLoading;

  return (
    <div>
      {(onLoad || dataLoading) && <LoadingSpinner />}
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="mt-4">
          <FloatingLabelInput
            label="Performance Name"
            {...register("performanceName", {
              required: "Performance name is required",
            })}
            error={errors.performanceName?.message}
          />
        </div>
        <div className="mt-2 flex justify-center space-x-5">
          <div className="w-full mt-2">
            <Controller
              name="eventType"
              control={control}
              rules={{ required: "Event type is required" }}
              render={({ field }) => (
                <FloatingLabelCombobox
                  label="Event Type"
                  options={[
                    { label: "Concert", value: "Concert" },
                    { label: "Festival", value: "Festival" },
                    { label: "Busking", value: "Busking" },
                    { label: "Online", value: "Online" },
                    { label: "Conference", value: "Conference" },
                  ]}
                  error={errors.eventType?.message}
                  {...field}
                />
              )}
            />
          </div>
          <div className="w-full mt-2">
            <Controller
              name="setList"
              control={control}
              rules={{ required: "Set list is required" }}
              render={({ field }) => (
                <FloatingLabelCombobox
                  label="Set list"
                  options={setLists || []}
                  error={errors.setList?.message}
                  {...field}
                />
              )}
            />
          </div>
        </div>
        <div className="mt-4 flex space-x-5">
          <div className="w-full">
            <Controller
              name="band"
              control={control}
              rules={{ required: "Band is required" }}
              render={({ field }) => (
                <FloatingLabelCombobox
                  label="Band"
                  options={bands || []}
                  error={errors.band?.message}
                  {...field}
                />
              )}
            />
          </div>
          <div className="w-full">
            <FloatingLabelInput
              label="Date of release"
              type="date"
              className="w-full"
              {...register("dateOfRelease", {
                required: "Date is required",
              })}
              error={errors.dateOfRelease?.message}
            />
          </div>
        </div>
        <div className="mt-4 flex space-x-4">
          <div
            className={`cursor-pointer ${newVenue ? "text-accent" : "text-black-300"
              } p-2 rounded-md`}
            onClick={() => toggleVenue(true)}
          >
            New venue
          </div>
          <div
            className={`cursor-pointer ${!newVenue ? "text-accent" : "text-black-300"
              } p-2 rounded-md`}
            onClick={() => toggleVenue(false)}
          >
            Use previous venue
          </div>
        </div>
        {!newVenue && (
          <div className="mt-4">
            <Controller
              name="previousVenue"
              control={control}
              rules={{ required: "Previous venue is required" }}
              render={({ field }) => (
                <FloatingLabelCombobox
                  label="Previous venue"
                  options={venues || []}
                  error={errors.previousVenue?.message}
                  {...field}
                  value={field.value ?? ""}
                />
              )}
            />
          </div>
        )}
        {newVenue && (
          <div>
            <div className="mt-4">
              <FloatingLabelInput
                label="Venue Name"
                {...register("venueName", {
                  required: "Venue Name is required",
                })}
                error={errors.venueName?.message}
              />
            </div>
            <div className="flex space-x-4 mt-4">
              <div className="w-full">
                <FloatingLabelInput
                  label="Street Address"
                  {...register("venueStreet", {
                    required: "Street Address is required",
                  })}
                  error={errors.venueStreet?.message}
                />
              </div>
              <div className="w-full">
                <FloatingLabelInput
                  label="City"
                  {...register("venueCity", { required: "City is required" })}
                  error={errors.venueCity?.message}
                />
              </div>
              <div className="w-full">
                <Controller
                  name="venueState"
                  control={control}
                  rules={{ required: "State is required" }}
                  render={({ field }) => (
                    <FloatingLabelCombobox
                      label="Select State"
                      options={states.map((state) => ({
                        value: state.isoCode,
                        label: state.name,
                      }))}
                      error={errors.venueState?.message}
                      {...field}
                      value={field.value ?? ""}
                    />
                  )}
                />
              </div>
              <div className="w-full">
                <FloatingLabelInput
                  label="Zip Code"
                  {...register("venueZip", {
                    required: "Zip Code is required",
                  })}
                  error={errors.venueZip?.message}
                />
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end">
          {item ? (
            <div className="flex space-x-2">
              <Button
                type="button"
                onClick={handleCancel}
                className="bg-red-600 hover:bg-red-600/90 text-white w-32 mt-2 ml-2"
              >
                <span className="self-stretch my-auto">Cancel</span>
              </Button>
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-white w-32 mt-2"
              >
                <span className="self-stretch my-auto">Update</span>
              </Button>
            </div>
          ) : (
            <Button
              type="submit"
              className="bg-accent px-5 hover:bg-accent/90 text-white w-36 mt-2"
            >
              <span className="self-stretch my-auto">Save performance</span>
            </Button>
          )}
        </div>
      </form>

      <AlertBox
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        onstepComplete={() => {
          setShowDialog(false);
          successSubmit();
        }}
        title="Success!"
        description={successMessage}
      />
    </div>
  );
};

export default AddPerformance;
