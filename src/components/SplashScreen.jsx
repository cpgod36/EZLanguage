import React from 'react';
import { BookOpen } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FAF9F6',
      gap: 16
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: 20,
        background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 25px rgba(79, 70, 229, 0.35)',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        <BookOpen size={32} color="white" strokeWidth={2.4} />
      </div>

      <div style={{
        fontSize: '1.4rem',
        fontWeight: 800,
        color: '#1E293B',
        letterSpacing: '-0.02em'
      }}>
        EZ<span style={{ color: '#4F46E5' }}>Language</span>
      </div>
    </div>
  );
}
