"use client";
import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PlanCard from '@/app/components/PlanCard';
import CustomButton from '@/app/components/Button';

// Mock Data representing items from your database
const mockPlans = [
  { id: 1, name: 'Elevation plan', thumbnail: 'https://placehold.co/600x400/png?text=Elevation+Plan', pdfUrl: '#' },
  { id: 2, name: 'Elevation plan', thumbnail: 'https://placehold.co/600x400/png?text=Elevation+Plan', pdfUrl: '#' },
  { id: 3, name: 'Flooring plan', thumbnail: 'https://placehold.co/600x400/png?text=Flooring+Plan', pdfUrl: '#' },
  { id: 4, name: 'Electrical plan', thumbnail: 'https://placehold.co/600x400/png?text=Electrical+Plan', pdfUrl: '#' },
  { id: 5, name: 'Plumbing plan', thumbnail: 'https://placehold.co/600x400/png?text=Plumbing+Plan', pdfUrl: '#' },
  { id: 6, name: 'Parking plan', thumbnail: 'https://placehold.co/600x400/png?text=Parking+Plan', pdfUrl: '#' },
];

export default function SitePlansPage() {
  return (
    <div className="min-h-screen bg-white p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-extrabold text-black tracking-tight">Site Plans</h1>
          
          <CustomButton text="Add New Plan"/>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

      </div>
    </div>
  );
}
