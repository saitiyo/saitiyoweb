"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import {
  UserOutlined,
  DownloadOutlined,
  BellOutlined,
  SettingOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { Layout, Menu, theme, Avatar, Badge } from 'antd';
import { LayoutDashboard,Users, Webcam, Toolbox, BookOpenText, FolderArchive, FileCheck } from 'lucide-react';
import { MenuItemType } from 'antd/es/menu/interface';


const { Header, Content, Sider } = Layout;



//   'Live Cam',
//   'Team',
//   'Equipment',
//   'Project documentation',
//   'Archives',
//   'Task board',

// Map menu keys to routes
const menuRoutes: { [key: string]: string } = {
  
};


const App: React.FC<React.PropsWithChildren> = ({ children }) => {
  const router = useRouter();

  
const items:MenuItemType[] = [
  {
    key: '1',
    icon: <LayoutDashboard size={18} />,
    label: 'Dashboard',
     onClick: () => router.push("/site"),
  },
  {
    key: '2',
    icon: <Webcam size={18} />,
    label: 'Live Cam',
     onClick: () => router.push("/site/livecam"),
  },
   {
    key: '3',
    icon: <Users size={18} />,
    label: 'Team',
     onClick: () => router.push("/site/team"),
  },
  {
    key: '4',
    icon: <Toolbox size={18} />,
    label: 'Equipment',
     onClick: () => router.push("/site/equipment"),
  },{
    key: '5',
    icon: <BookOpenText size={18} />,
    label: 'Project Documentation',
     onClick: () => router.push("/site/projectdocumentation"),
  },
  {
    key: '6',
    icon: <FolderArchive size={18} />,
    label: 'Archives',
     onClick: () => router.push("/site/archives"),
  },
  {
    key: '7',
    icon: <FileCheck size={18} />,
    label: 'Task Board',
     onClick: () => router.push("/site/taskboard"),
  },
 
];

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // title displayed in header; update when menu changes
  const [headerTitle, setHeaderTitle] = React.useState('Dashboard');
  const [selectedKey, setSelectedKey] = React.useState('1');

  const handleMenuClick = (e: { key: string }) => {
    setSelectedKey(e.key);
    // find label from menu items
    const item = items.find((it) => it.key === e.key);
    if (item && typeof item.label === 'string') {
      setHeaderTitle(item.label);
    }
    const route = menuRoutes[e.key];
    if (route) {
      router.push(route);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        style={{ height: '100vh' }}
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
          /* Make layout and sider full height */
          .ant-layout {
            min-height: 100vh;
          }
          
          .ant-layout-sider {
            height: 100vh !important;
          }

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
        <Menu className="custom-sider-menu" theme="dark" mode="inline" selectedKeys={[selectedKey]} items={items} onClick={handleMenuClick} />
      </Sider>
      <Layout style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header style={{ padding: 0, backgroundColor: 'lightgray', flexShrink: 0 }}>
          <div className="flex items-center justify-between px-6">
            <div className="text-sm font-medium text-gray-700">{headerTitle}</div>

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
        <Content style={{ margin: '', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              flex: 1,
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
