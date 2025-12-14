import React from "react";
import { BlogPost } from "../types";

interface SchemesProps {
  schemes: BlogPost[];
}

export const Schemes: React.FC<SchemesProps> = ({ schemes }) => {
  const schemeList = schemes.filter(s => s.category === "Scheme");

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gov-primary mb-8 border-b pb-3">
          🏛️ Government Schemes
        </h1>

        {schemeList.length === 0 && (
          <p className="text-center text-gray-500">
            No schemes published yet.
          </p>
        )}

        <div className="space-y-6">
          {schemeList.map(scheme => (
            <div
              key={scheme.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition border p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {scheme.title}
                  </h3>
                  <p className="text-gray-600 text-sm whitespace-pre-line">
                    {scheme.content}
                  </p>
                </div>

                <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0">
                  {scheme.mediaUrl && (
                    <a
                      href={scheme.mediaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center bg-gov-primary text-white px-4 py-2 rounded hover:bg-blue-800 transition text-sm"
                    >
                      📄 View Scheme
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-500 flex justify-between">
                <span>📅 Published: {scheme.publishDate}</span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
