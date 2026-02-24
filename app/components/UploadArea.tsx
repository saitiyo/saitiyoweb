import React from 'react'

type Props = {
  children?: React.ReactNode
}

export default function UploadArea({ children }: Props) {
  return (
    <div className="mt-8 border-2 border-dashed border-gray-200 rounded-xl py-10 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all">
      <svg
        className="w-6 h-6 text-gray-400 mb-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      <p className="text-[10px] uppercase tracking-wider text-gray-400 text-center leading-relaxed">
        Upload PNG, jpg, <br /> jpeg, max 50kb
      </p>
      {children}
    </div>
  )
}
