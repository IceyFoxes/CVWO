import React from "react";
import { Typography, Paper } from "@mui/material";
import Grid from '@mui/material/Grid2';

export interface Metrics {
  threadsCreated: number;
  commentsMade: number;
  likesReceived: number;
  dislikesReceived: number;
}

interface UserMetricsProps {
  metrics: Metrics;
}

const UserMetrics: React.FC<UserMetricsProps> = ({ metrics }) => {
    return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Metrics
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6">Threads Created</Typography>
          <Typography variant="body1">{metrics.threadsCreated}</Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6">Comments Made</Typography>
          <Typography variant="body1">{metrics.commentsMade}</Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6">Likes Received</Typography>
          <Typography variant="body1">{metrics.likesReceived}</Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6">Dislikes Received</Typography>
          <Typography variant="body1">{metrics.dislikesReceived}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UserMetrics;
