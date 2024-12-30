import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { buttonStyles } from './Styles';
import { Link } from 'react-router-dom';

export const PrimaryButton: React.FC<ButtonProps> = (props) => {
    return (
        <Button
            variant="contained"
            color="primary"
            {...props}
            sx={{
                ...(buttonStyles as any),
                ...(props.sx || {}),
                borderRadius: '8px', // Optional: custom border radius
            }}
        >
            {props.children}
        </Button>
    );
};

export const SecondaryButton: React.FC<ButtonProps> = (props) => {
    return (
        <Button
            variant="contained"
            color="secondary"
            {...props}
            sx={{
                ...(buttonStyles as any),
                ...(props.sx || {}),
                borderRadius: '4px', // Optional: smaller radius
            }}
        >
            {props.children}
        </Button>
    );
};

export const OutlinedButton: React.FC<ButtonProps> = (props) => {
    return (
        <Button
            variant="outlined"
            color="primary"
            {...props}
            sx={{
                ...(buttonStyles as any),
                ...(props.sx || {}),
                borderColor: 'primary.main',
                '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.1)', // Optional: hover effect
                },
            }}
        >
            {props.children}
        </Button>
    );
};

export const DangerButton: React.FC<ButtonProps> = (props) => {
    return (
        <Button
            variant="contained"
            color="error"
            {...props}
            sx={{
                ...(buttonStyles as any),
                ...(props.sx || {}),
                color: '#fff',
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
            {...props}
            sx={{
                textDecoration: 'underline',
                textTransform: 'none',
                ...props.sx,
            }}
        >
            {props.children}
        </Button>
    );
};
