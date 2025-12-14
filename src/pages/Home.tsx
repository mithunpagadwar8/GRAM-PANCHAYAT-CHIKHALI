import React from "react";
import HeroSlider from "../components/HeroSlider";
import { AppSettings, Member, ImportantLink, BlogPost } from "../types";

/**
 * =====================================================
 * HOME PAGE – PUBLIC WEBSITE
 * Hero Slider | Notices | Members | Important Links
 * =====================================================
 */

interface HomeProps {
  settings: AppSettings;
  members: Member[];
  links: ImportantLink[];
  notices: BlogPost[];
}

const Home: React.FC<HomeProps> = ({
  settings,
  members,
  links,
  notices,
}) => {
  return (
    <div className="space-y-12">

      {/* ================= HERO SLIDER ================= */}
      <HeroSlider images={settings.sliderImages} />

      {/* ================= NOTICE / NEWS ================= */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4">सूचना / बातम्या</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {notices.slice(0, 6).map((n) => (
            <div
              key={n.id}
              className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition"
            >
              <h3 className="font-semibold text-lg">{n.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {n.publishDate} • {n.author}
              </p>
              <p className="mt-2 text-gray-700 line-clamp-3">
                {n.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= PANCHAYAT MEMBERS ================= */}
      <section className="bg-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">ग्रामपंचायत सदस्य</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {members.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-xl shadow p-4 text-center"
              >
                <img
                  src={m.photoUrl}
                  alt={m.name}
                  className="w-24 h-24 mx-auto rounded-full object-cover"
                />
                <h3 className="mt-3 font-semibold">{m.name}</h3>
                <p className="text-sm text-gray-600">{m.position}</p>
                <p className="text-xs text-gray-500">{m.mobile}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= IMPORTANT LINKS ================= */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <h2 className="text-2xl font-bold mb-4">महत्वाचे दुवे</h2>

        <div className="grid md:grid-cols-3 gap-4">
          {links.map((l) => (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="block border rounded-lg p-4 bg-white hover:bg-gray-50 shadow"
            >
              <h3 className="font-semibold">{l.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {l.description}
              </p>
            </a>
          ))}
        </div>
      </section>

    </div>
  );
};

export default Home;
