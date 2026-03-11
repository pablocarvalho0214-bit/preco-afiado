'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUsuarioAtual, getProdutos, atualizarProduto } from '@/lib/storage';
import { type Produto, formatarMoeda } from '@/lib/calculos';

const UNIDADES = ['ml', 'g', 'kg', 'L', 'unid', 'pct'];

export default function EditarProdutoPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const [produto, setProduto] = useState<any>(null);
    const [mounted, setMounted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [saved, setSaved] = useState(false);
    const [err, setErr] = useState('');

    const [nome, setNome] = useState('');
    const [unidade, setUnidade] = useState('ml');
    const [volumeTotal, setVolumeTotal] = useState('');
    const [precoCompra, setPrecoCompra] = useState('');

    useEffect(() => {
        async function load() {
            const user = await getUsuarioAtual();
            if (!user) { router.replace('/'); return; }
            const prods = await getProdutos();
            const p = prods.find((x) => x.id === params.id);
            if (!p) { router.replace('/produtos'); return; }
            setProduto(p);
            setNome(p.nome);
            setUnidade(p.unidade);
            setVolumeTotal(String(p.volumeTotal));
            setPrecoCompra(String(p.precoCompra));
            setMounted(true);
        }
        load();
    }, [router, params.id]);

    if (!mounted || !produto) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr('');
        const vol = parseFloat(volumeTotal.replace(',', '.'));
        const preco = parseFloat(precoCompra.replace(',', '.'));
        if (!nome.trim()) { setErr('Informe o nome.'); return; }
        if (isNaN(vol) || vol <= 0) { setErr('Volume inválido.'); return; }
        if (isNaN(preco) || preco <= 0) { setErr('Preço inválido.'); return; }
        setSubmitting(true);
        try {
            await atualizarProduto(produto!.id, { nome: nome.trim(), unidade, volumeTotal: vol, precoCompra: preco });
            setSaved(true);
            setTimeout(() => router.push('/produtos'), 900);
        } catch (err) {
            console.error(err);
            setErr('Erro ao atualizar produto.');
            setSubmitting(false);
        }
    }

    return (
        <>
            <main className="page-content">
                <div className="container">
                    {err && <div className="alert alert-error animate-fadeIn" style={{ marginBottom: 16 }}>⚠️ {err}</div>}
                    {saved && <div className="alert alert-success animate-fadeIn" style={{ marginBottom: 16 }}>✅ Atualizado! Redirecionando...</div>}

                    <form className="animate-fadeIn" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="edit-nome" className="form-label">Nome do Produto</label>
                            <input id="edit-nome" type="text" className="form-input" value={nome}
                                onChange={(e) => setNome(e.target.value)} required />
                        </div>
                        <div className="row-2col" style={{ marginTop: 16 }}>
                            <div className="form-group">
                                <label htmlFor="edit-volume" className="form-label">Volume Total</label>
                                <input id="edit-volume" type="text" inputMode="decimal" className="form-input"
                                    value={volumeTotal} onChange={(e) => setVolumeTotal(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="edit-unidade" className="form-label">Unidade</label>
                                <select id="edit-unidade" className="form-input" value={unidade}
                                    onChange={(e) => setUnidade(e.target.value)}>
                                    {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-group" style={{ marginTop: 16 }}>
                            <label htmlFor="edit-preco" className="form-label">Preço de Compra (R$)</label>
                            <div className="form-input-prefix">
                                <span className="prefix">R$</span>
                                <input id="edit-preco" type="text" inputMode="decimal" className="form-input"
                                    value={precoCompra} onChange={(e) => setPrecoCompra(e.target.value)} required />
                            </div>
                        </div>

                        {volumeTotal && precoCompra && !isNaN(parseFloat(volumeTotal)) && !isNaN(parseFloat(precoCompra)) && (
                            <div className="card card-amber animate-fadeIn" style={{ marginTop: 16 }}>
                                <p className="text-sm text-secondary">Custo por {unidade}:</p>
                                <p className="font-bold text-amber" style={{ fontSize: '1.125rem', marginTop: 4 }}>
                                    {formatarMoeda(parseFloat(precoCompra.replace(',', '.')) / parseFloat(volumeTotal.replace(',', '.')))} /{unidade}
                                </p>
                            </div>
                        )}

                        <button id="btn-salvar-edicao" type="submit" className="btn btn-primary btn-full"
                            style={{ marginTop: 24 }} disabled={submitting || saved}>
                            {saved ? '✅ Atualizado!' : submitting ? 'Salvando...' : '💾 Salvar Alterações'}
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
