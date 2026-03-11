'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function TransitionProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="transition-container">
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={pathname}
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ opacity: 0 }} // Saída suave sem movimento para não quebrar o layout
                    transition={{
                        duration: 0.25,
                        ease: [0.23, 1, 0.32, 1] // Ease out expo mais rápido
                    }}
                    className="transition-content"
                >
                    {children}
                </motion.div>
            </AnimatePresence>

            <style jsx>{`
                .transition-container {
                    position: relative;
                    width: 100%;
                    min-height: 100vh;
                    overflow-x: hidden; /* Evita scrollbar lateral no slide */
                }
                .transition-content {
                    width: 100%;
                    min-height: 100vh;
                }
            `}</style>
        </div>
    );
}
