import React, { useEffect, useState } from "react";
import { getHeroSlides } from "../services/publicData";

const HeroSlider = () => {
  const [slides, setSlides] = useState<any[]>([]);

  useEffect(() => {
    getHeroSlides().then(setSlides);
  }, []);

  if (!slides.length) return null;

  return (
    <div className="relative overflow-hidden">
      {slides.map((s, i) => (
        <img
          key={i}
          src={s.imageUrl}
          alt={s.title}
          className="w-full h-[60vh] object-cover"
        />
      ))}
    </div>
  );
};

export default HeroSlider;
