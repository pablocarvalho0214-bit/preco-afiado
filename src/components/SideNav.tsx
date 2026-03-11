'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Scissors, History, Package, User, LogOut, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from './Logo';
import { getUsuarioAtual, logout, ADMIN_EMAILS } from '@/lib/storage';
import { BarChart3 } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: Home, label: 'Painel' },
  { href: '/categorias', icon: Scissors, label: 'Calcular' },
  { href: '/historico', icon: History, label: 'Histórico' },
  { href: '/produtos', icon: Package, label: 'Estoque' },
  { href: '/configuracoes', icon: User, label: 'Perfil' },
];

export default function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ nome: string; email: string; tipo: string; avatarUrl?: string } | null>(null);

  useEffect(() => {
    async function load() {
      const u = await getUsuarioAtual();
      if (u) setUser(u);
    }
    load();
  }, []);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);
  const fullNavItems = [...NAV_ITEMS];
  if (isAdmin) {
    fullNavItems.push({ href: '/stats', icon: BarChart3, label: 'Estatísticas' });
  }

  async function handleLogout() {
    if (confirm('Deseja realmente sair?')) {
      await logout();
      router.push('/');
    }
  }

  return (
    <nav className="desktop-side-nav glass-panel">
      <div className="side-nav-header">
        <Logo size={28} showText={true} />

        {user && (
          <div className="user-profile-mini">
            <div
              className="avatar-circle"
              style={{
                backgroundImage: user.avatarUrl ? `url(${user.avatarUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: user.avatarUrl ? 'transparent' : '#111'
              }}
            >
              {!user.avatarUrl && user.nome.charAt(0).toUpperCase()}
            </div>
            <div className="user-info-text">
              <span className="user-name-small">{user.nome.split(' ')[0]}</span>
              <span className="user-role-text">{user.tipo === 'empresario' ? 'Empresário' : 'Autônomo'}</span>
            </div>
          </div>
        )}
      </div>

      <div className="side-nav-links">
        <div className="nav-group-label">PRINCIPAL</div>
        {fullNavItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`side-nav-item ${active ? 'active' : ''}`}
              style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: '20px', padding: '14px 24px', width: '100%' }}
            >
              <div className="icon-box">
                <Icon size={20} className="nav-icon" />
              </div>
              <span className="nav-label">{item.label}</span>

              {active && (
                <motion.div
                  layoutId="side-indicator"
                  className="active-indicator"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="side-nav-footer">
        <button
          onClick={handleLogout}
          className="side-nav-item logout-btn"
          style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: '20px', padding: '14px 24px', width: '100%' }}
        >
          <div className="icon-box">
            <LogOut size={20} className="nav-icon" />
          </div>
          <span className="nav-label">Sair da Conta</span>
        </button>
      </div>

      <style jsx>{`
        .desktop-side-nav {
          position: fixed;
          top: 0; 
          left: 0; 
          bottom: 0;
          width: 260px;
          z-index: 1050;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--border) !important;
          border-left: none;
          border-top: none;
          border-bottom: none;
          border-radius: 0;
          padding: 24px 16px;
        }

        .side-nav-header {
          margin-bottom: 32px;
          padding-left: 12px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .user-profile-mini {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--glass-bg);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
        }
        .avatar-circle {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--amber), #ffcc33);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #111;
          font-weight: 900;
          font-size: 0.9rem;
          overflow: hidden;
          flex-shrink: 0;
        }
        .user-info-text { display: flex; flex-direction: column; }
        .user-name-small { font-size: 0.85rem; font-weight: 800; color: var(--text-primary); }
        .user-role-text { font-size: 0.65rem; color: var(--amber); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.9; }

        .nav-group-label {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-disabled);
          letter-spacing: 0.1em;
          margin: 12px 0 8px 16px;
        }

        .side-nav-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }

        .side-nav-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }

        .side-nav-item {
          position: relative;
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: flex-start !important;
          gap: 16px;
          padding: 10px 16px;
          height: 48px;
          border-radius: 12px;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
        }

        .side-nav-item:hover {
          color: var(--text-primary);
          background: var(--glass-bg);
          transform: translateX(4px);
        }

        .side-nav-item.active {
          color: var(--amber);
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.15);
        }

        .logout-btn { color: #ff5555; }
        .logout-btn:hover { background: rgba(255, 85, 85, 0.1); color: #ff7777; }

        .icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .nav-label {
          font-weight: 700;
          font-size: 0.88rem;
          z-index: 2;
        }

        .active-indicator {
          position: absolute;
          left: -4px;
          top: 12px;
          bottom: 12px;
          width: 3px;
          background: var(--amber);
          border-radius: 4px;
          box-shadow: 0 0 12px var(--amber-glow);
        }

        /* Oculta completamente no mobile (abaixo de 1024px) */
        @media (max-width: 1023px) {
          .desktop-side-nav {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
