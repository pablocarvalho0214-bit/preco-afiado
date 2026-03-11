'use client';

import Link from 'next/link';
import { Settings, Package, Scissors, CheckCircle, Circle } from 'lucide-react';

interface SetupChecklistProps {
    temConfig: boolean;
    temProduto: boolean;
    temPrecificacao: boolean;
    onDismiss: () => void;
}

export default function SetupChecklist({
    temConfig,
    temProduto,
    temPrecificacao,
    onDismiss
}: SetupChecklistProps) {
    const passos = [
        {
            done: temConfig,
            icon: Settings,
            label: 'Configure seus custos e margens',
            href: '/configuracoes',
            cta: 'Ir para Ajustes',
        },
        {
            done: temProduto,
            icon: Package,
            label: 'Cadastre pelo menos 1 produto',
            href: '/produtos/novo',
            cta: 'Cadastrar Produto',
        },
        {
            done: temPrecificacao,
            icon: Scissors,
            label: 'Crie sua primeira precificação',
            href: '/categorias',
            cta: 'Calcular Preço',
        },
    ];

    const concluidos = passos.filter(p => p.done).length;
    const todos = passos.length;
    const progresso = Math.round((concluidos / todos) * 100);
    const tudo_feito = concluidos === todos;

    if (tudo_feito) return null;

    return (
        <div className="checklist-card glass animate-fadeIn">
            <div className="checklist-header">
                <div>
                    <p className="checklist-eyebrow">PRIMEIROS PASSOS</p>
                    <h3 className="checklist-title">Configure seu negócio</h3>
                </div>
                <button className="checklist-dismiss" onClick={onDismiss} aria-label="Fechar">×</button>
            </div>

            <div className="checklist-progress-bar">
                <div className="checklist-progress-fill" style={{ width: `${progresso}%` }} />
            </div>
            <p className="checklist-progress-label">{concluidos}/{todos} concluídos</p>

            <div className="checklist-items">
                {passos.map((p, i) => {
                    const Icon = p.icon;
                    return (
                        <div key={i} className={`checklist-item${p.done ? ' done' : ''}`}>
                            <div className="check-icon-wrapper">
                                {p.done ? <CheckCircle size={18} className="text-success" /> : <Circle size={18} />}
                            </div>
                            <div className="item-content-flex">
                                <div className="item-icon-small">
                                    <Icon size={16} />
                                </div>
                                <span className="checklist-text">{p.label}</span>
                            </div>
                            {!p.done && (
                                <Link href={p.href} className="checklist-cta">
                                    {p.cta}
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
                .checklist-card {
                    border-radius: var(--radius-lg);
                    padding: 24px;
                    margin-bottom: 28px;
                    border: 1px solid var(--amber) !important;
                    background: var(--surface-1) !important;
                    box-shadow: var(--shadow-premium);
                }
                .checklist-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }
                .checklist-eyebrow {
                    font-size: 0.625rem;
                    font-weight: 800;
                    letter-spacing: 0.15em;
                    color: var(--amber);
                    margin-bottom: 4px;
                }
                .checklist-title {
                    font-size: 1rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }
                .checklist-dismiss {
                    background: none;
                    border: none;
                    color: var(--text-disabled);
                    font-size: 1.25rem;
                    cursor: pointer;
                    line-height: 1;
                    padding: 0 4px;
                    transition: color 0.2s;
                }
                .checklist-dismiss:hover { color: #fff; }
                
                .checklist-progress-bar {
                    height: 4px;
                    background: var(--border);
                    border-radius: 99px;
                    overflow: hidden;
                    margin-bottom: 8px;
                }
                .checklist-progress-fill {
                    height: 100%;
                    background: var(--amber);
                    border-radius: 99px;
                    transition: width 0.5s ease;
                    box-shadow: 0 0 10px var(--amber-glow);
                }
                .checklist-progress-label {
                    font-size: 0.7rem;
                    color: var(--text-secondary);
                    margin-bottom: 20px;
                    font-weight: 600;
                }
                
                .checklist-items { display: flex; flex-direction: column; gap: 12px; }
                .checklist-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px;
                    background: var(--surface-2);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border);
                    transition: all 0.3s ease;
                }
                .checklist-item.done {
                    opacity: 0.4;
                    background: transparent;
                    border-color: transparent;
                }
                
                .check-icon-wrapper { display: flex; align-items: center; justify-content: center; color: var(--text-disabled); }
                .item-content-flex { display: flex; align-items: center; gap: 10px; flex: 1; }
                .item-icon-small { color: var(--amber); display: flex; }
                
                .checklist-text {
                    font-size: 0.875rem;
                    color: var(--text-primary);
                    font-weight: 500;
                }
                .checklist-cta {
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: var(--amber);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid transparent;
                    transition: all 0.2s;
                }
                .checklist-cta:hover {
                    border-color: var(--amber);
                }
                .text-success { color: #10B981; }
            `}</style>
        </div>
    );
}
