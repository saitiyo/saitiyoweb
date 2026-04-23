"use client";
import ActiveContractsCard from "@/app/components/DashboardCard";
import Image from "next/image";
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import activemembers from '../../../assets/activemembers.png';
import supportteam from '../../../assets/supportteam.png';
import membersonsite from '../../../assets/membersonsite.png';
import { Tabs } from 'antd';
import MemberListItem from '@/app/components/MemberListItem';
import { Member } from "@/app/types/member";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const GET_SITE_TEAM_MEMBERS_COUNT = gql`
  query GetSiteTeamMembersCount($siteId: ID!) {
    getSiteTeamMembersCount(siteId: $siteId)
  }
`;


const mockMembers: Member[] = Array(5).fill({
  id: '1',
  name: 'Kintu Musa',
  role: 'Project Manager',
  status: 'Clocked in',
  time: '3/04/2025 7:35',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kintu',
});

const TeamPage = () => {

    const {data} = useQuery<any>(GET_SITE_TEAM_MEMBERS_COUNT);
    const [membersCount,setMembersCount] = useState<any>([])
    const params = useParams();
    const siteId = params?.id;

    useEffect(()=>{
        if(data && data.membersCount){
           setMembersCount(data.membersCount)
        }
      },[data])
    
  console.log("Members count: ", membersCount);

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
      <div className="flex flex-col gap-6 mb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ActiveContractsCard title="Team members" value={membersCount.length} image={
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
      </div>
      <div>
            <div className="min-h-screen bg-white p-6 md:p-12 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-semibold text-black">Team Overview</h1>
                  <p className="text-sm text-gray-500">View clock-in status and navigate to the full team members page.</p>
                </div>
                {siteId ? (
                  <Link href={`/site/${siteId}/team/members`} className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-200 shadow-sm" style={{ backgroundColor: '#000000', color: '#FFFFFF' }}>
                    Go to Team Members
                    <ChevronRight size={18} />
                  </Link>
                ) : (
                  <button className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold opacity-60 cursor-not-allowed shadow-sm" style={{ backgroundColor: '#000000', color: '#FFFFFF' }} disabled>
                    Go to Team Members
                    <ChevronRight size={18} />
                  </button>
                )}
              </div>
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
