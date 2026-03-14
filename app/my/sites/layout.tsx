"use client"

import { _getUserByToken } from "@/redux/actions/auth.actions";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Dropdown, MenuProps } from 'antd';
import { RightOutlined, LogoutOutlined, MailOutlined } from '@ant-design/icons';

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.authSlice);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      localStorage.removeItem("sessionId");
      router.replace("/");
      return;
    }
    dispatch(_getUserByToken({ token }));
  }, []);

  // 1. Define the Dropdown Menu Items
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <div className="flex items-center justify-between w-64 py-2 px-1">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-md border border-gray-200">
              <MailOutlined className="text-lg" />
            </div>
            <span className="font-medium text-gray-700">Invitations</span>
          </div>
          <RightOutlined className="text-gray-400 text-xs" />
        </div>
      ),
      onClick: () => router.push('/my/sites/invitations'),
    },
    {
      key: '2',
      label: (
        <div className="flex items-center justify-between w-64 py-2 px-1">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-md border border-gray-200">
              <LogoutOutlined className="text-lg" />
            </div>
            <span className="font-medium text-gray-700">Logout</span>
          </div>
          <RightOutlined className="text-gray-400 text-xs" />
        </div>
      ),
      onClick: () => {
        localStorage.clear();
        router.replace("/");
      },
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center gap-3 p-3">
        {/* 2. Wrap the Avatar in the Dropdown */}
        <Dropdown 
          menu={{ items }} 
          trigger={['click']} 
          overlayClassName="custom-profile-dropdown"
          placement="bottomLeft"
        >
          <div className="cursor-pointer flex items-center gap-3 group">
            <div className="relative w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 bg-black transition-opacity group-hover:opacity-80">
              {user && (
                <span className="text-white font-bold text-lg">
                  {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="h-12 flex flex-col justify-center relative">
              <div className="text-lg font-semibold text-gray-900 leading-tight">
                {user && `${user.firstName} ${user.lastName}`}
              </div>
              <div className="text-xs text-gray-500 text-left">Architect</div>
            </div>
          </div>
        </Dropdown>
      </header>

      {children}

      <style jsx global>{`
        .custom-profile-dropdown .ant-dropdown-menu {
          padding: 12px !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
        }
        .custom-profile-dropdown .ant-dropdown-menu-item {
          border: 1px solid #f0f0f0 !important;
          border-radius: 8px !important;
          margin-bottom: 8px !important;
        }
        .custom-profile-dropdown .ant-dropdown-menu-item:last-child {
          margin-bottom: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default ProfileLayout;
