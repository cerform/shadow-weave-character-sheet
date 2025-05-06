
import React from 'react';
import { Loader2 } from "lucide-react";

const LoadingState: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <Loader2 size={32} className="animate-spin text-primary mr-2" />
      <span>Загрузка персонажей...</span>
    </div>
  );
};

export default LoadingState;
