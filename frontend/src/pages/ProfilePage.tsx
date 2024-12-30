import React, { useEffect, useState } from "react";
import UserInfo from "../components/UserInfo";
import UpdateUserBio from "../components/UpdateUserBio"; // New Component for Editing Bio
import { getAuthorization, getUserInfo, getUserMetrics, getUserScores, updatePassword } from "../services/userService";
import { useParams } from "react-router-dom";
import { Box } from "@mui/material";
import UserMetrics, { Metrics } from "../components/UserMetrics";
import Loader from "../components/shared/Loader";
import UserScores, { Scores } from "../components/UserScores";
import UserActivity from "../components/UserActivity";
import { PrimaryButton } from "../components/shared/Buttons";
import PasswordChangeModal from "../components/PasswordChange";
import { useAlert } from "../components/contexts/AlertContext";
import RoleManagement from "../components/RoleManagement";
import { useRefresh } from "../components/contexts/RefreshContext";
import Layout from "../components/layouts/Layout";

interface UserInfoData {
  joinDate: string;
  role: string;
  bio: string;
}

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [userInfo, setUserInfo] = useState<UserInfoData | null>(null);
  const [userMetrics, setUserMetrics] = useState<Metrics | null>(null);
  const [userScores, setUserScores] = useState<Scores | null>(null);
  const [isCurrAdmin, setIsCurrAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false); // New state for Bio Modal
  const { refreshFlag } = useRefresh();
  const { showAlert } = useAlert();

  const currUsername = sessionStorage.getItem("username");

  const handleOpenPasswordModal = () => setIsPasswordModalOpen(true);
  const handleClosePasswordModal = () => setIsPasswordModalOpen(false);

  const handleOpenBioModal = () => setIsBioModalOpen(true); // Open Bio Modal
  const handleCloseBioModal = () => setIsBioModalOpen(false); // Close Bio Modal

  const handlePasswordChange = async (data: { currentPassword: string; newPassword: string }) => {
    try {
      await updatePassword(username ?? "", data.currentPassword, data.newPassword);
      showAlert("Password updated successfully!", "success");
      handleClosePasswordModal();
    } catch (error: any) {
      showAlert(error.response?.data.error || "Failed to update password.", "error");
    }
  };

  const handleBioUpdate = (newBio: string) => {
    if (userInfo) {
      setUserInfo({ ...userInfo, bio: newBio });
      showAlert("Bio updated successfully!", "success");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userInfoData, userMetricsData, userScoresData] = await Promise.all([
          getUserInfo(username ?? ""),
          getUserMetrics(username ?? ""),
          getUserScores(username ?? ""),
        ]);
        setUserInfo(userInfoData);
        setUserMetrics(userMetricsData);
        setUserScores(userScoresData);
        
        const authData = await getAuthorization(currUsername);
        setIsCurrAdmin(authData);

        setError(null);
      } catch (err) {
        setError("Failed to fetch user information or metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, currUsername, refreshFlag]);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (loading) return <Loader></Loader>;

  return (
    <Layout>
      <Box p={4} maxWidth="800px" margin="auto">
        {userInfo && (
          <>
            <UserInfo
              username={username ?? ""}
              joinDate={userInfo.joinDate}
              role={userInfo.role}
              bio={userInfo.bio}
            />
            {currUsername === username && (
              <PrimaryButton
                variant="contained"
                color="primary"
                onClick={handleOpenBioModal}
                sx={{ mt: 2 }}
              >
                Update Bio
              </PrimaryButton>
            )}
          </>
        )}

        {userMetrics && (
          <Box mt={4}>
            <UserMetrics metrics={userMetrics} />
          </Box>
        )}

        {userScores !== null && (
          <Box mt={4}>
            <UserScores scores={userScores} />
          </Box>
        )}

        {username && (
          <Box mt={4}>
            <UserActivity username={username} />
          </Box>
        )}

        {isCurrAdmin && (
          <Box mt={4} mb={4}>
            <RoleManagement username={username ?? ""} isAdmin={userInfo?.role === "Admin"} />
          </Box>
        )}
        
        <PrimaryButton variant="contained" color="primary" onClick={handleOpenPasswordModal}>
          Change Password
        </PrimaryButton>
        <PasswordChangeModal
          open={isPasswordModalOpen}
          onClose={handleClosePasswordModal}
          onConfirm={handlePasswordChange}
        />

        {userInfo && (
          <UpdateUserBio
            open={isBioModalOpen}
            username={username ?? ""}
            currentBio={userInfo.bio}
            onClose={handleCloseBioModal}
            onBioUpdate={handleBioUpdate}
          />
        )}
      </Box>
    </Layout>
  );
};

export default ProfilePage;
