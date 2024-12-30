import axiosInstance from "../axiosConfig";

export const registerUser = async (username: string, password: string) => {
    const response = await axiosInstance.post('/users', { username, password });
    return response.data;
};

export const loginUser = async (username: string, password: string) => {
    const response = await axiosInstance.post('/users/login', { username, password });
    return response.data;
};

export const getAuthorization = async (username: string | null) => {
    const response = await axiosInstance.get(`/users/${username}/authorize`)
    return response.data;
};

export const getUserScores = async (username: string | null) => {
    const response = await axiosInstance.get(`/users/${username}/scores`)
    return response.data;
};

export const getUserInfo = async (username: string) => {
    const response = await axiosInstance.get(`/users/${username}/info`)
    return response.data;
};

export const getUserMetrics = async (username: string) => {
    const response = await axiosInstance.get(`/users/${username}/metrics`);
    return response.data;
};

export const getUserActivity = async (username: string) => {
    const response = await axiosInstance.get(`/users/${username}/activity`);
    return response.data;
};

export const getUserSavedThreads = async (username: string) => {
    const response = await axiosInstance.get(`/users/${username}/saved`);
    return response.data;
};

export const updatePassword = async ( username: string, currentPassword: string, newPassword: string) => {
    const response = await axiosInstance.post(`/users/${username}/password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
};

export const updateUserBio = async (username: string, bio: string) => {
    const response = await axiosInstance.put(`/users/${username}/bio`, { bio });
    return response.data;
};

export const promoteUser = async (username: string) => {
    const response = await axiosInstance.put(`/users/${username}/promote`);
    return response.data;
};

export const demoteUser = async (username: string) => {
    const response = await axiosInstance.put(`/users/${username}/demote`);
    return response.data;
};