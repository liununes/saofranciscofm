import { useEffect, useRef } from 'react';

interface GoogleAdProps {
  codigo: string;
  className?: string;
  centered?: boolean;
}

const GoogleAd = ({ codigo, className = '', centered = true }: GoogleAdProps) => {
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

  const classes = `${centered ? 'flex justify-center' : ''} ${className}`.trim();

  return (
    <div ref={containerRef} className={classes} />
  );
};

export default GoogleAd;
