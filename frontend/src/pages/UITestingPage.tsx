import React from 'react';
import { PrimaryButton, SecondaryButton, DangerButton, OutlinedButton, LinkButton } from '../components/shared/Buttons';
import { TextField, Typography, Box, Paper, Divider, Card, CardContent, CardActions } from '@mui/material';
import Grid from '@mui/material/Grid2';
import Pagination from '../components/widgets/Pagination';
import SearchBar from '../components/widgets/SearchBar';
import SortMenu from '../components/widgets/SortMenu';
import Layout from '../components/layouts/Layout';

const UITestingPage: React.FC = () => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [sortBy, setSortBy] = React.useState('date');
    const [currentPage, setCurrentPage] = React.useState(1);
    const totalPages = 10;

    return (
        <Layout>
            <Typography variant="h4" gutterBottom>
                UI Testing Page
            </Typography>
            <Divider sx={{ marginY: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', marginLeft: '250px' }}>
                <Box sx={{ display: 'flex', flexGrow: 1 }}>
                    <Box sx={{ flexGrow: 1, padding: 4 }}>
                        {/* Search Bar Section */}
                        <Typography variant="h5" gutterBottom>
                            Search Bar
                        </Typography>
                        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

                        <Divider sx={{ marginY: 4 }} />

                        {/* Sort Menu Section */}
                        <Typography variant="h5" gutterBottom>
                            Sort Menu
                        </Typography>
                        <SortMenu sortBy={sortBy} onSortChange={setSortBy} />

                        <Divider sx={{ marginY: 4 }} />

                        {/* Buttons Section */}
                        <Typography variant="h5" gutterBottom>
                            Buttons
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <PrimaryButton>Primary Button</PrimaryButton>
                            <SecondaryButton>Secondary Button</SecondaryButton>
                            <OutlinedButton>Outlined Button</OutlinedButton>
                            <DangerButton>Danger Button</DangerButton>
                            <LinkButton to="/test">Link Button</LinkButton>
                        </Box>

                        <Divider sx={{ marginY: 4 }} />

                        {/* Text Fields Section */}
                        <Typography variant="h5" gutterBottom>
                            Text Fields
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField label="Default TextField" variant="outlined" fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField label="Filled TextField" variant="filled" fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField label="Standard TextField" variant="standard" fullWidth />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="With Error"
                                    variant="outlined"
                                    fullWidth
                                    error
                                    helperText="This field has an error"
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ marginY: 4 }} />

                        {/* Typography Section */}
                        <Typography variant="h5" gutterBottom>
                            Typography
                        </Typography>
                        <Box>
                            <Typography variant="h1">Heading 1</Typography>
                            <Typography variant="h2">Heading 2</Typography>
                            <Typography variant="h3">Heading 3</Typography>
                            <Typography variant="h4">Heading 4</Typography>
                            <Typography variant="h5">Heading 5</Typography>
                            <Typography variant="h6">Heading 6</Typography>
                            <Typography variant="body1">
                                Body 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            </Typography>
                            <Typography variant="body2">
                                Body 2: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            </Typography>
                        </Box>

                        <Divider sx={{ marginY: 4 }} />

                        {/* Paper Section */}
                        <Typography variant="h5" gutterBottom>
                            Paper and Containers
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Paper elevation={1} sx={{ padding: 2 }}>
                                    Elevation 1
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Paper elevation={3} sx={{ padding: 2 }}>
                                    Elevation 3
                                </Paper>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Paper elevation={5} sx={{ padding: 2 }}>
                                    Elevation 5
                                </Paper>
                            </Grid>
                        </Grid>

                        <Divider sx={{ marginY: 4 }} />

                        {/* Cards Section */}
                        <Typography variant="h5" gutterBottom>
                            Cards
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Card sx={{ maxWidth: 345 }}>
                                    <CardContent>
                                        <Typography variant="h5" component="div">
                                            Card Title
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            This is a simple card description to demonstrate card usage.
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <PrimaryButton>Action 1</PrimaryButton>
                                        <SecondaryButton>Action 2</SecondaryButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Card sx={{ maxWidth: 345 }}>
                                    <CardContent>
                                        <Typography variant="h5" component="div">
                                            Another Card
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Cards can have multiple sections and actions as well.
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <DangerButton>Delete</DangerButton>
                                        <LinkButton to="/test">Learn More</LinkButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        </Grid>

                        <Divider sx={{ marginY: 4 }} />

                        {/* Pagination Section */}
                        <Typography variant="h5" gutterBottom>
                            Pagination
                        </Typography>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </Box>
                </Box>
            </Box>
            </Layout>
    );
};

export default UITestingPage;
