import axiosInstance from "../axiosConfig";

export const getThreads = async (query: string, sortBy: string, page: number, limit: number) => {
    const response = await axiosInstance.get('/threads', {
        params: { query, sortBy, page, limit },
    });
    return response.data;
};

export const getThreadById = async (id: string, params?: { query?: string; sortBy?: string }) => {
    const response = await axiosInstance.get(`/threads/${id}`, { params });
    return response.data;
};

export const getThreadAuthorization = async (id : string, username: string) => {
    const response = await axiosInstance.get(`/threads/${id}/authorize`, {
        params: { username },
    });
    return response.data;
};

export const editThread = async (id: string, username: string, title?: string, content?: string) => {
    const response = await axiosInstance.put(`/threads/${id}`,
        {title: title ?? undefined, content},
        {params: { username } }
    );
    return response.data
};

export const createThread = async (username: string, title: string, content: string): Promise<void> => {
    await axiosInstance.post(`/threads?username=${username}`, { title, content });
};

export const postComment = async (threadId: number, username: string, content: string): Promise<void> => {
    await axiosInstance.post(`/threads/${threadId}/comment`, { content }, { params: { username } });
};

export const deleteThread = async (id: string, username: string) => {
    await axiosInstance.delete(`/threads/${id}`, {
        params: { username },
    });
};


