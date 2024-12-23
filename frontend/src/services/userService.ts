import axiosInstance from "../axiosConfig";

export const registerUser = async (username: string) => {
    const response = await axiosInstance.post('/users', { username });
    return response.data;
};

export const loginUser = async (username: string) => {
    const response = await axiosInstance.post('/users/login', { username });
    return response.data;
};
