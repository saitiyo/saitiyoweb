"use client";

import React from 'react';
import { Button } from 'antd';
import { 
  MailOutlined, 
  CalendarOutlined, 
  CheckOutlined, 
  CloseOutlined 
} from '@ant-design/icons';

interface Props {
  invitation: Invitation;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  loading?: boolean;
}

export default function InvitationCard({ invitation, onAccept, onDecline, loading }: Props) {
  const isPending = invitation.status === 'Pending';

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4 flex flex-col md:flex-row md:items-center justify-between shadow-sm hover:shadow-md transition-shadow">
      {/* Left Section: Icon and Details */}
      <div className="flex items-start gap-5">
        {/* Icon Box: Explicitly Black with White Icon */}
        <div className="bg-black p-4 rounded-lg flex items-center justify-center min-w-[60px] h-[60px]">
          <MailOutlined style={{ color: 'white', fontSize: '24px' }} />
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
              {invitation.siteName}
            </h3>
            <span className="bg-gray-100 text-black text-[11px] font-bold px-2 py-0.5 rounded border border-gray-200 uppercase">
              {invitation.role}
            </span>
          </div>
          <p className="text-gray-500 text-sm font-medium">
            Invited by <span className="text-black">{invitation.invitedBy}</span>
          </p>
          <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
            <CalendarOutlined style={{ fontSize: '12px' }} />
            <span className="font-medium uppercase tracking-wider">{invitation.date}</span>
          </div>
        </div>
      </div>

      {/* Right Section: Action Buttons */}
      <div className="mt-6 md:mt-0 flex items-center gap-2.5">
        {isPending ? (
          <>
            {/* Decline Button: Outlined Black/White */}
            <Button 
              onClick={() => onDecline(invitation.id)}
              className="!border-gray-300 !text-black hover:!border-black hover:!text-black h-11 px-6 font-bold rounded-md shadow-none transition-colors"
              disabled={loading}
            >
              Decline
            </Button>
            
            {/* Accept Button: Solid Black with White Text & Icon */}
            <Button 
              type="primary" 
              onClick={() => onAccept(invitation.id)}
              loading={loading}
              className="!bg-black !border-black !text-white hover:!bg-gray-800 h-11 px-8 font-bold rounded-md shadow-none flex items-center justify-center gap-2"
            >
              {!loading && <CheckOutlined style={{ color: 'white' }} />}
              <span className="!text-white">Accept</span>
            </Button>
          </>
        ) : (
          /* Status Label for History */
          <div className={`px-5 py-2.5 border-2 rounded-full font-black text-xs tracking-widest uppercase ${
            invitation.status === 'Accepted' 
              ? 'border-black text-black' 
              : 'border-gray-200 text-gray-400'
          }`}>
            {invitation.status}
          </div>
        )}
      </div>
    </div>
  );
}
