'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ProizvodServerAction } from '@/types';

interface ImageModalClientProps {
  proizvod: ProizvodServerAction;
}

export default function ImageModalClient({ proizvod }: ImageModalClientProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  // ESC key handler for closing modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        router.back();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [router]);

  const handleClose = () => {
    router.back();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
      onClick={handleBackdropClick}
    >
      {/* Ultra simple container */}
      <div style={{ position: 'relative', backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '-50px',
            right: '0px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px 12px',
            borderRadius: '50%',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ✕
        </button>
        {/* Clean image */}
        {proizvod.slika && (
          <Image
            src={proizvod.slika}
            alt={proizvod.naziv_sr || 'Proizvod'}
            width={1200}     // Povećajte širinu
            height={900}     // Povećajte visinu
            style={{
              maxWidth: '98vw',      // Dozvolite skoro punu širinu prozora
              maxHeight: '95vh',     // Veća maksimalna visina
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 6px 30px rgba(0,0,0,0.8)',
            }}
            onClick={(e) => e.stopPropagation()}
            onLoad={() => console.log('✅ Image loaded successfully in modal')}
            onError={() => console.error('❌ Image failed to load in modal')}
          />
        )}
      </div>
    </div>
  );
}