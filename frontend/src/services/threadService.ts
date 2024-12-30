import axiosInstance from "../axiosConfig";

export const getThreads = async (params?: { 
    query?: string; 
    sortBy?: string; 
    page?: number; 
    limit?: number; 
    category?: string; 
    tag?: string; 
}) => {
    const response = await axiosInstance.get(`/threads`, { params });
    return response.data;
};

export const getThreadById = async (id: string, params?: { query?: string; sortBy?: string }) => {
    const response = await axiosInstance.get(`/threads/${id}`, { params });
    return response.data;
};

export const getThreadAuthorization = async (id : string, username: string | null) => {
    const response = await axiosInstance.get(`/threads/${id}/authorize`, {
        params: { username },
    });
    return response.data;
};

export const fetchCategories = async () => {
    const response = await axiosInstance.get("/threads/categories");
    return response.data;
};

export const fetchTags = async () => {
    const response = await axiosInstance.get("/threads/tags");
    return response.data.tags.map((tag: { id: number; name: string }) => tag.name);
};

export const updateThread = async (id: string, username: string, title?: string, content?: string) => {
    const response = await axiosInstance.put(`/threads/${id}`,
        {title: title ?? undefined, content},
        {params: { username } }
    );
    return response.data;
};

export const createThread = async (username: string | null, title: string, content: string, category: string, tag: string) => {
    const response = await axiosInstance.post(`/threads`, { username, title, content, category, tag, });
    return response.data;
};

export const postComment = async (id: string, username: string, content: string) => {
    await axiosInstance.post(`/threads/${id}/comment`, { content }, { params: { username } });
};

export const deleteThread = async (id: string, username: string) => {
    await axiosInstance.delete(`/threads/${id}`, {
        params: { username },
    });
};


