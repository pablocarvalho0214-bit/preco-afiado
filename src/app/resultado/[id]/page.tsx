'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPrecificacaoPorId, type PrecificacaoSalva } from '@/lib/storage';
import { formatarMoeda, formatarNumero, calcularCapacidadeProdutiva, calcularCustoProduto } from '@/lib/calculos';
import PageSkeleton from '@/components/PageSkeleton';
import { ChevronDown, ChevronUp, Edit3, RotateCcw } from 'lucide-react';

export default function ResultadoPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [prec, setPrec] = useState<PrecificacaoSalva | null>(null);
    const [mounted, setMounted] = useState(false);

    // Feature 3: preço editável
    const [precoEditado, setPrecoEditado] = useState<string>('');
    const [modoEdicao, setModoEdicao] = useState(false);

    // Feature 2: memória de cálculo expansível
    const [showMemoria, setShowMemoria] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                if (params.id) {
                    const p = await getPrecificacaoPorId(params.id);
                    if (p) {
                        setPrec(p);
                        setPrecoEditado(String(p.precoFinal));
                    }
                }
            } catch (err) {
                console.error("Erro ao carregar resultado:", err);
            } finally {
                setMounted(true);
            }
        }
        load();
    }, [params.id]);

    // Recalcula margem com base no preço ajustado pelo usuário
    const precoAjustadoNum = parseFloat(precoEditado.replace(',', '.')) || 0;

    const calcularMargemAjustada = useCallback((prec: PrecificacaoSalva, novoPreco: number) => {
        if (novoPreco <= 0) return { lucro: 0, margem: 0 };
        const config = prec.config;
        const somaDeducoesPerc =
            (config.percImpostos || 0) +
            (config.percComissoes || 0) +
            (config.percTaxaCartao || 0) +
            (config.percInvestimentos || 0);
        const deducoes = novoPreco * (somaDeducoesPerc / 100);
        const lucro = novoPreco - prec.cutTotal - deducoes;
        const margem = (lucro / novoPreco) * 100;
        return { lucro, margem };
    }, []);

    const isPrecoDiferente = prec != null && Math.abs(precoAjustadoNum - prec.precoFinal) > 0.01;
    const margemAjustada = prec ? calcularMargemAjustada(prec, precoAjustadoNum) : { lucro: 0, margem: 0 };

    const lucroExibido = isPrecoDiferente ? margemAjustada.lucro : (prec?.lucroReal ?? 0);
    const margemExibida = isPrecoDiferente ? margemAjustada.margem : (prec?.percLucroReal ?? 0);

    // Calcula horasReais e breakdownProdutos a partir do config/produtosUsados armazenados
    const horasReais = prec ? calcularCapacidadeProdutiva(prec.config).horasReais : 0;
    const breakdownProdutos = prec
        ? prec.produtosUsados.map(pu => ({
            nome: pu.produto.nome,
            custo: calcularCustoProduto(pu.produto, pu.volumeUsado),
        }))
        : [];

    return (
        <>
            <main className="page-content">
                <div className="container" style={{ maxWidth: '1000px' }}>
                    {!mounted ? (
                        <PageSkeleton />
                    ) : prec ? (
                        <div className="animate-fadeIn">

                            {/* Cabeçalho — preço principal */}
                            <div className="card card-amber" style={{ textAlign: 'center', padding: 32, marginBottom: 20 }}>
                                <p className="text-secondary text-sm">
                                    {prec.itensPacote && prec.itensPacote.length > 0 ? 'Preço do Combo' : 'Preço Final de Venda'}
                                </p>

                                {/* Feature 3: preço editável */}
                                {modoEdicao ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 8 }}>
                                        <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--amber)' }}>R$</span>
                                        <input
                                            type="number"
                                            className="preco-input-edit"
                                            value={precoEditado}
                                            onChange={(e) => setPrecoEditado(e.target.value)}
                                            min={0}
                                            step={1}
                                            autoFocus
                                        />
                                    </div>
                                ) : (
                                    <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginTop: 8, color: isPrecoDiferente ? 'var(--amber)' : 'var(--text-primary)' }}>
                                        {formatarMoeda(isPrecoDiferente ? precoAjustadoNum : prec.precoFinal)}
                                    </h1>
                                )}

                                {isPrecoDiferente && (
                                    <p className="text-secondary text-xs" style={{ marginTop: 4 }}>
                                        Calculado originalmente: {formatarMoeda(prec.precoFinal)}
                                    </p>
                                )}

                                {prec.precoOriginalTotal && prec.precoOriginalTotal > prec.precoFinal && (
                                    <p className="text-secondary text-xs" style={{ marginTop: 12, textDecoration: 'line-through' }}>
                                        Original: {formatarMoeda(prec.precoOriginalTotal)} ({prec.descontoPacotePerc}% off)
                                    </p>
                                )}
                                <p className="text-secondary text-xs" style={{ marginTop: 4 }}>Markup: {prec.markup.toFixed(2)}</p>

                                {/* Botões de ação */}
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
                                    {!modoEdicao ? (
                                        <button className="btn-edit-price" onClick={() => setModoEdicao(true)}>
                                            <Edit3 size={14} /> Ajustar preço
                                        </button>
                                    ) : (
                                        <button className="btn-edit-price" onClick={() => setModoEdicao(false)}>
                                            ✓ Ver resultado
                                        </button>
                                    )}
                                    {isPrecoDiferente && (
                                        <button className="btn-reset-price" onClick={() => {
                                            setPrecoEditado(String(prec.precoFinal));
                                            setModoEdicao(false);
                                        }}>
                                            <RotateCcw size={14} /> Restaurar original
                                        </button>
                                    )}
                                </div>

                                {modoEdicao && (
                                    <p className="hint-text" style={{ marginTop: 12 }}>
                                        💡 Digite um novo preço para simular a margem de lucro resultante.
                                    </p>
                                )}
                            </div>

                            {/* Itens do Pacote (se houver) */}
                            {prec.itensPacote && prec.itensPacote.length > 0 && (
                                <div className="card glass" style={{ marginBottom: 20 }}>
                                    <h3 className="font-bold" style={{ marginBottom: 15, fontSize: '0.9rem', color: 'var(--amber)' }}>SERVIÇOS NO COMBO</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {prec.itensPacote.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                <span>{item.quantidade}x {item.nome}</span>
                                                <span className="text-secondary">{formatarMoeda(item.precoOriginal * item.quantidade)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Lucro e Margem */}
                            <div className="card glass" style={{ marginBottom: 20 }}>
                                <h3 className="font-bold" style={{ marginBottom: 15 }}>
                                    {isPrecoDiferente ? '📊 Margem Simulada' : 'Detalhamento do Lucro'}
                                </h3>
                                {isPrecoDiferente && (
                                    <p className="hint-text" style={{ marginBottom: 12 }}>
                                        Simulação baseada no preço ajustado de {formatarMoeda(precoAjustadoNum)}.
                                    </p>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <span className="text-secondary">Lucro Real (R$)</span>
                                    <span className={lucroExibido >= 0 ? 'text-success font-bold' : 'text-error font-bold'}>
                                        {formatarMoeda(lucroExibido)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className="text-secondary">Margem Real (%)</span>
                                    <span className={margemExibida >= 0 ? 'text-success font-bold' : 'text-error font-bold'}>
                                        {margemExibida.toFixed(2)}%
                                    </span>
                                </div>
                            </div>

                            {/* Estrutura de Custos */}
                            <div className="card glass" style={{ marginBottom: 20 }}>
                                <h3 className="font-bold" style={{ marginBottom: 15 }}>Estrutura de Custos</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                        <span className="text-secondary">Custo Fixo Rateado/Itens</span>
                                        <span>{formatarMoeda(prec.cutTotal - prec.cvUni)}</span>
                                    </div>
                                    {prec.cvUni > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                            <span className="text-secondary">Custo Variável (Produtos)</span>
                                            <span>{formatarMoeda(prec.cvUni)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10, fontWeight: 700 }}>
                                        <span>Custo Total Operacional</span>
                                        <span className="text-amber">{formatarMoeda(prec.cutTotal)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 2: Memória de Cálculo */}
                            <div className="card glass memoria-card" style={{ marginBottom: 20 }}>
                                <button
                                    className="memoria-toggle"
                                    onClick={() => setShowMemoria(!showMemoria)}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: '1.1rem' }}>📋</span>
                                        <span className="font-bold">Memória de Cálculo</span>
                                        <span className="memoria-badge">como chegamos aqui</span>
                                    </span>
                                    {showMemoria ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>

                                {showMemoria && (
                                    <div className="memoria-content animate-fadeIn">
                                        <p className="memoria-intro">
                                            Entenda de forma simples como cada gasto e margem afetam o seu preço final.
                                        </p>

                                        <div className="memoria-section">
                                            <p className="memoria-section-title">⏱ 1. SEU RITMO DE TRABALHO</p>
                                            <div className="memoria-row">
                                                <span className="memoria-label">Tempo produtivo real no mês</span>
                                                <span className="memoria-value">{formatarNumero(horasReais, 1)}h</span>
                                            </div>
                                            <p className="memoria-explain">
                                                É o tempo que você e sua equipe realmente passam atendendo, já descontando furos na agenda.
                                            </p>
                                        </div>

                                        <div className="memoria-divider" />

                                        <div className="memoria-section">
                                            <p className="memoria-section-title">🏢 2. PESO DO ESPAÇO (ALUGUEL, LUZ, ETC)</p>
                                            <div className="memoria-row">
                                                <span className="memoria-label">Fração das contas p/ este serviço</span>
                                                <span className="memoria-value">{formatarMoeda(prec.cfRateado)}</span>
                                            </div>
                                            <p className="memoria-explain">
                                                Quanto este atendimento "paga" das suas despesas fixas (seu custo fixo por hora hoje é {formatarMoeda(prec.cfUni)}).
                                            </p>
                                        </div>

                                        {prec.cvUni > 0 && (
                                            <>
                                                <div className="memoria-divider" />
                                                <div className="memoria-section">
                                                    <p className="memoria-section-title">🧴 3. MATERIAIS USADOS</p>
                                                    {breakdownProdutos.map((bp, i) => (
                                                        <div key={i} className="memoria-row">
                                                            <span className="memoria-label">{bp.nome}</span>
                                                            <span className="memoria-value">{formatarMoeda(bp.custo)}</span>
                                                        </div>
                                                    ))}
                                                    <div className="memoria-row highlight">
                                                        <span className="memoria-label">Total em produtos</span>
                                                        <span className="memoria-value">{formatarMoeda(prec.cvUni)}</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div className="memoria-divider" />

                                        <div className="memoria-section">
                                            <p className="memoria-section-title">📈 4. SEGURANÇA E CRESCIMENTO (MARKUP)</p>
                                            <div className="memoria-row">
                                                <span className="memoria-label">Custo Total (Fixo + Produtos)</span>
                                                <span className="memoria-value">{formatarMoeda(prec.cutTotal)}</span>
                                            </div>
                                            <div className="memoria-row">
                                                <span className="memoria-label">Multiplicador de Segurança</span>
                                                <span className="memoria-value">{prec.markup.toFixed(2)}x</span>
                                            </div>
                                            <p className="memoria-explain">
                                                Usamos este multiplicador (Markup) para garantir que você pague os impostos ({prec.config.percImpostos}%),
                                                comissões ({prec.config.percComissoes}%), taxas de cartão ({prec.config.percTaxaCartao}%),
                                                invista no negócio ({prec.config.percInvestimentos}%) e ainda tenha seu lucro.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button className="btn btn-primary btn-full" style={{ marginTop: 10 }} onClick={() => router.push('/dashboard')}>
                                Voltar ao Início
                            </button>
                        </div>
                    ) : (
                        <div className="empty-state card glass">
                            <p>Resultado não encontrado.</p>
                            <button className="btn btn-ghost" onClick={() => router.push('/dashboard')}>Voltar</button>
                        </div>
                    )}
                </div>
            </main>

            <style jsx>{`
                .preco-input-edit {
                    background: rgba(255,255,255,0.05);
                    border: 2px solid var(--amber);
                    border-radius: 12px;
                    padding: 8px 16px;
                    color: var(--amber);
                    font-size: 2.4rem;
                    font-weight: 900;
                    width: 200px;
                    text-align: center;
                    outline: none;
                }
                .preco-input-edit::-webkit-inner-spin-button,
                .preco-input-edit::-webkit-outer-spin-button { -webkit-appearance: none; }

                .btn-edit-price {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: rgba(212,175,55,0.12);
                    border: 1px solid rgba(212,175,55,0.4);
                    border-radius: 20px;
                    color: var(--amber);
                    font-size: 0.82rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-edit-price:hover { background: rgba(212,175,55,0.2); }

                .btn-reset-price {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 20px;
                    color: var(--text-secondary);
                    font-size: 0.82rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-reset-price:hover { background: rgba(255,255,255,0.08); }

                .hint-text {
                    font-size: 0.78rem;
                    color: var(--text-secondary);
                    font-style: italic;
                }

                /* Memória de Cálculo */
                .memoria-card { padding: 0; overflow: hidden; }

                .memoria-toggle {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: var(--text-primary);
                }
                .memoria-toggle:hover { background: rgba(255,255,255,0.02); }

                .memoria-badge {
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: var(--amber);
                    background: rgba(212,175,55,0.1);
                    border: 1px solid rgba(212,175,55,0.2);
                    border-radius: 10px;
                    padding: 2px 8px;
                    letter-spacing: 0.03em;
                    text-transform: uppercase;
                }

                .memoria-content {
                    padding: 0 24px 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                    border-top: 1px solid var(--border);
                }

                .memoria-intro {
                    font-size: 0.82rem;
                    color: var(--text-secondary);
                    font-style: italic;
                    margin: 16px 0 4px;
                }

                .memoria-section {
                    padding: 16px 0;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .memoria-section-title {
                    font-size: 0.72rem;
                    font-weight: 800;
                    color: var(--text-secondary);
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }

                .memoria-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.9rem;
                    gap: 12px;
                }

                .memoria-row.highlight {
                    background: rgba(212,175,55,0.06);
                    border-radius: 8px;
                    padding: 8px 10px;
                    border: 1px solid rgba(212,175,55,0.12);
                }

                .memoria-label {
                    color: var(--text-secondary);
                    flex: 1;
                }

                .memoria-value {
                    color: var(--text-primary);
                    font-weight: 700;
                    font-size: 0.95rem;
                    white-space: nowrap;
                }

                .memoria-explain {
                    font-size: 0.76rem;
                    color: var(--text-disabled);
                    font-style: italic;
                    margin-top: -4px;
                    line-height: 1.5;
                }

                .memoria-divider {
                    height: 1px;
                    background: var(--border);
                }
            `}</style>
        </>
    );
}
