import React from 'react';

interface StatCardProps {
  title?: string;
  value?: number | string;
  image?: React.ReactNode;
}

const ActiveContractsCard = ({ 
  title, 
  value,
  image
}: StatCardProps) => {
  return (
    <div className="max-w-[320px] p-6 bg-white border border-gray-100 rounded-2xl shadow-sm font-sans flex justify-between items-start">
      <div className="flex flex-col gap-2">
        {/* Title */}
        <h3 className="text-[22px] font-bold text-[#424e6e] tracking-tight">
          {title}
        </h3>
        
        {/* Value */}
        <p className="text-6xl font-bold text-[#424e6e]">
          {value}
        </p>
      </div>

      {/* Contract/Handshake Illustration */}
      <div className="mt-1">
        {image ? (
          image
        ) : (
          <div className="w-16 h-16 flex items-center justify-center grayscale-[0.2] opacity-90">
             <svg 
              viewBox="0 0 24 24" 
              className="w-full h-full" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
             >
              {/* Simplified Handshake/Contract Placeholder Icon */}
               <path d="M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7" stroke="#424e6e" strokeWidth="1.5"/>
               <rect x="5" y="7" width="14" height="14" rx="2" stroke="#424e6e" strokeWidth="1.5"/>
               <path d="M9 12H15M9 16H13" stroke="#424e6e" strokeWidth="1.5" strokeLinecap="round"/>
             </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveContractsCard;
