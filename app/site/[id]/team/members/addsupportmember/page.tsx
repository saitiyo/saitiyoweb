"use client";

import React, { useEffect, useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { LeftOutlined } from '@ant-design/icons';
import CustomButton from '@/app/components/Button';
import InputField from '@/app/components/InputField';
import SelectField from '@/app/components/SelectField';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { AddSupportMemberResponse } from '@/app/types/member';
import { useParams } from 'next/navigation';
import CustomToast from '@/app/components/CustomToast/CustomToastify';
import { GET_SUPPORT_TEAM_MEMBERS } from '../page';

const ADD_SUPPORT_TEAM_MEMBER = gql`
  mutation AddSupportTeamMember(
    $siteId: ID!, 
    $firstName: String!, 
    $lastName: String!, 
    $email: String!, 
    $mobileNumber: String!,
    $gender: Gender!
  ) {
    addSupportTeamMember(
      siteId: $siteId, 
      firstName: $firstName, 
      lastName: $lastName, 
      email: $email, 
      mobileNumber: $mobileNumber,
      gender: $gender
    ) {
      _id 
    }
  }
`;

const SupportMemberSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  designation: Yup.string().required('Designation is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  gender: Yup.string().required('Gender is required'),
  phoneNumber: Yup.string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .min(10, "Too short")
    .required('Phone number is required'),
});

export default function AddSupportMemberPage() {
  const params = useParams();
  const siteId = params.id;

  const [addSupportMember, { loading, error: addSupportMemberError, data: addSupportMemberData }] = useMutation<AddSupportMemberResponse>(ADD_SUPPORT_TEAM_MEMBER,{
    // 1. Specify the query AND the variables it needs to match the list page
    refetchQueries: [
      {
        query: GET_SUPPORT_TEAM_MEMBERS,
        variables: { 
          siteId: siteId,
          limit: 10,  // Match the pageSize in your list page
          offset: 0   // Usually you want to refresh the first page to see the new member
        },
      },
    ],
    // 2. This ensures the 'await' in handleSubmit waits for the data to actually refresh
    awaitRefetchQueries: true, 
  }
   );
  const router = useRouter();
  const [toastConfig, setToastConfig] = useState({ show: false, message: '', isSuccess: false });

  const initialValues = {
    firstName: '',
    lastName: '',
    designation: '',
    email: '',
    phoneNumber: '',
    gender: '', 
  };

  useEffect(()=>{

    // Check if the specific mutation key exists in the response
    if (addSupportMemberData && addSupportMemberData.addSupportTeamMember) {
      setToastConfig({
        show: true,
        message: "Member added successfully", 
        isSuccess: true
      });
      
      // Navigate back after a short delay
      setTimeout(() => router.back(), 4000);
    }
    if(addSupportMemberError){
      setToastConfig({
        show: true,
        message: "Failed to add member",
        isSuccess: false
      });
    }

  },[addSupportMemberData,addSupportMemberError])

 const handleSubmit = async (values: typeof initialValues, { setSubmitting }: any) => {
  try {
  await addSupportMember({
      variables: {
        siteId: siteId, 
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        mobileNumber: values.phoneNumber,
        gender: values.gender,
      }
    });

  } catch (error: any) {
    // This will catch GraphQL errors like "Email already exists"
    setToastConfig({
      show: true,
      message: error.message || "A network error occurred",
      isSuccess: false
    });
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12">
        <CustomToast
          message={toastConfig.message}
          show={toastConfig.show}
          isSuccess={toastConfig.isSuccess}
          isError={!toastConfig.isSuccess}
        />
        <div className="mb-10 text-center">
          <button 
            onClick={() => router.back()} 
            className="inline-flex items-center text-gray-400 hover:text-black transition-colors mb-4 text-sm"
          >
            <LeftOutlined className="mr-2 text-xs" />
            Back to Team
          </button>
          <h1 className="text-3xl font-bold text-black">Add Support Member</h1>
          <p className="text-gray-500 mt-2">Create a new support profile for your site</p>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={SupportMemberSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, handleChange, handleBlur, setFieldValue, isSubmitting }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">First Name</label>
                  <InputField
                    name="firstName"
                    placeholder="John"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.firstName && touched.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && touched.firstName && (
                    <span className="text-red-500 text-[10px] mt-1 font-medium">{errors.firstName}</span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Last Name</label>
                  <InputField
                    name="lastName"
                    placeholder="Doe"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.lastName && touched.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && touched.lastName && (
                    <span className="text-red-500 text-[10px] mt-1 font-medium">{errors.lastName}</span>
                  )}
                </div>
              </div>

              {/* Gender Select Field */}
              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Gender</label>
                <SelectField
                  placeholder="Select Gender"
                  value={values.gender}
                  onChange={(value) => setFieldValue('gender', value)}
                  className={errors.gender && touched.gender ? 'border-red-500' : ''}
                  options={[
                    { value: 'MALE', label: 'Male' },
                    { value: 'FEMALE', label: 'Female' },
                  ]}
                />
                {errors.gender && touched.gender && (
                  <span className="text-red-500 text-[10px] mt-1 font-medium">{errors.gender}</span>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Designation</label>
                <InputField
                  name="designation"
                  placeholder="Support Specialist"
                  value={values.designation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.designation && touched.designation ? 'border-red-500' : ''}
                />
                {errors.designation && touched.designation && (
                  <span className="text-red-500 text-[10px] mt-1 font-medium">{errors.designation}</span>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Email Address</label>
                <InputField
                  name="email"
                  type="email"
                  placeholder="john@company.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.email && touched.email ? 'border-red-500' : ''}
                />
                {errors.email && touched.email && (
                  <span className="text-red-500 text-[10px] mt-1 font-medium">{errors.email}</span>
                )}
              </div>

              <div className="flex flex-col">
                <label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Phone Number</label>
                <InputField
                  name="phoneNumber"
                  placeholder="1234567890"
                  value={values.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.phoneNumber && touched.phoneNumber ? 'border-red-500' : ''}
                />
                {errors.phoneNumber && touched.phoneNumber && (
                  <span className="text-red-500 text-[10px] mt-1 font-medium">{errors.phoneNumber}</span>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-6">
                <CustomButton 
                  text={isSubmitting ? "Processing..." : "Create Member"} 
                  htmlType="submit"
                  className="bg-black text-white w-full h-12 text-base font-bold tracking-wide"
                  disabled={isSubmitting}
                />
                <CustomButton 
                  text="Cancel" 
                  onClick={() => router.back()}
                  className="bg-white !text-black border border-gray-200 w-full h-12 text-base font-bold shadow-none"
                  style={{ backgroundColor: 'transparent', borderColor: '#e5e7eb' }}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
