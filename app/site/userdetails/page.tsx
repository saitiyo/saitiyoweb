"use client";
import React from 'react';
import { Avatar, List, Tag } from 'antd';
import { UsergroupAddOutlined } from '@ant-design/icons';
import DashboardCard from '@/app/components/DashboardCard';

// Mock data for the clocking history
const historyData = [
  { date: '3 - 04 - 2025', in: '7:35', out: '05:35' },
  { date: '4 - 04 - 2025', in: '7:35', out: '05:35' },
  { date: '5 - 04 - 2025', in: '7:35', out: '05:35' },
  { date: '6 - 04 - 2025', in: '7:35', out: '05:35' },
  { date: '7 - 04 - 2025', in: '7:35', out: '05:35' },
  { date: '8 - 04 - 2025', in: '7:35', out: '05:35' },
];

export default function UserProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Section: Profile & Provision for your Cards */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          
          {/* User Pill Header */}
          <div className="bg-black text-white rounded-r-full flex items-center p-6 pr-20 shadow-lg min-w-[350px]">
            <Avatar 
              size={64} 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kintu" 
              className="border-2 border-gray-600 mr-4"
            />
            <div>
              <h1 className="text-2xl font-bold m-0 leading-tight">Kintu Musa</h1>
              <p className="text-gray-400 m-0 text-sm">Project Manager</p>
            </div>
          </div>

          {/* PROVISION FOR YOUR CARD COMPONENTS */}
          <div className="flex flex-1 gap-12 flex-wrap">
             {/* Add your existing components here.
                Example: <YourLabourCostCard /> <YourDaysWorkedCard /> 
             */}
             <div className="flex gap-4 flex-wrap">
                <DashboardCard title="EST Labour cost" value="UGX 240,000" />
                <DashboardCard title="Total days worked" value="24" />
             </div>
          </div>
        </div>

        {/* Clocking History List */}
        <div className="max-w-2xl">
          <List
            dataSource={historyData}
            renderItem={(item) => (
              <List.Item className="!border-none !p-0 !mb-4">
                <div className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                  {/* Date */}
                  <span className="font-bold text-gray-700 w-1/3">
                    {item.date}
                  </span>

                  {/* Badges Container */}
                  <div className="flex gap-4 w-2/3 justify-end">
                    <Tag color="#00C853" className="rounded-full px-4 py-1 border-none font-medium text-white flex gap-2">
                      <span>Clocked in :</span>
                      <span>{item.in}</span>
                    </Tag>
                    
                    <Tag color="#FF1744" className="rounded-full px-4 py-1 border-none font-medium text-white flex gap-2">
                      <span>Clocked out :</span>
                      <span>{item.out}</span>
                    </Tag>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </div>

      </div>
    </div>
  );
}
