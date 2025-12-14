import React, { useEffect, useState } from "react";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from '../../services/firebaseconfig';

/**
 * =====================================================
 * SETTINGS MANAGER – Website Global Settings
 * Logo / Name / Contact / Footer
 * =====================================================
 */

interface SiteSettings {
  siteName: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string;
}

const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "",
    email: "",
    phone: "",
    address: "",
    logoUrl: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "settings"), snap => {
      if (!snap.empty) setSettings(snap.docs[0].data() as SiteSettings);
    });
    return () => unsub();
  }, []);

  const saveSettings = async () => {
    let logoUrl = settings.logoUrl;

    if (logoFile) {
      const logoRef = ref(storage, `site/logo.png`);
      await uploadBytes(logoRef, logoFile);
      logoUrl = await getDownloadURL(logoRef);
    }

    await setDoc(doc(db, "settings", "site"), {
      ...settings,
      logoUrl,
    });

    alert("Settings saved");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">⚙️ Website Settings</h2>

      <div className="bg-white p-4 rounded shadow mb-6 space-y-3">
        <input
          className="border p-2 w-full"
          placeholder="Website name"
          value={settings.siteName}
          onChange={e => setSettings({ ...settings, siteName: e.target.value })}
        />
        <input
          className="border p-2 w-full"
          placeholder="Contact email"
          value={settings.email}
          onChange={e => setSettings({ ...settings, email: e.target.value })}
        />
        <input
          className="border p-2 w-full"
          placeholder="Phone number"
          value={settings.phone}
          onChange={e => setSettings({ ...settings, phone: e.target.value })}
        />
        <textarea
          className="border p-2 w-full"
          placeholder="Address"
          value={settings.address}
          onChange={e => setSettings({ ...settings, address: e.target.value })}
        />

        <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} />
        {settings.logoUrl && (
          <img src={settings.logoUrl} alt="logo" className="h-16" />
        )}

        <button onClick={saveSettings} className="bg-green-600 text-white px-4 py-2 rounded">
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsManager;
