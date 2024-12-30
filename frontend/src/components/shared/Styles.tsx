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
    padding: 2,
    borderRadius: 2,
    boxShadow: 3,
    transition: "all 0.3s ease",
    "&:hover": {
        transform: "scale(1.02)",
        boxShadow: 6,
    },
};

// For Text fields
export const inputStyles: SxProps<Theme> = {
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
    padding: "8px 16px",
    "&.Mui-selected": {
        backgroundColor: "secondary.light",
        "&:hover": {
            backgroundColor: "secondary.main",
        },
    },
    "&:hover": {
        backgroundColor: "grey.100",
    },
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

export const headerStyles: SxProps<Theme> = {
    flexGrow: 1,
    padding: 2,
    borderRadius: 1,
    boxShadow: 2,
};

export const sidebarContainer: SxProps<Theme> = {
        width: 250,
        padding: 2,
        borderRight: "1px solid #ddd",
};


    