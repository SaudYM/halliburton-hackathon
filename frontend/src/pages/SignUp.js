import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user", // Default role is 'user'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignUp = async () => {
    try {
      const response = await api.post("/auth/signup", formData);
      if (response.data.replaceAdmin) {
        const confirmReplace = window.confirm(
          "An administrator already exists. Do you want to replace them?"
        );
        if (confirmReplace) {
          await api.post("/auth/replace-admin", formData);
          alert("Administrator replaced successfully!");
          navigate("/signin");
        } else {
          alert("Sign-up canceled.");
          return;
        }
      } else {
        alert("Sign-up successful!");
        navigate("/signin");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Sign-up failed.");
    }
  };

  return (
    <div className="bg-gray-900 font-serif min-h-screen flex items-center justify-center">
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full transform hover:rotate-1 transition-transform duration-300">
        <h1 className="text-4xl font-bold mb-6 text-center text-pink-400">
          Sign Up
        </h1>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-pink-400">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-pink-500 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-700 text-pink-300"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-pink-400">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-pink-500 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-700 text-pink-300"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-pink-400">
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-pink-500 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-700 text-pink-300"
          >
            <option value="user">Normal User</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
        <button
          onClick={handleSignUp}
          className="w-full px-4 py-2 bg-pink-500 text-gray-900 rounded hover:bg-pink-600 transition-colors duration-300 font-semibold"
        >
          Sign Up
        </button>
        <div className="mt-4 text-center">
          <p className="text-pink-400">
            Have an account?{" "}
            <span
              className="text-pink-500 cursor-pointer hover:underline"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
