import React from "react";
import HeroSlider from "../components/HeroSlider";
import Notices from "../components/Notices";
import Members from "../components/Members";
import ImportantLinks from "../components/ImportantLinks";
import HeroSlider from "../components/HeroSlider";

import { AppSettings, Member, ImportantLink, BlogPost } from "../types";

interface HomeProps {
  settings: AppSettings;
  members: Member[];
  links: ImportantLink[];
  notices: BlogPost[];
}

/**
 * =====================================================
 * HOME PAGE – FULLY ADMIN CONTROLLED
 * Hero Slider + Notices + Members + Links
 * Firebase / Offline Safe
 * =====================================================
 */

export const Home: React.FC<HomeProps> = ({
  settings,
  members,
  links,
  notices,
}) => {
  return (
  <div className="space-y-10">

    {/* ================= HERO SLIDER ================= */}
    <HeroSlider images={settings.sliderImages} />

      {/* ================= NOTICES ================= */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-bold text-blue-900 mb-3">Latest Notices</h2>
        <Notices notices={notices.slice(0, 5)} />
      </section>

      {/* ================= MEMBERS ================= */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Panchayat Members</h2>
          <Members members={members} />
        </div>
      </section>

      {/* ================= IMPORTANT LINKS ================= */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <h2 className="text-xl font-bold text-blue-900 mb-3">Important Links</h2>
        <ImportantLinks links={links} />
      </section>

    </div>
  );
};

export default Home;
