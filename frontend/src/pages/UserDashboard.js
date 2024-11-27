import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    image: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get("/posts/my", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
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
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setPosts(posts.filter((post) => post._id !== postId));
      alert("Post deleted successfully!");
    } catch (error) {
      console.error(
        "Error deleting post:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.error || "Failed to delete post.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await api.post("/uploads", formData);
      setNewPost({ ...newPost, image: response.data.url });
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleSubmitPost = async () => {
    if (!newPost.title || !newPost.content || !newPost.image) {
      alert("All fields are required!");
      return;
    }

    try {
      if (editingPost) {
        const response = await api.put(
          `/posts/${editingPost._id}`,
          {
            title: newPost.title,
            content: newPost.content,
            thumbnail: newPost.image,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPosts(
          posts.map((post) =>
            post._id === editingPost._id ? response.data.post : post
          )
        );
        alert("Post updated successfully!");
      } else {
        const response = await api.post(
          "/posts",
          {
            title: newPost.title,
            content: newPost.content,
            thumbnail: newPost.image,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setPosts([...posts, response.data.post]);
        alert("Post created successfully!");
      }

      setShowModal(false);
      setNewPost({ title: "", content: "", image: null });
      setEditingPost(null);
    } catch (error) {
      console.error("Error submitting post:", error);
      alert("Failed to submit post.");
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      content: post.content,
      image: post.thumbnail,
    });
    setShowModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-yellow-400 text-xl animate-pulse">Loading...</div>
      </div>
    );

  return (
    <div className="bg-gray-900 font-serif min-h-screen">
      {/* Header Section */}
      <header className="bg-gray-800 text-yellow-400 p-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold transform hover:scale-105 transition-transform duration-300">
            User Dashboard
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
        {/* Create Post Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              setEditingPost(null);
              setNewPost({ title: "", content: "", image: null });
              setShowModal(true);
            }}
            className="px-6 py-2 bg-green-500 text-gray-900 font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors duration-300"
          >
            Create New Post
          </button>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post._id}
              className={`bg-gray-800 shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ${
                post.restricted ? "border-4 border-red-500" : ""
              }`}
            >
              {post.thumbnail && (
                <img
                  src={post.thumbnail}
                  alt="Post Thumbnail"
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-yellow-400 mb-2">
                  {post.title}
                </h2>
                {post.restricted && (
                  <div className="mb-2 text-red-500 font-semibold">
                    ⚠️ This post contains restricted content.
                  </div>
                )}
                <p className="text-gray-300 mb-4">
                  {post.content.substring(0, 100)}...
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="px-4 py-2 bg-yellow-500 text-gray-900 rounded hover:bg-yellow-600 transition-colors duration-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/post/${post._id}`)}
                    className="px-4 py-2 bg-blue-500 text-gray-900 rounded hover:bg-blue-600 transition-colors duration-300"
                  >
                    Read More
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="px-4 py-2 bg-red-500 text-gray-900 rounded hover:bg-red-600 transition-colors duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal for Creating/Editing Post */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md transform hover:rotate-1 transition-transform duration-300">
            <h2 className="text-2xl font-bold mb-6 text-pink-400">
              {editingPost ? "Edit Post" : "Create New Post"}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-pink-400">
                Title
              </label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({ ...newPost, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-pink-500 rounded bg-gray-700 text-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-pink-400">
                Content
              </label>
              <textarea
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({ ...newPost, content: e.target.value })
                }
                className="w-full px-3 py-2 border border-pink-500 rounded bg-gray-700 text-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-pink-400">
                Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-300"
              />
              {newPost.image && (
                <img
                  src={newPost.image}
                  alt="Uploaded"
                  className="mt-4 w-20 h-20 object-cover"
                />
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleSubmitPost}
                className="px-4 py-2 bg-green-500 text-gray-900 rounded mr-2 hover:bg-green-600 transition-colors duration-300 font-semibold"
              >
                {editingPost ? "Update" : "Submit"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-red-500 text-gray-900 rounded hover:bg-red-600 transition-colors duration-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer className="bg-gray-800 text-yellow-400 p-6 mt-12">
        <div className="container mx-auto text-center">
          <p className="animate-pulse">
            Maybe the words you write could{" "}
            <span className="text-pink-400">Change a Life</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;
