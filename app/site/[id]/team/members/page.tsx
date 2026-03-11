"use client";

import React from 'react';
import { Table, Tag, Avatar, Button, Tabs } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import CustomButton from '@/app/components/Button';

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
      render: (text: string) => <span className="font-bold text-[#1e293b] text-base">{text}</span>,
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      render: (text: string) => <span className="font-semibold text-gray-700">{text}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag 
          color={status === 'Active' ? '#00D06A' : '#FF1919'} 
          className="rounded-full px-6 py-1 border-none font-bold text-white text-xs"
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

  // The Table Component shared by both tabs
  const TeamTable = () => (
    <div className="bg-white rounded-lg">
      <Table 
        columns={columns} 
        dataSource={teamData} 
        pagination={false}
        className="custom-table"
      />
    </div>
  );

  // Tab Items Configuration
  const tabItems = [
    {
      key: '1',
      label: 'Team Members',
      children: <TeamTable />,
    },
    {
      key: '2',
      label: 'Support Team Members',
      children: <TeamTable />,
    },
  ];

  return (
    <div className="p-10 bg-white min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-4xl font-bold text-black">Team Members</h1>
        
        <div className="flex gap-4">
            <CustomButton text="Invite Team Member" className="bg-[#2D2D2D] text-white" />
            <CustomButton text="Add New Support Member" className="bg-[#2D2D2D] text-white" />
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs 
        defaultActiveKey="1" 
        items={tabItems} 
        className="custom-tabs"
      />

      <style jsx global>{`
        /* Tab Styling */
        .custom-tabs .ant-tabs-nav::before {
            border-bottom: 2px solid #f0f0f0 !important;
        }
        .custom-tabs .ant-tabs-tab {
            padding: 12px 0 !important;
            margin-right: 40px !important;
        }
        .custom-tabs .ant-tabs-tab-btn {
            color: #9ca3af !important;
            font-weight: 600 !important;
            font-size: 16px !important;
        }
        .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #000 !important;
        }
        .custom-tabs .ant-tabs-ink-bar {
            background: #000 !important;
            height: 3px !important;
        }

        /* Table Styling */
        .custom-table .ant-table-thead > tr > th {
          background: #F9FAFB !important;
          color: #6b7280 !important;
          font-weight: 400 !important;
          text-transform: capitalize;
          border-bottom: none !important;
        }
        .custom-table .ant-table-cell {
          padding: 20px 16px !important;
          border-bottom: 1px solid #f8f8f8 !important;
        }
        .ant-table-wrapper .ant-table-container::before, 
        .ant-table-wrapper .ant-table-container::after {
            display: none !important;
        }
      `}</style>
    </div>
  );
}
