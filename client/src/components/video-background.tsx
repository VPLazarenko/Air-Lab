import React from 'react';

export default function VideoBackground() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
      {/* Kinescope embed iframe */}
      <iframe
        src="https://kinescope.io/embed/sxpt2B4A82AZKtwf8Q8ehc?autoplay=1&muted=1&loop=1&controls=0"
        className="w-full h-full"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer"
        allowFullScreen
        title="Демонстрационное видео"
      />
      
      {/* Fallback content - показывается если iframe не загрузился */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 -z-10">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-6xl mb-4">🎬</div>
          <div className="text-lg font-medium">Загрузка видео...</div>
          <div className="text-sm">Подождите пока видео загрузится</div>
        </div>
      </div>
      
      {/* Overlay for better text readability if needed */}
      <div className="absolute inset-0 bg-black/5 pointer-events-none" />
    </div>
  );
}