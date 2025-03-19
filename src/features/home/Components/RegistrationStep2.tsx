import { useForm } from 'react-hook-form';
 
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect, useState } from 'react';
import { UserData } from '../Registration';
import FloatingLabelSelect from '@/components/ui/FloatingLabelSelect';

// Define the option types for select elements
interface SelectOption {
  value: string;
  label: string;
}

interface RegistrationStep2Props {
  onBack: () => void;
  onStepComplete: (data: Partial<UserData>) => void;
  userData?: Partial<UserData>;
}

interface RegistrationStep2FormData {
  registering_type: string;
  business_title: string;
  performer_ch_both: string;
  age18orabove?: boolean;
}

const RegistrationStep2: React.FC<RegistrationStep2Props> = ({ onBack, onStepComplete, userData = {} }) => {
    const [isOver18, setIsOver18] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm<RegistrationStep2FormData>({
        defaultValues: {
            registering_type: userData?.registering_type || '',
            business_title: userData?.business_title || '',
            performer_ch_both: userData?.performer_ch_both || '',
            age18orabove: userData?.isOver18 || isOver18,
        }
    });

    useEffect(() => {
        if (userData && Object.keys(userData).length > 0) {
            reset({
                registering_type: userData?.registering_type || '',
                business_title: userData?.business_title || '',
                performer_ch_both: userData?.performer_ch_both || '',
                age18orabove: userData?.isOver18 || false,
            });
            
            if (userData?.isOver18) {
                setIsOver18(userData.isOver18 as boolean);
            }
        }
    }, [userData, reset]);

    const onSubmit = (data: RegistrationStep2FormData): void => {
        if (onStepComplete) {
            onStepComplete({ ...data, isOver18 });
            console.log("data in RegistrationStep2", data);
        }
    };

    console.log(isOver18);

    const registrationOptions: SelectOption[] = [
        { value: 'Registering for myself', label: 'Registering for myself' },
        { value: 'Registering for someone else', label: 'Registering for someone else' }
    ];

    const businessTitleOptions: SelectOption[] = [
        { value: 'individual', label: 'Individual' },
        { value: 'business', label: 'Business' },
        { value: 'organization', label: 'Organization' }
    ];

    const performerOptions: SelectOption[] = [
        { value: 'performer', label: 'Performer' },
        { value: 'Sound Recording Copyright Holder', label: 'Sound Recording Copyright Holder' },
        { value: 'both', label: 'Both' }
    ];

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mx-auto">
            <div className="text-center mb-8">
                <div className="text-dark font-bold text-accent mb-4" style={{ fontSize: "30px" }}>
                    ALMOST THERE
                </div>
                <p className="text-accent">This last bit helps us package you, and create your profile.</p>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mt-4">
                    {[1, 2, 3, 4, 5].map((dot, index) => (
                        <div
                            key={dot}
                            className={`w-4 h-4 rounded-full ${index === 2 ? 'w-6 bg-accent' : 'bg-gray-300'
                                }`}
                        ></div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <FloatingLabelSelect
                    name="registering_type"
                    label="Are you registering yourself or for someone else?"
                    register={register}
                    required
                    errors={errors}
                    watch={watch}
                    options={registrationOptions}
                />

                <FloatingLabelSelect
                    name="business_title"
                    label="Business Title"
                    register={register}
                    required
                    errors={errors}
                    watch={watch}
                    options={businessTitleOptions}
                />

                <FloatingLabelSelect
                    name="performer_ch_both"
                    label="Are you a performer or a sound recording copyright holder or both?"
                    register={register}
                    required
                    errors={errors}
                    watch={watch}
                    options={performerOptions}
                />

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="age-checkbox"
                        checked={isOver18}
                        onCheckedChange={(checked) => setIsOver18(checked as boolean)}
                    />
                    <label
                        htmlFor="age-checkbox"
                        className="text-sm text-accent font-poppins font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        I certify I am at least 18 years of age
                    </label>
                </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
                <Button
                    type="button"
                    variant="outline"
                    className="px-20 py-3 rounded-2xl dark:bg-gray-800 hover:bg-inherit dark:text-white border-black text-black hover:border-[#C09239] hover:text-black"
                    onClick={onBack}
                >
                    Previous
                </Button>
                <Button
                    type="submit"
                    className="px-20 py-3 rounded-2xl bg-accent hover:bg-gray-800 hover:text-white hover:bg-inherit hover:text-black dark:hover:text-accent border-2 border-accent text-white"
                >
                    Save & Continue
                </Button>
            </div>
        </form>
    );
};

export default RegistrationStep2;