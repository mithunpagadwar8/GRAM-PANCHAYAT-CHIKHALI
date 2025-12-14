import React from "react";
import { BlogPost } from "../types";

interface BlogProps {
  posts: BlogPost[];
}

export const Blog: React.FC<BlogProps> = ({ posts }) => {
  const blogs = posts.filter(p => p.category === "Blog");

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gov-primary mb-8 border-b pb-3">
          📰 Panchayat Blog & News
        </h1>

        {blogs.length === 0 && (
          <p className="text-gray-500 text-center">
            No blog posts published yet.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map(post => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden border"
            >
              {post.mediaUrl && (
                <img
                  src={post.mediaUrl}
                  alt={post.title}
                  className="h-48 w-full object-cover"
                />
              )}

              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  {post.title}
                </h3>

                <p className="text-sm text-gray-600 line-clamp-3">
                  {post.content}
                </p>

                <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                  <span>📅 {post.publishDate}</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {post.category}
                  </span>
                </div>

                {post.mediaUrl && (
                  <a
                    href={post.mediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-3 text-sm text-blue-600 hover:underline"
                  >
                    View Attachment →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
