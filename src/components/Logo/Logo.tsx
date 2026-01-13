'use client';

import { Shield, Radar } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center justify-center py-6 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-transparent to-blue-900/20 animate-pulse"></div>
      
      {/* Radar sweep animation */}
      <div className="absolute inset-0 opacity-20">
        <div className="radar-sweep"></div>
      </div>
      
      {/* Logo content */}
      <div className="relative flex items-center gap-4 z-10">
        {/* Animated shield icon */}
        <div className="relative">
          <Shield className="w-8 h-8 text-blue-300 animate-pulse" />
          <div className="absolute inset-0 w-8 h-8">
            <Radar className="w-8 h-8 text-blue-400 animate-spin-slow opacity-60" />
          </div>
        </div>
        
        {/* Main logo text */}
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white animate-gradient-shift tracking-wide">
          Daniels polisradar
        </h1>
        
        {/* Animated radar icon */}
        <div className="relative">
          <Radar className="w-8 h-8 text-blue-300 animate-ping" />
          <div className="absolute inset-0 w-8 h-8">
            <Shield className="w-8 h-8 text-blue-400 animate-pulse opacity-60" />
          </div>
        </div>
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-blue-400/10 blur-xl animate-pulse"></div>
    </div>
  );
}