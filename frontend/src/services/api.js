import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9000/api", // Adjust base URL as per your backend
});

export default api;
