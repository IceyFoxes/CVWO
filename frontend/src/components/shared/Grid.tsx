import React from 'react';
import { Typography} from '@mui/material';
import Grid from '@mui/material/Grid2';
import CustomCard from './Card';

interface CustomGridProps {
    title: string;
    threads: any[]; // Replace `any` with your thread type interface if defined
}

const CustomGrid: React.FC<CustomGridProps> = ({ title, threads }) => {
    return (
        <div style={{ marginBottom: '20px' }}>
            <Typography variant="h5" gutterBottom>
                {title}
            </Typography>
            <Grid container spacing={2}>
                {threads.map((thread) => (
                    <Grid size = {{xs : 12, sm : 6, md : 4}} key={thread.id}>
                        <CustomCard thread={thread} />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
};

export default CustomGrid;
