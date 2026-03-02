import { useEffect, useRef } from 'react';

interface GoogleAdProps {
  codigo: string;
  className?: string;
}

const GoogleAd = ({ codigo, className = '' }: GoogleAdProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !codigo) return;
    containerRef.current.innerHTML = codigo;

    // Execute any script tags in the ad code
    const scripts = containerRef.current.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [codigo]);

  if (!codigo) return null;

  return (
    <div ref={containerRef} className={`flex justify-center ${className}`} />
  );
};

export default GoogleAd;
