"use client";

import React from 'react';
import { Table, Tag, Avatar, Button, Tabs, TableColumnsType } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import CustomButton from '@/app/components/Button';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useState, useEffect } from 'react';
import InviteModal from "@/app/components/InviteModal" // Ensure this path is correct
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export const GET_SITE_TEAM_MEMBERS = gql`

  query GetSiteTeamMembers($siteId: ID!) {
    getSiteTeamMembers(siteId: $siteId) {
      id
      siteId
      userId
      user {
        id
        firstName
        lastName
      }
      role
      status
      joinedAt
      createdAt
    }
  }
`

export const INVITE_TEAM_MEMBER = gql`
  mutation InviteTeamMember($siteId: ID!, $invitedByUserId: ID!, $invitedMobileNumber: String!) {
    inviteTeamMember(siteId: $siteId, invitedByUserId: $invitedByUserId, invitedMobileNumber: $invitedMobileNumber) {
      success
      message
    }
  }
`

export default function TeamMembersPage() {
  const {user} = useSelector((state: RootState) => state.authSlice)
  const {data} = useQuery<any>(GET_SITE_TEAM_MEMBERS);
  const [members,setMembers] = useState<any>([])
  const params = useParams();
  const siteId = params.id;
  const userId = user?._id

  const [inviteMember, { loading: mutationLoading , data: inviteData,error: inviteError}] = useMutation(INVITE_TEAM_MEMBER);

  // --- ADDED ONLY THESE TWO STATES ---
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(()=>{
    if(data && data.members){
       setMembers(data.members)
    }
  },[data])

  useEffect(()=>{
    if(inviteData){
      // Handle successful invite
      setInviteLoading(false);
      setIsInviteModalOpen(false);
      console.log("Invite successful:", inviteData);

    }
    if(inviteError){
      // Handle invite error
      setInviteLoading(false);
      setIsInviteModalOpen(false)
      console.log("Invite error:", inviteError);
    }
  },[inviteData, inviteError])


  // --- ADDED ONLY THIS HANDLER ---
  const handleInvite = (phone: string) => {
    setInviteLoading(true);
    // Add logic here later
    inviteMember({
      variables: {
        siteId,
        invitedByUserId: userId,
        invitedMobileNumber: phone,
      }
    })
    
  };

  // Ant Design Table Columns (UNTOUCHED)
  const columns: TableColumnsType<any> = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (data) => {
        return (
          <div className='w-60 h-60 rouded-full bg-black text-white text-center'>
            {data.user.firstName[0]}{data.user.lastName[0]  }
          </div>
        );
      },
    },
    {
      title: 'First Name',
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: 'Designation',
      dataIndex: 'role',
      key: 'role',
      render: (data) => <span className="font-semibold text-gray-700">{data.role}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (data) => (
        <Tag 
          color={data.status === 'Active' ? '#00D06A' : '#FF1919'} 
          className="rounded-full px-6 py-1 border-none font-bold text-white text-xs"
        >
          {data.status}
        </Tag>
      ),
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      key: 'mobile',
      render: (text: string) => <span className="font-bold text-[#1e293b]">TODO FIX LATER</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => <Button type="text" icon={<MoreOutlined className="text-gray-400" />} />,
    },
  ];

  // The Table Component shared by both tabs (UNTOUCHED)
  const TeamTable = () => (
    <div className="bg-white rounded-lg">
      <Table 
        columns={columns} 
        dataSource={members} 
        pagination={false}
        className="custom-table"
      />
    </div>
  );

  // Tab Items Configuration (UNTOUCHED)
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
            <CustomButton 
              text="Invite Team Member" 
              className="bg-[#2D2D2D] text-white" 
              onClick={() => setIsInviteModalOpen(true)} // ONLY ADDED THIS
            />
            <CustomButton text="Add New Support Member" className="bg-[#2D2D2D] text-white" />
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs 
        defaultActiveKey="1" 
        items={tabItems} 
        className="custom-tabs"
      />

      {/* --- ADDED THE MODAL HERE --- */}
      <InviteModal 
        open={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInvite}
        loading={inviteLoading}
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
