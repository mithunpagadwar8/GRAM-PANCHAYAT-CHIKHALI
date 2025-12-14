import React, { useEffect, useState } from "react";

interface HeroSliderProps {
  images: string[];
  autoPlay?: boolean;
  interval?: number;
}

/**
 * ============================================
 * HERO SLIDER (PUBLIC WEBSITE)
 * Controlled by Admin → Firebase → App.tsx
 * Safe | Clean | YouTube-style
 * ============================================
 */

const HeroSlider: React.FC<HeroSliderProps> = ({
  images,
  autoPlay = true,
  interval = 4000,
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, images.length, interval]);

  if (!images || images.length === 0) {
    return (
      <div className="h-[300px] md:h-[500px] flex items-center justify-center bg-gray-200 text-gray-500">
        No slider images configured
      </div>
    );
  }

  return (
    <div className="relative h-[300px] md:h-[500px] overflow-hidden bg-black">
      {images.map((img, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
            index === current
              ? "translate-x-0"
              : index < current
              ? "-translate-x-full"
              : "translate-x-full"
          }`}
        >
          <img
            src={img}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      ))}

      {/* Left Arrow */}
      <button
        onClick={() =>
          setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1))
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 text-white p-2 rounded-full z-10"
      >
        <i className="fas fa-chevron-left" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % images.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/60 text-white p-2 rounded-full z-10"
      >
        <i className="fas fa-chevron-right" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === current ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
