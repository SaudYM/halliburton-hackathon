import axios from "axios";

const api = axios.create({
  baseURL: "https://halliburton-hackathon.onrender.com", // Adjust base URL as per your backend
});

export default api;
