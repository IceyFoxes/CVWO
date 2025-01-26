import React, { useState } from "react";
import { TextField } from "@mui/material";
import CustomModal from "../shared/Modal";
import { useAlert } from "../contexts/AlertContext";

interface PasswordChangeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { currentPassword: string; newPassword: string }) => Promise<boolean>;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { showAlert } = useAlert();

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
        showAlert("New passwords do not match.", "error");
        return;
    }

    if (!newPassword || !currentPassword) {
        showAlert("All fields are required.", "warning");
        return;
    }
    
    if (newPassword === currentPassword) {
      showAlert("New password cannot be the same as current password.", "warning");
      return;
    }

    const isPasswordUpdated = await onConfirm({ currentPassword, newPassword });

    if (isPasswordUpdated) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        onClose(); // Close the modal only if password update was successful
    }
};

  return (
    <CustomModal
      open={open}
      title="Change Password"
      onClose={onClose}
      onConfirm={handleSubmit}
    >
      <TextField
        label="Current Password"
        type="password"
        fullWidth
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        sx={{ my: 2 }}
        required
      />
      <TextField
        label="New Password"
        type="password"
        fullWidth
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        sx={{ my: 2 }}
        required
      />
      <TextField
        label="Confirm New Password"
        type="password"
        fullWidth
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        sx={{ my: 2 }}
        required
      />
    </CustomModal>
  );
};

export default PasswordChangeModal;
