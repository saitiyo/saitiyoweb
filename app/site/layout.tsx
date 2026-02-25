"use client"
import React from 'react';
import {
  UserOutlined,
  DownloadOutlined,
  BellOutlined,
  SettingOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { Layout, Menu, theme, Avatar, Badge } from 'antd';

const { Header, Content, Sider } = Layout;

const sidebarLabels = [
  'Dashboard',
  'Live Cam',
  'Team',
  'Equipment',
  'Project documentation',
  'Archives',
  'Task board',
];

const items = sidebarLabels.map((label, index) => ({
  key: String(index + 1),
  label,
}));

const App: React.FC<React.PropsWithChildren> = ({ children }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Layout>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <style jsx global>{`
          .custom-sider-menu .ant-menu-item-selected {
            background: #e5e7eb !important;
            color: #000 !important;
            border-radius: 0 !important;
          }

          /* Force all text and child elements within selected item to be black */
          .custom-sider-menu .ant-menu-item-selected *,
          .custom-sider-menu .ant-menu-item-selected > a,
          .custom-sider-menu .ant-menu-item-selected a,
          .custom-sider-menu .ant-menu-item-selected span,
          .custom-sider-menu .ant-menu-item-selected:hover > a,
          .custom-sider-menu .ant-menu-item-selected:hover a,
          .custom-sider-menu .ant-menu-item-selected:hover span,
          .custom-sider-menu .ant-menu-item-selected:hover * {
            color: #000 !important;
          }

          /* Hover state: make text blue for non-selected items */
          .custom-sider-menu .ant-menu-item:hover {
            background: #f3f4f6 !important;
            border-radius: 0 !important;
            color: #2563eb !important; /* blue-600 */
          }

          /* ensure anchor text also becomes blue on hover */
          .custom-sider-menu .ant-menu-item:hover > a,
          .custom-sider-menu .ant-menu-item:hover a {
            color: #2563eb !important;
          }

          /* light gray separators between items and straight ends */
          .custom-sider-menu .ant-menu-item {
            border-bottom: 1px solid #e5e7eb !important;
            border-radius: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            box-sizing: border-box !important;
            color: rgba(255,255,255,0.9) !important;
          }

          .custom-sider-menu .ant-menu-item > a {
            display: block !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          .custom-sider-menu .ant-menu-item:last-child {
            border-bottom: none !important;
          }

          /* remove default menu interior padding so borders reach edges */
          .custom-sider-menu.ant-menu-dark {
            padding: 0 !important;
          }
        `}</style>
        <div className="px-4 py-4">
          <div className="text-white text-lg font-semibold">Homeland Heights</div>
        </div>
        <div className="demo-logo-vertical" />
        <Menu className="custom-sider-menu" theme="dark" mode="inline" defaultSelectedKeys={['1']} items={items} />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, backgroundColor: 'lightgray' }}>
          <div className="flex items-center justify-between px-6">
            <div className="text-sm font-medium text-gray-700">Dashboard</div>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded hover:bg-gray-200">
                <DownloadOutlined />
              </button>

              <button className="p-2 rounded hover:bg-gray-200 relative">
                <Badge count={3} size="small">
                  <BellOutlined />
                </Badge>
              </button>

              <button className="p-2 rounded hover:bg-gray-200">
                <SettingOutlined />
              </button>

              <div className="flex items-center gap-2">
                <Avatar icon={<UserOutlined />} size={28} />
                <DownOutlined />
              </div>
            </div>
          </div>
        </Header>
        <Content style={{ margin: '' }}>
          <div
            style={{
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              padding: 10,
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
