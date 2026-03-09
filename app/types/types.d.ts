
interface User {
    firstName:string
    lastName:string
    email:string
    mobileNumber:string
}

type Site = {
  id: string;
  owner:string
  name: string;
  logoUrl?: string;
  status?: string;
  daysLeft?: number;
  progress?: number;
  notificationCount?: number;
};

