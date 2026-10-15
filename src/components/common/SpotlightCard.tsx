import React, { useRef, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  outerRadius?: number; // e.g., 16 for rounded-2xl
  padding?: number; // e.g., 16 or 20
  spotlightColor?: string;
  bordered?: boolean;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  outerRadius = 16,
  padding = 16,
  spotlightColor,
  bordered = true,
  style,
  ...rest
}) => {
  const { theme, currentPalette } = useApp();
  const isDark = theme === 'dark';
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Mathematical nested radius rule: Inner Radius = Outer Radius - Distance Between The Two (Padding)
  const innerRadius = Math.max(0, outerRadius - padding);

  const updateCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: clientX - rect.left,
      y: clientY - rect.top
    });
    setIsHovered(true);
  }, []);

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    updateCoordinates(e.clientX, e.clientY);
  }, [updateCoordinates]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    updateCoordinates(e.clientX, e.clientY);
  }, [updateCoordinates]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const effectiveSpotlight = spotlightColor || (isDark 
    ? (currentPalette?.dark.glowPrimary || 'rgba(3, 193, 214, 0.45)')
    : (currentPalette?.light.glowPrimary || 'rgba(3, 193, 214, 0.30)'));

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        borderRadius: `${outerRadius}px`,
        backgroundColor: 'var(--color-surface)',
        borderColor: isHovered ? 'color-mix(in srgb, var(--color-brand) 40%, var(--color-border))' : 'var(--color-border)',
        color: 'var(--color-text-primary)',
        boxShadow: isHovered
          ? (isDark
              ? '0 6px 20px -4px rgba(0, 0, 0, 0.35)'
              : '0 4px 14px -2px rgba(0, 0, 0, 0.08)')
          : undefined,
        ['--inner-radius' as any]: `${innerRadius}px`,
        ...style
      }}
      className={`relative overflow-hidden transition-all duration-200 group ${
        bordered ? 'border' : ''
      }`}
      {...rest}
    >
      {/* Subtle, Non-Intrusive Soft Light (Quiet, Low-Eyestrain) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-200 z-0"
        style={{
          opacity: isHovered ? (isDark ? 0.06 : 0.04) : 0,
          background: `radial-gradient(350px circle at ${position.x}px ${position.y}px, var(--color-brand), transparent 70%)`
        }}
      />

      {/* Card Content Surface */}
      <div className={`relative z-10 w-full h-full ${className}`}>
        {children}
      </div>
    </div>
  );
};
