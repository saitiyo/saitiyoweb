"use client";

import React from 'react';
import { Table, Tag, Avatar, Button, Tabs, TableColumnsType } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import CustomButton from '@/app/components/Button';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useState, useEffect } from 'react';
import InviteModal from "@/app/components/InviteModal" 
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import CustomToast from '@/app/components/CustomToast/CustomToastify';
import { useRouter } from 'next/navigation';

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
`;

export const GET_SUPPORT_TEAM_MEMBERS = gql`
  query GetSupportTeamMembers($siteId: ID!, $status: SupportMemberStatus) {
    getSupportTeamMembers(siteId: $siteId, status: $status) {
      _id
      createdAt
      email
      firstName
      fullName
      gender
      lastName
      mobileNumber
      siteId
      status
      updatedAt
    }
  }
`;

export const INVITE_TEAM_MEMBER = gql`
  mutation InviteTeamMember($siteId: ID!, $invitedByUserId: ID!, $invitedMobileNumber: String!) {
    inviteTeamMember(siteId: $siteId, invitedByUserId: $invitedByUserId, invitedMobileNumber: $invitedMobileNumber) {
      success
      message
    }
  }
`;

export default function TeamMembersPage() {
  const { user } = useSelector((state: RootState) => state.authSlice);
  const router = useRouter();
  const params = useParams();
  const siteId = params.id;
  const userId = user?._id;

  // --- FIXED: Added variables to useQuery hooks ---
  const { data } = useQuery<any>(GET_SITE_TEAM_MEMBERS, {
    variables: { siteId },
    skip: !siteId, // Don't run if siteId isn't available yet
  });

  const { data: supportData } = useQuery<any>(GET_SUPPORT_TEAM_MEMBERS, {
    variables: { siteId },
    skip: !siteId,
  });

  const [members, setMembers] = useState<any[]>([]);
  const [supportMembers, setSupportMembers] = useState<any[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [toastConfig, setToastConfig] = useState({ show: false, message: '', isSuccess: false });

  const [inviteMember, { data: inviteData, error: inviteError }] = useMutation<any>(INVITE_TEAM_MEMBER);

  useEffect(() => {
    if (data && data.getSiteTeamMembers) {
      setMembers(data.getSiteTeamMembers);
    }
  }, [data]);

  useEffect(() => {
    if (supportData && supportData.getSupportTeamMembers) {
      setSupportMembers(supportData.getSupportTeamMembers);
    }
  }, [supportData]);

  useEffect(() => {
    if (inviteData) {
      setInviteLoading(false);
      setIsInviteModalOpen(false);
      setToastConfig({
        show: true,
        message: inviteData.inviteTeamMember.message,
        isSuccess: inviteData.inviteTeamMember.success
      });
      setTimeout(() => setToastConfig(prev => ({ ...prev, show: false })), 4000);
    }
    
    if (inviteError) {
      setInviteLoading(false);
      setToastConfig({
        show: true,
        message: inviteError.message || "An error occurred",
        isSuccess: false
      });
      setTimeout(() => setToastConfig(prev => ({ ...prev, show: false })), 4000);
    }
  }, [inviteData, inviteError]);

  const handleInvite = (phone: string) => {
    setInviteLoading(true);
    inviteMember({
      variables: {
        siteId,
        invitedByUserId: userId,
        invitedMobileNumber: phone,
      }
    });
  };

  // Team Table Columns
  const columns: TableColumnsType<any> = [
    {
      title: 'Member',
      key: 'user',
      render: (record) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-black">
            {record.user?.firstName?.[0]}{record.user?.lastName?.[0]}
          </Avatar>
          <span>{record.user?.firstName} {record.user?.lastName}</span>
        </div>
      ),
    },
    {
      title: 'Designation',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'} className="rounded-full px-4">
          {status}
        </Tag>
      ),
    },
    {
        title: 'Actions',
        key: 'actions',
        render: () => <Button type="text" icon={<MoreOutlined />} />,
    },
  ];

  // Support Table Columns (Needs different mapping because SupportMember structure is flatter)
  const supportColumns: TableColumnsType<any> = [
    {
      title: 'Name',
      key: 'name',
      render: (record) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-blue-600">
            {record.firstName?.[0]}{record.lastName?.[0]}
          </Avatar>
          <span>{record.firstName} {record.lastName}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
        title: 'Mobile',
        dataIndex: 'mobileNumber',
        key: 'mobileNumber',
      },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color="blue" className="rounded-full px-4">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => <Button type="text" icon={<MoreOutlined />} />,
    },
  ];

  const TeamTable = () => (
    <Table columns={columns} dataSource={members} pagination={false} className="custom-table" rowKey="id" />
  );

  const SupportTeamTable = () => (
    <Table columns={supportColumns} dataSource={supportMembers} pagination={false} className="custom-table" rowKey="_id" />
  );

  const tabItems = [
    { key: '1', label: 'Team Members', children: <TeamTable /> },
    { key: '2', label: 'Support Team Members', children: <SupportTeamTable /> },
  ];

  return (
    <div className="p-10 bg-white min-h-screen">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-4xl font-bold text-black">Team Members</h1>
        
        <CustomToast
          message={toastConfig.message}
          show={toastConfig.show}
          isSuccess={toastConfig.isSuccess}
          isError={!toastConfig.isSuccess}
        />
        
        <div className="flex gap-4">
            <CustomButton 
              text="Invite Team Member" 
              className="bg-[#2D2D2D] text-white" 
              onClick={() => setIsInviteModalOpen(true)} 
            />
            <CustomButton 
              text="Add New Support Member" 
              className="bg-[#2D2D2D] text-white" 
              onClick={() => router.push(`/site/${siteId}/team/members/addsupportmember`)}
            />
        </div>
      </div>

      <Tabs defaultActiveKey="1" items={tabItems} className="custom-tabs" />

      <InviteModal 
        open={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInvite}
        loading={inviteLoading}
      />

      <style jsx global>{`
        .custom-tabs .ant-tabs-ink-bar { background: #000 !important; height: 3px !important; }
        .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #000 !important; font-weight: bold; }
        .custom-table .ant-table-thead > tr > th { background: #F9FAFB !important; }
      `}</style>
    </div>
  );
}
