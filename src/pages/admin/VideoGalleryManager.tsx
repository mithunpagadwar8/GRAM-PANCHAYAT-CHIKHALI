import React, { useState } from 'react';

/**
 * =====================================================
 * VIDEO GALLERY MANAGER – YouTube-style video uploads
 * =====================================================
 */

const VideoGalleryManager: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videos, setVideos] = useState<string[]>([]);

  // ================= ADD VIDEO =================
  const addVideo = () => {
    if (videoUrl) {
      setVideos((prev) => [...prev, videoUrl]);
      setVideoUrl("");
    } else {
      alert("Please enter a valid YouTube URL");
    }
  };

  // ================= DELETE VIDEO =================
  const deleteVideo = (url: string) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      setVideos((prev) => prev.filter((video) => video !== url));
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Video Gallery Manager</h1>

      {/* Add Video */}
      <div className="bg-white p-4 rounded shadow space-y-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="Paste YouTube Video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
        <button
          onClick={addVideo}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Add Video
        </button>
      </div>

      {/* Video List */}
      <div className="space-y-4">
        {videos.map((url, index) => (
          <div key={index} className="bg-white p-4 rounded shadow">
            <iframe
              src={`https://www.youtube.com/embed/${url.split("v=")[1]}`}
              className="w-full h-48 rounded"
              title={`Video ${index}`}
            />
            <button
              onClick={() => deleteVideo(url)}
              className="text-red-600 text-sm mt-2"
            >
              Delete Video
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoGalleryManager;
