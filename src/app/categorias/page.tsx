'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIAS } from '@/lib/categorias';
import { getUsuarioAtual, getTodasSubcategorias, salvarSubcategoria, type Subcategoria } from '@/lib/storage';
import PageSkeleton from '@/components/PageSkeleton';
import StepHint from '@/components/StepHint';
import { ChevronRight, Plus, Check, Loader2, Scissors } from 'lucide-react';

export default function CategoriasPage() {
    const [mounted, setMounted] = useState(false);
    const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
    const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
    const [newSubNome, setNewSubNome] = useState('');
    const [salvando, setSalvando] = useState(false);
    const router = useRouter();

    async function load() {
        try {
            const [u, subs] = await Promise.all([getUsuarioAtual(), getTodasSubcategorias()]);
            if (!u) { router.replace('/'); return; }
            setSubcategorias(subs);
        } catch (err) {
            console.error("Erro ao carregar categorias:", err);
        } finally {
            setMounted(true);
        }
    }

    useEffect(() => {
        load();
    }, [router]);

    function handleSelect(catId: string, subId?: string, subNome?: string) {
        if (subId) {
            router.push(`/precificar/${catId}?sub=${subId}&nome=${encodeURIComponent(subNome || '')}&v=6`);
        } else {
            router.push(`/precificar/${catId}?v=6`);
        }
    }

    async function handleAddSub(e: React.FormEvent, catId: string) {
        e.preventDefault();
        if (!newSubNome.trim() || salvando) return;

        setSalvando(true);
        try {
            await salvarSubcategoria(catId, newSubNome);
            setNewSubNome('');
            await load(); // Recarregar lista
        } catch (err: any) {
            alert(err.message || "Erro ao salvar variação");
        } finally {
            setSalvando(false);
        }
    }

    return (
        <>
            <main className="page-content">
                <div className="container" style={{ maxWidth: '1000px' }}>

                    {!mounted ? (
                        <PageSkeleton />
                    ) : (
                        <div className="animate-fadeIn">
                            <header style={{ marginBottom: 28 }}>
                                <p className="section-title text-center">Seleção de Serviço</p>
                                <h2 className="text-center" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Escolha uma categoria</h2>
                                <p className="text-secondary text-center text-sm" style={{ marginTop: 8 }}>
                                    Toque para ver as variações ou criar uma nova.
                                </p>
                            </header>

                            <StepHint
                                icon="💡"
                                title="Passo 1 de 3 — Tipo de serviço"
                                text="Selecione a categoria do serviço que você quer precificar. Em seguida, escolha a variação específica (ex: Corte + Barba) ou use a opção Padrão."
                            />

                            <div className="category-grid-desktop">
                                {CATEGORIAS.map((cat) => {
                                    const isSelected = selectedCatId === cat.id;
                                    const minhasSubs = subcategorias.filter(s => s.categoriaId === cat.id);
                                    const podeAdicionar = minhasSubs.length < 3;

                                    return (
                                        <div key={cat.id} className={`cat-card-wrapper animate-slideUp`}>
                                            {/* Card da Categoria */}
                                            <div
                                                className={`card glass card-hover ${isSelected ? 'selected' : ''}`}
                                                onClick={() => setSelectedCatId(isSelected ? null : cat.id)}
                                                style={{ padding: 24, cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s ease' }}
                                            >
                                                <div className="cat-icon-lg">{cat.emoji}</div>
                                                <h3 className="cat-name">{cat.nome}</h3>
                                                {isSelected ? (
                                                    <div className="active-dot"></div>
                                                ) : (
                                                    <p className="cat-ex">{cat.exemplos.slice(0, 3).join(', ')}</p>
                                                )}
                                            </div>

                                            {/* Menu de Subcategorias (Variações) */}
                                            {isSelected && (
                                                <div className="subs-panel glass animate-fadeIn">
                                                    <div className="subs-header">
                                                        <Scissors size={14} className="text-amber" />
                                                        <span>VARIAÇÕES DISPONÍVEIS</span>
                                                    </div>

                                                    <div className="subs-list">
                                                        {/* Opção Padrão */}
                                                        <button
                                                            className="sub-btn standard"
                                                            onClick={() => handleSelect(cat.id)}
                                                        >
                                                            <div className="sub-btn-info">
                                                                <span className="sub-tag">PADRÃO</span>
                                                                <span className="sub-title">{cat.nome} Base</span>
                                                            </div>
                                                            <ChevronRight size={18} />
                                                        </button>

                                                        {/* Subcategorias Criadas */}
                                                        {minhasSubs.map(sub => (
                                                            <button
                                                                key={sub.id}
                                                                className="sub-btn"
                                                                onClick={() => handleSelect(cat.id, sub.id, sub.nome)}
                                                            >
                                                                <div className="sub-btn-info">
                                                                    <span className="sub-title">{sub.nome}</span>
                                                                </div>
                                                                <ChevronRight size={18} />
                                                            </button>
                                                        ))}

                                                        {/* Formulário de Nova Subcategoria */}
                                                        {podeAdicionar ? (
                                                            <form className="add-sub-form" onSubmit={(e) => handleAddSub(e, cat.id)}>
                                                                <input
                                                                    type="text"
                                                                    className="add-sub-input"
                                                                    placeholder="Ex: Corte Navalhado..."
                                                                    value={newSubNome}
                                                                    onChange={(e) => setNewSubNome(e.target.value)}
                                                                />
                                                                <button type="submit" className="btn-add-mini" disabled={salvando || !newSubNome.trim()}>
                                                                    {salvando ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                                                                </button>
                                                            </form>
                                                        ) : (
                                                            <div className="limit-alert">
                                                                Limite de 3 variações atingido.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <style jsx>{`
                .cat-card-wrapper { display: flex; flex-direction: column; gap: 12px; height: 100%; }
                .cat-icon-lg { font-size: 3rem; margin-bottom: 16px; transition: transform 0.3s ease; }
                .cat-card-wrapper:hover .cat-icon-lg { transform: scale(1.1); }
                .cat-name { font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; }
                .cat-ex { font-size: 0.75rem; color: var(--text-disabled); letter-spacing: 0.02em; }
                
                .card.selected { border-color: var(--amber); box-shadow: var(--shadow-amber); }
                .active-dot { width: 8px; height: 8px; background: var(--amber); border-radius: 50%; margin: 8px auto 0; box-shadow: 0 0 10px var(--amber); }

                .subs-panel {
                    padding: 16px;
                    border-radius: var(--radius-md);
                    border: 1px solid rgba(212, 175, 55, 0.2) !important;
                    background: rgba(20, 20, 20, 0.6) !important;
                }
                .subs-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
                .subs-header span { font-size: 0.65rem; font-weight: 800; color: var(--text-secondary); letter-spacing: 0.1em; }

                .subs-list { display: flex; flex-direction: column; gap: 8px; }
                .sub-btn {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    color: var(--text-primary);
                    transition: all 0.2s ease;
                    text-align: left;
                    width: 100%;
                }
                .sub-btn:hover { background: var(--amber-dim); color: var(--amber); border-color: rgba(212, 175, 55, 0.3); }
                .sub-btn-info { display: flex; flex-direction: column; gap: 2px; }
                .sub-tag { font-size: 0.55rem; font-weight: 800; color: var(--amber); letter-spacing: 0.05em; }
                .sub-title { font-size: 0.9rem; font-weight: 600; }
                
                .add-sub-form {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 8px;
                    padding: 4px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 12px;
                    border: 1px dashed rgba(255,255,255,0.1);
                }
                .add-sub-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    padding: 10px 12px;
                    color: var(--text-primary);
                    font-size: 0.85rem;
                    outline: none;
                }
                .btn-add-mini {
                    width: 36px;
                    height: 36px;
                    background: var(--amber);
                    color: #000;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .btn-add-mini:disabled { opacity: 0.4; }
                
                .limit-alert { font-size: 0.7rem; color: var(--text-disabled); text-align: center; margin-top: 8px; font-style: italic; }
            `}</style>
        </>
    );
}
