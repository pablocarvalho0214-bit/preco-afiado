'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Package, Calculator, Star, Activity, ArrowUpRight, Shield, Zap, MessageSquare, TrendingUp, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminStats, StatsAdmin, ADMIN_EMAILS } from '@/lib/storage';
import { useRouter } from 'next/navigation';

export default function AdminStatsPage() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<StatsAdmin | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        if (!user || !ADMIN_EMAILS.includes(user.email)) {
            router.replace('/dashboard');
            return;
        }
        async function load() {
            try {
                const s = await getAdminStats();
                if (!s) {
                    setError("Usuário não autorizado ou não encontrado.");
                } else if ('error' in s) {
                    setError(s.error);
                } else {
                    setStats(s);
                }
            } catch (err) {
                console.error("Erro ao carregar stats:", err);
                setError("Ocorreu um erro inesperado ao carregar os dados.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <div style={{ width: 48, height: 48, border: '3px solid rgba(212,175,55,0.2)', borderTopColor: '#d4af37', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
                <Activity size={48} style={{ color: 'var(--text-disabled)', marginBottom: 20 }} />
                <h3 style={{ color: 'var(--text-primary)', marginBottom: 12 }}>Ops! Algo deu errado</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>{error}</p>
                <button
                    onClick={() => { setError(null); setLoading(true); window.location.reload(); }}
                    style={{ background: 'var(--amber)', color: '#000', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    if (!stats) return null;

    const ratingPercent = (stats.mediaRating / 5) * 100;
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference - (ratingPercent / 100) * circumference;

    const feedbackBorderColor = (rating: number) => {
        if (rating >= 4) return '#10b981';
        if (rating >= 3) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="dashboard-wrapper animate-fadeIn">
            <main className="page-content container">

                {/* Header Premium */}
                <header style={{ marginBottom: 48 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.2em', background: 'var(--amber-dim)', padding: '4px 14px', borderRadius: 20 }}>
                            Dashboard Admin • Tempo Real
                        </span>
                    </div>
                    <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                        Business <span style={{ color: 'var(--amber)' }}>Intelligence</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: 8, fontWeight: 500 }}>
                        Visão completa da plataforma Preço Afiado
                    </p>
                </header>

                {/* KPI Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 48 }}>
                    {[
                        { title: 'Usuários Totais', val: stats.totalUsuarios, icon: Users, gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', glow: 'rgba(59,130,246,0.15)', desc: 'Base consolidada' },
                        { title: 'Novos Hoje', val: stats.novosHoje, icon: ArrowUpRight, gradient: 'linear-gradient(135deg, #10b981, #059669)', glow: 'rgba(16,185,129,0.15)', desc: 'Últimas 24h', badge: 'Crescendo' },
                        { title: 'Online Agora', val: stats.usuariosOnline, icon: Activity, gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', glow: 'rgba(245,158,11,0.15)', desc: 'Ativos (15 min)', badge: 'Live' },
                        { title: 'Produtos', val: stats.totalProdutos, icon: Package, gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', glow: 'rgba(139,92,246,0.15)', desc: 'No ecossistema' },
                        { title: 'Precificações', val: stats.totalServicos, icon: Calculator, gradient: 'linear-gradient(135deg, #f97316, #ea580c)', glow: 'rgba(249,115,22,0.15)', desc: 'Cálculos feitos' },
                        { title: 'Rating Global', val: stats.mediaRating.toFixed(1), icon: Star, gradient: 'linear-gradient(135deg, #d4af37, #b8860b)', glow: 'rgba(212,175,55,0.15)', desc: '/ 5.0' },
                    ].map((card, idx) => (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.06, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                            style={{
                                background: 'var(--surface-1)',
                                borderRadius: 20,
                                padding: '28px 24px',
                                position: 'relative',
                                overflow: 'hidden',
                                border: '1px solid var(--border)',
                                cursor: 'default',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                            }}
                            whileHover={{ y: -4, boxShadow: `0 20px 40px ${card.glow}` }}
                        >
                            {/* Glow de fundo */}
                            <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: card.glow, filter: 'blur(40px)', pointerEvents: 'none' }} />

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative', zIndex: 1 }}>
                                <div style={{ width: 52, height: 52, borderRadius: 16, background: card.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${card.glow}` }}>
                                    <card.icon size={24} color="#fff" />
                                </div>
                                {card.badge && (
                                    <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', padding: '4px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                                        ● {card.badge}
                                    </span>
                                )}
                            </div>

                            <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6, position: 'relative', zIndex: 1 }}>{card.title}</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, position: 'relative', zIndex: 1 }}>
                                <span style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>{card.val}</span>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-disabled)' }}>{card.desc}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Seção de Gráficos */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 48 }}>

                    {/* Gráfico de Barras — Distribuição por Perfil */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ background: 'var(--surface-1)', borderRadius: 24, padding: 40, border: '1px solid var(--border)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                            <BarChart3 size={22} style={{ color: 'var(--amber)' }} />
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)' }}>Distribuição de Usuários</h3>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 40, fontWeight: 500 }}>Comparativo entre perfis de negócio</p>

                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 48, height: 220, justifyContent: 'center', borderBottom: '2px solid var(--border)', paddingBottom: 8 }}>
                            {/* Barra Autônomos */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: 120 }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#3b82f6', marginBottom: 8 }}>{stats.distribuicao.autonomo}</span>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max((stats.distribuicao.autonomo / Math.max(stats.totalUsuarios, 1)) * 200, 8)}px` }}
                                    transition={{ duration: 1, ease: [0.23, 1, 0.32, 1], delay: 0.5 }}
                                    style={{ width: '100%', background: 'linear-gradient(to top, #1d4ed8, #60a5fa)', borderRadius: '12px 12px 4px 4px', boxShadow: '0 8px 24px rgba(59,130,246,0.25)' }}
                                />
                            </div>

                            {/* Barra Empresários */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: 120 }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b', marginBottom: 8 }}>{stats.distribuicao.empresario}</span>
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max((stats.distribuicao.empresario / Math.max(stats.totalUsuarios, 1)) * 200, 8)}px` }}
                                    transition={{ duration: 1, ease: [0.23, 1, 0.32, 1], delay: 0.7 }}
                                    style={{ width: '100%', background: 'linear-gradient(to top, #d97706, #fbbf24)', borderRadius: '12px 12px 4px 4px', boxShadow: '0 8px 24px rgba(245,158,11,0.25)' }}
                                />
                            </div>
                        </div>

                        {/* Legenda */}
                        <div style={{ display: 'flex', gap: 24, marginTop: 20, justifyContent: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 12, height: 12, borderRadius: 4, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }} />
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Autônomos ({((stats.distribuicao.autonomo / Math.max(stats.totalUsuarios, 1)) * 100).toFixed(0)}%)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 12, height: 12, borderRadius: 4, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }} />
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Empresários ({((stats.distribuicao.empresario / Math.max(stats.totalUsuarios, 1)) * 100).toFixed(0)}%)</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Gráfico Gauge — Rating Médio */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{ background: 'var(--surface-1)', borderRadius: 24, padding: 40, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <h3 style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', marginBottom: 24 }}>Satisfação Global</h3>

                        <div style={{ position: 'relative', width: 140, height: 140 }}>
                            <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="70" cy="70" r="54" fill="none" stroke="var(--border)" strokeWidth="12" />
                                <motion.circle
                                    cx="70" cy="70" r="54" fill="none"
                                    stroke="url(#ratingGradient)"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset }}
                                    transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1], delay: 0.6 }}
                                />
                                <defs>
                                    <linearGradient id="ratingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#d4af37" />
                                        <stop offset="100%" stopColor="#f59e0b" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{stats.mediaRating.toFixed(1)}</span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-disabled)' }}>de 5.0</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 4, marginTop: 20 }}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={18} fill={s <= Math.round(stats.mediaRating) ? '#d4af37' : 'none'} style={{ color: s <= Math.round(stats.mediaRating) ? '#d4af37' : 'var(--border)' }} />
                            ))}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginTop: 8, fontWeight: 600 }}>
                            {(stats.feedbacks?.length || 0)} avaliações
                        </p>
                    </motion.div>
                </div>

                {/* Painel Admin Exclusivo */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        background: 'linear-gradient(135deg, #18181b, #27272a)',
                        borderRadius: 24,
                        padding: '40px 48px',
                        marginBottom: 48,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 32,
                        border: '1px solid rgba(255,255,255,0.06)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'radial-gradient(circle at 80% 50%, rgba(212,175,55,0.08), transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(212,175,55,0.15)', flexShrink: 0 }}>
                        <Shield size={28} style={{ color: '#d4af37' }} />
                    </div>
                    <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', marginBottom: 6 }}>Painel Administrativo Exclusivo</h3>
                        <p style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: 500, marginBottom: 12 }}>Dados extraídos diretamente do Supabase com fidedignidade total.</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {ADMIN_EMAILS.map(email => (
                                <span key={email} style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', color: '#d4d4d8', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    {email.split('@')[0]}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Voice of Client — Feedbacks Premium */}
                <section style={{ marginBottom: 60 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                                <MessageSquare size={24} style={{ color: 'var(--amber)' }} />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>Voice of Client</h3>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Monitoramento de satisfação e qualidade do serviço</p>
                        </div>
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', padding: '6px 16px', borderRadius: 20, background: 'var(--surface-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                            {(stats.feedbacks?.length || 0)} Respostas
                        </span>
                    </div>

                    {stats.feedbacks && stats.feedbacks.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 20 }}>
                            {stats.feedbacks.map((f, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 + i * 0.08 }}
                                    style={{
                                        background: 'var(--surface-1)',
                                        borderRadius: 20,
                                        padding: 28,
                                        border: '1px solid var(--border)',
                                        borderLeft: `4px solid ${feedbackBorderColor(f.rating)}`,
                                        transition: 'transform 0.2s',
                                        cursor: 'default',
                                    }}
                                >
                                    {/* Header do feedback */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', gap: 3 }}>
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} size={18} fill={s <= f.rating ? '#d4af37' : 'none'} style={{ color: s <= f.rating ? '#d4af37' : 'var(--border)' }} />
                                            ))}
                                        </div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-disabled)', fontVariantNumeric: 'tabular-nums' }}>
                                            {f.criadoEm ? new Date(f.criadoEm).toLocaleDateString('pt-BR') : '—'}
                                        </span>
                                    </div>

                                    {/* Respostas */}
                                    <div style={{ display: 'grid', gap: 14 }}>
                                        <div>
                                            <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-disabled)' }}>Custos</span>
                                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{f.q1}</p>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-disabled)' }}>Interface</span>
                                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{f.q2}</p>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-disabled)' }}>Recomendaria?</span>
                                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{f.q3}</p>
                                        </div>
                                        <div>
                                            <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-disabled)' }}>Chatbot</span>
                                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{f.q4}</p>
                                        </div>
                                        {f.q5 && (
                                            <div style={{ marginTop: 4, padding: 16, borderRadius: 14, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                                                <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-disabled)', display: 'block', marginBottom: 4 }}>Comentário</span>
                                                <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.5 }}>"{f.q5}"</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ background: 'var(--surface-1)', borderRadius: 24, padding: '80px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, border: '1px solid var(--border)' }}>
                            <Star size={48} style={{ color: 'var(--text-disabled)', opacity: 0.4 }} />
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-disabled)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Aguardando as primeiras avaliações dos clientes.</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)' }}>O feedback será solicitado automaticamente após o uso do app (≥3 produtos + ≥2 serviços).</p>
                        </div>
                    )}
                </section>

            </main>

            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                @media (max-width: 768px) {
                    main { padding: 16px !important; }
                }
                @media (max-width: 900px) {
                    div[style*="grid-template-columns: 2fr 1fr"] {
                        grid-template-columns: 1fr !important;
                    }
                    div[style*="grid-template-columns: repeat(auto-fit, minmax(380px"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
