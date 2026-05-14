interface Invitation {
  id: string;
  siteName: string;
  role: string;
  invitedBy: string;
  invitedByUser:any;
  status: 'Pending' | 'Accepted' | 'Declined';
  date: string;
}
