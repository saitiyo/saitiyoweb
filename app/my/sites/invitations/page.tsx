"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, Empty } from 'antd';
import InvitationCard from '@/app/components/InvitationsCard';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

export const GET_ALL_INVITATIONS = gql`
  query GetAllInvitations($siteId: ID!) {
  getSiteInvitations(siteId: $siteId) {
    id
    siteId
    siteName
    invitedBy
    invitedByUser {
      firstName
      id
      lastName
    }
    invitedUser
    invitedUserInfo {
      firstName
      id
      lastName
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


// const MOCK_DATA = [
//   {
//     id: '1',
//     siteName: 'Zion Heights',
//     role: 'Lead Architect',
//     invitedBy: 'Moses O.',
//     status: 'Pending' as const,
//     date: '14 MARCH 2026',
//   },
//   {
//     id: '2',
//     siteName: 'Marble Tower',
//     role: 'Consultant',
//     invitedBy: 'Sarah J.',
//     status: 'Accepted' as const,
//     date: '10 MARCH 2026',
//   }
// ];

export default function InvitationsPage() {
  const {data} = useQuery<any>(GET_ALL_INVITATIONS);
  const [ivitations, setInvitations] = useState<any>([])
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(()=>{
      if(data && data.invitations){
         setInvitations(data.invitations)
      }
    },[data])

  const handleAction = (id: string) => {
    setLoadingId(id);
    // Simulate API call
    setTimeout(() => setLoadingId(null), 1000);
  };

  const pending = ivitations.filter((i:Invitation) => i.status === 'Pending');
  const history = ivitations.filter((i:Invitation) => i.status !== 'Pending');

  const items = [
    {
      key: '1',
      label: `PENDING (${pending.length})`,
      children: (
        <div className="pt-6">
          {pending.length > 0 ? (
            pending.map((inv: Invitation) => (
              <InvitationCard 
                key={inv.id} 
                invitation={inv} 
                onAccept={handleAction} 
                onDecline={handleAction}
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
          {history.map((inv: Invitation) => (
            <InvitationCard key={inv.id} invitation={inv} onAccept={()=>{}} onDecline={()=>{}} />
          ))}
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
