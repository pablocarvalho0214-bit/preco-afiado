'use client';
// v1.1.0 - Categorias Colapsáveis

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProdutos, excluirProduto, type Produto } from '@/lib/storage';
import { formatarMoeda } from '@/lib/calculos';
import { CATEGORIAS_PRODUTO } from '@/lib/categoriasProduto';
import PageSkeleton from '@/components/PageSkeleton';
import { Package, Plus, Search, ChevronRight, Trash2, Folder, ChevronDown } from 'lucide-react';

export default function ProdutosPage() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [mounted, setMounted] = useState(false);
    const [filtro, setFiltro] = useState('');
    const [categoriasAbertas, setCategoriasAbertas] = useState<Set<string>>(new Set());
    const router = useRouter();

    useEffect(() => {
        async function load() {
            try {
                const p = await getProdutos();
                setProdutos(p);
            } catch (err) {
                console.error("Erro ao carregar produtos:", err);
            } finally {
                setMounted(true);
            }
        }
        load();
    }, []);

    async function handleExcluirProduto(id: string, e: React.MouseEvent) {
        e.preventDefault();
        if (confirm('Tem certeza que deseja excluir este produto?')) {
            try {
                await excluirProduto(id);
                setProdutos(produtos.filter(p => p.id !== id));
            } catch (err) {
                console.error("Erro ao excluir produto:", err);
                alert("Erro ao excluir o produto. Tente novamente.");
            }
        }
    }

    function toggleCategoria(catId: string) {
        setCategoriasAbertas(prev => {
            const novo = new Set(prev);
            if (novo.has(catId)) novo.delete(catId);
            else novo.add(catId);
            return novo;
        });
    }

    const produtosFiltrados = produtos.filter(p =>
        p.nome.toLowerCase().includes(filtro.toLowerCase())
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
        <div className="products-wrapper">
            <main className="page-content">
                <div className="container" style={{ maxWidth: '1000px' }}>

                    {/* Header Section */}
                    <header className="page-header animate-fadeIn">
                        <div className="header-top">
                            <div>
                                <p className="section-title">MEU ESTOQUE</p>
                                <h2 className="title-platinum">Produtos & Insumos</h2>
                            </div>
                            <Link href="/produtos/novo" className="btn btn-primary">
                                <Plus size={20} /> <span className="hide-mobile-sm">NOVO PRODUTO</span>
                            </Link>
                        </div>

                        <div className="search-box glass" style={{ marginTop: 24 }}>
                            <Search size={18} className="text-disabled" />
                            <input
                                type="text"
                                placeholder="Buscar produto pelo nome..."
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </header>

                    {/* Content Section */}
                    <div className="products-content animate-slideUp" style={{ marginTop: 32 }}>
                        {produtosFiltrados.length === 0 ? (
                            <div className="card glass empty-card">
                                <Package size={48} className="text-disabled" />
                                <p>{filtro ? 'Nenhum produto encontrado.' : 'Sua lista de insumos está vazia.'}</p>
                                {!filtro && (
                                    <Link href="/produtos/novo" className="btn btn-ghost" style={{ marginTop: 12 }}>
                                        Cadastrar Primeiro
                                    </Link>
                                )}
                            </div>
                        ) : (() => {
                            // Agrupar produtos por categoria
                            const grupos: Record<string, Produto[]> = {};
                            produtosFiltrados.forEach(p => {
                                const cat = p.categoriaProduto || 'outros';
                                if (!grupos[cat]) grupos[cat] = [];
                                grupos[cat].push(p);
                            });

                            // Ordenar categorias (as do array primeiro, outros por último)
                            const idsCategorias = [...CATEGORIAS_PRODUTO.map(c => c.id), 'outros'];

                            return idsCategorias.map(catId => {
                                const prodsNoGrupo = grupos[catId];
                                if (!prodsNoGrupo || prodsNoGrupo.length === 0) return null;

                                const infoCat = CATEGORIAS_PRODUTO.find(c => c.id === catId);
                                const nomeCat = infoCat ? `${infoCat.emoji} ${infoCat.nome}` : '📦 Outros / Não Categorizados';
                                const estaAberta = categoriasAbertas.has(catId) || filtro.length > 0;

                                return (
                                    <section key={catId} style={{ marginBottom: 32 }}>
                                        <div
                                            className={`category-header collapsible ${estaAberta ? 'active' : ''}`}
                                            onClick={() => toggleCategoria(catId)}
                                        >
                                            <div className="cat-title-left">
                                                <ChevronDown size={20} className={`chevron-indicator ${estaAberta ? 'rotated' : ''}`} />
                                                <Folder size={18} className="text-amber" />
                                                <h3 className="category-title">{nomeCat}</h3>
                                            </div>
                                            <span className="category-count">{prodsNoGrupo.length} {prodsNoGrupo.length === 1 ? 'produto' : 'produtos'}</span>
                                        </div>

                                        {estaAberta && (
                                            <div className="responsive-grid responsive-grid-3 animate-fadeInSmall">
                                                {prodsNoGrupo.map((p) => (
                                                    <Link key={p.id} href={`/produtos/${p.id}/editar`} className="product-card-premium glass card-hover">
                                                        <div className="card-top">
                                                            <div className="p-icon-box">
                                                                <Package size={20} className="text-amber" />
                                                            </div>
                                                            <span className="p-unit">{p.unidade}</span>
                                                        </div>

                                                        <div className="card-body">
                                                            <h3 className="p-name">{p.nome}</h3>
                                                            <div className="p-stat-row">
                                                                <span className="p-label">Volume:</span>
                                                                <span className="p-val">{p.volumeTotal} {p.unidade}</span>
                                                            </div>
                                                            <div className="p-stat-row">
                                                                <span className="p-label">Custo por {p.unidade}:</span>
                                                                <span className="p-val text-amber">
                                                                    R$ {(p.precoCompra / (p.volumeTotal || 1)).toFixed(4).replace('.', ',')}
                                                                </span>
                                                            </div>
                                                            <div className="p-stat-row" style={{ marginTop: 4, opacity: 0.6 }}>
                                                                <span className="p-label">Compra:</span>
                                                                <span className="p-val">{formatarMoeda(p.precoCompra)}</span>
                                                            </div>
                                                        </div>

                                                        <div className="card-footer">
                                                            <span className="btn-edit-text">EDITAR DETALHES</span>
                                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleExcluirProduto(p.id, e);
                                                                    }}
                                                                    className="btn-delete-icon"
                                                                    title="Excluir Produto"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                                <ChevronRight size={14} />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </section>
                                );
                            });
                        })()}
                    </div>
                </div>
            </main>

            <style jsx>{`
                .header-top { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; }
                .title-platinum { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin-top: 4px; }
                
                .category-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 12px; }
                .category-header.collapsible { cursor: pointer; transition: all 0.2s; }
                .category-header.collapsible:hover { border-color: var(--amber-dim); }
                .cat-title-left { display: flex; align-items: center; gap: 12px; }
                .category-title { font-size: 1rem; font-weight: 800; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em; }
                .category-count { font-size: 0.75rem; color: var(--text-disabled); font-weight: 600; background: rgba(255,255,255,0.03); padding: 2px 8px; border-radius: 99px; }

                .chevron-indicator { color: var(--text-disabled); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .chevron-indicator.rotated { transform: rotate(-180deg); color: var(--amber); }

                @keyframes fadeInSmall {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInSmall { animation: fadeInSmall 0.3s ease-out forwards; }

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

                .product-card-premium {
                    display: flex;
                    flex-direction: column;
                    padding: 20px;
                    border-radius: var(--radius-lg);
                    gap: 16px;
                }
                
                .card-top { display: flex; align-items: center; justify-content: space-between; }
                .p-icon-box {
                    width: 40px;
                    height: 40px;
                    background: var(--amber-dim);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .p-unit { font-size: 0.65rem; font-weight: 800; color: var(--text-disabled); border: 1px solid var(--border); padding: 4px 8px; border-radius: 6px; text-transform: uppercase; }

                .card-body { display: flex; flex-direction: column; gap: 8px; }
                .p-name { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; }
                .p-stat-row { display: flex; justify-content: space-between; font-size: 0.8rem; }
                .p-label { color: var(--text-secondary); }
                .p-val { font-weight: 700; color: var(--text-primary); }

                .card-footer {
                    margin-top: auto;
                    padding-top: 16px;
                    border-top: 1px solid var(--border-subtle);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    color: var(--amber);
                }
                .btn-edit-text { font-size: 0.65rem; font-weight: 800; letter-spacing: 0.05em; }

                .btn-delete-icon {
                    background: none;
                    border: none;
                    color: var(--error);
                    opacity: 0.7;
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                .btn-delete-icon:hover {
                    opacity: 1;
                    background: rgba(239, 68, 68, 0.1);
                }

                .empty-card {  
                    padding: 60px 40px; 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                    gap: 16px; 
                    color: var(--text-disabled);
                    text-align: center;
                }

                @media (max-width: 400px) {
                    .hide-mobile-sm { display: none; }
                }
            `}</style>
        </div>
    );
}
