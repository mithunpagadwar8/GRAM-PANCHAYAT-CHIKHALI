import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, isConfigured } from "../../services/firebaseconfig";

/**
 * =====================================================
 * SETTINGS MANAGER – Global Website Settings CMS
 * Controls: Logo, Name, Slider Images, Contact Info
 * =====================================================
 */

export interface AppSettings {
  logoUrl: string;
  panchayatName: string;
  flagUrl: string;
  marqueeText: string;
  contactNumber: string;
  email: string;
  address: string;
  taluka: string;
  district: string;
  sliderImages: string[];
}

const DEFAULT_SETTINGS: AppSettings = {
  logoUrl: "",
  panchayatName: "Gram Panchayat",
  flagUrl: "",
  marqueeText: "Welcome to Gram Panchayat",
  contactNumber: "",
  email: "",
  address: "",
  taluka: "",
  district: "",
  sliderImages: [],
};

const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ================= LOAD SETTINGS =================
  useEffect(() => {
    if (!isConfigured()) {
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const ref = doc(db, "settings", "app");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setSettings(snap.data() as AppSettings);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // ================= SAVE SETTINGS =================
  const saveSettings = async () => {
    try {
      setSaving(true);
      const ref = doc(db, "settings", "app");
      await setDoc(ref, {
        ...settings,
        updatedAt: serverTimestamp(),
      });
      alert("✅ Settings updated successfully");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // ================= SLIDER HELPERS =================
  const addSliderImage = () => {
    setSettings({ ...settings, sliderImages: [...settings.sliderImages, ""] });
  };

  const updateSliderImage = (index: number, value: string) => {
    const updated = [...settings.sliderImages];
    updated[index] = value;
    setSettings({ ...settings, sliderImages: updated });
  };

  const removeSliderImage = (index: number) => {
    const updated = settings.sliderImages.filter((_, i) => i !== index);
    setSettings({ ...settings, sliderImages: updated });
  };

  if (loading) return <p>Loading settings...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Website Settings</h1>

      <div className="bg-white p-6 rounded shadow space-y-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="Panchayat Name"
          value={settings.panchayatName}
          onChange={(e) => setSettings({ ...settings, panchayatName: e.target.value })}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Logo URL"
          value={settings.logoUrl}
          onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Flag URL"
          value={settings.flagUrl}
          onChange={(e) => setSettings({ ...settings, flagUrl: e.target.value })}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Marquee Text"
          value={settings.marqueeText}
          onChange={(e) => setSettings({ ...settings, marqueeText: e.target.value })}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Contact Number"
          value={settings.contactNumber}
          onChange={(e) => setSettings({ ...settings, contactNumber: e.target.value })}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          value={settings.email}
          onChange={(e) => setSettings({ ...settings, email: e.target.value })}
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Address"
          value={settings.address}
          onChange={(e) => setSettings({ ...settings, address: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Taluka"
            value={settings.taluka}
            onChange={(e) => setSettings({ ...settings, taluka: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="District"
            value={settings.district}
            onChange={(e) => setSettings({ ...settings, district: e.target.value })}
          />
        </div>

        {/* SLIDER IMAGES */}
        <div className="space-y-2">
          <h3 className="font-bold">Hero Slider Images (URLs)</h3>
          {settings.sliderImages.map((img, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="flex-1 border p-2 rounded"
                value={img}
                onChange={(e) => updateSliderImage(i, e.target.value)}
              />
              <button
                onClick={() => removeSliderImage(i)}
                className="bg-red-600 text-white px-3 rounded"
              >
                ✕
              </button>
            </div>
          ))}
          <button onClick={addSliderImage} className="bg-blue-600 text-white px-4 py-1 rounded">
            + Add Image
          </button>
        </div>

        <button
          disabled={saving}
          onClick={saveSettings}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          Save Settings
        </button>
      </div>

      <div className="text-xs text-gray-500">
        Firestore Path: <b>settings/app</b>
      </div>
    </div>
  );
};

export default SettingsManager;
