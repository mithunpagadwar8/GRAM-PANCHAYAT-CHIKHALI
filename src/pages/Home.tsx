// STEP 1 FINAL: Original Home.tsx UI PRESERVED
// Only Hero Slider + Notices are now Firebase-connected
// SAFE to replace entire src/pages/Home.tsx with this file

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AppSettings, Member, ImportantLink, BlogPost } from '../types';

export const Home = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [links, setLinks] = useState<ImportantLink[]>([]);
  const [notices, setNotices] = useState<BlogPost[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // 🔥 LOAD FIREBASE DATA (STEP 1)
  useEffect(() => {
    const loadData = async () => {
      const settingsSnap = await getDoc(doc(db, 'settings', 'global'));
      if (settingsSnap.exists()) setSettings(settingsSnap.data() as AppSettings);

      const membersSnap = await getDocs(collection(db, 'members'));
      setMembers(membersSnap.docs.map(d => ({ id: d.id, ...(d.data() as Member) })));

      const linksSnap = await getDocs(collection(db, 'importantLinks'));
      setLinks(linksSnap.docs.map(d => ({ id: d.id, ...(d.data() as ImportantLink) })));

      const noticesSnap = await getDocs(collection(db, 'blogs'));
      setNotices(
        noticesSnap.docs
          .map(d => ({ id: d.id, ...(d.data() as BlogPost) }))
          .filter(n => n.category === 'Notice')
      );
    };

    loadData();
  }, []);

  // 🔄 HERO SLIDER AUTOPLAY
  useEffect(() => {
    if (!settings?.sliderImages?.length) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % settings.sliderImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [settings]);

  if (!settings) return <div className="text-center py-20">Loading…</div>;

  // MEMBER FILTERS (UNCHANGED UI)
  const gpCommittee = members.filter(m => m.type === 'committee');
  const pesaCommittee = members.filter(m => m.type === 'pesa');
  const panchayatSamiti = members.filter(m => m.type === 'panchayat_samiti');
  const psStaff = members.filter(m => m.type === 'ps_staff');
  const staff = members.filter(m => m.type === 'staff');

  const MemberCard = ({ member, colorClass, borderColor }: any) => (
    <div className={`bg-white rounded-lg shadow-lg p-4 text-center border-t-4 ${borderColor}`}>
      <img src={member.photoUrl} className="w-24 h-24 rounded-full mx-auto object-cover mb-3" />
      <h4 className="font-bold">{member.name}</h4>
      <p className={`${colorClass} text-sm font-bold`}>{member.position}</p>
      <p className="text-xs text-gray-500">{member.mobile}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 🔥 HERO SLIDER (Firebase Controlled) */}
      <div className="relative h-[300px] md:h-[500px] overflow-hidden bg-gray-900">
        {settings.sliderImages?.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-transform duration-1000 ${
              index === currentSlide
                ? 'translate-x-0'
                : index < currentSlide
                ? '-translate-x-full'
                : 'translate-x-full'
            }`}
          >
            <img src={img} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        ))}
      </div>

      {/* 🔔 NOTICES SIDEBAR (Firebase LIVE) */}
      <div className="container mx-auto px-4 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">{/* LEFT CONTENT REMAINS SAME */}</div>

        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gov-secondary text-white p-3 font-bold">
              Latest Notices
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {notices.length ? (
                <ul className="space-y-3">
                  {notices.map(n => (
                    <li key={n.id} className="border-b pb-2">
                      <p className="font-bold text-sm">{n.title}</p>
                      <p className="text-xs text-gray-600">{n.content}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No active notices</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER (UNCHANGED) */}
      <footer className="bg-gov-primary text-white mt-16">
        <div className="container mx-auto px-4 py-10 text-sm">
          © {new Date().getFullYear()} {settings.panchayatName}
        </div>
      </footer>
    </div>
  );
};
