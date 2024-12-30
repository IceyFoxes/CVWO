import React, { useState } from "react";
import { TextField, Typography } from "@mui/material";
import CustomModal from "./shared/Modal"; // Assuming the Modal is in the same directory

interface PasswordChangeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { currentPassword: string; newPassword: string }) => void;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setError(null);
    onConfirm({ currentPassword, newPassword });
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
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
    </CustomModal>
  );
};

export default PasswordChangeModal;
