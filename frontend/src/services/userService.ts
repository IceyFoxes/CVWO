import { apiCall } from "./apiUtil";

export const registerUser = async (username: string, password: string): Promise<any> => {
    return apiCall({
        url: "/users",
        method: "POST",
        data: { username, password },
    });
};

export const loginUser = async (username: string, password: string): Promise<any> => {
    return apiCall({
        url: "/users/login",
        method: "POST",
        data: { username, password },
    });
};

export const getAuthorization = async (username: string | null): Promise<any> => {
    return apiCall({
        url: `/users/${username}/authorize`,
        method: "GET",
    });
};

export const getUserScores = async (username: string | null): Promise<any> => {
    return apiCall({
        url: `/users/${username}/scores`,
        method: "GET",
    });
};

export const getUserInfo = async (username: string): Promise<any> => {
    return apiCall({
        url: `/users/${username}/info`,
        method: "GET",
    });
};

export const getUserMetrics = async (username: string): Promise<any> => {
    return apiCall({
        url: `/users/${username}/metrics`,
        method: "GET",
    });
};

export const getUserActivity = async (username: string): Promise<any> => {
    return apiCall({
        url: `/users/${username}/activity`,
        method: "GET",
    });
};

export const getUserSavedThreads = async (username: string): Promise<any> => {
    return apiCall({
        url: `/users/${username}/saved`,
        method: "GET",
    });
};

export const updatePassword = async (
    username: string,
    currentPassword: string,
    newPassword: string
): Promise<any> => {
    return apiCall({
        url: `/users/${username}/password`,
        method: "POST",
        data: { currentPassword, newPassword },
    });
};

export const updateUserBio = async (username: string, bio: string): Promise<any> => {
    return apiCall({
        url: `/users/${username}/bio`,
        method: "PUT",
        data: { bio },
    });
};

export const promoteUser = async (username: string): Promise<any> => {
    return apiCall({
        url: `/users/${username}/promote`,
        method: "PUT",
    });
};

export const demoteUser = async (username: string): Promise<any> => {
    return apiCall({
        url: `/users/${username}/demote`,
        method: "PUT",
    });
};
