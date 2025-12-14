import React from 'react';

interface FileUploadProps {
  label: string;
  accept: string;
  onFileSelect: (url: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, accept, onFileSelect }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mock file upload - create object URL
      const url = URL.createObjectURL(file);
      onFileSelect(url);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer">
      <label className="cursor-pointer block">
        <i className="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-2"></i>
        <div className="text-sm font-bold text-gray-600">{label}</div>
        <div className="text-xs text-gray-400 mt-1">Allowed: {accept}</div>
        <input type="file" accept={accept} onChange={handleFileChange} className="hidden" />
      </label>
    </div>
  );
};
