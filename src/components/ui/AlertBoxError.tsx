import { FC } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle } from "lucide-react";

interface AlertBoxErrorProps {
  showDialog: boolean;
  setShowDialog: (value: boolean) => void;
  onstepComplete: () => void;
  title: string;
  description: string;
}

const AlertBoxError: FC<AlertBoxErrorProps> = ({
  showDialog,
  setShowDialog,
  onstepComplete,
  title,
  description,
}) => {
  const handleDialogClose = () => {
    setShowDialog(false);
    onstepComplete();
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent className="font-poppins">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-center mx-auto">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="font-semibold font-poppins text-red-500">
              {title}
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center py-4 font-poppins">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            className="bg-[#ff1100] hover:bg-red/90 text-white w-full"
            onClick={handleDialogClose}
          >
            Ok, I've read and understand.
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertBoxError;
