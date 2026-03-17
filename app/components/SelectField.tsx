import React from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';

type Props = SelectProps & {
  className?: string;
  label?: string;
  error?: string;
  touched?: boolean;
};

export default function SelectField({ 
  className = '', 
  error, 
  touched, 
  ...props 
}: Props) {
  return (
    <div className="w-full flex flex-col">
      <Select
        variant="borderless" // Removes default box styling
        {...props}
        className={`custom-select-underlined w-full !px-0 text-sm transition-colors ${className}`}
      />
      {/* Global CSS or Styled JSX to handle the bottom border */}
      <style jsx global>{`
        .custom-select-underlined {
          border-bottom: 1px solid #e5e7eb !important; /* gray-200 */
          border-radius: 0 !important;
        }
        .custom-select-underlined:hover, 
        .custom-select-underlined.ant-select-focused {
          border-bottom-color: #9ca3af !important; /* gray-400 */
        }
        .custom-select-underlined .ant-select-selector {
          padding: 12px 0 !important; /* Matching InputField p-3 */
          background-color: transparent !important;
        }
        /* Style for validation errors */
        .select-error {
          border-bottom-color: #ef4444 !important; /* red-500 */
        }
      `}</style>
    </div>
  );
}
