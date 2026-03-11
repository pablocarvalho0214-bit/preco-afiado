'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUsuarioAtual, logout, deletarUsuario } from '@/lib/storage';
import TopBar from '@/components/TopBar';
import { User, Mail, Shield, Trash2, LogOut, ChevronRight, AlertTriangle } from 'lucide-react';

export default function PerfilPage() {
    const router = useRouter();
    const [usuario, setUsuario] = useState<any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        async function load() {
            const u = await getUsuarioAtual();
            if (!u) router.push('/');
            else setUsuario(u);
        }
        load();
    }, [router]);

    function handleLogout() {
        logout();
        router.push('/');
    }

    async function handleDeleteAccount() {
        if (usuario) {
            await deletarUsuario();
            router.push('/');
        }
    }

    if (!usuario) return null;

    return (
        <div className="perfil-wrapper animate-fadeIn">
            <TopBar title="Seu Perfil" showBack backHref="/dashboard" />

            <main className="page-content container">
                <div className="perfil-layout">

                    {/* Header do Perfil */}
                    <header className="perfil-header glass-card">
                        <div className="avatar-box">
                            <User size={32} />
                        </div>
                        <div className="header-info">
                            <h2 className="user-name">{usuario.nome}</h2>
                            <span className="user-badge">Membro Premium</span>
                        </div>
                    </header>

                    {/* Dados da Conta */}
                    <section className="perfil-section">
                        <h3 className="section-title">Dados Pessoais</h3>
                        <div className="glass-panel info-list">
                            <div className="info-item">
                                <div className="info-icon"><Mail size={18} /></div>
                                <div className="info-content">
                                    <span className="info-label">E-mail</span>
                                    <span className="info-value">{usuario.email}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon"><Shield size={18} /></div>
                                <div className="info-content">
                                    <span className="info-label">Segurança</span>
                                    <span className="info-value">Senha Protegida</span>
                                </div>
                                <ChevronRight size={16} className="item-arrow" />
                            </div>
                        </div>
                    </section>

                    {/* Ações Rápidas */}
                    <section className="perfil-section">
                        <h3 className="section-title">Ações do Sistema</h3>
                        <div className="action-grid">
                            <button onClick={handleLogout} className="glass-card action-btn logout-btn">
                                <LogOut size={20} />
                                <span>Sair da Conta</span>
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="glass-card action-btn delete-trigger-btn"
                            >
                                <Trash2 size={20} />
                                <span>Encerrar Conta</span>
                            </button>
                        </div>
                    </section>

                    {/* Nota de Rodapé */}
                    <footer className="perfil-footer">
                        <p>© 2026 Preço Afiado v2.0</p>
                        <p>Inteligência para Barbearia</p>
                    </footer>
                </div>
            </main>

            {/* Modal de Confirmação de Exclusão */}
            {showDeleteConfirm && (
                <div className="modal-overlay animate-fadeIn">
                    <div className="glass-panel modal-card">
                        <div className="modal-icon warning">
                            <AlertTriangle size={32} />
                        </div>
                        <h3>Excluir Conta?</h3>
                        <p>
                            Essa ação é irreversível. Todas as suas precificações e dados serão removidos permanentemente.
                        </p>
                        <div className="modal-actions">
                            <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">
                                Cancelar
                            </button>
                            <button onClick={handleDeleteAccount} className="btn-delete-final">
                                Sim, Excluir Tudo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .perfil-layout {
                    max-width: 600px;
                    margin: 0 auto;
                    display: grid;
                    gap: 40px;
                }

                .perfil-header {
                    padding: 32px;
                    border-radius: var(--radius-xl);
                    display: flex;
                    align-items: center;
                    gap: 24px;
                }
                .avatar-box {
                    width: 72px; height: 72px;
                    border-radius: 24px;
                    background: var(--amber-dim);
                    color: var(--amber);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .user-name { font-size: 1.5rem; font-weight: 900; color: var(--text-primary); letter-spacing: -0.02em; }
                .user-badge {
                    display: inline-block;
                    font-size: 0.7rem;
                    font-weight: 800;
                    color: var(--amber);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }

                .perfil-section { display: grid; gap: 16px; }
                .section-title {
                    font-size: 0.9rem;
                    font-weight: 800;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    padding-left: 8px;
                }

                .info-list {
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }
                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px;
                    border-bottom: 1px solid var(--border);
                }
                .info-item:last-child { border-bottom: none; }
                .info-icon { color: var(--text-disabled); }
                .info-content { flex: 1; }
                .info-label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-disabled); }
                .info-value { display: block; font-weight: 700; color: var(--text-primary); }
                .item-arrow { color: var(--text-disabled); }

                .action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .action-btn {
                    padding: 24px;
                    border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    font-weight: 800;
                    font-size: 0.9rem;
                    cursor: pointer;
                }
                .logout-btn { color: var(--text-primary); }
                .delete-trigger-btn { color: var(--error); border-color: rgba(239, 68, 68, 0.1); }
                .delete-trigger-btn:hover { background: rgba(239, 68, 68, 0.05); border-color: var(--error); }

                .perfil-footer {
                    text-align: center;
                    color: var(--text-disabled);
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(8px);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }
                .modal-card {
                    max-width: 400px;
                    width: 100%;
                    padding: 40px;
                    border-radius: var(--radius-xl);
                    text-align: center;
                }
                .modal-icon.warning { color: var(--error); margin-bottom: 20px; }
                .modal-card h3 { font-size: 1.4rem; font-weight: 900; margin-bottom: 12px; }
                .modal-card p { color: var(--text-secondary); margin-bottom: 32px; line-height: 1.6; }
                
                .modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .btn-secondary { background: var(--surface-2); color: var(--text-primary); border: 1px solid var(--border); }
                .btn-delete-final {
                    background: var(--error);
                    color: #fff;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 800;
                    cursor: pointer;
                    transition: var(--transition-fast);
                    padding: 12px;
                }
                .btn-delete-final:hover { transform: scale(1.02); background: #CA3A3A; }

                @media (max-width: 480px) {
                    .action-grid { grid-template-columns: 1fr; }
                    .perfil-header { flex-direction: column; text-align: center; padding: 40px 24px; }
                }
            `}</style>
        </div>
    );
}
