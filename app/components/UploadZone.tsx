import React from 'react';
import { Upload, message, GetProp, UploadProps } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const UploadZone = () => {
  const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    
    // Check for 50kb limit
    const isLt50K = file.size / 1024 < 50;
    if (!isLt50K) {
      message.error('Image must be smaller than 50KB!');
    }

    // Return false to stop Ant Design from trying to upload to a URL automatically
    // This allows us to handle the file manually via a form or state
    return false; 
  };

  return (
    <Dragger 
      name="file"
      multiple={false}
      beforeUpload={beforeUpload}
      accept=".png,.jpg,.jpeg"
      className="bg-white !border-gray-200 !rounded-xl"
    >
      <div className="py-10">
        <p className="ant-upload-drag-icon">
          <CloudUploadOutlined style={{ fontSize: '48px', color: '#9ca3af' }} />
        </p>
        <p className="ant-upload-text text-gray-400 text-sm mt-4">
          Upload PNG, jpg, jpeg, max 50kb
        </p>
      </div>
    </Dragger>
  );
};

export default UploadZone;
