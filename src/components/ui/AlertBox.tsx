// src/components/ui/AlertBox.tsx
import { FC } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CheckCircle } from "lucide-react";
 
import { useLocation } from "react-router-dom";

interface AlertBoxProps {
    showDialog: boolean;
    setShowDialog: (show: boolean) => void;
    onstepComplete: () => void;
    title: string;
    description: string;
}

const AlertBox: FC<AlertBoxProps> = ({ showDialog, setShowDialog, onstepComplete, title, description }) => {
     
    const location = useLocation();
    const path = location.pathname;
    
    const isAuthPage = path.includes("user_sign_up") || path.includes("user_sign_in");
    const accentColor = isAuthPage ? "#C09239" : "var(--accent-color, #C09239)";
    
    const handleDialogClose = () => {
        setShowDialog(false);
        onstepComplete();
    };

    return (
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogContent className={`font-poppins ${!isAuthPage ? "dark:text-white dark:border-zinc-800 dark:bg-zinc-950" : "text-black !bg-white"}`}>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-center mx-auto">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-semibold font-poppins">{title}</span>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center py-4 font-poppins">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction
                        className="bg-accent hover:bg-accent/90 text-white w-full"
                        style={{ backgroundColor: accentColor }}
                        onClick={handleDialogClose}
                    >
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default AlertBox;