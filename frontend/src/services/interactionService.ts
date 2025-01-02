import { apiCall } from "./apiUtil";

export const getLikesCount = async (threadId: string): Promise<number> => {
    const data = await apiCall<{ likes_count: number }>({
        url: `/threads/${threadId}/likes`,
        method: "GET",
    });
    return data.likes_count || 0;
};

export const getDislikesCount = async (threadId: string): Promise<number> => {
    const data = await apiCall<{ dislikes_count: number }>({
        url: `/threads/${threadId}/dislikes`,
        method: "GET",
    });
    return data.dislikes_count || 0;
};

export const getLikeState = async (threadId: string, username: string): Promise<any> => {
    return apiCall({
        url: `/threads/${threadId}/likestate`,
        method: "GET",
        params: { username },
    });
};

export const getSaveState = async (threadId: string, username: string): Promise<any> => {
    return apiCall({
        url: `/threads/${threadId}/savestate`,
        method: "GET",
        params: { username },
    });
};

export const likeThread = async (threadId: string, username: string): Promise<void> => {
    await apiCall({
        url: `/threads/${threadId}/like`,
        method: "POST",
        params: { username },
    });
};

export const dislikeThread = async (threadId: string, username: string): Promise<void> => {
    await apiCall({
        url: `/threads/${threadId}/dislike`,
        method: "POST",
        params: { username },
    });
};

export const saveThread = async (threadId: string, username: string): Promise<void> => {
    await apiCall({
        url: `/threads/${threadId}/save`,
        method: "POST",
        params: { username },
    });
};

export const removeLike = async (threadId: string, username: string): Promise<void> => {
    await apiCall({
        url: `/threads/${threadId}/like`,
        method: "DELETE",
        params: { username },
    });
};

export const removeDislike = async (threadId: string, username: string): Promise<void> => {
    await apiCall({
        url: `/threads/${threadId}/dislike`,
        method: "DELETE",
        params: { username },
    });
};

export const unsaveThread = async (threadId: string, username: string): Promise<void> => {
    await apiCall({
        url: `/threads/${threadId}/save`,
        method: "DELETE",
        params: { username },
    });
};
