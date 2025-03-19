import { Button } from '@/components/ui/button';
import { FloatingLabelInput } from '@/components/ui/FloatingLabelInput';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { UserData } from '../Registration';

interface RegistrationStep1Props {
    onStepComplete: (data: Partial<UserData>) => void;
    userData?: Partial<UserData>;
    onBack: () => void;
}

interface BankFormData {
    bank_name: string;
    routing_number: string;
    account_name: string;
    account_number: string;
}

const RegistrationStep1: React.FC<RegistrationStep1Props> = ({ onStepComplete, userData = {}, onBack }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<BankFormData>({
        defaultValues: {
            bank_name: userData?.bank_name || '',
            routing_number: userData?.routing_number || '',
            account_name: userData?.account_name || '',
            account_number: userData?.account_number || '',
        }
    });

    useEffect(() => {
        if (userData && Object.keys(userData).length > 0) {
            reset({
                bank_name: userData.bank_name || '',
                routing_number: userData.routing_number || '',
                account_name: userData.account_name || '',
                account_number: userData.account_number || '',
            });
        }
    }, [userData, reset]);

    const onSubmit = (data: BankFormData): void => {
        onStepComplete({ ...data });
        console.log("data in RegistrationStep1", data);
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
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    <div className="w-6 h-4 rounded-full bg-accent"></div>
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                    <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                </div>
            </div>

            <p className="text-center text-accent mb-6">
                This information is required to directly deposit your royalties into your bank account.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="">
                {/* Bank Information Section */}
                <div className="mt-8 mb-14">
                    <h2 className="text-xl font-bold text-accent mb-4">Bank Informations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FloatingLabelInput
                            label="Bank Name"
                            {...register("bank_name", { required: "Bank Name is required" })}
                            error={errors.bank_name?.message}
                        />
                        <FloatingLabelInput
                            label="Routing Number"
                            {...register("routing_number", { required: "Routing Number is required" })}
                            error={errors.routing_number?.message}
                        />
                        <FloatingLabelInput
                            label="Account Name"
                            {...register("account_name", { required: "Account Name is required" })}
                            error={errors.account_name?.message}
                        />
                        <FloatingLabelInput
                            label="Account Number"
                            type="password"
                            {...register("account_number", { required: "Account Number is required" })}
                            error={errors.account_number?.message}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="text-right mt-14 flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="px-20 py-3 rounded-2xl dark:bg-gray-800 dark:text-white hover:bg-inherit border-[black] text-[black] hover:border-[#C09239] hover:text-black"
                        onClick={onBack}
                    >
                        Previous
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

export default RegistrationStep1;