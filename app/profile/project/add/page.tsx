import React from 'react';
import Button from '@/app/components/Button';
import InputField from '@/app/components/InputField';
import UploadArea from '@/app/components/UploadArea';

const Addprojects = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 relative">
      
      {/* Profile Header - Positioned Top Left */}
      <div className="absolute top-8 left-8 flex items-center">
        <img
          src="https://via.placeholder.com/40" // Replace with actual user image
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover border border-gray-200"
        />
        <div className="ml-3">
          <h2 className="text-sm font-bold text-gray-800 leading-tight">Moses O</h2>
          <p className="text-xs text-gray-500">Architect</p>
        </div>
      </div>

      {/* Centered Form Container */}
      <div className="bg-white w-full max-w-md p-10 rounded-xl shadow-sm">
        
        {/* Form Fields with increased spacing (space-y-6) */}
        <div className="space-y-6">
          <div>
            <InputField placeholder="Project Title" name="title" />
          </div>

          <div>
            <InputField placeholder="Location" name="location" />
          </div>

          <div>
            <InputField placeholder="Block Number" name="blockNumber" />
          </div>

          <div>
            <InputField placeholder="Plot Number" name="plotNumber" />
          </div>

          <div>
            <InputField placeholder="Project Owner" name="owner" />
          </div>

          {/* Upload Area */}
          <UploadArea />

          {/* Submit Button */}
          <div className="pt-4">
            <Button text="Create" className="w-full block" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Addprojects;
