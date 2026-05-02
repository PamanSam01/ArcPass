import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Background: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Gentle parallax effect on the floating orbs
      gsap.to('.orb', {
        x: 'random(-50, 50)',
        y: 'random(-50, 50)',
        duration: 'random(10, 20)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: {
          each: 2,
          from: 'random'
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="mesh-bg">
      {/* Floating Light Orbs */}
      <div className="orb absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-arc-violet/10 blur-[120px] pointer-events-none" />
      <div className="orb absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-arc-cyan/10 blur-[120px] pointer-events-none" />
      <div className="orb absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-arc-magenta/5 blur-[100px] pointer-events-none" />
      
      {/* Dynamic Grid */}
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 245, 255, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 245, 255, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black, transparent)'
        }}
      />
    </div>
  );
};

export default Background;
