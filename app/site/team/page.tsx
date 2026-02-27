"use client";
import ActiveContractsCard from "@/app/components/DashboardCard";
import Image from "next/image";
import activemembers from '../../assets/activemembers.png';
import supportteam from '../../assets/supportteam.png';
import membersonsite from '../../assets/membersonsite.png';
import { Tabs } from 'antd';
import MemberListItem from '@/app/components/MemberListItem';
import { Member } from "@/app/types/member";

const mockMembers: Member[] = Array(5).fill({
  id: '1',
  name: 'Kintu Musa',
  role: 'Project Manager',
  status: 'Clocked in',
  time: '3/04/2025 7:35',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kintu',
});

const TeamPage = () => {

    const items = [
    {
      key: '1',
      label: 'Clocked In',
      children: (
        <div className="mt-4">
          {mockMembers.map((m, idx) => (
            <MemberListItem 
              key={idx} 
              member={m} 
              isSelected={idx === 1} // Replicating the 2nd item highlight from image
            />
          ))}
        </div>
      ),
    },
    {
      key: '2',
      label: 'Clocked Out',
      children: <div className="p-10 text-center text-gray-400">No members clocked out.</div>,
    },
  ];

  return (
    <div>
  <div className="flex justify-between">
    <ActiveContractsCard title="Active team members" value={24} image={
          <Image
            src={activemembers}
            width={64}
            height={64}
            className="w-16 h-16"
            alt=""
          />
        }/>
    <ActiveContractsCard title="Support team members" value={50} image={
          <Image
            src={supportteam}
            width={64}
            height={64}
            className="w-16 h-16"
            alt=""
          />
        }/>
    <ActiveContractsCard title="Members currently on site" value={12} image={
          <Image
            src={membersonsite}
            width={64}
            height={64}
            className="w-16 h-16"
            alt=""
          />
        }/>
  </div>
  <div>
            <div className="min-h-screen bg-[#F9FAFB] p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                <Tabs
                defaultActiveKey="1"
                items={items}
                className="custom-tabs"
                />
            </div>

            <style jsx global>{`
                /* Matching the specific visual style of the Ant Design Tabs */
                .ant-tabs-nav {
                    margin-bottom: 30px !important;
                }
                .ant-tabs-nav::before {
                border-bottom: 2px solid #E5E7EB !important;
                }
                .ant-tabs-tab {
                padding: 12px 30px !important;
                margin: 0 !important;
                }
                .ant-tabs-tab-btn {
                font-weight: 600 !important;
                font-size: 16px;
                color: #9CA3AF !important;
                }
                .ant-tabs-tab-active .ant-tabs-tab-btn {
                color: #000000 !important;
                }
                .ant-tabs-ink-bar {
                background: #000000 !important;
                height: 3px !important;
                }
            `}</style>
            </div>
        </div>
    </div>);
  
}

export default TeamPage;    
