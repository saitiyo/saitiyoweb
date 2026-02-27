import React from 'react';
import { List, Avatar, Tag, Button } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { Member } from '../types/member';


interface Props {
  member: Member;
  isSelected?: boolean;
}

const MemberListItem = ({ member, isSelected }: Props) => {
  return (
    <List.Item
      className={`
        !mb-3 !p-4 !border-none rounded-xl bg-white shadow-sm transition-all
        ${isSelected ? 'ring-2 ring-blue-400 bg-blue-50/40' : 'hover:shadow-md'}
      `}
    >
      <div className="flex w-full items-center justify-between text-sm md:text-base">
        {/* User Profile Section */}
        <div className="flex items-center gap-4 w-1/4">
          <Avatar src={member.avatar} size={44} className="border border-gray-100" />
          <span className="font-bold text-gray-800">{member.name}</span>
        </div>

        {/* Role Column */}
        <div className="w-1/4 text-gray-700 font-medium">
          {member.role}
        </div>

        {/* Status Tag */}
        <div className="w-1/6 flex justify-center">
          <Tag 
            color={member.status === 'Clocked in' ? '#22C55E' : '#9ca3af'} 
            className="rounded-full px-6 py-1 border-none font-semibold text-white"
          >
            {member.status}
          </Tag>
        </div>

        {/* Time & Actions */}
        <div className="flex items-center justify-end gap-6 w-1/4">
          <span className="font-bold text-gray-900 tracking-tight">{member.time}</span>
          <Button 
            type="text" 
            shape="circle"
            icon={<MoreOutlined className="text-xl text-gray-400" />} 
            className="flex items-center justify-center hover:bg-gray-100"
          />
        </div>
      </div>
    </List.Item>
  );
};

export default MemberListItem;