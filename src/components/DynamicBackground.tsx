'use client';

import React, { useEffect, useRef } from 'react';

interface DynamicBackgroundProps {
  theme?: 'railway' | 'police' | 'ssc' | 'banking' | 'defence';
}

export default function DynamicBackground({ theme = 'ssc' }: DynamicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Define particle colors based on active exam theme
  const getThemeConfig = (t: string) => {
    switch (t) {
      case 'police':
        return {
          primaryBlob: 'rgba(30, 58, 138, 0.4)', // Deep Navy Blue
          secondaryBlob: 'rgba(234, 179, 8, 0.25)', // Gold Badge
          particles: ['#1e40af', '#60a5fa', '#eab308', '#f59e0b'],
          speedMultiplier: 1.2
        };
      case 'ssc':
        return {
          primaryBlob: 'rgba(194, 65, 12, 0.35)', // Saffron
          secondaryBlob: 'rgba(30, 20, 20, 0.5)',
          particles: ['#ea580c', '#f97316', '#fdba74', '#9a3412'],
          speedMultiplier: 1.0
        };
      case 'banking':
        return {
          primaryBlob: 'rgba(4, 47, 46, 0.45)', // Forest Green
          secondaryBlob: 'rgba(217, 119, 6, 0.25)', // Finance Gold
          particles: ['#0d9488', '#14b8a6', '#d97706', '#f59e0b'],
          speedMultiplier: 0.8
        };
      case 'defence':
        return {
          primaryBlob: 'rgba(27, 46, 27, 0.45)', // Tactical Green
          secondaryBlob: 'rgba(132, 204, 22, 0.25)', // Lime Green
          particles: ['#3f6212', '#84cc16', '#a3e635', '#ea580c'],
          speedMultiplier: 1.5
        };
      case 'railway':
      default:
        return {
          primaryBlob: 'rgba(29, 78, 216, 0.35)', // Metallic Blue
          secondaryBlob: 'rgba(71, 85, 105, 0.25)', // Silver/Slate
          particles: ['#2563eb', '#3b82f6', '#94a3b8', '#cbd5e1'],
          speedMultiplier: 0.9
        };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Re-adjust sizing on window resize
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const config = getThemeConfig(theme);
    const particleCount = Math.min(60, Math.floor((width * height) / 25000));
    const particlesArray: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
      pulseDirection: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = (Math.random() * 0.4 - 0.2) * config.speedMultiplier;
        this.speedY = (Math.random() * 0.4 - 0.2) * config.speedMultiplier;
        this.color = config.particles[Math.floor(Math.random() * config.particles.length)];
        this.alpha = Math.random() * 0.5 + 0.2;
        this.pulseDirection = Math.random() > 0.5 ? 0.005 : -0.005;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Pulse opacity for high-end micro-animation
        this.alpha += this.pulseDirection;
        if (this.alpha >= 0.7 || this.alpha <= 0.15) {
          this.pulseDirection *= -1;
        }

        // Boundary collision / wrap around
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        // Glow effect
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    // Populate particles
    for (let i = 0; i < particleCount; i++) {
      particlesArray.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Render particle connections (constellation effect)
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();

        for (let j = i + 1; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.save();
            ctx.globalAlpha = (1 - dist / 120) * 0.15;
            ctx.strokeStyle = particlesArray[i].color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
            ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  const config = getThemeConfig(theme);

  return (
    <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden bg-[var(--theme-bg)] transition-colors duration-500">
      {/* Glow blobs background */}
      <div 
        className="absolute w-[600px] h-[600px] -top-96 -left-48 rounded-full filter blur-[120px] opacity-35 mix-blend-screen animate-[float-blob_20s_infinite_alternate_ease-in-out] pointer-events-none transition-all duration-700"
        style={{ backgroundColor: config.primaryBlob }}
      />
      <div 
        className="absolute w-[500px] h-[500px] -bottom-48 -right-48 rounded-full filter blur-[100px] opacity-25 mix-blend-screen animate-[float-blob_25s_infinite_alternate-reverse_ease-in-out] pointer-events-none transition-all duration-700"
        style={{ backgroundColor: config.secondaryBlob }}
      />
      
      {/* Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full pointer-events-none" />
    </div>
  );
}
