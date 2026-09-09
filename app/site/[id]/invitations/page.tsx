"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, Empty } from 'antd';
import InvitationCard from '@/app/components/InvitationsCard';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { toast } from 'react-toastify';
import { useParams } from 'next/navigation';

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

export const GET_MY_ALL_INVITATIONS = gql`
  query GetSiteInvitations($siteId: ID!) {
  getSiteInvitations(siteId: $siteId) {
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
  mutation RejectInvitation($invitationId: ID!, $userId: ID!) {
    rejectInvitation(invitationId: $invitationId, userId: $userId) {
      success
      message
      data {
        id
        status
      }
    }
  }
`;

type AcceptInvitationResponse = {
  acceptInvitation: {
    data: Invitation;
  };
};

type AcceptInvitationVars = {
  invitationId: string;
  userId: string;
};

type DeclineInvitationResponse = {
  rejectInvitation: {
    success: boolean;
    message: string;
    data?: {
      id: string;
      status: string;
    };
  };
};

type DeclineInvitationVars = {
  invitationId: string;
  userId: string;
};

export default function InvitationsPage() {
  const {user} = useAppSelector((state:RootState) => state.authSlice);
  const params = useParams();
  const siteId = params.id as string;

  console.log("User in invitations page: ", user);

  const {data} = useQuery<any>(GET_MY_PENDING_INVITATIONS,{
    variables:{
      userId:user?._id
    },
    skip: !user?._id,
  });

  const {data: allInvitationsData } = useQuery<any>(GET_MY_ALL_INVITATIONS, {
    variables: {
      siteId: siteId
    },
    skip: !siteId,
  })

  const [acceptInvitation, { loading: acceptLoading }] = useMutation<AcceptInvitationResponse, AcceptInvitationVars>(ACCEPT_INVITATION, {
    refetchQueries: [
      { query: GET_MY_PENDING_INVITATIONS, variables: { userId: user?._id } },
      { query: GET_MY_ALL_INVITATIONS, variables: { siteId: siteId } }
    ]
  });
  const [declineInvitation, { loading: declineLoading }] = useMutation<DeclineInvitationResponse, DeclineInvitationVars>(DECLINE_INVITATION);

  const [invitations, setInvitations] = useState<any>([])
  const [siteInvitations, setSiteInvitations] = useState<any>([])
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (data && data.getMyPendingInvitations) {
      setInvitations((prev: any[]) => {
        const pending = data.getMyPendingInvitations;
        const history = prev.filter(
          (inv: any) =>
            (inv.status || '').toLowerCase() !== 'pending' &&
            !pending.some((pendingInv: any) => pendingInv.id === inv.id)
        );
        return [...pending, ...history];
      });
    }
  }, [data]);

  useEffect(() => {
    if (allInvitationsData && allInvitationsData.getSiteInvitations) {
      setSiteInvitations(allInvitationsData.getSiteInvitations);
    }
  }, [allInvitationsData]);

  const handleAccept = async (id: string) => {
    if (!user?._id) {
      toast.error('Please sign in before accepting an invitation.');
      return;
    }

    setLoadingId(id);
    try {
      await acceptInvitation({
        variables: { invitationId: id, userId: user._id }
      });

      // Update local state immediately to move invitation to history
      setInvitations((prev: any[]) =>
        prev.map((inv: any) =>
          inv.id === id ? { ...inv, status: 'Accepted' } : inv
        )
      );

      toast.success('Invitation accepted successfully!');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Failed to accept invitation. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDecline = async (id: string) => {
    if (!user?._id) {
      toast.error('Please sign in before declining an invitation.');
      return;
    }

    setLoadingId(id);
    try {
      const response = await declineInvitation({
        variables: { invitationId: id, userId: user._id }
      });

      const result = response.data?.rejectInvitation;
      if (!result?.success) {
        throw new Error(result?.message || 'The invitation could not be declined.');
      }

      const declinedStatus = result.data?.status || 'Declined';
      setInvitations((prev: any[]) => prev.filter((inv: any) => inv.id !== id));
      setSiteInvitations((prev: any[]) =>
        prev.map((inv: any) =>
          inv.id === id ? { ...inv, status: declinedStatus } : inv
        )
      );

      toast.success('Invitation declined successfully!');
    } catch (error) {
      console.error('Error declining invitation:', error);
      const message = error instanceof Error ? error.message : 'Failed to decline invitation. Please try again.';
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  };

  const pendingInvitations = invitations.filter((inv: any) =>
    (inv.status || '').toLowerCase() === 'pending' && inv.siteId === siteId
  );
  const historyInvitations = siteInvitations.filter((inv: any) =>
    (inv.status || '').toLowerCase() !== 'pending'
  );

  const items = [
    {
      key: '1',
      label: `PENDING (${pendingInvitations.length})`,
      children: (
        <div className="pt-6">
          {pendingInvitations.length > 0 ? (
            pendingInvitations.map((inv: Invitation) => (
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
          {historyInvitations.length > 0 ? (
            historyInvitations.map((inv: Invitation) => (
              <InvitationCard key={inv.id} invitation={inv}/>
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