"use client";

import React from 'react';
import { Table, Tag, Avatar, Button } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import CustomButton  from '@/app/components/Button';

// --- Types ---
interface TeamMember {
  key: string;
  name: string;
  designation: string;
  status: 'Active' | 'In Active';
  mobile: string;
  avatar: string;
}

// --- Mock Data ---
const teamData: TeamMember[] = [
  {
    key: '1',
    name: 'Kintu Musa',
    designation: 'Project Manager',
    status: 'Active',
    mobile: '0702000456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kintu',
  },
  {
    key: '2',
    name: 'Otim Simon',
    designation: 'Architect',
    status: 'Active',
    mobile: '0704460456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Simon',
  },
  {
    key: '3',
    name: 'Ding Tom',
    designation: 'City Planner',
    status: 'In Active',
    mobile: '0704460456',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
  },
];

export default function TeamMembersPage() {
  // Ant Design Table Columns
  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (src: string) => <Avatar src={src} size={45} />,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-bold text-gray-800">{text}</span>,
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      render: (text: string) => <span className="font-medium text-gray-600">{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag 
          color={status === 'Active' ? '#00D06A' : '#FF1919'} 
          className="rounded-full px-6 py-1 border-none font-bold text-white"
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
      render: (text: string) => <span className="font-bold text-[#1e293b]">{text}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => <Button type="text" icon={<MoreOutlined className="text-gray-400" />} />,
    },
  ];

  return (
    <div className="p-10 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-black">Team Members</h1>
        
        {/* PROVISION FOR YOUR BUTTON COMPONENT */}
        <div className="flex items-center">
            {/* Replace this div with your <AddButton /> */}
            <CustomButton text="Add New" />
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-[#F9FAFB] rounded-lg overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={teamData} 
          pagination={false}
          className="custom-table"
        />
      </div>

      <style jsx global>{`
        .custom-table .ant-table-thead > tr > th {
          background: #F9FAFB !important;
          color: #6b7280 !important;
          font-weight: 500 !important;
          border-bottom: 1px solid #f0f0f0 !important;
        }
        .custom-table .ant-table-cell {
          padding: 24px 16px !important;
        }
      `}</style>
    </div>
  );
}
