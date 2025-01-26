import { styled } from "@mui/material/styles";
import Button, { ButtonProps } from "@mui/material/Button";
import { Link } from "react-router-dom";

// Primary Button
export const PrimaryButton = styled(Button)<ButtonProps>(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: "8px",
    padding: "8px 16px",
    transition: "all 0.3s ease",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    "&:hover": {
        backgroundColor: theme.palette.primary.dark,
        boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.2)",
    },
    "&:active": {
        transform: "scale(0.98)",
    },
    "&:disabled": {
        backgroundColor: theme.palette.action.disabledBackground,
        color: theme.palette.action.disabled,
    },
}));

// Danger Button
export const DangerButton = styled(Button)<ButtonProps>(({ theme }) => ({
    backgroundColor: theme.palette.danger.main,
    color: theme.palette.danger.contrastText,
    borderRadius: "8px",
    padding: "8px 16px",
    transition: "all 0.3s ease",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    "&:hover": {
        backgroundColor: "#7f0000", // Slightly darker red
        boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.2)",
    },
    "&:active": {
        transform: "scale(0.98)",
    },
    "&:disabled": {
        backgroundColor: theme.palette.action.disabledBackground,
        color: theme.palette.action.disabled,
    },
}));


interface LinkButtonProps extends ButtonProps {
    to: string; // Require 'to' for routing
}

export const LinkButton = styled(({ to, ...props }: LinkButtonProps) => (
    <Button component={Link} to={to} {...props} />))
    (({ theme }) => ({
        textDecoration: "none",
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderRadius: "8px",
        padding: "8px 16px",
        transition: "all 0.3s ease",
        "&:hover": {
            textDecoration: "underline", // Underline on hover
            backgroundColor: theme.palette.primary.dark,
            transform: "scale(1.02)", // Slight enlarge on hover
        },
        "&:active": {
            transform: "scale(0.98)", // Slight shrink on click
        },
        "&:disabled": {
            backgroundColor: theme.palette.action.disabledBackground,
            color: theme.palette.action.disabled,
            textDecoration: "none",
        },
    })
);