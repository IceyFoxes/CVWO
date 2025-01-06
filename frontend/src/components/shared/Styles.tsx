import { SxProps, Theme } from "@mui/material/styles";

export const buttonStyles: SxProps<Theme> = {
    "&.MuiButton-root": {
        textTransform: "none",
        padding: "8px 16px",
        borderRadius: "8px",
    },
    "&:hover": {
        boxShadow: "none", 
    },
    "&:active": {
        transform: "scale(0.98)",
    },
};

export const cardStyles: SxProps<Theme> = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    cursor: "pointer",
    borderRadius: "8px", // Rounded corners
    boxShadow: 3, // Default shadow
    transition: "box-shadow 0.3s ease, transform 0.2s ease", // Smooth hover effects
    "&:hover": {
        boxShadow: 6, // Enhanced shadow on hover
        transform: "scale(1.02)", // Slight scale effect
    },
};

// For Text fields
export const inputStyles: SxProps<Theme> = {
    color: "text.primary",
    "& .MuiOutlinedInput-root": {
        "&:hover fieldset": {
            borderColor: "primary.main",
        },
        "&.Mui-focused fieldset": {
            borderColor: "primary.dark",
        },
    },
};

export const listItemStyles: SxProps<Theme> = {
    padding: { xs: "6px 12px", sm: "8px 16px" }, 
    fontSize: { xs: "0.875rem", sm: "1rem" }, 
    "&.Mui-selected": {
        backgroundColor: (theme) => theme.palette.secondary.light,
        "&:hover": {
            backgroundColor: (theme) => theme.palette.secondary.main,
        },
    },
    "&:hover": {
        backgroundColor: (theme) => theme.palette.grey[500], // Grey hover
    },
    transition: "background-color 0.2s ease-in-out", // Smooth transition for hover effects
    borderRadius: "8px",
};

export const modalStyles: SxProps<Theme> = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: 2,
    padding: 4,
};

export const sidebarContainer: SxProps<Theme> = {
    width: 250,
    padding: 2,
    borderRight: "1px solid #ddd",
    position: "sticky",
    top: 100,
    height: "100vh", 
    overflowY: "auto", 
    backgroundColor: (theme) => theme.palette.background.paper, 
    boxShadow: 2, 
};


    