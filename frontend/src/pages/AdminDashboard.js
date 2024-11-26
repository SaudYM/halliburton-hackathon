import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get("/posts", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPosts(posts.filter((post) => post._id !== postId));
      alert("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post.");
    }
  };

  const toggleFlag = async (postId, flagStatus) => {
    try {
      await api.put(
        `/posts/${postId}`,
        { restricted: !flagStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setPosts(
        posts.map((post) =>
          post._id === postId ? { ...post, restricted: !flagStatus } : post
        )
      );
      alert(
        flagStatus
          ? "Post unflagged successfully!"
          : "Post flagged successfully!"
      );
    } catch (error) {
      console.error("Error toggling flag:", error);
      alert("Failed to update post flag.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const exportPosts = async () => {
    try {
      const response = await api.get("/posts/export?all=true", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "all_posts.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error exporting posts:", error);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-green-400 text-xl animate-pulse">Loading...</div>
      </div>
    );

  return (
    <div className="bg-gray-900 font-serif min-h-screen">
      {/* Header Section */}
      <header className="bg-gray-800 text-green-400 p-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold transform hover:scale-105 transition-transform duration-300">
            Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 transition-colors duration-300"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto my-8 p-6">
        {/* Export Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={exportPosts}
            className="px-6 py-2 bg-blue-500 text-gray-900 font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300"
          >
            Export All Posts
          </button>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-gray-800 shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
            >
              {post.thumbnail && (
                <img
                  src={post.thumbnail}
                  alt="Post Thumbnail"
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-green-400 mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-300 mb-4">
                  {post.content.substring(0, 100)}...
                </p>
                <p className="mb-4">
                  <strong>Flagged:</strong>{" "}
                  <span
                    className={
                      post.restricted ? "text-red-500" : "text-green-500"
                    }
                  >
                    {post.restricted ? "Yes" : "No"}
                  </span>
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => toggleFlag(post._id, post.restricted)}
                    className={`px-4 py-2 rounded text-gray-900 font-semibold transition-colors duration-300 ${
                      post.restricted
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {post.restricted ? "Unflag" : "Flag"}
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="px-4 py-2 bg-red-500 text-gray-900 rounded hover:bg-red-600 transition-colors duration-300 font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-green-400 p-6 mt-12">
        <div className="container mx-auto text-center">
          <p className="animate-pulse">
            With Great Power Comes Great Res— You Know the Rest
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
