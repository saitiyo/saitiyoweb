"use client";

import React, { useState, useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Form, DatePicker, Button, Card, Spin, message, Upload, Space } from "antd";
import { CameraOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import dayjs from "dayjs";
import CustomButton from "@/app/components/Button";
import { RootState } from "@/redux/store";
import { GET_MY_SITES } from "../page";

// GraphQL Mutation
const CREATE_SITE_MUTATION = gql`
  mutation CreateSite($userId: ID!, $name: String!, $endDate: String!, $logoUrl: String) {
  createSite(userId: $userId, name: $name, endDate: $endDate, logoUrl: $logoUrl) {
    id
    name
    logoUrl
    status
    daysLeft
    progress
    notificationCount
  }
}
`;

interface SiteFormData {
  name: string;
  endDate: string;
  logoFile?: File;
}

const AddSite = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  
  // Redux state - assuming you have user info
  const { user } = useAppSelector((state:RootState) => state.authSlice);
  
  // Local state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // GraphQL mutation
  const [createSite, { loading: mutationLoading }] = useMutation(CREATE_SITE_MUTATION, {
    refetchQueries: [
      { query: GET_MY_SITES, variables: { userId: user?._id } }
    ],
    onCompleted: (data:any) => {
      message.success("Site created successfully!");
      console.log(data)
      // Optional: Refresh data or redirect
      setTimeout(()=>{
        router.back();
      },4000)
    },
    onError: (error:any) => {
      message.error(`Error creating site: ${error.message}`);
    },
  });

  /**
   * Upload file to Cloudinary
   */
  const uploadToCloudinary = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");
      formData.append("cloud_name", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "");
      formData.append("folder", "saitiyo/sites");
      formData.append("quality", "auto");
      formData.append("fetch_format", "auto");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  /**
   * Handle logo file selection
   */
  const handleLogoChange = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      message.error("File size must be less than 5MB");
      return false;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    return false; // Prevent default upload behavior
  }, []);

  /**
   * Remove logo
   */
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (values: any) => {
    try {
      if (!user) {
        message.error("User ID not found. Please log in again.");
        return;
      }

      const { name, endDate } = values;

      if (!name?.trim()) {
        message.error("Site name is required");
        return;
      }

      if (!endDate) {
        message.error("End date is required");
        return;
      }

      // Upload logo if provided
      let logoUrl = "";
      if (logoFile) {
        logoUrl = await uploadToCloudinary(logoFile);
      }

      // Format endDate as ISO string
      const formattedEndDate = endDate.toISOString();

      // Execute mutation
      await createSite({
        variables: {
          userId:user._id,
          name: name.trim(),
          endDate: formattedEndDate,
          logoUrl
        },
      });

      // Reset form
      form.resetFields();
      handleRemoveLogo();
    } catch (error) {
      console.error("Submit error:", error);
      message.error("Failed to create site");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Create New Site</h1>
          <p className="text-slate-600">Set up a new construction project and track its progress</p>
        </div>

        {/* Main Form Card */}
        <Card
          className="shadow-lg border-0"
          style={{
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <Spin spinning={mutationLoading || uploading} tip="Creating site...">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
              requiredMark={false}
            >
              {/* Site Name */}
              <Form.Item
                label={<span className="font-semibold text-slate-700">Site Name</span>}
                name="name"
                rules={[
                  { required: true, message: "Site name is required" },
                  { min: 3, message: "Site name must be at least 3 characters" },
                  { max: 100, message: "Site name must not exceed 100 characters" },
                ]}
              >
                <input
                  type="text"
                  placeholder="e.g., Downtown Plaza Construction"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </Form.Item>

              {/* End Date */}
              <Form.Item
                label={<span className="font-semibold text-slate-700">Project End Date</span>}
                name="endDate"
                rules={[{ required: true, message: "End date is required" }]}
              >
                <DatePicker
                  className="w-full"
                  placeholder="Select completion date"
                  disabledDate={(current) => {
                    // Disable past dates
                    return current && current < dayjs().startOf("day");
                  }}
                  style={{
                    height: "44px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                  }}
                  format="MMM DD, YYYY"
                />
              </Form.Item>

              {/* Logo Upload */}
              <Form.Item
                label={<span className="font-semibold text-slate-700">Site Logo (Optional)</span>}
              >
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  {logoPreview ? (
                    <div className="space-y-4">
                      <div className="relative inline-block">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-32 w-32 object-cover rounded-lg shadow-md"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <DeleteOutlined className="text-lg" />
                        </button>
                      </div>
                      <p className="text-sm text-slate-600">Logo selected</p>
                      <Upload
                        accept="image/*"
                        beforeUpload={handleLogoChange}
                        maxCount={1}
                        showUploadList={false}
                      >
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          Change logo
                        </button>
                      </Upload>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <CameraOutlined className="text-5xl text-slate-400" />
                      <div>
                        <p className="font-semibold text-slate-700">Upload site logo</p>
                        <p className="text-sm text-slate-500 mt-1">PNG, JPG or WebP (Max 5MB)</p>
                      </div>
                      <Upload
                        accept="image/*"
                        beforeUpload={handleLogoChange}
                        maxCount={1}
                        showUploadList={false}
                      >
                        <CustomButton
                          text="Browse Files"
                         />
                      </Upload>
                    </div>
                  )}
                </div>
              </Form.Item>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <ExclamationCircleOutlined className="text-blue-600 mt-0.5 text-lg shrink-0" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-1">Pro Tip</p>
                    <p>You can manage team members and track progress after creating the site.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <Form.Item>
                <Space className="w-full flex justify-end gap-3">
                  <Button
                    onClick={() => router.back()}
                    className="border-slate-300 text-slate-700 h-12 px-6 rounded-lg hover:border-slate-400 font-medium"
                  >
                    Cancel
                  </Button>
                  
                  <CustomButton
                    loading={mutationLoading || uploading}
                    disabled={mutationLoading || uploading}
                    htmlType="submit"
                    text={`${mutationLoading || uploading ? "Creating..." : "Create Site"}`}
                   />
                </Space>
              </Form.Item>
            </Form>
          </Spin>
        </Card>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">📋 What's Next?</h3>
            <p className="text-sm text-slate-600">
              After creating your site, you can add team members, upload files, and start tracking progress.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-2">⚙️ Requirements</h3>
            <p className="text-sm text-slate-600">
              You need a site name and end date to proceed. Logo is optional but recommended.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSite;