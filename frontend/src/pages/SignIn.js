import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/auth/signin", formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);

      alert("Sign in successful!");

      if (response.data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (error) {
      alert(error.response?.data?.error || "Failed to sign in.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-gray-900 font-serif min-h-screen flex items-center justify-center">
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-4xl font-bold mb-6 text-center text-yellow-400">
          Sign In
        </h1>
        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-yellow-400">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="mt-1 p-2 w-full border border-yellow-500 rounded-md bg-gray-700 text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-yellow-400">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 p-2 w-full border border-yellow-500 rounded-md bg-gray-700 text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-500 text-gray-900 py-2 rounded-md hover:bg-yellow-600 transition-colors duration-300 font-semibold"
          >
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-yellow-400">
            Don't have an account?{" "}
            <span
              className="text-yellow-500 cursor-pointer hover:underline"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
