'use client';


import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getUsuarioAtual, getProdutos, getConfig, salvarPrecificacao, getPrecificacaoPorId, getPrecificacoes, type PrecificacaoSalva } from '@/lib/storage';
import { getCategoriaById } from '@/lib/categorias';
import type { Produto, ProdutoUsado, ConfiguracaoUsuario } from '@/lib/calculos';
import { calcularPrecoFinal, calcularCustoProduto, formatarMoeda, formatarNumero } from '@/lib/calculos';
import PageSkeleton from '@/components/PageSkeleton';
import StepHint from '@/components/StepHint';

function PrecificarContent() {
    const params = useParams<{ categoria: string }>();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [step, setStep] = useState<'produtos' | 'config' | 'resultado'>('produtos');

    const [todosProdutos, setTodosProdutos] = useState<Produto[]>([]);
    const [produtosUsados, setProdutosUsados] = useState<ProdutoUsado[]>([]);
    const [config, setConfig] = useState<ConfiguracaoUsuario | null>(null);
    const [nomeServico, setNomeServico] = useState('');

    const [volsInput, setVolsInput] = useState<Record<string, string>>({});
    const [configInput, setConfigInput] = useState<Record<string, string>>({});

    const [resultado, setResultado] = useState<ReturnType<typeof calcularPrecoFinal> | null>(null);
    const [salvando, setSalvando] = useState(false);
    const [salvo, setSalvo] = useState(false);
    const [minhasPrecs, setMinhasPrecs] = useState<PrecificacaoSalva[]>([]);
    const [itensPacote, setItensPacote] = useState<{ precificacaoId: string; quantidade: number; nome: string; precoOriginal: number; custoOriginal: number }[]>([]);

    // Novas states para simulação interativa
    const [precoEditado, setPrecoEditado] = useState<string>('');
    const [modoEdicao, setModoEdicao] = useState(false);
    const [showMemoria, setShowMemoria] = useState(false);

    const categoria = getCategoriaById(params.categoria ?? '');
    const isPacote = categoria?.id === 'pacote' ||
        params.categoria?.toLowerCase().includes('pacote') ||
        params.categoria?.toLowerCase().includes('combo') ||
        nomeServico.toLowerCase().includes('pacote') ||
        nomeServico.toLowerCase().includes('combo');

    useEffect(() => {
        async function load() {
            try {
                const user = await getUsuarioAtual();
                if (!user) { router.replace('/'); return; }
                if (!categoria) { router.replace('/categorias'); return; }

                const [prods, confDefault, precs] = await Promise.all([
                    getProdutos(),
                    getConfig(),
                    getPrecificacoes()
                ]);

                setTodosProdutos(prods);
                setMinhasPrecs(precs);

                const editId = searchParams?.get('edit');
                if (editId) {
                    const precSalva = await getPrecificacaoPorId(editId);
                    if (precSalva) {
                        setConfig(precSalva.config);
                        setNomeServico(precSalva.nomeServico);
                        const produtosAtualizados = precSalva.produtosUsados.map(pu => {
                            const produtoAtual = prods.find(p => p.id === pu.produto.id);
                            return { produto: produtoAtual ?? pu.produto, volumeUsado: pu.volumeUsado };
                        });
                        setProdutosUsados(produtosAtualizados);
                        const vi: Record<string, string> = {};
                        precSalva.produtosUsados.forEach(pu => { vi[pu.produto.id] = String(pu.volumeUsado); });
                        setVolsInput(vi);
                        // Restaurar itens do pacote ao editar combo
                        if (precSalva.itensPacote && precSalva.itensPacote.length > 0) {
                            setItensPacote(precSalva.itensPacote);
                        }
                        const c = precSalva.config;
                        setConfigInput({
                            custoFixoTotal: String(c.custoFixoTotal),
                            percImpostos: String(c.percImpostos).replace('.', ','),
                            percComissoes: String(c.percComissoes).replace('.', ','),
                            percTaxaCartao: String(c.percTaxaCartao).replace('.', ','),
                            percInvestimentos: String(c.percInvestimentos).replace('.', ','),
                            percLucroDesejado: String(c.percLucroDesejado).replace('.', ','),
                            numPessoas: String(c.numPessoas),
                            horasDiarias: String(c.horasDiarias),
                            diasTrabalhadosMes: String(c.diasTrabalhadosMes),
                            percProdutividade: String(c.percProdutividade).replace('.', ','),
                            tempoServicoMinutos: String(c.tempoServicoMinutos || 60),
                            descontoPacotePerc: String(precSalva.descontoPacotePerc || 0).replace('.', ','),
                        });
                    }
                } else {
                    const nomeCustom = searchParams?.get('nome');
                    setConfig(confDefault);
                    setNomeServico(nomeCustom || categoria.nome);
                    if (confDefault) {
                        setConfigInput({
                            custoFixoTotal: String(confDefault.custoFixoTotal),
                            percImpostos: String(confDefault.percImpostos).replace('.', ','),
                            percComissoes: String(confDefault.percComissoes).replace('.', ','),
                            percTaxaCartao: String(confDefault.percTaxaCartao).replace('.', ','),
                            percInvestimentos: String(confDefault.percInvestimentos).replace('.', ','),
                            percLucroDesejado: String(confDefault.percLucroDesejado).replace('.', ','),
                            numPessoas: String(confDefault.numPessoas),
                            horasDiarias: String(confDefault.horasDiarias),
                            diasTrabalhadosMes: String(confDefault.diasTrabalhadosMes),
                            percProdutividade: String(confDefault.percProdutividade).replace('.', ','),
                            tempoServicoMinutos: '60',
                            descontoPacotePerc: '0',
                        });
                    }
                }
            } catch (err) {
                console.error("Erro ao carregar dados de precificação:", err);
            } finally {
                setMounted(true);
            }
        }
        load();
    }, [router, categoria, searchParams]);

    // Lógica compartilhada de parsing/masking (removida para brevidade no render, mantida no código final)
    function parseBRL(val: string): number {
        const cleaned = val.replace(/\./g, '').replace(',', '.');
        return parseFloat(cleaned) || 0;
    }
    function maskBRL(val: string): string {
        let v = val.replace(/[^\d,]/g, '');
        const parts = v.split(',');
        let intPart = parts[0];
        const decPart = parts.length > 1 ? ',' + parts[1].substring(0, 2) : '';
        intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return intPart + decPart;
    }

    function handleConfigChange(key: keyof ConfiguracaoUsuario, val: string) {
        const displayVal = key === 'custoFixoTotal' ? maskBRL(val) : val;
        if (key === 'custoFixoTotal') setConfigInput(prev => ({ ...prev, [key]: displayVal }));
        let n: number | boolean;
        if (val === 'true') n = true;
        else if (val === 'false') n = false;
        else if (key === 'custoFixoTotal') n = parseBRL(val);
        else {
            let cleaned = val.replace(/[^\d.,]/g, '');
            const parts = cleaned.split(/[.,]/);
            if (parts.length > 2) cleaned = parts[0] + ',' + parts.slice(1).join('');
            setConfigInput(prev => ({ ...prev, [key]: cleaned }));
            n = parseBRL(cleaned);
        }
        setConfig((prev) => prev ? { ...prev, [key]: n } : prev);
    }

    function toggleProduto(prod: Produto) {
        setProdutosUsados((prev) => {
            const existe = prev.find((p) => p.produto.id === prod.id);
            if (existe) return prev.filter((p) => p.produto.id !== prod.id);
            setVolsInput(v => ({ ...v, [prod.id]: '1' }));
            return [...prev, { produto: prod, volumeUsado: 1 }];
        });
    }
    function setVolume(prodId: string, vol: string) {
        setVolsInput(v => ({ ...v, [prodId]: vol }));
        const n = parseFloat(vol.replace(',', '.'));
        setProdutosUsados((prev) => prev.map((pu) => pu.produto.id === prodId ? { ...pu, volumeUsado: isNaN(n) ? 0 : n } : pu));
    }
    function toggleItemPacote(p: PrecificacaoSalva) {
        setItensPacote(prev => {
            const existe = prev.find(item => item.precificacaoId === p.id);
            if (existe) return prev.filter(item => item.precificacaoId !== p.id);
            return [...prev, { precificacaoId: p.id, quantidade: 1, nome: p.nomeServico, precoOriginal: p.precoFinal, custoOriginal: p.cfRateado + p.cvUni }];
        });
    }
    function setQuantidadeItem(id: string, qtd: string) {
        const cleaned = qtd.replace(/[^\d]/g, '');
        const num = parseInt(cleaned) || 0;
        setItensPacote(prev => prev.map(item => item.precificacaoId === id ? { ...item, quantidade: num } : item));
    }

    const title = categoria ? `${categoria.emoji} ${categoria.nome}` : 'Precificar';

    return (
        <>
            <main className="page-content">
                <div className="container" style={{ maxWidth: '1000px' }}>
                    {!mounted ? (
                        <PageSkeleton />
                    ) : (
                        <div className="animate-fadeIn">
                            {/* Conteúdo dinâmico baseado no STEP (Produtos, Config, Resultado) */}
                            {step === 'produtos' && (
                                <>
                                    <div className="form-group" style={{ marginBottom: 20 }}>
                                        <label className="form-label">Nome do Serviço</label>
                                        <input type="text" className="form-input" value={nomeServico} onChange={(e) => setNomeServico(e.target.value)} />
                                    </div>
                                    <StepHint
                                        icon="📦"
                                        title={isPacote ? 'Passo 2 de 3 — Serviços do combo' : 'Passo 2 de 3 — Produtos utilizados'}
                                        text={isPacote
                                            ? 'Selecione os serviços que farão parte deste combo. Para cada um, informe a quantidade de vezes que ele aparece no pacote.'
                                            : 'Selecione os produtos/insumos usados neste serviço (ex: pomada, navalhete, gola). Depois informe a quantidade utilizada. Se não usar nenhum produto, basta avançar.'}
                                    />
                                    {isPacote ? (
                                        <div className="category-grid-desktop">
                                            {minhasPrecs.map(p => {
                                                const sel = itensPacote.find(it => it.precificacaoId === p.id);
                                                const cardClass = `card ${sel ? 'card-amber' : ''}`;
                                                return (
                                                    <div key={p.id} className={cardClass} onClick={() => toggleItemPacote(p)} style={{ padding: '20px', position: 'relative', cursor: 'pointer' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <div>
                                                                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 4 }}>{p.nomeServico}</div>
                                                                <div style={{ fontSize: '0.85rem', color: 'var(--amber)', fontWeight: 700 }}>FICHA: {formatarMoeda(p.precoFinal)}</div>
                                                            </div>
                                                            <div className={`checkbox ${sel ? 'checked' : ''}`}>{sel ? '✓' : ''}</div>
                                                        </div>
                                                        {sel && (
                                                            <div className="animate-fadeIn" style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                                                                <label className="text-xs" style={{ color: 'var(--text-secondary)', fontWeight: 900, display: 'block', marginBottom: 10, letterSpacing: '0.1em' }}>QTD NO COMBO</label>
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                    <input type="text" inputMode="numeric" className="form-input premium-input-glass" style={{ width: 90, height: 52, textAlign: 'center', fontSize: '1.3rem', borderRadius: 16 }} value={sel.quantidade} onClick={(e) => e.stopPropagation()} onChange={(e) => setQuantidadeItem(p.id, e.target.value)} />
                                                                    <div style={{ textAlign: 'right' }}>
                                                                        <div className="text-xs text-secondary" style={{ marginBottom: 2 }}>SUBTOTAL</div>
                                                                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--amber)' }}>{formatarMoeda(p.precoFinal * (sel.quantidade || 1))}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="category-grid-desktop">
                                            {todosProdutos.map(prod => {
                                                const usado = produtosUsados.find(pu => pu.produto.id === prod.id);
                                                const cardClass = `card ${usado ? 'card-amber' : ''}`;
                                                return (
                                                    <div key={prod.id} className={cardClass} onClick={() => toggleProduto(prod)} style={{ padding: '20px', position: 'relative', cursor: 'pointer' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <div>
                                                                <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 4 }}>{prod.nome}</div>
                                                                <div style={{ fontSize: '0.85rem', color: 'var(--amber)', fontWeight: 800 }}>
                                                                    CUSTO UNIT: {formatarMoeda(prod.precoCompra / (prod.volumeTotal || 1))}
                                                                </div>
                                                            </div>
                                                            <div className={`checkbox ${usado ? 'checked' : ''}`}>{usado ? '✓' : ''}</div>
                                                        </div>
                                                        {usado && (
                                                            <div className="animate-fadeIn" style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                                                                <label className="text-xs" style={{ color: 'var(--text-secondary)', fontWeight: 900, display: 'block', marginBottom: 10, letterSpacing: '0.1em' }}>VOLUME POR USO ({prod.unidade})</label>
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                    <input type="text" inputMode="decimal" className="form-input premium-input-glass" style={{ width: 110, height: 52, textAlign: 'center', fontSize: '1.3rem', borderRadius: 16 }} value={volsInput[prod.id]} onClick={(e) => e.stopPropagation()} onChange={(e) => setVolume(prod.id, e.target.value)} />
                                                                    <div style={{ textAlign: 'right' }}>
                                                                        <div className="text-xs text-secondary" style={{ marginBottom: 2 }}>CUSTO</div>
                                                                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--amber)' }}>{formatarMoeda(calcularCustoProduto(prod, usado.volumeUsado))}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <button className="btn btn-primary btn-full" style={{ marginTop: 24 }} onClick={() => setStep('config')}>Avançar →</button>
                                </>
                            )}

                            {step === 'config' && config && (
                                <div className="animate-fadeIn">
                                    <h4 className="config-section-title">Ajustes da Precificação</h4>
                                    <StepHint
                                        icon="⚙️"
                                        title={isPacote ? 'Passo 3 de 3 — Desconto do Combo' : 'Passo 3 de 3 — Revisão das margens'}
                                        text={isPacote
                                            ? 'Defina o desconto promocional do combo. Os custos e margens já foram calculados individualmente nos serviços selecionados.'
                                            : 'Confira as margens e o custo fixo mensais. Esses valores já vêm preenchidos com as suas configurações padrão. Ajuste se necessário e veja a prévia do preço em tempo real abaixo.'}
                                    />

                                    {/* VERSÃO V7 - Server Component Wrapper */}
                                    {isPacote ? (
                                        /* BLOCO EXCLUSIVO PARA COMBOS — SEM TEMPO DE SERVIÇO */
                                        <div className="animate-fadeIn">

                                            <div className="card glass-amber" style={{ marginBottom: 20, padding: 16, border: '1px solid var(--amber)' }}>
                                                <label className="form-label text-amber" style={{ fontWeight: 800 }}>PROMOÇÃO: Desconto no Combo (%)</label>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    className="form-input"
                                                    style={{ fontSize: '1.2rem', fontWeight: 700, borderColor: 'var(--amber)' }}
                                                    placeholder="0"
                                                    value={configInput.descontoPacotePerc || ''}
                                                    onChange={(e) => handleConfigChange('descontoPacotePerc' as any, e.target.value)}
                                                />
                                                <p className="helper-text" style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Desconto sobre a soma dos preços individuais.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        /* BLOCO PARA SERVIÇOS INDIVIDUAIS */
                                        <div className="animate-fadeIn">
                                            <div className="form-group" style={{ marginBottom: 20 }}>
                                                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>⏱ Tempo do Serviço (minutos)</label>
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    className="form-input premium-input-glass"
                                                    placeholder="60"
                                                    value={configInput.tempoServicoMinutos || ''}
                                                    onChange={(e) => handleConfigChange('tempoServicoMinutos' as any, e.target.value)}
                                                />
                                                <p className="helper-text" style={{ color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>Duração ocupando a cadeira.</p>
                                            </div>

                                            <div className="form-group" style={{ marginBottom: 20 }}>
                                                <label className="form-label">Custo Fixo Mensal (R$)</label>
                                                <input type="text" inputMode="decimal" className="form-input" value={configInput.custoFixoTotal} onChange={(e) => handleConfigChange('custoFixoTotal', e.target.value)} />
                                            </div>

                                            <div className="perc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                {['percImpostos', 'percComissoes', 'percTaxaCartao', 'percLucroDesejado'].map(key => (
                                                    <div key={key} className="form-group">
                                                        <label className="form-label">{key.replace('perc', '').replace('Impostos', 'Impostos').replace('Comissoes', 'Comissões').replace('TaxaCartao', 'Taxa Cartão').replace('LucroDesejado', 'Margem Desejada')} (%)</label>
                                                        <input type="text" inputMode="decimal" className="form-input premium-input-glass" value={configInput[key]} onChange={(e) => handleConfigChange(key as any, e.target.value)} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="form-group" style={{ marginTop: 20 }}>
                                        <label className="form-label" style={{ color: 'var(--amber)', fontWeight: 800 }}>Preço Praticado Atual (R$)</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            className="form-input premium-input-glass"
                                            style={{ border: '2px dashed var(--amber)', background: 'rgba(212,175,55,0.02)' }}
                                            placeholder="Quanto cobra hoje?"
                                            value={precoEditado}
                                            onChange={(e) => setPrecoEditado(maskBRL(e.target.value))}
                                        />
                                    </div>

                                    {(() => {
                                        const res = calcularPrecoFinal({ ...config, itensPacote: isPacote ? itensPacote : undefined }, produtosUsados);
                                        const precoAtualNum = parseBRL(precoEditado);

                                        // V7: Calcular margem usando EXATAMENTE a mesma fórmula do backend
                                        let margemAtual = 0;
                                        if (precoAtualNum > 0) {
                                            if (Math.abs(precoAtualNum - res.precoFinal) < 0.01) {
                                                // Preço igual ao sugerido → margem IDÊNTICA
                                                margemAtual = res.percLucroReal;
                                            } else {
                                                // Preço diferente → recalcular com a mesma fórmula de calculos.ts
                                                const somaDeducoesPerc = (config.percImpostos || 0) + (config.percComissoes || 0) + (config.percTaxaCartao || 0) + (config.percInvestimentos || 0);
                                                const custoTotalDeducoes = precoAtualNum * (somaDeducoesPerc / 100);
                                                const lucroVal = precoAtualNum - res.cutTotal - custoTotalDeducoes;
                                                margemAtual = (lucroVal / precoAtualNum) * 100;
                                            }
                                        }

                                        return (
                                            <div className="card card-amber" style={{ marginTop: 24, padding: 20, border: '2px solid var(--amber)', position: 'relative' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--amber)' }}>🎯 SIMULADOR DE LUCRATIVIDADE</span>
                                                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--amber)', background: 'var(--amber-dim)', padding: '2px 8px', borderRadius: 6 }}>Tempo Real</span>
                                                </div>

                                                <div style={{ display: 'grid', gridTemplateColumns: precoAtualNum > 0 ? '1fr 1fr' : '1fr', gap: 15 }}>
                                                    <div style={{ textAlign: 'center', padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                                                        <p className="text-secondary text-xs">Preço Ideal Sugerido</p>
                                                        <h3 style={{ fontSize: '1.6rem', fontWeight: 900 }}>{formatarMoeda(res.precoFinal)}</h3>
                                                        <div style={{ color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700 }}>Margem: {res.percLucroReal.toFixed(1)}%</div>
                                                    </div>

                                                    {precoAtualNum > 0 && (
                                                        <div style={{ textAlign: 'center', padding: 10, background: 'rgba(212,175,55,0.03)', borderRadius: 12, border: '1px solid var(--amber-dim)' }}>
                                                            <p className="text-secondary text-xs">Seu Preço Atual</p>
                                                            <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--amber)' }}>{formatarMoeda(precoAtualNum)}</h3>
                                                            <div style={{ color: margemAtual >= (isPacote ? 0 : config.percLucroDesejado) ? 'var(--success)' : 'var(--error)', fontSize: '0.75rem', fontWeight: 700 }}>
                                                                Margem Real: {margemAtual.toFixed(1)}%
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div style={{ marginTop: 15, display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.8 }}>
                                                    <span>Custo Operacional Total:</span>
                                                    <span>{formatarMoeda(res.cutTotal)}</span>
                                                </div>

                                                <button className="btn-edit-price" style={{ width: '100%', marginTop: 10 }} onClick={() => setShowMemoria(!showMemoria)}>
                                                    {showMemoria ? '🔼 Ocultar Detalhes' : '📋 Ver Verificação de Custos'}
                                                </button>

                                                {showMemoria && (
                                                    <div className="animate-fadeIn" style={{ marginTop: 10, padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 8, fontSize: '0.75rem' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                                            <span>Custo Total:</span> <span>{formatarMoeda(res.cutTotal)}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--amber)' }}>
                                                            <span>Seu Lucro Líquido:</span> <span>{formatarMoeda(res.lucroReal)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    <div className="btn-row" style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                                        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setStep('produtos')}>← Voltar</button>
                                        <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => {
                                            const res = calcularPrecoFinal({ ...config, itensPacote: isPacote ? itensPacote : undefined }, produtosUsados);
                                            setResultado(res);
                                            // Se o usuário já inseriu um preço atual, levamos ele para a tela final como preço editado
                                            const precoAtualNum = parseBRL(precoEditado);
                                            if (precoAtualNum > 0) {
                                                setPrecoEditado(String(precoAtualNum));
                                            } else {
                                                setPrecoEditado(String(res.precoFinal));
                                            }
                                            setStep('resultado');
                                        }}>Concluir Precificação →</button>
                                    </div>
                                </div>
                            )}

                            {step === 'resultado' && resultado && (() => {
                                const precoAjustadoNum = parseFloat(precoEditado.replace(',', '.')) || 0;
                                const isPrecoDiferente = Math.abs(precoAjustadoNum - resultado.precoFinal) > 0.01;

                                // Cálculo de margem ajustada inline
                                let lucroExibido = resultado.lucroReal;
                                let margemExibida = resultado.percLucroReal;

                                if (isPrecoDiferente && precoAjustadoNum > 0) {
                                    const configAjuste = config!;
                                    const somaDeducoesPerc = (configAjuste.percImpostos || 0) + (configAjuste.percComissoes || 0) + (configAjuste.percTaxaCartao || 0) + (configAjuste.percInvestimentos || 0);
                                    const deducoes = precoAjustadoNum * (somaDeducoesPerc / 100);
                                    lucroExibido = precoAjustadoNum - resultado.cutTotal - deducoes;
                                    margemExibida = (lucroExibido / precoAjustadoNum) * 100;
                                }

                                const horasReais = resultado.horasReais;
                                const breakdownProdutos = produtosUsados.map(pu => ({
                                    nome: pu.produto.nome,
                                    custo: calcularCustoProduto(pu.produto, pu.volumeUsado),
                                }));

                                return (
                                    <div className="animate-fadeIn">
                                        <div className="card card-amber" style={{ textAlign: 'center', padding: 32, marginBottom: 20 }}>
                                            <p className="text-secondary text-sm">
                                                Prévia do Preço de Venda:
                                            </p>

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
                                                    {formatarMoeda(isPrecoDiferente ? precoAjustadoNum : resultado.precoFinal)}
                                                </h1>
                                            )}

                                            {isPrecoDiferente && (
                                                <p className="text-secondary text-xs" style={{ marginTop: 4 }}>
                                                    Sugerido pelo sistema: {formatarMoeda(resultado.precoFinal)}
                                                </p>
                                            )}

                                            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
                                                {!modoEdicao ? (
                                                    <button className="btn-edit-price" onClick={() => setModoEdicao(true)}>
                                                        ✏️ Ajustar preço
                                                    </button>
                                                ) : (
                                                    <button className="btn-edit-price" onClick={() => setModoEdicao(false)}>
                                                        ✓ Confirmar valor
                                                    </button>
                                                )}
                                                {isPrecoDiferente && (
                                                    <button className="btn-reset-price" onClick={() => {
                                                        setPrecoEditado(String(resultado.precoFinal));
                                                        setModoEdicao(false);
                                                    }}>
                                                        🔄 Restaurar sugerido
                                                    </button>
                                                )}
                                            </div>

                                            {modoEdicao && (
                                                <p className="hint-text" style={{ marginTop: 12 }}>
                                                    💡 Teste um valor diferente para ver como sua margem muda.
                                                </p>
                                            )}
                                        </div>

                                        {/* Lucro e Margem Simulada */}
                                        <div className="card glass" style={{ marginBottom: 20 }}>
                                            <h3 className="font-bold" style={{ marginBottom: 15, fontSize: '0.9rem', color: 'var(--amber)', textTransform: 'uppercase' }}>
                                                {isPrecoDiferente ? '📊 Margem Simulada' : '🏁 Resultado Esperado'}
                                            </h3>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                                <span className="text-secondary">Seu Lucro no Bolso (R$)</span>
                                                <span className={lucroExibido >= 0 ? 'text-success font-bold' : 'text-error font-bold'}>
                                                    {formatarMoeda(lucroExibido)}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span className="text-secondary">Margem de Lucro (%)</span>
                                                <span className={margemExibida >= 0 ? 'text-success font-bold' : 'text-error font-bold'}>
                                                    {margemExibida.toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>

                                        {lucroExibido < 0 && (
                                            <div className="critical-alert animate-fadeIn" style={{ marginBottom: 20 }}>
                                                <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                                                    <span style={{ fontSize: '2.5rem' }}>⚠️</span>
                                                    <div>
                                                        <h4 style={{ color: 'var(--error)', fontWeight: 900, marginBottom: 4, textTransform: 'uppercase', fontSize: '1.1rem' }}>Prejuízo Detectado!</h4>
                                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.4, fontWeight: 500 }}>
                                                            Atenção: Seu preço está <strong>abaixo do custo total</strong>. Você terá um prejuízo de {formatarMoeda(Math.abs(lucroExibido))} em cada atendimento.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Accordion Memória de Cálculo Lúdica */}
                                        <div className="card glass memoria-card" style={{ marginBottom: 20 }}>
                                            <button
                                                className="memoria-toggle"
                                                onClick={() => setShowMemoria(!showMemoria)}
                                            >
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <span style={{ fontSize: '1.1rem' }}>📋</span>
                                                    <span className="font-bold">COMO CHEGAMOS AQUI?</span>
                                                    <span className="memoria-badge">Lógica de Cálculo</span>
                                                </span>
                                                <span style={{ fontSize: '0.8rem' }}>{showMemoria ? '🔼' : '🔽'}</span>
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
                                                            <span className="memoria-value">{formatarMoeda(resultado.cfRateado)}</span>
                                                        </div>
                                                        <p className="memoria-explain">
                                                            Quanto este atendimento "paga" das suas despesas fixas (seu custo fixo por hora hoje é {formatarMoeda(resultado.cfUni)}).
                                                        </p>
                                                    </div>

                                                    {resultado.cvUni > 0 && (
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
                                                                    <span className="memoria-value">{formatarMoeda(resultado.cvUni)}</span>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}

                                                    <div className="memoria-divider" />

                                                    <div className="memoria-section">
                                                        <p className="memoria-section-title">📈 4. SEGURANÇA E CRESCIMENTO (MARKUP)</p>
                                                        <div className="memoria-row">
                                                            <span className="memoria-label">Custo Total (Fixo + Produtos)</span>
                                                            <span className="memoria-value">{formatarMoeda(resultado.cutTotal)}</span>
                                                        </div>
                                                        <div className="memoria-row">
                                                            <span className="memoria-label">Multiplicador de Segurança</span>
                                                            <span className="memoria-value">{resultado.markup.toFixed(2)}x</span>
                                                        </div>
                                                        <p className="memoria-explain">
                                                            Usamos este multiplicador (Markup) para garantir que você pague os impostos ({config?.percImpostos}%),
                                                            comissões ({config?.percComissoes}%), taxas de cartão ({config?.percTaxaCartao}%),
                                                            invista no negócio ({config?.percInvestimentos}%) e ainda tenha seu lucro.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="btn-row" style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                                            <button className="btn btn-ghost" onClick={() => setStep('config')}>← Ajustar</button>
                                            <button className="btn btn-primary" onClick={async () => {
                                                if (salvando) return;
                                                setSalvando(true);
                                                try {
                                                    if (!categoria || !config) return;
                                                    // Se o preço foi editado, salvar com o valor final ajustado
                                                    const precoFinalSalvar = isPrecoDiferente ? precoAjustadoNum : resultado.precoFinal;
                                                    const lucroRealSalvar = isPrecoDiferente ? lucroExibido : resultado.lucroReal;
                                                    const percLucroRealSalvar = isPrecoDiferente ? margemExibida : resultado.percLucroReal;

                                                    const saved = await salvarPrecificacao({
                                                        nomeServico, categoriaId: categoria.id, categoriaNome: categoria.nome,
                                                        categoriaEmoji: categoria.emoji, config, produtosUsados: produtosUsados.map(pu => ({ produto: pu.produto, volumeUsado: pu.volumeUsado })),
                                                        precoFinal: precoFinalSalvar, cfUni: resultado.cfUni, cfRateado: resultado.cfRateado, cvUni: resultado.cvUni,
                                                        tempoServicoMinutos: resultado.tempoServicoMinutos, markup: resultado.markup, markup2: resultado.markup2,
                                                        itensPacote: resultado.itensPacote, descontoPacotePerc: resultado.descontoPacotePerc, lucroReal: lucroRealSalvar, percLucroReal: percLucroRealSalvar,
                                                        cutTotal: resultado.cutTotal, precoOriginalTotal: resultado.precoOriginalTotal
                                                    });
                                                    setSalvo(true);
                                                    setTimeout(() => router.push(`/resultado/${saved.id}`), 500);
                                                } catch (err) { console.error(err); setSalvando(false); }
                                            }}>{salvo ? '✅ Salvo!' : salvando ? 'Salvando...' : '💾 Salvar Precificação'}</button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div >
            </main >
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

                .checkbox { width: 20px; height: 20px; border: 2px solid var(--border); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; }
                .checkbox.checked { background: var(--amber); border-color: var(--amber); color: #111; }
                .config-section-title { font-size: 1rem; font-weight: 700; margin-bottom: 16px; color: var(--amber); }
                .badge-pulse { 
                    background: rgba(212, 175, 55, 0.2); 
                    color: var(--amber); 
                    font-size: 0.65rem; 
                    padding: 2px 8px; 
                    border-radius: 99px; 
                    animation: pulse 2s infinite; 
                    font-weight: 800;
                    border: 1px solid rgba(212, 175, 55, 0.3);
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .premium-input-glass {
                    background: rgba(255,255,255,0.03) !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    backdrop-filter: blur(5px);
                    border-radius: 16px !important;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.1) !important;
                }
                .premium-input-glass:focus {
                    background: rgba(255,255,255,0.07) !important;
                    border-color: var(--amber) !important;
                    box-shadow: 0 0 0 3px var(--amber-dim), inset 0 2px 4px rgba(0,0,0,0.1) !important;
                }
            `}</style>
        </>
    );
}

export default function PrecificarPage() {
    return (
        <Suspense fallback={<div className="loading-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--amber)' }}>Carregando...</div>}>
            <PrecificarContent />
        </Suspense>
    );
}
