import axios from "axios";
import API_BASE_URL from "./api";

// Ensure all requests send and receive cookies
axios.defaults.withCredentials = true;

// Prevent infinite loops if the refresh endpoint itself fails
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If the failed request was already a refresh attempt, then the session is dead
      if (originalRequest.url.includes("/api/auth/refresh")) {
        // Clear local storage and redirect to login
        localStorage.removeItem("user");
        localStorage.removeItem("userEmail");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Wait for the ongoing refresh to complete
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, { withCredentials: true });
        
        isRefreshing = false;
        processQueue(null, "success");
        
        // Retry original request
        return axios(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        
        // Log out user fully
        localStorage.removeItem("user");
        localStorage.removeItem("userEmail");
        window.location.href = "/login";
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
