import React from 'react';
import Button from '@/app/components/Button';
import InputField from '@/app/components/InputField';
import UploadArea from '@/app/components/UploadArea';

const Addprojects = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 relative">
      

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
