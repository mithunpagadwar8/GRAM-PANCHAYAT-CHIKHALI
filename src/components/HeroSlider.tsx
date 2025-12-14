import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";

/**
 * =====================================================
 * HERO SLIDER – LIVE FIRESTORE VERSION (PUBLIC)
 * Admin uploads → Firestore → Live Website
 * No props | No AppSettings dependency
 * =====================================================
 */

interface Slide {
  id: string;
  url: string;
}

const HeroSlider: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);

  // 🔄 Realtime Firestore listener
  useEffect(() => {
    const q = query(collection(db, "heroSlider"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const data: Slide[] = snap.docs.map((d) => ({
        id: d.id,
        url: d.data().url,
      }));
      setSlides(data);
      setCurrent(0);
    });
    return () => unsub();
  }, []);

  // ⏱️ Auto play
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="h-[280px] md:h-[480px] bg-gray-200 flex items-center justify-center text-gray-500">
        No slider images uploaded
      </div>
    );
  }

  return (
    <div className="relative h-[280px] md:h-[480px] overflow-hidden bg-black">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
            index === current
              ? "translate-x-0"
              : index < current
              ? "-translate-x-full"
              : "translate-x-full"
          }`}
        >
          <img
            src={slide.url}
            alt="Hero Slide"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={() => setCurrent((p) => (p === 0 ? slides.length - 1 : p - 1))}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 text-white p-2 rounded-full"
      >
        ‹
      </button>
      <button
        onClick={() => setCurrent((p) => (p + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 text-white p-2 rounded-full"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full ${i === current ? "bg-white" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
