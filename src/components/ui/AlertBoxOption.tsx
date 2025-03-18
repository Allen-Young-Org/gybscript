import React from "react";
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

interface AlertBoxOptionProps {
  showDialog: boolean;
  setShowDialog: (open: boolean) => void;
  onstepComplete: () => void;
  title: string;
  description: string;
}

const AlertBoxOption: React.FC<AlertBoxOptionProps> = ({
  showDialog,
  setShowDialog,
  onstepComplete,
  title,
  description,
}) => {
  const handleCancel = () => {
    setShowDialog(false);
  };

  const handleProceed = () => {
    onstepComplete();
    setShowDialog(false);
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent className="font-poppins">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-center mx-auto">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="font-semibold font-poppins">{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center py-4 font-poppins">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            className="bg-[#C09239] hover:bg-[#C09239]/90 text-white w-full"
            onClick={handleProceed}
          >
            Proceed
          </AlertDialogAction>
          <AlertDialogAction
            className="bg-white border-2 border-solid border-[#C09239] hover:bg-white text-[#C09239] w-full"
            onClick={handleCancel}
          >
            Cancel
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertBoxOption;
