import React, { useEffect, useState } from 'react';
import { db } from '../services/firebaseconfig';
import { collection, onSnapshot } from 'firebase/firestore';

/**
 * =====================================================
 * PUBLIC HERO SLIDER – LIVE Firestore Slider
 * Displays images from Firestore (Automatic Sync)
 * =====================================================
 */

const HeroSlider: React.FC<{ images: string[] }> = ({ images }) => {
  const [sliderImages, setSliderImages] = useState<string[]>([]);

  // ================= LOAD SLIDER IMAGES =================
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'heroSlider'), (snap) => {
      const data: string[] = snap.docs.map((d) => d.data().imageUrl);
      setSliderImages(data);
    });

    return () => unsub();
  }, []);

  return (
    <div className="relative h-[300px] md:h-[500px] overflow-hidden bg-gray-900">
      {sliderImages.length > 0 ? (
        sliderImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-transform duration-1000 ease-in-out ${
              index === 0 ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <img src={img} alt={`Slide ${index}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        ))
      ) : (
        <div className="text-white text-center p-4">Loading Slider...</div>
      )}
    </div>
  );
};

export default HeroSlider;
