import axios, { Method } from "axios";
import axiosInstance from "../axiosConfig";

interface ApiOptions {
    url: string;
    method: Method;
    data?: unknown;
    params?: Record<string, unknown>;
}

export const apiCall = async <T>({ url, method, data, params }: ApiOptions): Promise<T> => {
    try {
        const response = await axiosInstance.request<T>({
            url,
            method,
            data,
            params,
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const { response } = error;
            if (response) {
                const message =
                    response.data?.message ||
                    `Error ${response.status}: ${response.statusText}`;
                console.error(`API Error: ${message}`);
            } else {
                console.error("No response received from the server.");
            }
        } else {
            console.error("Unexpected Error:", error);
        }
        throw error;
    }
};
