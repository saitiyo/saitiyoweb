"use client";
import React from 'react';
import { Input, Button } from 'antd';
import UploadZone from '../../../components/UploadZone';
import CustomButton from '@/app/components/Button';
import InputField from '@/app/components/InputField';

export default function UploadSitePlan() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-sm w-full max-w-2xl p-8 relative">
        
        {/* Header */}
        <h2 className="text-xl font-bold text-gray-800 mb-8">
          Upload New Site Plan
        </h2>

        {/* Upload Area Component */}
        <div className="mb-6">
          <UploadZone />
        </div>

        {/* Document Name Input */}
        <div className="mb-10">
            <InputField placeholder="Document name" />
        </div>

        {/* Footer Action */}
        <div className="flex justify-end">
            <CustomButton text='Add New' />
        </div>
      </div>
    </div>
  );
}
