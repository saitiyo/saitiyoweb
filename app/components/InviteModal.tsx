"use client";

import React, { useState } from 'react';
import { Modal } from 'antd';
import PhoneInput from '@/app/components/PhoneInput';
import CustomButton from '@/app/components/Button'; 

type InviteModalProps = {
  open: boolean;
  onClose: () => void;
  onInvite: (phone: string) => void;
  loading?: boolean;
};

export default function InviteModal({ open, onClose, onInvite, loading }: InviteModalProps) {
  const [phoneValue, setPhoneValue] = useState<string | undefined>();
  const [error, setError] = useState<string>('');
  const handlePhoneChange = (phone: string | undefined) => {
    setPhoneValue(phone);
    setError('');
  };

  const handleInvite = () => {
    if (!phoneValue || phoneValue.trim() === '') {
      setError('Phone number is required');
      return;
    }

    if (phoneValue.length < 9) {
      setError('Phone number is too short');
      return;
    }

    onInvite(phoneValue);
  };

  const handleClose = () => {
    setPhoneValue(undefined);
    setError('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={700}
      styles={{ body: { padding: '40px' } }}
    >
      <div className="flex flex-col items-center text-center">
        <p className="text-gray-400 text-sm mb-8 font-medium">
          Make sure that the person you're inviting has an account with Saitiyo
        </p>

        <div className="flex w-full gap-3 items-start">
          <div className="flex-1 flex flex-col items-start">
            <PhoneInput
              value={phoneValue}
              onChange={handlePhoneChange}
              placeholder="Enter Phone Number"
              defaultCountry="UG"
              error={error}
            />
          </div>
          
          <div className="w-1/3">
            <CustomButton 
              text="Invite" 
              className="bg-[#2D2D2D] text-white w-full py-3 rounded-md"
              onClick={handleInvite}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
