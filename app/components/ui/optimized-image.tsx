'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ImageIcon } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  width = 100,
  height = 100,
  className = '',
  fallback,
  priority = false,
  quality = 75,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // If image failed to load and we have a fallback, use it
  if (imageError && fallback) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={fallback}
          alt={alt}
          width={width}
          height={height}
          className="object-cover"
          priority={priority}
          quality={quality}
          sizes={sizes}
          onError={handleError}
          onLoad={handleLoad}
        />
      </div>
    );
  }

  // If image failed to load and no fallback, show placeholder
  if (imageError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-200 ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <ImageIcon className="h-6 w-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width: `${width}px`, height: `${height}px` }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        priority={priority}
        quality={quality}
        sizes={sizes}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
}

// Specialized components for common use cases
export function FlagImage({ 
  src, 
  alt, 
  className = '' 
}: { 
  src: string; 
  alt: string; 
  className?: string; 
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={24}
      height={16}
      className={`rounded ${className}`}
      fallback="/images/flag-placeholder.svg"
    />
  );
}

export function TeamLogo({ 
  src, 
  alt, 
  className = '' 
}: { 
  src: string; 
  alt: string; 
  className?: string; 
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={40}
      height={40}
      className={`rounded-full ${className}`}
      fallback="/images/team-placeholder.svg"
    />
  );
}

export function LeagueLogo({ 
  src, 
  alt, 
  className = '' 
}: { 
  src: string; 
  alt: string; 
  className?: string; 
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={32}
      height={32}
      className={`rounded ${className}`}
      fallback="/images/league-placeholder.svg"
    />
  );
}
