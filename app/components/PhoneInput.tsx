'use client';

import React, { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import { parsePhoneNumber, CountryCode } from 'libphonenumber-js';
import 'react-phone-number-input/style.css';

interface PhoneInputProps {
  value?: string;
  onChange?: (phoneNumber: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  defaultCountry?: CountryCode;
  error?: string;
}

const PhoneInputComponent: React.FC<PhoneInputProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter phone number',
  disabled = false,
  defaultCountry = 'UG' as CountryCode,
  error,
}) => {
  const [phoneValue, setPhoneValue] = useState<string | undefined>(value || undefined);

  const handleChange = (newValue: string | undefined) => {
    setPhoneValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  // Custom style to match your design
  const containerStyle: React.CSSProperties = {
    width: '100%',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: error ? '1px solid #ff4d4f' : '1px solid #d9d9d9',
    borderRadius: '4px',
    fontSize: '14px',
    transition: 'all 0.3s',
    boxShadow: error ? '0 0 0 2px rgba(255, 77, 79, 0.1)' : 'none',
  };

  return (
    <div style={containerStyle}>
      <PhoneInput
        international
        countryCallingCodeEditable={false}
        defaultCountry={defaultCountry}
        placeholder={placeholder}
        value={phoneValue}
        onChange={handleChange}
        disabled={disabled}
        style={inputStyle}
      />
      {error && (
        <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default PhoneInputComponent;
