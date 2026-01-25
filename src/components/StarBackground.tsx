import { useEffect, useRef } from 'react';

export function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
    const numStars = 100;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initStars = () => {
      stars.length = 0;
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.5 + 0.1,
          opacity: Math.random(),
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.opacity += (Math.random() - 0.5) * 0.02;
        star.opacity = Math.max(0.1, Math.min(1, star.opacity));

        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 2
        );
        gradient.addColorStop(0, `rgba(123, 66, 245, ${star.opacity})`);
        gradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    resize();
    initStars();
    animate();

    window.addEventListener('resize', () => {
      resize();
      initStars();
    });

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'radial-gradient(circle at 50% 100%, hsl(260, 60%, 4%) 0%, hsl(260, 80%, 2%) 100%)' }}
    />
  );
}
