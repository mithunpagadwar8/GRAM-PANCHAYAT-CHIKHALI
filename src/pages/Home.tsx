import React, { useEffect, useState } from "react";
import { AppSettings, Member, ImportantLink, BlogPost } from "../types";

interface HomeProps {
  settings: AppSettings;
  members: Member[];
  links: ImportantLink[];
  notices: BlogPost[];
}

const Home: React.FC<HomeProps> = ({ settings, members, links, notices }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  /* ================= HERO SLIDER ================= */
  useEffect(() => {
    if (!settings.sliderImages.length) return;

    const timer = setInterval(() => {
      setCurrentSlide((p) => (p + 1) % settings.sliderImages.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [settings.sliderImages]);

  const committee = members.filter((m) => m.type === "committee");
  const staff = members.filter((m) => m.type === "staff");

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ================= HERO SLIDER ================= */}
      <div className="relative h-[300px] md:h-[500px] overflow-hidden bg-black">
        {settings.sliderImages.map((img, i) => (
          <img
            key={i}
            src={img}
            alt="slide"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              i === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-12">

          {/* COMMITTEE */}
          {committee.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">
                Gram Panchayat Committee
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {committee.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white p-4 rounded shadow text-center"
                  >
                    <img
                      src={m.photoUrl}
                      className="w-24 h-24 rounded-full mx-auto mb-2 object-cover"
                    />
                    <h4 className="font-bold">{m.name}</h4>
                    <p className="text-sm text-gray-600">{m.position}</p>
                    <p className="text-xs text-gray-500">{m.mobile}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* STAFF */}
          {staff.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Staff</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {staff.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white p-4 rounded shadow text-center"
                  >
                    <img
                      src={m.photoUrl}
                      className="w-24 h-24 rounded-full mx-auto mb-2 object-cover"
                    />
                    <h4 className="font-bold">{m.name}</h4>
                    <p className="text-sm text-gray-600">{m.position}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="space-y-8">

          {/* NOTICES */}
          <div className="bg-white rounded shadow p-4">
            <h3 className="font-bold mb-3">Latest Notices</h3>
            {notices.length ? (
              <ul className="space-y-2">
                {notices.map((n) => (
                  <li key={n.id} className="border-b pb-2">
                    <p className="font-semibold text-sm">{n.title}</p>
                    <p className="text-xs text-gray-600">
                      {n.publishDate}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No notices</p>
            )}
          </div>

          {/* IMPORTANT LINKS */}
          <div className="bg-white rounded shadow p-4">
            <h3 className="font-bold mb-3">Important Links</h3>
            <ul className="space-y-2">
              {links.map((l) => (
                <li key={l.id}>
                  <a
                    href={l.url}
                    target="_blank"
                    className="text-blue-600 text-sm hover:underline"
                  >
                    {l.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Home;
