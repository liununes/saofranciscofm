import { useState, useEffect } from 'react';
import { useRadio } from '@/contexts/RadioContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import slide1 from '@/assets/slide-1.jpg';
import slide2 from '@/assets/slide-2.jpg';

const ImageSlider = () => {
  const { config } = useRadio();
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = config.slide_imagens.length > 0
    ? config.slide_imagens.sort((a, b) => a.ordem - b.ordem).map(s => s.imagem)
    : [slide1, slide2];

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const prev = () => setCurrentIndex(i => (i - 1 + images.length) % images.length);
  const next = () => setCurrentIndex(i => (i + 1) % images.length);

  return (
    <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] overflow-hidden rounded-xl shadow-card group">
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`Slide ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />

      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-foreground">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-foreground">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex ? 'bg-secondary w-6' : 'bg-card/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageSlider;
