import React from 'react'

type Props = {
  placeholder?: string
  type?: string
  className?: string
  name?: string
}

export default function InputField({ placeholder = '', type = 'text', className = '', ...props }: Props) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      {...props}
      className={`w-full p-3 border-b border-gray-200 focus:border-gray-400 focus:outline-none text-sm transition-colors ${className}`}
    />
  )
}
