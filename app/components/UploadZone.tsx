import React from 'react';
import { Upload, message } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

const UploadZone = () => {
  const props = {
    name: 'file',
    multiple: false,
    action: '/api/upload', // Replace with your actual upload endpoint
    onChange(info: any) {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  return (
    <Dragger {...props} className="bg-white !border-gray-200 !rounded-xl">
      <div className="py-10">
        <p className="ant-upload-drag-icon">
          <CloudUploadOutlined style={{ fontSize: '48px', color: '#9ca3af', fontWeight: 'light' }} />
        </p>
        <p className="ant-upload-text text-gray-400 text-sm mt-4">
          Upload PNG, jpg, jpeg, max 50kb
        </p>
      </div>
    </Dragger>
  );
};

export default UploadZone;
