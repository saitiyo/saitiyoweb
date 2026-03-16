
interface User {
    _id:string
    id:string
    firstName:string
    lastName:string
    email:string
    mobileNumber:string
}

type Site = {
  _id: string;
  owner:string
  name: string;
  logoUrl?: string;
  status?: string;
  daysLeft?: number;
  progress?: number;
  notificationCount?: number;
};

interface TeamMember {
  id:string
  userId:string
  user:User
  role:string
  status:string
  joinedAt:string
  createdAt:string
}

interface InviteResponse {
  inviteTeamMember: {
    success: boolean;
    message: string;
    __typename?: string;
  };
}

type PlanType =
  | 'FLOOR_PLAN' | 'ELEVATION' | 'SECTION'
  | 'SITE_LAYOUT' | 'ELECTRICAL' | 'PLUMBING'
  | 'STRUCTURAL' | 'OTHER';


interface SitePlan {
  _id: string;
  title: string;
  planType: PlanType;
  fileUrl: string;
  fileSize?: number;
  description?: string;
  uploadedBy: string;
  createdAt: string;
}
   

