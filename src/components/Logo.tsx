'use client';

import { motion } from 'framer-motion';

interface LogoProps {
    size?: number;
    showText?: boolean;
    className?: string;
}

export default function Logo({ size = 32, showText = true, className = "" }: LogoProps) {
    return (
        <div className={`flex items-center gap-3 ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="logo-svg-wrapper" style={{ width: size, height: size, position: 'relative' }}>
                <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: '100%', height: '100%' }}
                >
                    {/* Escudo / Diamante de Fundo */}
                    <path
                        d="M50 5L90 25V75L50 95L10 75V25L50 5Z"
                        fill="url(#logo-grad)"
                        fillOpacity="0.1"
                        stroke="url(#logo-grad)"
                        strokeWidth="2"
                    />

                    {/* Elemento de Navalha Estilizada (V) */}
                    <path
                        d="M30 35L50 75L70 35"
                        stroke="url(#logo-grad)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Círculo Central Detalhe */}
                    <circle cx="50" cy="30" r="6" fill="url(#logo-grad)" />

                    <defs>
                        <linearGradient id="logo-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#D4AF37" />
                            <stop offset="1" stopColor="#F5D061" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {showText && (
                <div className="logo-text-wrapper" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                    <span className="logo-brand-top" style={{
                        fontSize: 'max(14px, 0.8rem)',
                        fontWeight: 400,
                        letterSpacing: '0.3em',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        marginBottom: '2px'
                    }}>
                        Preço
                    </span>
                    <span className="logo-brand-main" style={{
                        fontSize: 'max(18px, 1.2rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.02em',
                        background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--amber) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textTransform: 'uppercase'
                    }}>
                        Afiado
                    </span>
                </div>
            )}
        </div>
    );
}
