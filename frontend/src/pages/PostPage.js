import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const PostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setPost(response.data);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleExport = async () => {
    try {
      const response = await api.get(`/posts/export`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        params: {
          id: id,
          all: false,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `post_${id}.pdf`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting post:", error);
      alert("Failed to export post.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-yellow-400 text-xl animate-pulse">Loading...</div>
      </div>
    );

  if (!post)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-red-500 text-xl">Post not found.</div>
      </div>
    );

  return (
    <div className="bg-gray-900 font-serif leading-relaxed tracking-normal min-h-screen">
      {/* Header */}
      <header className="bg-gray-800 text-yellow-400 p-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold transform hover:scale-105 transition-transform duration-300">
            Duxas Blog
          </h1>
          <nav className="flex space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="text-yellow-300 hover:text-yellow-500 transition-colors duration-300"
            >
              Dashboard
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto my-8 p-6 bg-gray-800 shadow-lg rounded-lg">
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-yellow-400 mb-2">
            {post.title}
          </h2>
          <p className="text-sm text-gray-400">
            Published on: {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
        {post.thumbnail && (
          <img
            src={post.thumbnail}
            alt="Post Thumbnail"
            className="w-full h-full object-cover rounded mb-6 transform hover:scale-105 transition-transform duration-300"
          />
        )}
        <article className="prose prose-lg max-w-full">
          {post.content.split("\n").map((paragraph, index) => (
            <p key={index} className="mb-8 text-white">
              {paragraph}
            </p>
          ))}
        </article>

        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-500 text-gray-900 rounded shadow hover:bg-green-600 transition-colors duration-300 font-semibold"
          >
            Export to PDF
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-yellow-400 p-6 mt-12">
        <div className="container mx-auto text-center">
          <p className="animate-pulse">
            Maybe the words you write could{" "}
            <span className="text-pink-400">Change a life</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PostPage;
