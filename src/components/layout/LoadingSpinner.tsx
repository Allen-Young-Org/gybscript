import { FC } from "react";
const LoadingSpinner: FC = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-800 dark:text-white flex items-center justify-center z-50">
      <div className="text-dark dark:bg-gray-800 dark:text-white text-2xl font-bold">
        <div className="flex justify-center">
          <div className="loader"></div>
        </div>
        We are preparing things for you!
        <div className="flex justify-center"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
