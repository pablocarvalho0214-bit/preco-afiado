'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Scissors, History, Package, User } from 'lucide-react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { href: '/dashboard', icon: Home, label: 'Painel' },
  { href: '/categorias', icon: Scissors, label: 'Calcular' },
  { href: '/historico', icon: History, label: 'Histórico' },
  { href: '/produtos', icon: Package, label: 'Estoque' },
  { href: '/configuracoes', icon: User, label: 'Perfil' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav glass-panel">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = pathname.startsWith(item.href);

        return (
          <Link key={item.href} href={item.href} className="bottom-nav-item">
            <motion.div
              initial={false}
              animate={{ color: active ? 'var(--amber)' : 'var(--text-disabled)' }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}
            >
              <Icon size={20} className="bottom-nav-icon" />
            </motion.div>

            {/* Indicador Animado (Luz Amarela Móvel) */}
            {active && (
              <motion.div
                layoutId="nav-indicator"
                className="active-indicator-motion"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30
                }}
              />
            )}
          </Link>
        );
      })}

      <style jsx>{`
        .bottom-nav {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          height: var(--bottom-nav-height);
          z-index: 1000;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding-bottom: env(safe-area-inset-bottom, 0px);
          border-bottom: none;
          border-left: none;
          border-right: none;
          border-radius: 0;
        }
        @media (min-width: 768px) {
          .bottom-nav { display: none; }
        }
        .bottom-nav-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px 4px;
          min-width: 64px;
          height: 100%;
          cursor: pointer;
        }
        
        .active-indicator-motion {
            position: absolute;
            top: 0;
            width: 32px;
            height: 3px;
            background: var(--amber);
            border-radius: 0 0 4px 4px;
            box-shadow: 0 2px 12px var(--amber-glow), 0 0 20px rgba(212, 175, 55, 0.4);
        }
      `}</style>
    </nav>
  );
}
