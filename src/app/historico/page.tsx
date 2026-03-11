'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPrecificacoes, type PrecificacaoSalva } from '@/lib/storage';
import { formatarMoeda } from '@/lib/calculos';
import PageSkeleton from '@/components/PageSkeleton';
import { History, ChevronRight, Scissors, Calendar, Search } from 'lucide-react';

export default function HistoricoPage() {
    const [historico, setHistorico] = useState<PrecificacaoSalva[]>([]);
    const [mounted, setMounted] = useState(false);
    const [filtro, setFiltro] = useState('');
    const router = useRouter();

    useEffect(() => {
        async function load() {
            try {
                const h = await getPrecificacoes();
                setHistorico(h.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()));
            } catch (err) {
                console.error("Erro ao carregar histórico:", err);
            } finally {
                setMounted(true);
            }
        }
        load();
    }, []);

    const historicoFiltrado = historico.filter(p =>
        p.nomeServico.toLowerCase().includes(filtro.toLowerCase()) ||
        p.categoriaNome.toLowerCase().includes(filtro.toLowerCase())
    );

    if (!mounted) {
        return (
            <div className="min-h-screen bg-black">
                <main className="page-content">
                    <div className="container">
                        <PageSkeleton />
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="history-wrapper">
            <main className="page-content">
                <div className="container" style={{ maxWidth: '800px' }}>

                    {/* Header & Busca */}
                    <header className="history-header animate-fadeIn">
                        <p className="section-title">REGISTROS SALVOS</p>
                        <h2 className="page-main-title">Suas Precificações</h2>

                        <div className="search-box glass" style={{ marginTop: 24 }}>
                            <Search size={18} className="text-disabled" />
                            <input
                                type="text"
                                placeholder="Buscar serviço ou categoria..."
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </header>

                    {/* Lista de Itens */}
                    <div className="history-list animate-slideUp" style={{ marginTop: 32 }}>
                        {historicoFiltrado.length === 0 ? (
                            <div className="card glass empty-card">
                                <History size={48} className="text-disabled" />
                                <p>Nenhum registro encontrado.</p>
                                {filtro && <button onClick={() => setFiltro('')} className="btn-text" style={{ marginTop: 8 }}>Limpar busca</button>}
                            </div>
                        ) : (
                            historicoFiltrado.map((p) => (
                                <Link key={p.id} href={`/resultado/${p.id}`} className="history-item-premium glass card-hover">
                                    <div className="item-icon-circle">
                                        <span className="item-emoji-display">{p.categoriaEmoji || '✂️'}</span>
                                    </div>

                                    <div className="item-details">
                                        <h3 className="item-title">{p.nomeServico}</h3>
                                        <div className="item-meta">
                                            <span className="meta-tag">{p.categoriaNome}</span>
                                            <span className="meta-dot"></span>
                                            <div className="meta-date">
                                                <Calendar size={12} />
                                                {new Date(p.criadoEm).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="item-price-box">
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <span className="price-label" style={{ color: 'var(--success)' }}>
                                                    LUCRO REAL ({p.percLucroReal?.toFixed(0) || 0}%)
                                                </span>
                                                <div className="price-value" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                                    {formatarMoeda(p.lucroReal || 0)}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span className="price-label">PREÇO FINAL</span>
                                                <div className="price-value">{formatarMoeda(p.precoFinal)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="item-arrow">
                                        <ChevronRight size={20} />
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </main>

            <style jsx>{`
                .page-main-title { font-size: 2rem; font-weight: 800; color: var(--text-primary); line-height: 1.1; }
                
                .search-box {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 20px;
                    border-radius: var(--radius-md);
                }
                .search-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: var(--text-primary);
                    font-size: 0.95rem;
                    outline: none;
                }
                .search-input::placeholder { color: var(--text-disabled); }

                .history-list { display: flex; flex-direction: column; gap: 16px; }

                .history-item-premium {
                    display: flex;
                    align-items: center;
                    padding: 20px;
                    border-radius: var(--radius-lg);
                    gap: 20px;
                    transition: all 0.3s ease;
                }
                
                .item-icon-circle {
                    width: 56px;
                    height: 56px;
                    background: var(--surface-2);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.75rem;
                    flex-shrink: 0;
                    border: 1px solid var(--border);
                }

                .item-details { flex: 1; min-width: 0; }
                .item-title { 
                    font-size: 1.1rem; 
                    font-weight: 700; 
                    color: var(--text-primary); 
                    margin-bottom: 6px; 
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .item-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
                .meta-tag { font-size: 0.65rem; font-weight: 800; color: var(--amber); text-transform: uppercase; letter-spacing: 0.05em; }
                .meta-dot { width: 4px; height: 4px; background: var(--text-disabled); border-radius: 50%; }
                .meta-date { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--text-secondary); }

                .item-price-box { text-align: right; margin-left: 10px; }
                .price-label { font-size: 0.55rem; font-weight: 800; color: var(--text-disabled); display: block; margin-bottom: 2px; }
                .price-value { font-size: 1.15rem; font-weight: 800; color: var(--amber); }

                .item-arrow { color: var(--text-disabled); opacity: 0.5; transition: all 0.3s; }
                .history-item-premium:hover .item-arrow { color: var(--amber); opacity: 1; transform: translateX(4px); }

                .empty-card { 
                    padding: 60px 40px; 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    gap: 16px; 
                    color: var(--text-disabled);
                    text-align: center;
                }
                .btn-text { color: var(--amber); font-weight: 700; font-size: 0.85rem; }

                @media (max-width: 600px) {
                    .history-item-premium { padding: 16px; gap: 12px; }
                    .item-icon-circle { width: 48px; height: 48px; font-size: 1.5rem; border-radius: 12px; }
                    .item-title { font-size: 1rem; }
                    .price-value { font-size: 1rem; }
                    .item-arrow { display: none; }
                }
            `}</style>
        </div>
    );
}
