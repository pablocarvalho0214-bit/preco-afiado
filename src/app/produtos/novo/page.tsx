'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUsuarioAtual, salvarProduto } from '@/lib/storage';
import { CATEGORIAS_PRODUTO } from '@/lib/categoriasProduto';

const UNIDADES = ['ml', 'g', 'kg', 'L', 'unid', 'pct'];

export default function NovoProdutoPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState('');
    const [success, setSuccess] = useState(false);

    const [nome, setNome] = useState('');
    const [unidade, setUnidade] = useState('ml');
    const [volumeTotal, setVolumeTotal] = useState('');
    const [precoCompra, setPrecoCompra] = useState('');
    const [categoriaProduto, setCategoriaProduto] = useState('');

    useEffect(() => {
        async function load() {
            const user = await getUsuarioAtual();
            if (!user) { router.replace('/'); return; }
            setMounted(true);
        }
        load();
    }, [router]);

    if (!mounted) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr('');

        const vol = parseFloat(volumeTotal.replace(',', '.'));
        const preco = parseFloat(precoCompra.replace(',', '.'));

        if (!nome.trim()) { setErr('Informe o nome do produto.'); return; }
        if (isNaN(vol) || vol <= 0) { setErr('Volume inválido.'); return; }
        if (isNaN(preco) || preco <= 0) { setErr('Preço de compra inválido.'); return; }

        setSubmitting(true);
        try {
            await salvarProduto({
                nome: nome.trim(),
                unidade,
                volumeTotal: vol,
                precoCompra: preco,
                categoriaProduto: categoriaProduto || undefined
            });
            setSuccess(true);
            setTimeout(() => router.push('/produtos'), 900);
        } catch (err) {
            console.error(err);
            setErr('Erro ao salvar produto.');
            setSubmitting(false);
        }
    }

    return (
        <>
            <main className="page-content">
                <div className="container">
                    <p className="text-secondary animate-fadeIn" style={{ marginBottom: 24, fontSize: '0.9375rem' }}>
                        Cadastre um produto para usar nas precificações. O custo por uso será calculado automaticamente.
                    </p>

                    {err && <div className="alert alert-error animate-fadeIn" style={{ marginBottom: 16 }}>⚠️ {err}</div>}
                    {success && <div className="alert alert-success animate-fadeIn" style={{ marginBottom: 16 }}>✅ Produto salvo! Redirecionando...</div>}

                    <form className="animate-fadeIn" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="prod-nome" className="form-label">Nome do Produto</label>
                            <input
                                id="prod-nome"
                                type="text"
                                className="form-input"
                                placeholder="Ex: Shampoo, Creme de Barba..."
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />
                        </div>

                        <div className="row-2col" style={{ marginTop: 16 }}>
                            <div className="form-group">
                                <label htmlFor="prod-volume" className="form-label">Volume Total</label>
                                <input
                                    id="prod-volume"
                                    type="text"
                                    inputMode="decimal"
                                    className="form-input"
                                    placeholder="Ex: 200"
                                    value={volumeTotal}
                                    onChange={(e) => setVolumeTotal(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="prod-unidade" className="form-label">Unidade</label>
                                <select
                                    id="prod-unidade"
                                    className="form-input"
                                    value={unidade}
                                    onChange={(e) => setUnidade(e.target.value)}
                                >
                                    {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: 16 }}>
                            <label htmlFor="prod-categoria" className="form-label">Categoria do Produto</label>
                            <select
                                id="prod-categoria"
                                className="form-input"
                                value={categoriaProduto}
                                onChange={(e) => setCategoriaProduto(e.target.value)}
                            >
                                <option value="">Sem Categoria (Outros)</option>
                                {CATEGORIAS_PRODUTO.map((c) => (
                                    <option key={c.id} value={c.id}>{c.emoji} {c.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginTop: 16 }}>
                            <label htmlFor="prod-preco" className="form-label">Preço de Compra (R$)</label>
                            <div className="form-input-prefix">
                                <span className="prefix">R$</span>
                                <input
                                    id="prod-preco"
                                    type="text"
                                    inputMode="decimal"
                                    className="form-input"
                                    placeholder="0,00"
                                    value={precoCompra}
                                    onChange={(e) => setPrecoCompra(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Preview de custo */}
                        {volumeTotal && precoCompra && !isNaN(parseFloat(volumeTotal)) && !isNaN(parseFloat(precoCompra)) && (
                            <div className="card card-amber animate-fadeIn" style={{ marginTop: 16 }}>
                                <p className="text-sm text-secondary">Custo por {unidade}:</p>
                                <p className="font-bold text-amber" style={{ fontSize: '1.25rem', marginTop: 4 }}>
                                    R$ {(parseFloat(precoCompra.replace(',', '.')) / parseFloat(volumeTotal.replace(',', '.'))).toFixed(4).replace('.', ',')}/{unidade}
                                </p>
                            </div>
                        )}

                        <button
                            id="btn-salvar-produto"
                            type="submit"
                            className="btn btn-primary btn-full"
                            style={{ marginTop: 24 }}
                            disabled={submitting || success}
                        >
                            {submitting ? 'Salvando...' : success ? '✅ Salvo!' : '💾 Salvar Produto'}
                        </button>
                    </form>
                </div>
            </main>

            <style jsx>{`
        .row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      `}</style>
        </>
    );
}
