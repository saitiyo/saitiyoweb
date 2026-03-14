"use client";

import React from 'react';
import { Modal } from 'antd';
import { Formik, FormikProps } from 'formik';
import * as Yup from 'yup';
import InputField from './InputField'; 
import CustomButton from '@/app/components/Button'; 

type InviteModalProps = {
  open: boolean;
  onClose: () => void;
  onInvite: (phone: string) => void;
  loading?: boolean;
};

// Define the shape of our form values
interface FormValues {
  phone: string;
}

export default function InviteModal({ open, onClose, onInvite, loading }: InviteModalProps) {
  
  const validationSchema = Yup.object({
    phone: Yup.string()
      .required('Phone number is required')
      .matches(/^[0-9+]+$/, 'Please enter a valid phone number')
      .min(10, 'Number is too short'),
  });

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={700}
      styles={{ body: { padding: '40px' } }} // Updated for latest AntD 'styles' prop
    >
      <Formik
        initialValues={{ phone: '' }}
        validationSchema={validationSchema}
        onSubmit={() => {}} // We are bypassing Formik's internal onSubmit
      >
        {(props: FormikProps<FormValues>) => {
          const { values, errors, touched, handleChange, handleBlur, validateForm } = props;

          const handleManualSubmit = async () => {
            // Manually trigger validation before calling onInvite
            const validationErrors = await validateForm();
            
            if (Object.keys(validationErrors).length === 0) {
              onInvite(values.phone);
            }
          };

          return (
            <div className="flex flex-col items-center text-center">
              <p className="text-gray-400 text-sm mb-8 font-medium">
                Make sure that the person you're inviting has an account with Saitiyo
              </p>

              <div className="flex w-full gap-3 items-start">
                <div className="flex-1 flex flex-col items-start">
                  <InputField
                    name="phone"
                    placeholder="Enter Phone Number"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full !border-b-2 ${
                      touched.phone && errors.phone 
                      ? '!border-red-500' 
                      : '!border-blue-400'
                    }`}
                  />
                  {touched.phone && errors.phone && (
                    <span className="text-red-500 text-xs mt-1 text-left font-medium">
                      {errors.phone}
                    </span>
                  )}
                </div>
                
                <div className="w-1/3">
                  <CustomButton 
                    text="Invite" 
                    className="bg-[#2D2D2D] text-white w-full py-3 rounded-md"
                    onClick={handleManualSubmit}
                    loading={loading}
                  />
                </div>
              </div>
            </div>
          );
        }}
      </Formik>
    </Modal>
  );
}
