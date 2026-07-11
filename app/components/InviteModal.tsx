"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
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
  const [submitted, setSubmitted] = useState(false);

  // Clear form when modal opens
  useEffect(() => {
    if (open) {
      setPhoneValue(undefined);
      setError('');
      setSubmitted(false);
    }
  }, [open]);

  // Clear error when phone changes
  const handlePhoneChange = (phone: string | undefined) => {
    setPhoneValue(phone);
    if (error) {
      setError('');
    }
  };

  const validatePhoneNumber = (phone: string | undefined): boolean => {
    if (!phone || phone.trim() === '') {
      setError('Phone number is required');
      return false;
    }

    // Check if it's a valid international phone number
    if (!isValidPhoneNumber(phone)) {
      setError('Please enter a valid phone number');
      return false;
    }

    // Parse and check national number length (excluding country code)
    try {
      const parsedNumber = parsePhoneNumber(phone);
      if (parsedNumber) {
        const nationalNumberDigits = parsedNumber.nationalNumber.toString();
        if (nationalNumberDigits.length > 10) {
          setError('Phone number should not exceed 10 digits (excluding country code)');
          return false;
        }
      }
    } catch (err) {
      setError('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handleInvite = () => {
    setSubmitted(true);

    if (!validatePhoneNumber(phoneValue)) {
      return;
    }

    // TypeScript guard: phoneValue is guaranteed to be a string after validation
    if (phoneValue) {
      onInvite(phoneValue);
    }
  };

  const handleClose = () => {
    setPhoneValue(undefined);
    setError('');
    setSubmitted(false);
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
      closable={!loading}
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
              disabled={loading}
            />
            {submitted && error && (
              <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {/* <span>⚠️</span>
                <span>{error}</span> */}
              </div>
            )}
          </div>
          
          <div className="w-1/3">
            <CustomButton 
              text={loading ? "Sending..." : "Invite"} 
              className="bg-[#2D2D2D] text-white w-full py-3 rounded-md"
              onClick={handleInvite}
              loading={loading}
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
