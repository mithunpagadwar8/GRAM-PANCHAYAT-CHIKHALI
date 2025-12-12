import React, { useState, useRef } from "react";
import { storage, isConfigured } from "../firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

interface FileUploadProps {
  label: string;
  accept?: string;
  onFileSelect: (fileUrl: string, fileType: string) => void;
  previewType?: "image" | "video" | "any";
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = "image/*,video/*",
  onFileSelect,
  previewType = "any",
}) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔥 FAST Image Compression (70% smaller)
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        canvas.width = img.width * 0.5;
        canvas.height = img.height * 0.5;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => resolve(blob!),
          "image/jpeg",
          0.7
        );
      };

      reader.readAsDataURL(file);
    });
  };

  // 🔥 FAST Video Compression (50% resolution reduce)
  const compressVideo = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const reader = new FileReader();

      reader.onload = (e) => {
        video.src = e.target?.result as string;
      };

      video.onloadeddata = () => {
        const w = video.videoWidth * 0.5;
        const h = video.videoHeight * 0.5;

        canvas.width = w;
        canvas.height = h;

        ctx.drawImage(video, 0, 0, w, h);

        canvas.toBlob(
          (blob) => {
            resolve(new File([blob!], file.name, { type: "video/mp4" }));
          },
          "video/mp4",
          0.7
        );
      };

      reader.readAsDataURL(file);
    });
  };

  // 🔥 Main Upload Function
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isConfigured()) {
      alert("Cloud upload is OFF. Configure firebaseConfig.ts first.");
      return;
    }

    setUploading(true);
    setProgress(0);

    let fileToUpload: Blob | File = file;

    // Image compression
    if (file.type.startsWith("image/")) {
      fileToUpload = await compressImage(file);
    }
    // Video compression
    else if (file.type.startsWith("video/")) {
      fileToUpload = await compressVideo(file);
    }

    const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(p);
      },
      (error) => {
        console.error("Upload failed", error);
        alert("Upload Failed: " + error.message);
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setPreview(downloadURL);
          setUploading(false);
          onFileSelect(downloadURL, file.type);
        });
      }
    );
  };

  return (
    <div className="mb-4">
      <label className="font-bold text-sm mb-1 block">{label}</label>

      <div
        className={`border-2 border-dashed p-6 rounded-lg text-center cursor-pointer ${
          uploading ? "bg-blue-50" : "hover:bg-gray-50"
        }`}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />

        {!preview && (
          <div className="text-gray-500">
            <i className="fas fa-cloud-upload-alt text-3xl mb-2"></i>
            <p>Click to upload to Cloud</p>
            <span className="text-xs text-gray-400">(CDN Powered Storage)</span>
          </div>
        )}

        {preview && previewType === "image" && (
          <img src={preview} className="max-h-48 mx-auto rounded shadow" />
        )}

        {uploading && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs mt-1 font-bold">
              Uploading... {Math.round(progress)}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
