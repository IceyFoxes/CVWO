import axiosInstance from "../axiosConfig";

export const getLikesCount = async (threadId: number) => {
    const response = await axiosInstance.get(`/threads/${threadId}/likes`);
    return response.data.likes_count || 0;
};

export const getDislikesCount = async (threadId: number) => {
    const response = await axiosInstance.get(`/threads/${threadId}/dislikes`);
    return response.data.dislikes_count || 0;
};

export const getInteractionState = async (threadId: number, username: string) => {
    const response = await axiosInstance.get(`/threads/${threadId}/interaction`, {
        params: { username },
    });
    return response.data;
};

export const likeThread = async (threadId: number, username: string) => {
    await axiosInstance.post(`/threads/${threadId}/like`, null, {
        params: { username },
    });
};

export const dislikeThread = async (threadId: number, username: string) => {
    await axiosInstance.post(`/threads/${threadId}/dislike`, null, {
        params: { username },
    });
};

export const removeLike = async (threadId: number, username: string) => {
    await axiosInstance.delete(`/threads/${threadId}/like`, {
        params: { username },
    });
};

export const removeDislike = async (threadId: number, username: string) => {
    await axiosInstance.delete(`/threads/${threadId}/dislike`, {
        params: { username },
    });
};