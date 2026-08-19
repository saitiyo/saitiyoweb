"use client";

import React from "react";
import {
  Table,
  Tag,
  Avatar,
  Button,
  Tabs,
  TableColumnsType,
  Dropdown,
  Popconfirm,
} from "antd";
import { DeleteOutlined, MoreOutlined } from "@ant-design/icons";
import CustomButton from "@/app/components/Button";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useState, useEffect } from "react";
import InviteModal from "@/app/components/InviteModal";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import CustomToast from "@/app/components/CustomToast/CustomToastify";

export const GET_SITE_TEAM_MEMBERS = gql`
  query GetSiteTeamMembers($siteId: ID!) {
    getSiteTeamMembers(siteId: $siteId) {
      id
      user {
        firstName
        lastName
      }
      role
      status
      joinedAt
      createdAt
    }
  }
`;

export const GET_SUPPORT_TEAM_MEMBERS = gql`
  query GetSupportTeamMembers($siteId: ID!, $status: SupportMemberStatus) {
    getSupportTeamMembers(siteId: $siteId, status: $status) {
      _id
      createdAt
      email
      firstName
      fullName
      gender
      lastName
      mobileNumber
      status
      updatedAt
    }
  }
`;

export const INVITE_TEAM_MEMBER = gql`
  mutation InviteTeamMember(
    $siteId: ID!
    $invitedByUserId: ID!
    $invitedMobileNumber: String!
  ) {
    inviteTeamMember(
      siteId: $siteId
      invitedByUserId: $invitedByUserId
      invitedMobileNumber: $invitedMobileNumber
    ) {
      success
      message
    }
  }
`;

export const DELETE_SUPPORT_TEAM_MEMBER = gql`
  mutation DeleteSupportTeamMember($deleteSupportTeamMemberId: ID!) {
    deleteSupportTeamMember(id: $deleteSupportTeamMemberId)
  }
`;

export const GET_SITE_INVITATIONS = gql`
  query GetSiteInvitations($siteId: ID!) {
    getSiteInvitations(siteId: $siteId) {
      id
      siteName
      invitedByUser {
        firstName
        lastName
        mobileNumber
      }
      invitedUser
      invitedUserInfo {
        firstName
        lastName
        mobileNumber
      }
      invitedMobileNumber
      role
      status
      message
      expiresAt
      acceptedAt
      createdAt
    }
  }
`;

export default function TeamMembersPage() {
  const { user } = useSelector((state: RootState) => state.authSlice);

  const router = useRouter();
  const params = useParams();

  const rawSiteId = params?.id;
  const siteId = Array.isArray(rawSiteId) ? rawSiteId[0] : rawSiteId;

  const invitedByUserId = user?._id || user?.id;

  // =========================================================
  // TOAST HELPER
  // =========================================================

  const [toastConfig, setToastConfig] = useState({
    show: false,
    message: "",
    isSuccess: false,
  });

  const showToast = (message: string, isSuccess: boolean) => {
    setToastConfig({
      show: true,
      message,
      isSuccess,
    });

    setTimeout(() => {
      setToastConfig((prev) => ({
        ...prev,
        show: false,
      }));
    }, 4000);
  };

  // =========================================================
  // GET TEAM MEMBERS
  // =========================================================

  const { data, loading, error } = useQuery<any>(
    GET_SITE_TEAM_MEMBERS,
    {
      variables: { siteId },
      skip: !siteId,
    }
  );

  // =========================================================
  // GET SUPPORT TEAM MEMBERS
  // =========================================================

  const { data: supportData } = useQuery<any>(
    GET_SUPPORT_TEAM_MEMBERS,
    {
      variables: { siteId },
      skip: !siteId,
    }
  );

  // =========================================================
  // GET SITE INVITATIONS
  // =========================================================

  const {
    data: invitationsData,
    error: invitationsError,
    refetch: refetchInvitations,
  } = useQuery<any>(
    GET_SITE_INVITATIONS,
    {
      variables: { siteId },
      skip: !siteId,
    }
  );

  // =========================================================
  // STATE
  // =========================================================

  const [members, setMembers] = useState<any[]>([]);
  const [supportMembers, setSupportMembers] = useState<any[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] =
    useState(false);
  const [activeTabKey, setActiveTabKey] =
    useState<string>("1");

  // =========================================================
  // DELETE SUPPORT TEAM MEMBER
  // =========================================================

  const [deleteMember] = useMutation(
    DELETE_SUPPORT_TEAM_MEMBER,
    {
      onCompleted: () => {
        // Refresh support team list
        // after successful deletion.
        // This is handled separately so that
        // the toast is not dependent on the refetch.
        showToast(
          "Member deleted successfully",
          true
        );
      },

      onError: (error) => {
        showToast(
          error.message || "Failed to delete member",
          false
        );
      },
    }
  );

  // =========================================================
  // INVITE TEAM MEMBER
  // =========================================================

  const [
    inviteMember,
    { loading: inviteMutationLoading },
  ] = useMutation<any>(
    INVITE_TEAM_MEMBER,
    {
      // IMPORTANT:
      // We intentionally DO NOT use refetchQueries here.
      //
      // The invitation mutation should be considered
      // successful based on the invitation mutation itself,
      // not based on whether the invitations query succeeds.
      //
      // After success, we manually refresh the invitations
      // list below.

      onCompleted: async (response) => {
        console.log(
          "INVITATION RESPONSE:",
          response
        );

        const result =
          response?.inviteTeamMember;

        // =====================================================
        // NO RESPONSE FROM BACKEND
        // =====================================================

        if (!result) {
          console.error(
            "Invitation mutation returned no inviteTeamMember:",
            response
          );

          showToast(
            "Invitation could not be processed. Please try again.",
            false
          );

          return;
        }

        // =====================================================
        // SUCCESS
        // =====================================================

        // Treat the mutation as successful when:
        //
        // 1. success === true
        //
        // OR
        //
        // 2. the backend returned an invitation result
        //    with a message but did not explicitly return false.
        //
        // This prevents a valid backend response from being
        // incorrectly shown as a failed invitation.

        const invitationSuccessful =
          result.success === true ||
          result.success === undefined;

        if (invitationSuccessful) {
          console.log(
            "Invitation sent successfully:",
            result
          );

          // Close invite modal
          setIsInviteModalOpen(false);

          // Go to Team Members tab
          setActiveTabKey("1");

          // SHOW SUCCESS TOAST
          showToast(
            result.message ||
              "Invitation sent successfully",
            true
          );

          // Refresh invitations separately.
          //
          // If this query fails, we DO NOT show an invitation
          // failure because the invitation itself was already
          // successfully sent.
          if (siteId) {
            try {
              await refetchInvitations();
            } catch (refreshError) {
              console.warn(
                "Invitation sent, but invitation list could not be refreshed:",
                refreshError
              );
            }
          }

          return;
        }

        // =====================================================
        // BACKEND EXPLICITLY RETURNED success: false
        // =====================================================

        console.warn(
          "Invitation was rejected by backend:",
          result
        );

        showToast(
          result.message ||
            "Invitation could not be sent",
          false
        );
      },

      // =======================================================
      // GRAPHQL / NETWORK ERROR
      // =======================================================

      onError: (mutationError) => {
        console.error(
          "INVITATION ERROR:",
          mutationError
        );

        showToast(
          mutationError.message ||
            "Failed to send invitation",
          false
        );
      },
    }
  );

  // =========================================================
  // UPDATE TEAM MEMBERS
  // =========================================================

  useEffect(() => {
    if (data?.getSiteTeamMembers) {
      setMembers(data.getSiteTeamMembers);
    }
  }, [data]);

  // =========================================================
  // UPDATE SUPPORT MEMBERS
  // =========================================================

  useEffect(() => {
    if (supportData?.getSupportTeamMembers) {
      setSupportMembers(
        supportData.getSupportTeamMembers
      );
    }
  }, [supportData]);

  // =========================================================
  // HANDLE INVITATION
  // =========================================================

  const handleInvite = (phone: string) => {
    if (!siteId || !invitedByUserId) {
      showToast(
        "Unable to send invite: missing site or user data.",
        false
      );

      return;
    }

    console.log(
      "Sending invitation with variables:",
      {
        siteId,
        invitedByUserId,
        invitedMobileNumber: phone,
      }
    );

    inviteMember({
      variables: {
        siteId,
        invitedByUserId,
        invitedMobileNumber: phone,
      },
    });
  };

  // =========================================================
  // TEAM MEMBERS TABLE COLUMNS
  // =========================================================

  const teamMembersColumns: TableColumnsType<any> = [
    {
      title: "Name",
      key: "name",

      render: (record) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-blue-600">
            {record.user?.firstName?.[0]}
            {record.user?.lastName?.[0]}
          </Avatar>

          <span>
            {record.user?.firstName}{" "}
            {record.user?.lastName}
          </span>
        </div>
      ),
    },

    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",

      render: (status) => (
        <Tag
          color={
            status === "Active"
              ? "green"
              : "blue"
          }
          className="rounded-full px-4"
        >
          {status}
        </Tag>
      ),
    },

    {
      title: "Joined",
      dataIndex: "joinedAt",
      key: "joinedAt",

      render: (joinedAt: string) =>
        joinedAt
          ? new Date(
              joinedAt
            ).toLocaleDateString()
          : "-",
    },
  ];

  // =========================================================
  // SUPPORT TEAM TABLE COLUMNS
  // =========================================================

  const supportColumns: TableColumnsType<any> = [
    {
      title: "Name",
      key: "name",

      render: (record) => (
        <div className="flex items-center gap-3">
          <Avatar className="bg-blue-600">
            {record.firstName?.[0]}
            {record.lastName?.[0]}
          </Avatar>

          <span>
            {record.firstName}{" "}
            {record.lastName}
          </span>
        </div>
      ),
    },

    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },

    {
      title: "Mobile",
      dataIndex: "mobileNumber",
      key: "mobileNumber",
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",

      render: (status) => (
        <Tag
          color="blue"
          className="rounded-full px-4"
        >
          {status}
        </Tag>
      ),
    },

    {
      title: "Actions",
      key: "actions",
      align: "right",

      render: (record) => {
        return (
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            menu={{
              items: [
                {
                  key: "delete",
                  danger: true,
                  icon: <DeleteOutlined />,

                  label: (
                    <Popconfirm
                      title="Delete member?"
                      description="Are you sure you want to remove this member?"
                      onConfirm={() =>
                        deleteMember({
                          variables: {
                            deleteSupportTeamMemberId:
                              record._id,
                          },
                        })
                      }
                      okText="Yes"
                      cancelText="No"
                      okButtonProps={{
                        danger: true,
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          width: "100%",
                        }}
                      >
                        Delete Member
                      </span>
                    </Popconfirm>
                  ),
                },
              ],
            }}
          >
            <Button
              type="text"
              icon={
                <MoreOutlined
                  style={{
                    fontSize: "18px",
                  }}
                />
              }
            />
          </Dropdown>
        );
      },
    },
  ];

  // =========================================================
  // TEAM TABLE
  // =========================================================

  const TeamTable = () => {
    if (!siteId) {
      return (
        <div>
          No site selected
        </div>
      );
    }

    if (loading) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    if (error) {
      return (
        <div>
          Error loading members:{" "}
          {error.message}
        </div>
      );
    }

    return (
      <Table
        columns={teamMembersColumns}
        dataSource={members}
        pagination={{
          pageSize: 10,
          position: ["bottomCenter"],
          hideOnSinglePage: true,
        }}
        className="custom-table"
        rowKey={(record) => record.id}
      />
    );
  };

  // =========================================================
  // SUPPORT TEAM TABLE
  // =========================================================

  const SupportTeamTable = () => (
    <Table
      columns={supportColumns}
      dataSource={supportMembers}
      pagination={{
        pageSize: 10,
        position: ["bottomCenter"],
        hideOnSinglePage: true,
      }}
      className="custom-table"
      rowKey="_id"
    />
  );

  // =========================================================
  // TABS
  // =========================================================

  const tabItems = [
    {
      key: "1",
      label: "Team Members",
      children: <TeamTable />,
    },

    {
      key: "2",
      label: "Support Team Members",
      children: <SupportTeamTable />,
    },
  ];

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="p-10 bg-white min-h-screen">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-4xl font-bold text-black">
          Team Members
        </h1>

        {/* =================================================
            SUCCESS / ERROR TOAST
        ================================================== */}

        <CustomToast
          message={toastConfig.message}
          show={toastConfig.show}
          isSuccess={toastConfig.isSuccess}
          isError={!toastConfig.isSuccess}
        />

        <div className="flex gap-4">
          {/* INVITE TEAM MEMBER BUTTON */}

          <CustomButton
            text="Invite Team Member"
            className="bg-[#2D2D2D] text-white"
            onClick={() =>
              setIsInviteModalOpen(true)
            }
          />

          {/* ADD SUPPORT MEMBER BUTTON */}

          <CustomButton
            text="Add New Support Member"
            className="bg-[#2D2D2D] text-white"
            onClick={() =>
              router.push(
                `/site/${siteId}/team/members/addsupportmember`
              )
            }
          />
        </div>
      </div>

      {/* =================================================
          TABS
      ================================================== */}

      <Tabs
        activeKey={activeTabKey}
        onChange={(key) =>
          setActiveTabKey(key)
        }
        items={tabItems}
        className="custom-tabs"
      />

      {/* =================================================
          INVITE MODAL
      ================================================== */}

      <InviteModal
        open={isInviteModalOpen}
        onClose={() =>
          setIsInviteModalOpen(false)
        }
        onInvite={handleInvite}
        loading={inviteMutationLoading}
      />

      {/* =================================================
          STYLES
      ================================================== */}

      <style jsx global>{`
        .custom-tabs .ant-tabs-ink-bar {
          background: #000 !important;
          height: 3px !important;
        }

        .custom-tabs
          .ant-tabs-tab-active
          .ant-tabs-tab-btn {
          color: #000 !important;
          font-weight: bold;
        }

        .custom-table
          .ant-table-thead
          > tr
          > th {
          background: #f9fafb !important;
        }
      `}</style>
    </div>
  );
}
