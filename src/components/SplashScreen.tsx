'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Logo from './Logo';

export default function SplashScreen() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2000); // 2 segundos de splash
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="splash-screen"
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }
                    }}
                >
                    <div className="splash-content">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                transition: { duration: 0.6, ease: "easeOut" }
                            }}
                        >
                            <Logo size={80} className="splash-logo" />
                        </motion.div>

                        <motion.div
                            className="splash-shimmer"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "linear",
                                delay: 0.5
                            }}
                        />
                    </div>

                    <style jsx>{`
            .splash-screen {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: #000;
              z-index: 9999;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .splash-content {
              position: relative;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .splash-shimmer {
              position: absolute;
              top: 0;
              left: 0;
              width: 50%;
              height: 100%;
              background: linear-gradient(
                90deg,
                transparent,
                rgba(212, 175, 55, 0.1),
                transparent
              );
              pointer-events: none;
            }
          `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
