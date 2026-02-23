import React from 'react';
import Image from 'next/image';
import Button from '../components/Button';

export default function ProfilePage() {
  return (
    // Main container with the blue border seen in your image
    <div className="min-h-screen bg-white flex flex-col p-8 font-sans">
      
      {/* Header Section: Profile Info */}
      <header className="flex items-center gap-3">
        <div className="relative w-12 h-12 overflow-hidden rounded-full border border-gray-200">
          <Image 
            src="/profile-avatar.jpg" // Replace with your actual image path
            alt="Moses O"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-gray-900 leading-tight">Moses O</h1>
          <p className="text-sm text-gray-500">Architect</p>
        </div>
      </header>

      {/* Main Content: Centered Empty State */}
      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-1">No Projects</h2>
          <p className="text-gray-500 mb-6">You have no projects at the moment</p>
          <Button text='Add New'/>
        </div>
      </main>
      
    </div>
  );
}
