export interface Member {
  id: string;
  name: string;
  role: string;
  status: 'Clocked in' | 'Clocked out';
  time: string;
  avatar: string;
}
