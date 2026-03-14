import React from 'react'

type Props = {
  placeholder?: string
  type?: string
  className?: string
  name?: string
  // Add these two lines:
  value?: string 
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; 
}

export default function InputField({ 
  placeholder = '', 
  type = 'text', 
  className = '',
  onBlur, 
  value,      // Destructure value
  onChange,   // Destructure onChange
  ...props 
}: Props) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}       // Pass to the native input
      onChange={onChange} // Pass to the native input
      onBlur={onBlur} // Pass it to the native input
      {...props}
      className={`w-full p-3 border-b border-gray-200 focus:border-gray-400 focus:outline-none text-sm transition-colors ${className}`}
    />
  )
}
