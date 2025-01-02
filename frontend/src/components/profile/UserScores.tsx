import React from "react";
import { Paper, Typography} from "@mui/material";
import Grid from "@mui/material/Grid2";

export interface Scores {
  userID: number;
  username: string;
  threadsScore: number;
  commentsScore: number;
  contributionScore: number;
}

interface UserScoresProps {
  scores: Scores;
}

const UserScores: React.FC<UserScoresProps> = ({ scores }) => {
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Scores
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6">Threads Score</Typography>
          <Typography variant="body1">{scores.threadsScore}</Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6">Comments Score</Typography>
          <Typography variant="body1">{scores.commentsScore}</Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6">Contribution Score</Typography>
          <Typography variant="body1">{scores.contributionScore}</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default UserScores;
