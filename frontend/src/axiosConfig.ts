import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8080",
});

instance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) =>{
    console.error("Interceptor error:", error);
    Promise.reject(new Error(error));
  }
);

export default instance;
