import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import Layout from "../components/layouts/Layout";
import Loader from "../components/shared/Loader";
import UserInfo from "../components/profile/UserInfo";
import UserMetrics, { Metrics } from "../components/profile/UserMetrics";
import UserScores, { Scores } from "../components/profile/UserScores";
import UserActivity from "../components/profile/UserActivity";
import RoleManagement from "../components/modals/RoleManagement";
import PasswordChangeModal from "../components/modals/PasswordChange";
import UpdateUserBio from "../components/modals/UpdateUserBio";
import { PrimaryButton } from "../components/shared/Buttons";
import { useAuth } from "../components/contexts/AuthContext";
import { useAlert } from "../components/contexts/AlertContext";
import { useRefresh } from "../components/contexts/RefreshContext";
import { useModal } from "../components/hooks/useModal";
import {
    getAuthorization,
    getUserInfo,
    getUserMetrics,
    getUserScores,
    updatePassword,
} from "../services/userService";

interface UserInfoData {
    joinDate: string;
    role: string;
    bio: string;
}

const ProfilePage: React.FC = () => {
    const { usernameProfile } = useParams<{ usernameProfile: string }>();
    const [userInfo, setUserInfo] = useState<UserInfoData | null>(null);
    const [userMetrics, setUserMetrics] = useState<Metrics | null>(null);
    const [userScores, setUserScores] = useState<Scores | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { isOpen: isPasswordModalOpen, openModal: openPasswordModal, closeModal: closePasswordModal } = useModal();
    const { isOpen: isBioModalOpen, openModal: openBioModal, closeModal: closeBioModal } = useModal();

    const { username } = useAuth();
    const { showAlert } = useAlert();
    const { refreshFlag } = useRefresh();

    const handlePasswordChange = async (data: { currentPassword: string; newPassword: string }): Promise<boolean> => {
        try {
            await updatePassword(username ?? "", data.currentPassword, data.newPassword);
            showAlert("Password updated successfully!", "success");
            closePasswordModal(); 
            return true; 
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || "Failed to update password.";
            showAlert(errorMessage, "error");
            return false; 
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
                    getUserInfo(usernameProfile ?? ""),
                    getUserMetrics(usernameProfile ?? ""),
                    getUserScores(usernameProfile ?? ""),
                ]);

                setUserInfo(userInfoData);
                setUserMetrics(userMetricsData);
                setUserScores(userScoresData);

                const authData = await getAuthorization(username);
                setIsAdmin(authData);

                setError(null);
            } catch (err) {
                setError("Failed to fetch user information or metrics.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [usernameProfile, username, refreshFlag]);

    if (error) return <Typography color="error">{error}</Typography>;
    if (loading) return <Loader />;

    return (
        <Layout>
            <Box p={4} maxWidth="800px" margin="auto">
                {userInfo && (
                    <Box 
                        sx={{ 
                            display: "flex", 
                            flexDirection: "column", 
                            gap: 2,
                            alignItems: "flex-start",
                        }}
                    >
                        <UserInfo
                            username={usernameProfile ?? ""}
                            joinDate={userInfo.joinDate}
                            role={userInfo.role}
                            bio={userInfo.bio}
                        />
                        {username === usernameProfile && (
                            <PrimaryButton 
                                variant="contained" 
                                color="primary" 
                                onClick={openBioModal} 
                                sx={{ alignSelf: "flex-start", marginLeft: 2}}
                            >
                                Update Bio
                            </PrimaryButton>
                        )}
                    </Box>
                )}

                {userMetrics && (
                    <Box mt={4}>
                        <UserMetrics metrics={userMetrics} />
                    </Box>
                )}

                {userScores && (
                    <Box mt={4}>
                        <UserScores scores={userScores} />
                    </Box>
                )}

                {usernameProfile && (
                    <Box mt={4}>
                        <UserActivity username={usernameProfile} />
                    </Box>
                )}

                {isAdmin && (
                    <Box mt={4} mb={4}>
                        <RoleManagement username={usernameProfile ?? ""} isAdmin={userInfo?.role === "Admin"} />
                    </Box>
                )}

                {username === usernameProfile && (
                    <Box>
                        <PrimaryButton variant="contained" color="primary" onClick={openPasswordModal}>
                            Change Password
                        </PrimaryButton>
                        <PasswordChangeModal
                            open={isPasswordModalOpen}
                            onClose={closePasswordModal}
                            onConfirm={handlePasswordChange}
                        />
                    </Box>
                )}

                {userInfo && (
                    <UpdateUserBio
                        open={isBioModalOpen}
                        username={usernameProfile ?? ""}
                        currentBio={userInfo.bio}
                        onClose={closeBioModal}
                        onBioUpdate={handleBioUpdate}
                    />
                )}
            </Box>
        </Layout>
    );
};

export default ProfilePage;
