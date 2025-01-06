import axios, { AxiosError } from "axios";

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 30000, //backend takes 30 - 60 seconds to wake up
    headers: {
        "Content-Type": "application/json",
    },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Add Authorization
        const token = localStorage.getItem("jwtToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        console.error("Request Error:", error);
        return Promise.reject(error);
    }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Centralized error handling
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;
          let errorMessage = `Response Error: ${status}`;
          
          if (data && typeof data === "object" && "message" in data) {
              errorMessage +=  - `${data.message}`;
          } else {
              errorMessage +=  - `${error.response.statusText}`;
          }
          console.error(errorMessage);
        } else if (error.request) {
            console.error("No response received from the server:", error.request);
        } else {
            console.error("Unexpected Axios Error:", error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;