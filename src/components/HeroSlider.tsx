import React, { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";

interface Slide {
  id: string;
  url: string;
}

const HeroSlider: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);

  // 🔥 Firestore LIVE connection
  useEffect(() => {
    const q = query(
      collection(db, "heroSlider"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Slide[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        url: doc.data().url,
      }));
      setSlides(data);
    });

    return () => unsubscribe();
  }, []);

  // ⏱ Auto slide
  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((p) => (p + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides]);

  if (slides.length === 0) {
    return (
      <div className="h-[300px] md:h-[500px] flex items-center justify-center bg-gray-200 text-gray-500">
        No slider images uploaded
      </div>
    );
  }

  return (
    <div className="relative h-[300px] md:h-[500px] overflow-hidden bg-black">
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
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ))}

      {/* Controls */}
      <button
        onClick={() =>
          setCurrent(current === 0 ? slides.length - 1 : current - 1)
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 text-white p-2 rounded-full z-10"
      >
        ‹
      </button>

      <button
        onClick={() => setCurrent((current + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 text-white p-2 rounded-full z-10"
      >
        ›
      </button>
    </div>
  );
};

export default HeroSlider;
