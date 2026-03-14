interface Invitation {
  id: string;
  siteName: string;
  role: string;
  invitedBy: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  date: string;
}
