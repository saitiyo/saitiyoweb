"use client";
import React from 'react';
import InventoryCard from '@/app/components/InventoryCard';
import { ArrowUpOutlined } from '@ant-design/icons';
import DashboardCard from '@/app/components/DashboardCard';
import totalstock from '../../assets/totalstock.png';
import lowstock from '../../assets/lowstock.png';
import Image from 'next/image';


const inventoryData = [
  { name: 'Concrete', unit: 'Cubic meters', total: 100, billedDate: 'August 31, 2025', delivered: 50, remaining: 50, unitPrice: 150.00, totalCost: 15000, color: '#22c55e' },
  { name: 'Paint', unit: 'Liters', total: 1000, billedDate: 'August 31, 2025', delivered: 400, remaining: 600, unitPrice: 8.00, totalCost: 8000, color: '#ef4444' },
  { name: 'Pipes', unit: 'Meters', total: 2000, billedDate: 'August 31, 2025', delivered: 1200, remaining: 800, unitPrice: 5.00, totalCost: 10000, color: '#f87171' },
  { name: 'Adhesives', unit: 'Liters', total: 200, billedDate: 'August 31, 2025', delivered: 100, remaining: 100, unitPrice: 5.00, totalCost: 1000, color: '#3b82f6' },
];

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* PROVISION FOR TOP CARDS (STAT CARDS) */}
        <div className="flex flex-wrap gap-6 mb-16 mt-5">
          {/* PLACE YOUR STAT CARDS HERE */}
          <div className="w-64 h-32 flex items-center justify-center text-gray-300">
            <DashboardCard title="Total Stock" value="15,000" image={<Image src={totalstock} alt="Total Stock" width={64} height={64} />} />
          </div>
          <div className="w-64 h-32 flex items-center justify-center text-gray-300">
            <DashboardCard title="Low Stock Levels" value="52" image={<Image src={lowstock} alt="Low Stock Levels" width={64} height={64} />} />
          </div>
        </div>

        {/* RECENTLY ADDED SECTION */}
        <div className="mb-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-8">
            <h2 className="text-xl font-bold text-[#64748b]">Recently Added</h2>
            <button className="text-red-500 font-bold flex items-center gap-1 hover:underline transition-all">
              View all stock <ArrowUpOutlined className="rotate-45" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {inventoryData.map((item, idx) => (
              <InventoryCard key={idx} item={item} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
