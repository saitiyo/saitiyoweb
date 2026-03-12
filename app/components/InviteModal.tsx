"use client";

import React from 'react';
import { Modal } from 'antd';
import InputField from './InputField'; // Adjust path
import CustomButton from '@/app/components/Button'; // Adjust path

type InviteModalProps = {
  open: boolean;
  onClose: () => void;
  onInvite: (phone: string) => void;
  loading?: boolean;
};

export default function InviteModal({ open, onClose, onInvite, loading }: InviteModalProps) {
  const [phone, setPhone] = React.useState('');

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null} // We use our own custom footer/button
      centered
      width={700}
      bodyStyle={{ padding: '40px' }}
      // This removes the default close icon if you want the clean look from the image
      // closeIcon={null} 
    >
      <div className="flex flex-col items-center text-center">
        <p className="text-gray-400 text-sm mb-8 font-medium">
          Make sure that the person you're inviting has an account with Saitiyo
        </p>

        <div className="flex w-full gap-3 items-end">
          <div className="flex-1">
            <InputField
              placeholder="Enter Phone Number"
              value={phone}
              onChange={(e: any) => setPhone(e.target.value)}
              className="!border-b-2 !border-blue-400" // Matching the blue highlight in image
            />
          </div>
          
          <div className="w-1/3">
            <CustomButton 
              text="Invite" 
              className="bg-[#2D2D2D] text-white w-full py-3 rounded-md"
              onClick={() => onInvite(phone)}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
