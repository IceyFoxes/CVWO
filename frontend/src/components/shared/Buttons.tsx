import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { buttonStyles } from './Styles';
import { Link } from 'react-router-dom';
import { useTheme } from "@mui/material/styles";
import { red } from '@mui/material/colors';

export const PrimaryButton: React.FC<ButtonProps> = (props) => {
    const theme = useTheme();

    return (
        <Button
            variant="contained"
            {...props}
            sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                "&:hover": {
                    backgroundColor: theme.palette.primary.dark, 
                },
                ...(buttonStyles as any),
                ...(props.sx || {}),
            }}
        >
            {props.children}
        </Button>
    );
};

export const DangerButton: React.FC<ButtonProps> = (props) => {
    const theme = useTheme();
    
    return (
        <Button
            color="error"
            {...props}
            sx={{
                ...(buttonStyles as any),
                ...(props.sx || {}),
                backgroundColor: red[500],
                color: theme.palette.primary.contrastText,
                '&:hover': {
                    backgroundColor: '#d32f2f',
                },
            }}
        >
            {props.children}
        </Button>
    );
};

interface LinkButtonProps extends ButtonProps {
    to: string; // Require 'to' for routing
}

export const LinkButton: React.FC<LinkButtonProps> = ({ to, ...props }) => {
    return (
        <Button   
            component={Link}
            to={to}
            variant="contained"
            {...props}
        >
            {props.children}
        </Button>
    );
};
