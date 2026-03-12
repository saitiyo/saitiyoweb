
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
   

