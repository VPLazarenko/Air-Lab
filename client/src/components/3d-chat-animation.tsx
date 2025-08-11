import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Bot, Heart, Star, Zap, Users } from 'lucide-react';

interface ChatWidget {
  id: number;
  x: number;
  y: number;
  z: number;
  color: string;
  greeting: string;
  icon: React.ReactNode;
  size: number;
  velocity: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  rotationSpeed: { x: number; y: number; z: number };
}

const greetings = [
  "Привет! Как дела?",
  "Добро пожаловать!",
  "Чем могу помочь?",
  "Готов к общению!",
  "Давайте поговорим!",
  "Я ваш помощник!",
  "Здравствуйте!",
  "Рад вас видеть!",
  "Что нового?",
  "Как поживаете?"
];

const colors = [
  'bg-gradient-to-br from-blue-400 to-blue-600',
  'bg-gradient-to-br from-green-400 to-green-600',
  'bg-gradient-to-br from-purple-400 to-purple-600',
  'bg-gradient-to-br from-pink-400 to-pink-600',
  'bg-gradient-to-br from-orange-400 to-orange-600',
  'bg-gradient-to-br from-teal-400 to-teal-600',
  'bg-gradient-to-br from-indigo-400 to-indigo-600',
  'bg-gradient-to-br from-red-400 to-red-600',
  'bg-gradient-to-br from-yellow-400 to-yellow-600',
  'bg-gradient-to-br from-cyan-400 to-cyan-600'
];

const icons = [
  <MessageCircle key="message" className="w-full h-full" />,
  <Bot key="bot" className="w-full h-full" />,
  <Heart key="heart" className="w-full h-full" />,
  <Star key="star" className="w-full h-full" />,
  <Zap key="zap" className="w-full h-full" />,
  <Users key="users" className="w-full h-full" />
];

export default function ChatAnimation3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgets, setWidgets] = useState<ChatWidget[]>([]);
  const [hoveredWidget, setHoveredWidget] = useState<number | null>(null);
  const animationFrameRef = useRef<number>();

  const createWidget = (id: number): ChatWidget => {
    const containerWidth = containerRef.current?.offsetWidth || 800;
    const containerHeight = containerRef.current?.offsetHeight || 600;
    
    return {
      id,
      x: Math.random() * containerWidth,
      y: Math.random() * containerHeight,
      z: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      greeting: greetings[Math.floor(Math.random() * greetings.length)],
      icon: icons[Math.floor(Math.random() * icons.length)],
      size: 60 + Math.random() * 40, // Random size between 60-100px
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 0.5
      },
      rotation: {
        x: Math.random() * 360,
        y: Math.random() * 360,
        z: Math.random() * 360
      },
      rotationSpeed: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: (Math.random() - 0.5) * 2
      }
    };
  };

  const updateWidgets = () => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;

    setWidgets(prevWidgets => 
      prevWidgets.map(widget => {
        let newX = widget.x + widget.velocity.x;
        let newY = widget.y + widget.velocity.y;
        let newZ = widget.z + widget.velocity.z;

        // Bounce off walls
        let newVelX = widget.velocity.x;
        let newVelY = widget.velocity.y;
        let newVelZ = widget.velocity.z;

        if (newX <= 0 || newX >= containerWidth - widget.size) {
          newVelX = -newVelX;
          newX = Math.max(0, Math.min(containerWidth - widget.size, newX));
        }

        if (newY <= 0 || newY >= containerHeight - widget.size) {
          newVelY = -newVelY;
          newY = Math.max(0, Math.min(containerHeight - widget.size, newY));
        }

        if (newZ <= -50 || newZ >= 50) {
          newVelZ = -newVelZ;
        }

        return {
          ...widget,
          x: newX,
          y: newY,
          z: newZ,
          velocity: { x: newVelX, y: newVelY, z: newVelZ },
          rotation: {
            x: (widget.rotation.x + widget.rotationSpeed.x) % 360,
            y: (widget.rotation.y + widget.rotationSpeed.y) % 360,
            z: (widget.rotation.z + widget.rotationSpeed.z) % 360
          }
        };
      })
    );
  };

  const animate = () => {
    updateWidgets();
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    // Initialize widgets
    const initialWidgets = Array.from({ length: 8 }, (_, i) => createWidget(i));
    setWidgets(initialWidgets);

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleWidgetClick = (widget: ChatWidget) => {
    // Add click animation effect
    setWidgets(prevWidgets =>
      prevWidgets.map(w =>
        w.id === widget.id
          ? {
              ...w,
              velocity: {
                x: (Math.random() - 0.5) * 8,
                y: (Math.random() - 0.5) * 8,
                z: (Math.random() - 0.5) * 2
              }
            }
          : w
      )
    );
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[500px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl"
      style={{ perspective: '1000px' }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="grid grid-cols-10 grid-rows-10 h-full">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="border border-gray-300 dark:border-gray-600" />
          ))}
        </div>
      </div>

      {/* 3D Chat Widgets */}
      {widgets.map(widget => (
        <div
          key={widget.id}
          className={`absolute cursor-pointer transition-all duration-300 hover:scale-110 ${widget.color} rounded-2xl shadow-lg backdrop-blur-sm border border-white/20`}
          style={{
            left: `${widget.x}px`,
            top: `${widget.y}px`,
            width: `${widget.size}px`,
            height: `${widget.size}px`,
            transform: `
              translateZ(${widget.z}px) 
              rotateX(${widget.rotation.x}deg) 
              rotateY(${widget.rotation.y}deg) 
              rotateZ(${widget.rotation.z}deg)
              ${hoveredWidget === widget.id ? 'scale(1.2)' : 'scale(1)'}
            `,
            transformStyle: 'preserve-3d',
            zIndex: Math.floor(50 + widget.z)
          }}
          onMouseEnter={() => setHoveredWidget(widget.id)}
          onMouseLeave={() => setHoveredWidget(null)}
          onClick={() => handleWidgetClick(widget)}
        >
          <div className="w-full h-full flex items-center justify-center text-white p-3">
            <div className="w-6 h-6 opacity-80">
              {widget.icon}
            </div>
          </div>

          {/* Greeting tooltip */}
          {hoveredWidget === widget.id && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap backdrop-blur-sm z-10">
              {widget.greeting}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80" />
            </div>
          )}

          {/* Glow effect */}
          <div 
            className="absolute inset-0 rounded-2xl blur-sm opacity-50"
            style={{
              background: 'inherit',
              transform: 'scale(1.1)'
            }}
          />
        </div>
      ))}

      {/* Center title */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2 opacity-20">
            AIR LAB
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 opacity-20">
            Интерактивные ассистенты
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-sm text-gray-500 dark:text-gray-400">
        Наведите на виджет для приветствия • Кликните для взаимодействия
      </div>
    </div>
  );
}