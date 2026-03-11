'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scissors, Package, History, Settings, ChevronRight, ArrowRight, TrendingUp, DollarSign, Clock, Target } from 'lucide-react';
import OnboardingTour from '@/components/OnboardingTour';
import { calcularMetricasDashboard, type DashboardMetrics } from '@/lib/metrics';
import { useAuth } from '@/contexts/AuthContext';
import { getPrecificacoes, getConfig, getProdutos, checkUserFeedbackEligibility, type PrecificacaoSalva } from '@/lib/storage';
import FeedbackModal from '@/components/FeedbackModal';

export default function Dashboard() {
    const { user, loading: authLoading } = useAuth();
    const [totalPrecs, setTotalPrecs] = useState<PrecificacaoSalva[]>([]);
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [mounted, setMounted] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.replace('/');
            return;
        }

        async function load() {
            try {
                const [precs, config] = await Promise.all([
                    getPrecificacoes(),
                    getConfig()
                ]);

                setTotalPrecs(precs);
                setMetrics(calcularMetricasDashboard(precs, config));

                // Verificar elegibilidade para feedback (≥3 produtos + ≥2 serviços)
                try {
                    const elegivel = await checkUserFeedbackEligibility();
                    if (elegivel) {
                        setTimeout(() => setShowFeedback(true), 2000);
                    }
                } catch (e) {
                    console.warn('Erro ao checar elegibilidade de feedback:', e);
                }
            } catch (err) {
                console.error('Erro ao carregar dashboard:', err);
            } finally {
                setMounted(true);
            }
        }
        load();
    }, [user, authLoading, router]);

    if (authLoading || !mounted) return null;

    const recentPrecs = totalPrecs.slice(0, 3);

    function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--y', `${e.clientY - rect.top}px`);
    }

    function handleMouseLeave(e: React.MouseEvent<HTMLElement>) {
        const card = e.currentTarget;
        card.style.setProperty('--x', '50%');
        card.style.setProperty('--y', '50%');
    }

    return (
        <div className="dashboard-wrapper animate-fadeIn">
            <OnboardingTour />

            {/* Feedback Inteligente — só aparece quando o usuário realmente usou o app */}
            {showFeedback && (
                <FeedbackModal
                    onClose={() => {
                        setShowFeedback(false);
                        localStorage.setItem('app_feedback_given', 'true');
                    }}
                />
            )}

            <main className="page-content container">
                {/* Hero Section */}
                <header className="hero-section">
                    <div className="user-welcome">
                        <span className="welcome-tag">Barbearia Premium</span>
                        <h2 className="welcome-title">
                            Olá, <span className="text-amber">{user?.nome?.split(' ')[0] || 'Barbeiro'}</span>
                        </h2>
                        <p className="welcome-subtitle">Sua inteligência de precificação está pronta.</p>
                    </div>
                    <div className="hero-actions">
                        <Link href="/categorias" className="btn btn-primary start-btn">
                            <Scissors size={20} />
                            <span>Nova Precificação</span>
                        </Link>
                    </div>
                </header>

                <div className="dashboard-grid">
                    {/* Main Metrics Section */}
                    <section className="metrics-section">
                        <div className="section-header">
                            <h3 className="section-title">Indicadores de Performance</h3>
                        </div>
                        <div className="metrics-grid">
                            <div className="glass-card stat-card hover-effect" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                                <div className="stat-icon-box blue"><DollarSign size={20} /></div>
                                <div className="stat-content">
                                    <span className="stat-label">Ticket Médio</span>
                                    <span className="stat-value">R$ {metrics?.ticketMedio.toFixed(2) || '0,00'}</span>
                                    <span className="stat-trend blue">Valor por serviço</span>
                                </div>
                            </div>

                            <div className="glass-card stat-card hover-effect" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                                <div className="stat-icon-box amber"><Clock size={20} /></div>
                                <div className="stat-content">
                                    <span className="stat-label">Valor da Hora</span>
                                    <span className="stat-value">R$ {metrics?.valorHora.toFixed(2) || '0,00'}</span>
                                    <span className="stat-trend amber">Média por serviço</span>
                                </div>
                            </div>

                            <div className="glass-card stat-card hover-effect" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                                <div className="stat-icon-box green"><TrendingUp size={20} /></div>
                                <div className="stat-content">
                                    <span className="stat-label">Margem Média</span>
                                    <span className="stat-value">{metrics?.margemLucroAcumulada.toFixed(1) || '0'}%</span>
                                    <span className="stat-trend success">Lucro Real</span>
                                </div>
                            </div>

                            <div className="glass-card stat-card hover-effect" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                                <div className="stat-icon-box gold"><Target size={20} /></div>
                                <div className="stat-content">
                                    <span className="stat-label">Markup Médio</span>
                                    <span className="stat-value">{metrics?.markupMedio.toFixed(2) || '0,00'}x</span>
                                    <span className="stat-trend gold">Multiplicador</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Recent Activities Section */}
                    <section className="recent-section">
                        <div className="section-header">
                            <h3 className="section-title">Atividades Recentes</h3>
                            {totalPrecs.length > 0 && (
                                <Link href="/historico" className="btn-link">
                                    Ver Tudo <ChevronRight size={14} />
                                </Link>
                            )}
                        </div>

                        {totalPrecs.length > 0 ? (
                            <div className="recent-list">
                                {recentPrecs.map((item) => (
                                    <Link key={item.id} href={`/resultado/${item.id}`} className="glass-card recent-item hover-effect" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                                        <div className="recent-icon-wrapper">
                                            {item.categoriaNome.toLowerCase().includes('barba') ? <Scissors size={20} /> : <Package size={20} />}
                                        </div>
                                        <div className="recent-info">
                                            <span className="recent-name">{item.categoriaNome}</span>
                                            <span className="recent-date">{new Date(item.criadoEm).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                        <div className="recent-price">
                                            <span className="price-label">Sugerido</span>
                                            <span className="price-val">R$ {item.precoFinal.toFixed(2)}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-card empty-state">
                                <Package size={40} strokeWidth={1} className="empty-icon" />
                                <p>Nenhuma precificação realizada ainda.</p>
                                <Link href="/categorias" className="btn-link-amber">Começar Agora</Link>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <style jsx>{`
                .hero-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                    gap: 24px;
                }
                .hero-actions {
                    display: flex;
                    gap: 12px;
                }
                .welcome-tag {
                    display: inline-block;
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: var(--amber);
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    margin-bottom: 8px;
                    background: var(--amber-dim);
                    padding: 4px 12px;
                    border-radius: var(--radius-full);
                }
                .welcome-title {
                    font-size: 2rem;
                    font-weight: 900;
                    color: var(--text-primary);
                    letter-spacing: -0.03em;
                    margin-bottom: 6px;
                }
                .welcome-subtitle {
                    color: var(--text-secondary);
                    font-weight: 500;
                }
                .text-amber { color: var(--amber); }

                .dashboard-grid { display: grid; gap: 40px; }
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .section-title { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); }

                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }
                .stat-card {
                    padding: 20px;
                    border-radius: var(--radius-lg);
                    display: flex;
                    gap: 16px;
                    align-items: center;
                }

                /* Premium Hover Effects */
                .hover-effect {
                    position: relative;
                    overflow: hidden;
                    --x: 50%;
                    --y: 50%;
                    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease, border-color 0.3s ease;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .hover-effect::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    pointer-events: none;
                    background: radial-gradient(circle at var(--x) var(--y), rgba(255, 255, 255, 0.15), transparent 60%);
                    opacity: 0;
                    transition: opacity 0.4s ease;
                    z-index: 0;
                }

                .hover-effect:hover {
                    transform: translateY(-4px) scale(1.02);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
                    border-color: rgba(255, 200, 50, 0.4);
                }

                .hover-effect:hover::before {
                    opacity: 1;
                }

                .stat-icon-box, .stat-content, .recent-icon-wrapper, .recent-info, .recent-price {
                    position: relative;
                    z-index: 1;
                }
                .stat-icon-box {
                    width: 48px; height: 48px;
                    border-radius: 14px;
                    background: var(--surface-2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-secondary);
                }
                .stat-icon-box.amber { color: var(--amber); background: var(--amber-dim); }
                .stat-icon-box.green { color: var(--accent-green); background: rgba(16, 185, 129, 0.1); }
                .stat-icon-box.blue { color: var(--accent-blue); background: rgba(59, 130, 246, 0.1); }
                .stat-icon-box.gold { color: var(--accent-gold); background: rgba(245, 158, 11, 0.1); }

                .stat-content { display: flex; flex-direction: column; }
                .stat-label { font-size: 0.65rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.1em; }
                .stat-value { font-size: 1.3rem; font-weight: 900; color: var(--text-primary); line-height: 1.2; }
                .stat-trend { font-size: 0.7rem; font-weight: 600; color: var(--text-disabled); }
                .stat-trend.success { color: var(--success); }
                .stat-trend.blue { color: var(--accent-blue); }
                .stat-trend.amber { color: var(--amber); }
                .stat-trend.gold { color: var(--accent-gold); }

                .btn-secondary {
                    background: var(--surface-2);
                    border: 1px solid var(--border);
                    color: var(--text-primary);
                }
                .btn-secondary:hover {
                    background: var(--surface-3);
                    border-color: var(--text-secondary);
                }

                .export-btn {
                    padding: 14px 20px;
                }

                .recent-list { display: grid; gap: 16px; }
                .recent-item {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 16px 20px;
                    border-radius: var(--radius-lg);
                    text-decoration: none;
                }
                .recent-icon-wrapper {
                    width: 48px; height: 48px;
                    border-radius: 14px;
                    background: var(--surface-3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-secondary);
                }
                .recent-info { flex: 1; }
                .recent-name { display: block; font-weight: 800; font-size: 1.05rem; color: var(--text-primary); margin-bottom: 2px; }
                .recent-date { font-size: 0.8rem; color: var(--text-disabled); font-weight: 500; }
                .recent-price { text-align: right; }
                .price-label { display: block; font-size: 0.65rem; font-weight: 800; color: var(--text-disabled); text-transform: uppercase; }
                .price-val { font-weight: 900; color: var(--amber); font-size: 1.2rem; }

                .empty-state { padding: 60px 40px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; border-radius: var(--radius-xl); }
                .empty-icon { color: var(--text-disabled); margin-bottom: 8px; }
                .btn-link-amber { color: var(--amber); font-weight: 800; text-decoration: none; }

                .btn-link { font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; text-decoration: none; transition: var(--transition-fast); }
                .btn-link:hover { color: var(--amber); }

                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    z-index: 1050;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                @media (max-width: 768px) {
                    .hero-section { flex-direction: column; align-items: flex-start; }
                    .hero-actions { width: 100%; flex-direction: column; }
                    .welcome-title { font-size: 1.6rem; }
                    .start-btn, .export-btn { width: 100%; }
                }
            `}</style>
        </div>
    );
}
