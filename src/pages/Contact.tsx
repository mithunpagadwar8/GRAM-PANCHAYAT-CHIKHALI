import React from "react";
import { AppSettings } from "../types";

interface ContactProps {
  settings: AppSettings;
}

const Contact: React.FC<ContactProps> = ({ settings }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gov-primary text-white py-12 text-center">
        <h1 className="text-4xl font-bold mb-2">संपर्क साधा (Contact Us)</h1>
        <p className="opacity-90">आम्ही आपल्या सेवेसाठी सदैव तत्पर आहोत</p>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-xl border-t-4 border-gov-secondary">
            <h2 className="text-2xl font-bold mb-6">Gram Panchayat Office</h2>

            <p><strong>Address:</strong> {settings.address}</p>
            <p><strong>Taluka:</strong> {settings.taluka}</p>
            <p><strong>District:</strong> {settings.district}</p>
            <p><strong>Phone:</strong> {settings.contactNumber}</p>
            <p>
              <strong>Email:</strong>{" "}
              <a href={`mailto:${settings.email}`} className="text-blue-600 underline">
                {settings.email}
              </a>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <iframe
              src={settings.mapEmbedUrl}
              className="w-full h-[450px]"
              loading="lazy"
              title="Gram Panchayat Location"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
