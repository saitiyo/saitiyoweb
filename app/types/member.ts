export interface Member {
  id: string;
  name: string;
  role: string;
  status: 'Clocked in' | 'Clocked out';
  time: string;
  avatar: string;
}

export interface AddSupportMemberResponse {
  addSupportTeamMember: {
    _id: string;
    // add other fields if you added them to the gql string
  };
}