
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PhoneFrameProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  className?: string;
}

const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  title,
  showBackButton = false,
  className,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="phone-frame mx-auto animate-fade-in">
      <div className="phone-screen">
        {(title || showBackButton) && (
          <div className="sticky top-0 z-10 flex items-center h-12 px-4 bg-white border-b border-gray-200">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="mr-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            {title && (
              <h1 className="text-sm font-semibold text-center flex-1">
                {title}
              </h1>
            )}
          </div>
        )}
        <div className={cn("page-content", className)}>{children}</div>
      </div>
    </div>
  );
};

export default PhoneFrame;
