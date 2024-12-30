import axiosInstance from "../axiosConfig";

export const getLikesCount = async (threadId: string) => {
    const response = await axiosInstance.get(`/threads/${threadId}/likes`);
    return response.data.likes_count || 0;
};

export const getDislikesCount = async (threadId: string) => {
    const response = await axiosInstance.get(`/threads/${threadId}/dislikes`);
    return response.data.dislikes_count || 0;
};

export const getLikeState = async (threadId: string, username: string) => {
    const response = await axiosInstance.get(`/threads/${threadId}/likestate`, {
        params: { username },
    });
    return response.data;
};

export const getSaveState = async (threadId: string, username: string) => {
    const response = await axiosInstance.get(`/threads/${threadId}/savestate`, {
        params: { username },
    });
    return response.data;
};

export const likeThread = async (threadId: string, username: string) => {
    await axiosInstance.post(`/threads/${threadId}/like`, null, {
        params: { username },
    });
};

export const dislikeThread = async (threadId: string, username: string) => {
    await axiosInstance.post(`/threads/${threadId}/dislike`, null, {
        params: { username },
    });
};

export const saveThread = async (threadId: string, username: string) => {
    await axiosInstance.post(`/threads/${threadId}/save`, null, {
        params: { username },
    });
};

export const removeLike = async (threadId: string, username: string) => {
    await axiosInstance.delete(`/threads/${threadId}/like`, {
        params: { username },
    });
};

export const removeDislike = async (threadId: string, username: string) => {
    await axiosInstance.delete(`/threads/${threadId}/dislike`, {
        params: { username },
    });
};

export const unsaveThread = async (threadId: string, username: string) => {
    await axiosInstance.delete(`/threads/${threadId}/save`, {
        params: { username },
    });
};
