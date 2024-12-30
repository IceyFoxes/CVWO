import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box sx={{ display: 'flex', flexGrow: 1, marginTop: '64px' }}>
                <Sidebar />
                <Box sx={{ flexGrow: 1, marginLeft: '250px', padding: 2 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default Layout;
