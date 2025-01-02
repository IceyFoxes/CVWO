import { apiCall } from "./apiUtil";

export const getThreads = async (params?: {
    query?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
    category?: string;
    tag?: string;
}): Promise<any> => {
    return apiCall({
        url: "/threads",
        method: "GET",
        params,
    });
};

export const getThreadById = async (
    id: string,
    params?: { query?: string; sortBy?: string }
): Promise<any> => {
    return apiCall({
        url: `/threads/${id}`,
        method: "GET",
        params,
    });
};

export const getThreadAuthorization = async (
    id: string,
    username: string | null
): Promise<any> => {
    return apiCall({
        url: `/threads/${id}/authorize`,
        method: "GET",
        params: { username },
    });
};

export const fetchCategories = async (): Promise<any> => {
    return apiCall({
        url: "/threads/categories",
        method: "GET",
    });
};

export const fetchTags = async (): Promise<string[]> => {
    const data = await apiCall<{ tags: { id: number; name: string }[] }>({
        url: "/threads/tags",
        method: "GET",
    });
    return data.tags.map((tag) => tag.name);
};

export const updateThread = async (
    id: string,
    username: string,
    title?: string,
    content?: string
): Promise<any> => {
    return apiCall({
        url: `/threads/${id}`,
        method: "PUT",
        data: { title: title ?? undefined, content },
        params: { username },
    });
};

export const createThread = async (
    username: string | null,
    title: string,
    content: string,
    category: string,
    tag: string
): Promise<any> => {
    return apiCall({
        url: "/threads",
        method: "POST",
        data: { username, title, content, category, tag },
    });
};

export const postComment = async (
    id: string,
    username: string,
    content: string
): Promise<void> => {
    await apiCall({
        url: `/threads/${id}/comment`,
        method: "POST",
        data: { content },
        params: { username },
    });
};

export const deleteThread = async (
    id: string,
    username: string
): Promise<void> => {
    await apiCall({
        url: `/threads/${id}`,
        method: "DELETE",
        params: { username },
    });
};
