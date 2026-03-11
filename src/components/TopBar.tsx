'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/storage';
import { ArrowLeft, LogOut, Moon, Sun, Bell, Settings as SettingsIcon, X, Lightbulb, TrendingUp, Target, DollarSign, Percent } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import Logo from './Logo';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  showLogout?: boolean;
}

const PRICING_TIPS = [
  {
    icon: Lightbulb,
    title: 'Custo fixo importa',
    body: 'Inclua aluguel, energia e salários no custo fixo mensal. Muitos profissionais esquecem esses valores e precificam abaixo do necessário.',
    color: '#f59e0b'
  },
  {
    icon: TrendingUp,
    title: 'Margem de lucro saudável',
    body: 'Uma margem entre 20% e 40% é ideal para barbearias. Abaixo disso, o negócio não gera reserva para crescer.',
    color: '#10b981'
  },
  {
    icon: Target,
    title: 'Taxa de ocupação',
    body: 'Você não atende 100% do tempo. Configure a produtividade real nas configurações para uma precificação mais realista.',
    color: '#3b82f6'
  },
  {
    icon: DollarSign,
    title: 'Não esqueça o pró-labore',
    body: 'O seu salário como dono deve estar no custo fixo. Se você não paga a si mesmo, está subsidiando o negócio sem saber.',
    color: '#8b5cf6'
  },
  {
    icon: Percent,
    title: 'Impostos no cálculo',
    body: 'MEI paga ~5% de imposto. Simples Nacional, entre 6% e 15%. Configure corretamente em Ajustes & Margens para refletir no preço.',
    color: '#ef4444'
  },
];

export default function TopBar({ title, showBack, backHref, showLogout }: TopBarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [showNotif, setShowNotif] = useState(false);
  const [readTips, setReadTips] = useState<number[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('read_tips');
    if (stored) setReadTips(JSON.parse(stored));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    }
    if (showNotif) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotif]);

  const unreadCount = PRICING_TIPS.length - readTips.length;

  function markAllRead() {
    const allIds = PRICING_TIPS.map((_, i) => i);
    setReadTips(allIds);
    localStorage.setItem('read_tips', JSON.stringify(allIds));
  }

  function handleBack() {
    if (backHref) router.push(backHref);
    else router.back();
  }

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <header className="top-bar glass-panel">
      <div className="top-bar-inner">
        <div className="top-bar-left" style={{ gap: '12px' }}>
          {showBack && (
            <button className="top-bar-icon-btn nav-back-btn" onClick={handleBack} aria-label="Voltar">
              <ArrowLeft size={18} />
            </button>
          )}
          <Link href="/dashboard" className="top-bar-logo-link">
            <Logo size={26} showText={true} />
          </Link>
        </div>

        <div className="top-bar-center"></div>

        <div className="top-bar-right">
          <button className="top-bar-icon-btn" onClick={toggleTheme} title="Trocar Tema">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Notificações com Popup */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              className="top-bar-icon-btn notification-btn"
              title="Dicas de Precificação"
              onClick={() => setShowNotif(!showNotif)}
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="notification-badge" />}
            </button>

            {showNotif && (
              <div className="notif-popup">
                <div className="notif-header">
                  <span className="notif-title">Dicas de Precificação</span>
                  {unreadCount > 0 && (
                    <button className="notif-mark-read" onClick={markAllRead}>
                      Marcar lidas
                    </button>
                  )}
                </div>
                <div className="notif-list">
                  {PRICING_TIPS.map((tip, i) => {
                    const Icon = tip.icon;
                    const isRead = readTips.includes(i);
                    return (
                      <div
                        key={i}
                        className={`notif-item ${isRead ? 'read' : ''}`}
                        onClick={() => {
                          if (!isRead) {
                            const updated = [...readTips, i];
                            setReadTips(updated);
                            localStorage.setItem('read_tips', JSON.stringify(updated));
                          }
                        }}
                      >
                        <div className="notif-icon" style={{ background: `${tip.color}15`, color: tip.color }}>
                          <Icon size={16} />
                        </div>
                        <div className="notif-content">
                          <span className="notif-item-title">{tip.title}</span>
                          <p className="notif-item-body">{tip.body}</p>
                        </div>
                        {!isRead && <div className="notif-unread-dot" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button className="top-bar-icon-btn gear-btn" onClick={() => router.push('/configuracoes')} title="Ajustes">
            <SettingsIcon size={18} strokeWidth={2.5} />
          </button>

          {showLogout && (
            <button className="top-bar-icon-btn logout-btn" onClick={handleLogout} title="Sair">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .top-bar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: var(--nav-height);
          z-index: 1000;
          padding-top: env(safe-area-inset-top, 0px);
          border-top: none;
          border-left: none;
          border-right: none;
          border-radius: 0;
        }
        .top-bar-inner {
          height: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .top-bar-left, .top-bar-right {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .top-bar-right { justify-content: flex-end; }

        .top-bar-center {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            padding: 0 12px;
        }

        /* Notificações Popup */
        .notif-popup {
          position: absolute;
          top: calc(100% + 12px);
          right: -40px;
          width: 360px;
          max-height: 480px;
          background: var(--surface-1);
          border: 1px solid var(--border);
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          animation: popIn 0.2s ease;
          z-index: 2000;
        }
        @keyframes popIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .notif-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }
        .notif-title {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .notif-mark-read {
          background: none;
          border: none;
          color: var(--amber);
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
        }
        .notif-mark-read:hover { text-decoration: underline; }

        .notif-list {
          max-height: 400px;
          overflow-y: auto;
          padding: 8px;
        }

        .notif-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 12px;
          border-radius: 14px;
          cursor: pointer;
          transition: background 0.2s;
          position: relative;
        }
        .notif-item:hover { background: var(--glass-bg); }
        .notif-item.read { opacity: 0.5; }

        .notif-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notif-content { flex: 1; min-width: 0; }
        .notif-item-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-primary);
          display: block;
          margin-bottom: 2px;
        }
        .notif-item-body {
          font-size: 0.72rem;
          color: var(--text-secondary);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .notif-unread-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--amber);
          flex-shrink: 0;
          margin-top: 6px;
          box-shadow: 0 0 8px var(--amber-glow);
        }

        @media (max-width: 600px) {
            .notif-popup { width: 300px; right: -60px; }
            .top-bar-title { font-size: 0.75rem; letter-spacing: 0.15em; }
        }

        @media (min-width: 1024px) {
            .top-bar {
                left: 260px;
            }
        }
      `}</style>
    </header>
  );
}
