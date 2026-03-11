'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUsuarioAtual, getConfig, salvarConfig, type ConfiguracaoUsuario, type Usuario, atualizarUsuario, deletarConta } from '@/lib/storage';
import { supabase } from '@/lib/supabaseClient';
import { formatarMoeda } from '@/lib/calculos';
import PageSkeleton from '@/components/PageSkeleton';
import InfoTooltip from '@/components/InfoTooltip';
import ConfigTour from '@/components/ConfigTour';
import { Clock, Briefcase, BarChart3, Save, Check, Percent, Users, Calendar, ChevronRight, User, KeyRound, Camera, Trash2, AlertTriangle } from 'lucide-react';

export default function ConfiguracoesPage() {
    const [user, setUser] = useState<Usuario | null>(null);
    const [config, setConf] = useState<ConfiguracaoUsuario | null>(null);

    const [perfilNome, setPerfilNome] = useState('');
    const [perfilTipo, setPerfilTipo] = useState<'autonomo' | 'empresario'>('autonomo');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [isGoogleUser, setIsGoogleUser] = useState(false);

    const [mounted, setMounted] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [salvo, setSalvo] = useState(false);
    const router = useRouter();

    const [percInputs, setPercInputs] = useState<Record<string, string>>({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showDangerZone, setShowDangerZone] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deletando, setDeletando] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const [u, conf] = await Promise.all([getUsuarioAtual(), getConfig()]);
                if (!u) { router.replace('/'); return; }
                setUser(u);
                setPerfilNome(u.nome || '');
                setPerfilTipo(u.tipo || 'autonomo');

                const { data: userData } = await supabase.auth.getUser();
                if (userData.user?.user_metadata?.avatar_url) {
                    setAvatarUrl(userData.user.user_metadata.avatar_url);
                }
                const providers = userData.user?.app_metadata?.providers || [];
                setIsGoogleUser(providers.includes('google'));

                setConf(conf);

                if (conf) {
                    setPercInputs({
                        custoFixoTotal: String(conf.custoFixoTotal),
                        percImpostos: String(conf.percImpostos).replace('.', ','),
                        percComissoes: String(conf.percComissoes).replace('.', ','),
                        percTaxaCartao: String(conf.percTaxaCartao).replace('.', ','),
                        percInvestimentos: String(conf.percInvestimentos).replace('.', ','),
                        percLucroDesejado: String(conf.percLucroDesejado).replace('.', ','),
                        numPessoas: String(conf.numPessoas),
                        horasDiarias: String(conf.horasDiarias),
                        diasTrabalhadosMes: String(conf.diasTrabalhadosMes),
                        percProdutividade: String(conf.percProdutividade).replace('.', ','),
                    });
                }
            } catch (err) {
                console.error("Erro ao carregar configurações:", err);
            } finally {
                setMounted(true);
            }
        }
        load();
    }, [router]);

    function parseBRL(val: string): number {
        const cleaned = val.replace(/\./g, '').replace(',', '.');
        return parseFloat(cleaned) || 0;
    }

    function maskBRL(val: string): string {
        if (!val) return '';
        let v = val.replace(/[^\d,]/g, '');
        if (!v) return '';
        const parts = v.split(',');
        let intPart = parts[0];
        const decPart = parts.length > 1 ? ',' + parts[1].substring(0, 2) : '';
        intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return intPart + decPart;
    }

    function handlePercChange(key: keyof ConfiguracaoUsuario, val: string) {
        const displayVal = key === 'custoFixoTotal' ? maskBRL(val) : val;
        setPercInputs(prev => ({ ...prev, [key]: displayVal }));

        let n: number;
        if (key === 'custoFixoTotal') {
            n = parseBRL(val);
        } else {
            const cleaned = val.replace(',', '.');
            n = parseFloat(cleaned) || 0;
        }

        setConf((prev) => prev ? { ...prev, [key]: n } : prev);
    }

    const [showAcademy, setShowAcademy] = useState(false);

    function triggerFileSelect() {
        document.getElementById('avatar-upload')?.click();
    }

    function handleFotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }

    async function handleSalvar() {
        if (!config || !user) return;
        setSalvando(true);
        try {
            await atualizarUsuario({ nome: perfilNome, tipo: perfilTipo });

            const updateData: Record<string, unknown> = {};
            if (avatarUrl) {
                updateData.data = { avatar_url: avatarUrl };
            }

            if (novaSenha.trim().length >= 6) {
                updateData.password = novaSenha;
            }

            if (Object.keys(updateData).length > 0) {
                await supabase.auth.updateUser(updateData);
                setNovaSenha('');
            }

            await salvarConfig(config);
            setSalvo(true);
            setSalvando(false);
            setTimeout(() => setSalvo(false), 2000);
        } catch (err) {
            console.error(err);
            setSalvando(false);
            alert('Erro ao salvar configurações.');
        }
    }

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
        <div className="settings-wrapper">
            <main className="page-content">
                <ConfigTour />
                <div className="container" style={{ maxWidth: '800px' }}>

                    <header className="page-header animate-fadeIn" style={{ marginBottom: 32 }}>
                        <p className="section-title">BASE DE CÁLCULO</p>
                        <h2 className="title-platinum">Ajustes & Margens</h2>
                        <p className="text-secondary text-sm" style={{ marginTop: 8 }}>
                            Configure os alicerces financeiros da sua barbearia para uma precificação precisa.
                        </p>
                    </header>

                    <div className="settings-form animate-slideUp">

                        {/* Perfil do Usuário */}
                        <section className="config-card glass">
                            <div className="card-header-flex">
                                <div className="card-title-box">
                                    <User size={20} className="text-amber" />
                                    <h3>Meu Perfil</h3>
                                </div>
                            </div>

                            <div className="profile-edit-box">
                                <div className="avatar-section">
                                    <div className="avatar-preview" onClick={triggerFileSelect}>
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="avatar-img" />
                                        ) : (
                                            <Camera size={24} className="text-disabled" />
                                        )}
                                        <input
                                            type="file"
                                            id="avatar-upload"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handleFotoUpload}
                                        />
                                    </div>
                                    <p className="avatar-hint">Toque para trocar foto</p>
                                </div>

                                <div className="profile-inputs">
                                    <div className="form-group">
                                        <label className="form-label-mini">NOME COMPLETO</label>
                                        <input
                                            type="text"
                                            className="form-input-platinum"
                                            value={perfilNome}
                                            onChange={e => setPerfilNome(e.target.value)}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label-mini">VOCÊ É</label>
                                        <div className="tipo-selector">
                                            <button
                                                type="button"
                                                className={`tipo-btn ${perfilTipo === 'autonomo' ? 'active' : ''}`}
                                                onClick={() => setPerfilTipo('autonomo')}
                                            >
                                                Autônomo
                                            </button>
                                            <button
                                                type="button"
                                                className={`tipo-btn ${perfilTipo === 'empresario' ? 'active' : ''}`}
                                                onClick={() => setPerfilTipo('empresario')}
                                            >
                                                Empresário
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {!isGoogleUser && (
                                <div className="form-group password-group" style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
                                    <label className="form-label-mini">
                                        <KeyRound size={12} /> TROCAR SENHA
                                    </label>
                                    <input
                                        type="password"
                                        className="form-input-platinum"
                                        placeholder="Digite nova senha (min 6 caracteres)"
                                        value={novaSenha}
                                        onChange={e => setNovaSenha(e.target.value)}
                                        minLength={6}
                                        autoComplete="new-password"
                                    />
                                    <p className="helper-text">Deixe em branco se não quiser alterar sua senha atual.</p>
                                </div>
                            )}
                        </section>

                        {/* Capacidade Produtiva */}
                        <section className="config-card glass">
                            <div className="card-header-flex">
                                <div className="card-title-box">
                                    <Clock size={20} className="text-amber" />
                                    <h3>Capacidade Produtiva</h3>
                                </div>
                            </div>

                            <div className="form-grid-3">
                                <div className="form-group">
                                    <label className="form-label-mini">
                                        <Users size={12} /> PESSOAS
                                        <InfoTooltip text="Quantos profissionais trabalham na barbearia. Inclua sócios e funcionários que atendem clientes." />
                                    </label>
                                    <input type="text" inputMode="numeric" className="form-input-platinum" value={percInputs.numPessoas ?? '1'}
                                        onChange={(e) => handlePercChange('numPessoas', e.target.value)}
                                        onFocus={(e) => e.target.value === '0' && handlePercChange('numPessoas', '')}
                                        onBlur={(e) => e.target.value === '' && handlePercChange('numPessoas', '0')} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label-mini">
                                        <Clock size={12} /> HORAS/DIA
                                        <InfoTooltip text="Horas de atendimento por dia, sem contar intervalos e almoço. Ex.: se abre às 9h e fecha às 18h com 1h de almoço, coloque 8." />
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        id="horas-diarias"
                                        className="form-input-platinum"
                                        value={percInputs.horasDiarias ?? '8'}
                                        onChange={(e) => handlePercChange('horasDiarias', e.target.value)}
                                        onFocus={(e) => e.target.value === '0' && handlePercChange('horasDiarias', '')}
                                        onBlur={(e) => e.target.value === '' && handlePercChange('horasDiarias', '0')} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label-mini">
                                        <Calendar size={12} /> DIAS/MÊS
                                        <InfoTooltip text="Média de dias trabalhados por mês. Em um mês comum são 22 dias úteis. Descontar feriados e folgas que a equipe tira." />
                                    </label>
                                    <input type="text" inputMode="numeric" className="form-input-platinum" value={percInputs.diasTrabalhadosMes ?? '22'}
                                        onChange={(e) => handlePercChange('diasTrabalhadosMes', e.target.value)}
                                        onFocus={(e) => e.target.value === '0' && handlePercChange('diasTrabalhadosMes', '')}
                                        onBlur={(e) => e.target.value === '' && handlePercChange('diasTrabalhadosMes', '0')} />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: 20 }}>
                                <label className="form-label-mini">
                                    <Percent size={12} /> PRODUTIVIDADE MÉDIA
                                    <InfoTooltip text="Percentual do tempo em que há atendimento real. Ex.: em 8h de expediente, se 6h ficam com clientes na cadeira, a produtividade é 75%. Se trabalha sem parar, coloque 100%." />
                                </label>
                                <div className="input-with-suffix" id="perc-produtividade">
                                    <input type="text" inputMode="decimal" className="form-input-platinum" value={percInputs.percProdutividade ?? '100'}
                                        onChange={(e) => handlePercChange('percProdutividade', e.target.value)}
                                        onFocus={(e) => e.target.value === '0' && handlePercChange('percProdutividade', '')}
                                        onBlur={(e) => e.target.value === '' && handlePercChange('percProdutividade', '0')} />
                                    <span className="suffix">%</span>
                                </div>
                                <p className="helper-text">Eficiência real da sua equipe durante o expediente.</p>
                            </div>
                        </section>

                        {/* Custo Fixo */}
                        <section className="config-card glass">
                            <div className="card-header-flex">
                                <div className="card-title-box">
                                    <Briefcase size={20} className="text-amber" />
                                    <h3>Custo Fixo Mensal</h3>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label-mini">
                                    DESPESAS TOTAIS
                                    <InfoTooltip text="Tudo que a empresa paga todo mês, independente de atender ou não: aluguel, energia, água, internet, salários fixos de funcionários e o seu próprio pró-labore (o salário que você retira como dono)." />
                                </label>
                                <div className="input-with-prefix" id="custo-fixo-total">
                                    <span className="prefix">R$</span>
                                    <input type="text" inputMode="decimal" className="form-input-platinum" value={percInputs.custoFixoTotal ?? '0'}
                                        onChange={(e) => handlePercChange('custoFixoTotal', e.target.value)}
                                        onFocus={(e) => e.target.value === '0' && handlePercChange('custoFixoTotal', '')}
                                        onBlur={(e) => e.target.value === '' && handlePercChange('custoFixoTotal', '0')} />
                                </div>
                                <p className="helper-text">Soma de aluguel, luz, internet, salários fixos e pro-labore.</p>
                            </div>
                        </section>

                        {/* Deduções e Lucro */}
                        <section className="config-card glass">
                            <div className="card-header-flex">
                                <div className="card-title-box">
                                    <BarChart3 size={20} className="text-amber" />
                                    <h3>Deduções & Lucro Padrão</h3>
                                </div>
                            </div>
                            <div className="perc-grid">
                                {([
                                    { key: 'percImpostos', label: 'IMPOSTOS', tooltip: 'Percentual de imposto que incide sobre o seu faturamento. MEI paga cerca de 5%, Simples Nacional entre 6% e 15%. Se tiver dúvida, consulte seu contador.' },
                                    { key: 'percComissoes', label: 'COMISSÕES', tooltip: 'Percentual pago ao barbeiro sobre cada serviço realizado. Ex.: se o barbeiro recebe 40% do valor do corte, coloque 40.' },
                                    { key: 'percTaxaCartao', label: 'TAXA CARTÃO', tooltip: 'Percentual médio cobrado pela maquininha. Em geral, débito ≈ 1,5% e crédito ≈ 2,5% a 3%. Use uma média ponderada conforme seus clientes pagam.' },
                                    { key: 'percInvestimentos', label: 'REINVESTIMENTO', tooltip: 'Parte do faturamento reservada para melhorias, equipamentos novos ou emergências. Ex.: 5% significa que R$ 5 de cada R$ 100 faturados vão para uma reserva da empresa.' },
                                    { key: 'percLucroDesejado', label: 'LUCRO LÍQUIDO', tooltip: 'O percentual de lucro limpo que você quer garantir em cada serviço, após pagar todos os custos e deduções. Este valor é a sua recompensa pelo risco de empreender.' },
                                ] as { key: string; label: string; tooltip: string }[]).map(({ key, label, tooltip }) => (
                                    <div key={key} className="form-group">
                                        <label className="form-label-mini">
                                            {label}
                                            <InfoTooltip text={tooltip} />
                                        </label>
                                        <div className="input-with-suffix" id={key}>
                                            <input type="text" inputMode="decimal" className="form-input-platinum"
                                                value={percInputs[key] ?? '0'}
                                                onChange={(e) => handlePercChange(key as any, e.target.value)}
                                                onFocus={(e) => e.target.value === '0' && handlePercChange(key as any, '')}
                                                onBlur={(e) => e.target.value === '' && handlePercChange(key as any, '0')} />
                                            <span className="suffix">%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <button
                            className={`btn-save-platinum ${salvo ? 'success' : ''}`}
                            onClick={handleSalvar}
                            disabled={salvando}
                        >
                            {salvando ? (
                                <span className="loader-mini animate-spin"></span>
                            ) : salvo ? (
                                <><Check size={20} /> CONFIGURAÇÕES SALVAS</>
                            ) : (
                                <><Save size={20} /> SALVAR ALTERAÇÕES</>
                            )}
                        </button>

                        {/* Link Discreto — Exclusão de Conta */}
                        <div className="delete-toggle-area">
                            <button
                                type="button"
                                className="delete-toggle-link"
                                onClick={() => setShowDangerZone(!showDangerZone)}
                            >
                                <AlertTriangle size={14} />
                                {showDangerZone ? 'Ocultar opções avançadas' : 'Opções avançadas da conta'}
                            </button>

                            {showDangerZone && (
                                <div className="danger-zone-revealed">
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-disabled)', marginBottom: 16, lineHeight: 1.6 }}>
                                        A exclusão da conta é <strong style={{ color: '#ef4444' }}>permanente e irreversível</strong>. Todos os seus dados serão apagados definitivamente.
                                    </p>
                                    <button
                                        type="button"
                                        className="btn-delete-account"
                                        onClick={() => setShowDeleteModal(true)}
                                    >
                                        <Trash2 size={16} />
                                        Excluir Minha Conta
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal de Confirmação de Exclusão */}
                {showDeleteModal && (
                    <div className="delete-overlay">
                        <div className="delete-modal">
                            <div className="delete-modal-icon">
                                <AlertTriangle size={40} color="#ef4444" />
                            </div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, textAlign: 'center' }}>Excluir conta permanentemente?</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6, marginBottom: 24 }}>
                                Esta ação <strong style={{ color: '#ef4444' }}>não pode ser desfeita</strong>. Todos os seus dados serão apagados para sempre: precificações, produtos, configurações e feedbacks.
                            </p>
                            <div style={{ marginBottom: 20 }}>
                                <label className="form-label-mini" style={{ color: '#ef4444' }}>DIGITE A PALAVRA-CHAVE PARA CONFIRMAR</label>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-disabled)', marginBottom: 10 }}>Copie e cole ou digite: <strong style={{ color: '#ef4444', fontFamily: 'monospace', fontSize: '0.9rem' }}>DELETAR</strong></p>
                                <input
                                    type="text"
                                    className="form-input-platinum delete-input"
                                    placeholder="Digite DELETAR aqui"
                                    value={deleteConfirmText}
                                    onChange={e => setDeleteConfirmText(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    type="button"
                                    className="btn-cancel-delete"
                                    onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                                    disabled={deletando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn-confirm-delete"
                                    disabled={deleteConfirmText !== 'DELETAR' || deletando}
                                    onClick={async () => {
                                        setDeletando(true);
                                        const result = await deletarConta();
                                        if (result.ok) {
                                            window.location.href = '/';
                                        } else {
                                            alert('Erro ao excluir conta: ' + (result.error || 'Tente novamente.'));
                                            setDeletando(false);
                                        }
                                    }}
                                >
                                    {deletando ? 'Excluindo...' : 'Excluir Permanentemente'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <style jsx>{`
                .title-platinum { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin-top: 4px; }
                
                .settings-form { display: flex; flex-direction: column; gap: 24px; padding-bottom: 40px; }
                
                .config-card {
                    padding: 24px;
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-subtle) !important;
                }
                
                .card-header-flex { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
                .card-title-box { display: flex; align-items: center; gap: 12px; }
                .card-title-box h3 { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); }

                .form-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
                .perc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

                .profile-edit-box { display: flex; gap: 24px; align-items: flex-start; }
                .avatar-section { display: flex; flex-direction: column; align-items: center; gap: 8px; }
                .avatar-preview { width: 80px; height: 80px; border-radius: 50%; background: var(--surface-2); border: 2px dashed var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; transition: all 0.2s; }
                .avatar-preview:hover { border-color: var(--amber); }
                .avatar-img { width: 100%; height: 100%; object-fit: cover; }
                .avatar-hint { font-size: 0.65rem; color: var(--text-disabled); }
                .profile-inputs { flex: 1; display: flex; flex-direction: column; gap: 16px; }
                .tipo-selector { display: flex; gap: 8px; }
                .tipo-btn { flex: 1; padding: 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text-secondary); font-weight: 600; font-size: 0.9rem; transition: all 0.2s; cursor: pointer; }
                .tipo-btn.active { border-color: var(--amber); color: var(--amber); background: var(--amber-dim); }

                .form-label-mini { 
                    font-size: 0.6rem; 
                    font-weight: 800; 
                    color: var(--text-disabled); 
                    letter-spacing: 0.08em; 
                    margin-bottom: 8px; 
                    display: flex; 
                    align-items: center; 
                    gap: 4px;
                }
                
                .form-input-platinum {
                    width: 100%;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 14px 16px;
                    color: var(--text-primary);
                    font-size: 1rem;
                    font-weight: 600;
                    transition: all 0.2s ease;
                }
                .form-input-platinum:focus {
                    outline: none;
                    border-color: var(--amber);
                    background: rgba(212, 175, 55, 0.05);
                    box-shadow: 0 0 0 4px var(--amber-dim);
                }

                .input-with-prefix, .input-with-suffix { position: relative; display: flex; align-items: center; }
                .prefix, .suffix { position: absolute; font-size: 0.85rem; font-weight: 800; color: var(--text-disabled); }
                .prefix { left: 16px; }
                .suffix { right: 16px; }
                .input-with-prefix .form-input-platinum { padding-left: 50px; }
                .input-with-suffix .form-input-platinum { padding-right: 50px; }

                .helper-text { font-size: 0.7rem; color: var(--text-disabled); margin-top: 8px; font-style: italic; }

                .btn-save-platinum {
                    width: 100%;
                    padding: 18px;
                    background: linear-gradient(135deg, var(--amber), #B8860B);
                    border-radius: 16px;
                    color: #000;
                    font-weight: 800;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
                    border: none;
                    cursor: pointer;
                }
                .btn-save-platinum:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 35px rgba(212, 175, 55, 0.4); }
                .btn-save-platinum:disabled { opacity: 0.7; cursor: not-allowed; }
                .btn-save-platinum.success { background: var(--success); color: #fff; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3); }

                .loader-mini { 
                    width: 20px; 
                    height: 20px; 
                    border: 3px solid rgba(0,0,0,0.1); 
                    border-top-color: #000; 
                    border-radius: 50%; 
                }

                @media (max-width: 600px) {
                    .perc-grid { grid-template-columns: 1fr; }
                    .form-grid-3 { gap: 8px; }
                }

                .educational-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-top: 10px;
                }
                .edu-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(212, 175, 55, 0.1);
                    border-left: 3px solid var(--amber);
                    padding: 16px;
                    border-radius: 8px;
                }
                .edu-card h4 {
                    font-size: 0.95rem;
                    font-weight: 800;
                    color: var(--amber);
                    margin-bottom: 8px;
                }
                .edu-card p {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    line-height: 1.5;
                }
                .academy-section {
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .delete-toggle-area {
                    margin-top: 24px;
                    padding-top: 24px;
                    border-top: 1px dashed var(--border);
                    text-align: center;
                }
                .delete-toggle-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: none;
                    border: none;
                    color: var(--text-disabled);
                    font-size: 0.7rem;
                    font-weight: 600;
                    cursor: pointer;
                    opacity: 0.6;
                    transition: all 0.2s;
                }
                .delete-toggle-link:hover {
                    opacity: 1;
                    color: #ef4444;
                }
                .danger-zone-revealed {
                    margin-top: 16px;
                    padding: 20px;
                    border: 1px solid rgba(239, 68, 68, 0.15);
                    border-radius: 16px;
                    background: rgba(239, 68, 68, 0.02);
                    animation: slideDown 0.3s ease;
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-8px); max-height: 0; }
                    to { opacity: 1; transform: translateY(0); max-height: 200px; }
                }
                .text-red { color: #ef4444; }

                .btn-delete-account {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 14px 24px;
                    background: transparent;
                    border: 2px solid rgba(239, 68, 68, 0.3);
                    border-radius: 12px;
                    color: #ef4444;
                    font-weight: 700;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-delete-account:hover {
                    background: rgba(239, 68, 68, 0.08);
                    border-color: #ef4444;
                }

                .delete-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 200;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .delete-modal {
                    background: var(--surface-1);
                    border: 1px solid var(--border);
                    border-radius: 24px;
                    padding: 40px;
                    max-width: 460px;
                    width: 100%;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
                }
                .delete-modal-icon {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    background: rgba(239, 68, 68, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                }
                .delete-input {
                    border-color: rgba(239, 68, 68, 0.3) !important;
                    text-align: center;
                    font-size: 1.1rem !important;
                    letter-spacing: 0.1em;
                }
                .delete-input:focus {
                    border-color: #ef4444 !important;
                    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1) !important;
                    background: rgba(239, 68, 68, 0.03) !important;
                }
                .btn-cancel-delete {
                    flex: 1;
                    padding: 16px;
                    border-radius: 14px;
                    background: var(--surface-2);
                    border: 1px solid var(--border);
                    color: var(--text-secondary);
                    font-weight: 700;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-cancel-delete:hover { background: var(--surface-3); }
                .btn-confirm-delete {
                    flex: 1.5;
                    padding: 16px;
                    border-radius: 14px;
                    background: #ef4444;
                    border: none;
                    color: #fff;
                    font-weight: 800;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-confirm-delete:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                .btn-confirm-delete:not(:disabled):hover {
                    background: #dc2626;
                    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
                }
            `}</style>
        </div>
    );
}
