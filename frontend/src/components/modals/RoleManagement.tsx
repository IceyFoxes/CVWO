import React from "react";
import { Box } from "@mui/material";
import { promoteUser, demoteUser } from "../../services/userService";
import { useAlert } from "../contexts/AlertContext";
import { DangerButton, PrimaryButton } from "../shared/Buttons";
import { useRefresh } from "../contexts/RefreshContext";

interface RoleManagementProps {
  username: string;
  isAdmin: boolean;
}

const RoleManagement: React.FC<RoleManagementProps> = ({ username, isAdmin }) => {
  const { showAlert } = useAlert();
  const { triggerRefresh } = useRefresh();

  const handlePromote = async () => {
    try {
      await promoteUser(username);
      showAlert(`${username} promoted to admin`, "success");
      triggerRefresh();
    } catch (error: any) {
      showAlert(error.response?.data.error || "Failed to promote user", "error");
    }
  };

  const handleDemote = async () => {
    try {
      await demoteUser(username);
      showAlert(`${username} demoted to user`, "success");
      triggerRefresh();
    } catch (error: any) {
      showAlert(error.response?.data.error || "Failed to demote user", "error");
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {isAdmin ? (
        <DangerButton variant="contained" color="secondary" onClick={handleDemote}>
          Demote User
        </DangerButton>
      ) : (
        <PrimaryButton variant="contained" color="primary" onClick={handlePromote}>
          Promote to Admin
        </PrimaryButton>
      )}
    </Box>
  );
};

export default RoleManagement;
