import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

// Declare global VANTA object from CDN
declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

export interface ThreeBackgroundRef {
  triggerNinjaEffect: () => void;
}

const ThreeBackground = forwardRef<ThreeBackgroundRef>((_props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const vantaRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    triggerNinjaEffect: () => {
      // Create a cool wave intensity effect
      if (vantaRef.current) {
        const originalColor = vantaRef.current.options.color;
        const originalZoom = vantaRef.current.options.zoom;

        // Intensify waves for ninja effect
        vantaRef.current.setOptions({
          color: 0xff6b81,
          zoom: 0.5,
          shininess: 100,
        });

        // Return to normal after 2 seconds
        setTimeout(() => {
          vantaRef.current?.setOptions({
            color: originalColor,
            zoom: originalZoom,
            shininess: 50,
          });
        }, 2000);
      }
    }
  }));

  useEffect(() => {
    if (!containerRef.current) return;

    // Wait for VANTA to load from CDN
    const initVanta = () => {
      if (window.VANTA && window.THREE) {
        try {
          // Initialize Vanta Waves with dark neon colors
          vantaRef.current = window.VANTA.WAVES({
            el: containerRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x1a1f3a,
            shininess: 15,
            waveHeight: 15,
            waveSpeed: 0.8,
            zoom: 1.2,
          });
        } catch (error) {
          console.error('Failed to initialize Vanta Waves:', error);
        }
      } else {
        // Retry if VANTA hasn't loaded yet
        setTimeout(initVanta, 100);
      }
    };

    initVanta();

    // Cleanup
    return () => {
      if (vantaRef.current) {
        vantaRef.current.destroy();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
});

ThreeBackground.displayName = 'ThreeBackground';

export default ThreeBackground;
