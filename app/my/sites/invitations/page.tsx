"use client";

import React, { useState, useEffect, use } from 'react';
import { Tabs, Empty } from 'antd';
import InvitationCard from '@/app/components/InvitationsCard';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { toast } from 'react-toastify';

export const GET_MY_PENDING_INVITATIONS = gql`
 query GetMyPendingInvitations($userId: ID!) {
  getMyPendingInvitations(userId: $userId) {
    id
    siteId
    siteName
    invitedBy
    invitedByUser {
      firstName
      lastName
      mobileNumber
    }
    invitedUser
    invitedUserInfo {
      firstName
      lastName
      mobileNumber
    }
    invitedMobileNumber
    role
    status
    message
    expiresAt
    acceptedAt
    createdAt
  }
}
`;

export const GET_ACCEPTED_INVITATIONS = gql`

  query GetAcceptedInvitations($userId: ID!) {
  getAcceptedInvitations(userId: $userId) {
    id
    siteId
    siteName
    invitedBy
    invitedByUser {
      id
      firstName
      lastName
      mobileNumber
    }
    invitedUser
    invitedUserInfo {
      id
      firstName
      lastName
      mobileNumber
    }
    invitedMobileNumber
    role
    status
    message
    expiresAt
    acceptedAt
    createdAt
  }
}

`

export const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($invitationId: ID!, $userId: ID!) {
  acceptInvitation(invitationId: $invitationId, userId: $userId) {
    data {
      id
      siteId
      siteName
      invitedBy
      invitedByUser {
        id
        firstName
        lastName
        mobileNumber
      }
      invitedUser
      invitedUserInfo {
        id
        firstName
        lastName
        mobileNumber
      }
      invitedMobileNumber
      role
      status
      message
      expiresAt
      acceptedAt
      createdAt
    }
  }
}
`;

export const DECLINE_INVITATION = gql`
  mutation DeclineInvitation($invitationId: ID!) {
    declineInvitation(invitationId: $invitationId) {
      id
      status
    }
  }
`;


export default function InvitationsPage() {
  const {user} = useAppSelector((state:RootState) => state.authSlice);

  console.log("User in invitations page: ", user);

  const {data, refetch} = useQuery<any>(GET_MY_PENDING_INVITATIONS,{
    variables:{
      userId:user?._id
    },
    skip: !user?._id,
  });

  const {data: acceptedInvitationsData, refetch: refetchAcceptedInvitations} = useQuery<any>(GET_ACCEPTED_INVITATIONS,{
    variables:{
      userId: user?._id
    },
    skip: !user?._id,
  }); 

  const [acceptInvitation, { loading: acceptLoading }] = useMutation(ACCEPT_INVITATION);
  const [declineInvitation, { loading: declineLoading }] = useMutation(DECLINE_INVITATION);

  const [invitations, setInvitations] = useState<any>([])
  const [acceptedInvitations, setAcceptedInvitations] = useState<any>([])
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(()=>{
      if(data && data.getMyPendingInvitations){
         setInvitations(data.getMyPendingInvitations)
      }
    },[data])

  useEffect(()=>{
      if(acceptedInvitationsData && acceptedInvitationsData.getAcceptedInvitations){
         setAcceptedInvitations(acceptedInvitationsData.getAcceptedInvitations)
      }
    },[acceptedInvitationsData])

  const handleAccept = async (id: string) => {
    setLoadingId(id);
    try {
      await acceptInvitation({
        variables: { invitationId: id, userId: user?._id }
      });
      toast.success('Invitation accepted successfully!');
      await Promise.all([
        refetch(),
        refetchAcceptedInvitations?.(),
      ]);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDecline = async (id: string) => {
    setLoadingId(id);
    try {
      await declineInvitation({
        variables: { invitationId: id }
      });
      toast.success('Invitation declined successfully!');
      await refetch();
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error('Failed to decline invitation. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const items = [
    {
      key: '1',
      label: `PENDING (${invitations.length})`,
      children: (
        <div className="pt-6">
          {invitations.length > 0 ? (
            invitations.map((inv: Invitation) => (
              <InvitationCard 
                key={inv.id} 
                invitation={inv} 
                onAccept={handleAccept} 
                onDecline={handleDecline}
                loading={loadingId === inv.id}
              />
            ))
          ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="NO PENDING REQUESTS" />}
        </div>
      ),
    },
    {
      key: '2',
      label: 'HISTORY',
      children: (
        <div className="pt-6">
          {acceptedInvitations.length > 0 ? (
            acceptedInvitations.map((inv: Invitation) => (
              <InvitationCard key={inv.id} invitation={inv} />
            ))
          ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="NO HISTORY" />}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 border-b-4 border-black pb-6">
          <h1 className="text-5xl font-black text-black tracking-tighter uppercase">
            Invitations
          </h1>
          <p className="text-gray-500 mt-2 font-medium tracking-wide">
            PROJECT ACCESS REQUESTS & TEAM PERMISSIONS
          </p>
        </header>

        <Tabs 
          defaultActiveKey="1" 
          items={items} 
          className="black-white-tabs"
        />
      </div>

      <style jsx global>{`
        .black-white-tabs .ant-tabs-nav::before {
          border-bottom: 1px solid #e5e7eb !important;
        }
        .black-white-tabs .ant-tabs-tab-btn {
          color: #9ca3af !important;
          font-weight: 800 !important;
          letter-spacing: 0.1em !important;
        }
        .black-white-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #000 !important;
        }
        .black-white-tabs .ant-tabs-ink-bar {
          background: #000 !important;
          height: 4px !important;
        }
      `}</style>
    </div>
  );
}
