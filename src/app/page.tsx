'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login, cadastrar, getUsuarioAtual, loginComGoogle, resetarSenha, atualizarSenha } from '@/lib/storage';
import { supabase } from '@/lib/supabaseClient';
import { Scissors, Lock, Mail, User, Eye, EyeOff, X, CheckCircle, Key } from 'lucide-react';
import Logo from '@/components/Logo';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);
export default function HomePage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'cadastro'>('login');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [resetError, setResetError] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [showNovaSenha, setShowNovaSenha] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });

  useEffect(() => {
    // 1. Detecção imediata via URL (caso o evento demore a disparar)
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      setIsRecoveryMode(true);
      setTab('login');
      setLoading(false);
    }

    // 2. Escutar eventos de Auth (especialmente Recuperação de Senha)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        setTab('login');
      }
    });

    async function check() {
      // Se detectamos recuperação via URL no passo 1, não precisamos checar usuário agora
      if (window.location.hash.includes('type=recovery')) return;

      const u = await getUsuarioAtual();
      // Só redireciona se NÃO estiver em modo de recuperação
      if (u && !isRecoveryMode) {
        router.replace('/dashboard');
        return;
      }
      setLoading(false);
    }
    check();

    return () => {
      subscription.unsubscribe();
    };
  }, [router, isRecoveryMode]);

  async function handleGoogleLogin() {
    setError('');
    setSubmitting(true);
    try {
      const result = await loginComGoogle();
      if (!result.ok) setError(result.error ?? 'Erro ao entrar com Google.');
    } catch (err) {
      setError('Falha ao iniciar login com Google.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResetSenha() {
    if (!resetEmail) { setResetError('Informe seu e-mail.'); return; }
    setResetStatus('sending');
    setResetError('');
    try {
      const result = await resetarSenha(resetEmail);
      if (result.ok) { setResetStatus('sent'); }
      else { setResetStatus('error'); setResetError(result.error ?? 'Erro ao enviar e-mail.'); }
    } catch {
      setResetStatus('error');
      setResetError('Falha de conexão.');
    }
  }

  async function handleAtualizarSenha(e: React.FormEvent) {
    e.preventDefault();
    if (novaSenha !== confirmarNovaSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    if (novaSenha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const result = await atualizarSenha(novaSenha);
      if (result.ok) {
        alert('Senha atualizada com sucesso! Agora você pode entrar com sua nova senha.');
        setIsRecoveryMode(false);
        setFormData({ ...formData, senha: '' });
      } else {
        setError(result.error ?? 'Erro ao atualizar senha.');
      }
    } catch (err) {
      setError('Falha ao atualizar senha.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tab === 'cadastro' && formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem.');
      return;
    }
    if (tab === 'cadastro' && !aceitouTermos) {
      setError('Você precisa aceitar os Termos de Uso para continuar.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const result = tab === 'login'
        ? await login(formData.email, formData.senha)
        : await cadastrar({ ...formData, tipo: 'autonomo' });

      if (result.ok) router.push('/dashboard');
      else setError(result.error ?? 'Erro ao processar solicitação.');
    } catch (err) {
      setError('Falha na conexão com o servidor.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  return (
    <div className="landing-wrapper animate-fadeIn">
      <main className="landing-main container">
        <div className="landing-grid">

          {/* Brand Section */}
          <div className="brand-section">
            <div className="logo-badge animate-slideUp">
              <Logo size={80} />
            </div>
            <h1 className="landing-title animate-slideUp" style={{ animationDelay: '0.1s' }}>
              Preço <span className="text-amber">Afiado</span>
            </h1>
            <p className="landing-tagline animate-slideUp" style={{ animationDelay: '0.2s' }}>
              A inteligência por trás do seu lucro. Sofisticação e precisão para a sua barbearia.
            </p>

            <div className="brand-features animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <div className="feature-item">
                <div className="feature-icon"><Scissors size={18} /></div>
                <span>Cálculos Precisos</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon"><Lock size={18} /></div>
                <span>Gestão Segura</span>
              </div>
            </div>
          </div>

          {/* Auth Section */}
          <div className="auth-section animate-slideUp" style={{ animationDelay: '0.4s' }}>
            <div className="glass-panel auth-card">
              <div className="auth-tabs">
                <button
                  className={`auth-tab ${tab === 'login' || isRecoveryMode ? 'active' : ''}`}
                  onClick={() => { setTab('login'); setIsRecoveryMode(false); }}
                >
                  {isRecoveryMode ? 'Redefinir Senha' : 'Entrar'}
                </button>
                {!isRecoveryMode && (
                  <button
                    className={`auth-tab ${tab === 'cadastro' ? 'active' : ''}`}
                    onClick={() => setTab('cadastro')}
                  >
                    Criar Conta
                  </button>
                )}
              </div>

              {isRecoveryMode ? (
                <form className="auth-form" onSubmit={handleAtualizarSenha}>
                  <div className="reset-info">
                    <Key size={20} className="text-amber" />
                    <p>Crie uma nova senha para sua conta profissional.</p>
                  </div>

                  <div className="input-group">
                    <label>Nova Senha</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={18} />
                      <input
                        type={showNovaSenha ? 'text' : 'password'}
                        placeholder="Mínimo 6 caracteres"
                        value={novaSenha}
                        onChange={e => setNovaSenha(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowNovaSenha(!showNovaSenha)}
                      >
                        {showNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Confirmar Nova Senha</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={18} />
                      <input
                        type={showNovaSenha ? 'text' : 'password'}
                        placeholder="Repita a nova senha"
                        value={confirmarNovaSenha}
                        onChange={e => setConfirmarNovaSenha(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {error && <p className="error-msg">{error}</p>}

                  <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                    {submitting ? 'Atualizando...' : 'Definir Nova Senha'}
                  </button>

                  <button
                    type="button"
                    className="btn-back-login"
                    onClick={() => setIsRecoveryMode(false)}
                  >
                    Cancelar e voltar ao login
                  </button>
                </form>
              ) : (
                <form className="auth-form" onSubmit={handleSubmit}>
                  {tab === 'cadastro' && (
                    <div className="input-group">
                      <label>Nome Completo</label>
                      <div className="input-wrapper">
                        <User className="input-icon" size={18} />
                        <input
                          type="text"
                          placeholder="Seu nome"
                          value={formData.nome}
                          onChange={e => setFormData({ ...formData, nome: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="input-group">
                    <label>E-mail Profissional</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" size={18} />
                      <input
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Senha</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="with-eye"
                        placeholder="••••••••"
                        value={formData.senha}
                        onChange={e => setFormData({ ...formData, senha: e.target.value })}
                        onPaste={tab === 'cadastro' ? (e) => e.preventDefault() : undefined}
                        onCopy={tab === 'cadastro' ? (e) => e.preventDefault() : undefined}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        title={showPassword ? "Ocultar senha" : "Ver senha"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {tab === 'login' && (
                    <div className="forgot-password-row">
                      <button type="button" className="forgot-link" onClick={() => { setShowResetModal(true); setResetEmail(formData.email); setResetStatus('idle'); setResetError(''); }}>
                        Esqueci minha senha
                      </button>
                    </div>
                  )}

                  {tab === 'cadastro' && (
                    <div className="input-group">
                      <label>Confirmar Senha</label>
                      <div className="input-wrapper">
                        <Lock className="input-icon" size={18} />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="with-eye"
                          placeholder="••••••••"
                          value={formData.confirmarSenha}
                          onChange={e => setFormData({ ...formData, confirmarSenha: e.target.value })}
                          onPaste={(e) => e.preventDefault()}
                          onCopy={(e) => e.preventDefault()}
                          required
                        />
                        <button
                          type="button"
                          className="toggle-password"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          tabIndex={-1}
                          title={showConfirmPassword ? "Ocultar senha" : "Ver senha"}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {tab === 'cadastro' && (
                    <div className="termos-check">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={aceitouTermos}
                          onChange={(e) => setAceitouTermos(e.target.checked)}
                          className="termos-checkbox"
                        />
                        <span className="checkbox-custom">
                          {aceitouTermos && <CheckCircle size={16} />}
                        </span>
                        <span className="checkbox-text">
                          Li e concordo com os{' '}
                          <Link href="/termos" target="_blank" className="termos-link">Termos de Uso</Link>
                        </span>
                      </label>
                    </div>
                  )}

                  {error && <p className="error-msg">{error}</p>}

                  <button type="submit" className="btn btn-primary w-full" disabled={submitting || (tab === 'cadastro' && !aceitouTermos)}>
                    {submitting ? 'Processando...' : tab === 'login' ? 'Acessar Barbearia' : 'Começar Agora'}
                  </button>

                  <div className="divider">
                    <span>ou</span>
                  </div>

                  <button type="button" onClick={handleGoogleLogin} className="btn-google">
                    <GoogleIcon />
                    <span>Continuar com Google</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Reset de Senha */}
      {showResetModal && (
        <div className="reset-overlay" onClick={() => setShowResetModal(false)}>
          <div className="reset-modal glass-panel" onClick={(e) => e.stopPropagation()}>
            <button className="reset-close" onClick={() => setShowResetModal(false)}><X size={20} /></button>

            {resetStatus === 'sent' ? (
              <div className="reset-success">
                <div className="reset-success-icon"><CheckCircle size={48} /></div>
                <h3>E-mail enviado!</h3>
                <p>Verifique sua caixa de entrada e spam. O link para redefinir sua senha foi enviado para <strong>{resetEmail}</strong>.</p>
                <button className="btn btn-primary w-full" onClick={() => setShowResetModal(false)}>Entendi</button>
              </div>
            ) : (
              <>
                <div className="reset-header">
                  <Lock size={28} className="text-amber" />
                  <h3>Recuperar Senha</h3>
                  <p>Informe o e-mail da sua conta e enviaremos um link para redefinir sua senha.</p>
                </div>
                <div className="input-group">
                  <label>E-mail da Conta</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {resetError && <p className="error-msg">{resetError}</p>}
                <button className="btn btn-primary w-full" onClick={handleResetSenha} disabled={resetStatus === 'sending'}>
                  {resetStatus === 'sending' ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
            .landing-wrapper { min-height: 100dvh; display: flex; align-items: center; padding: 40px 0; }
            .landing-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 80px; align-items: center; }
            .brand-section { max-width: 500px; }
            .logo-badge { margin-bottom: 24px; filter: drop-shadow(0 10px 20px var(--amber-glow)); }
            .landing-title { font-size: 3.5rem; font-weight: 900; color: var(--text-primary); letter-spacing: -0.04em; margin-bottom: 20px; }
            .text-amber { color: var(--amber); }
            .landing-tagline { font-size: 1.2rem; color: var(--text-secondary); margin-bottom: 32px; font-weight: 500; }
            .brand-features { display: flex; gap: 24px; }
            .feature-item { display: flex; align-items: center; gap: 10px; font-weight: 700; color: var(--text-primary); }
            .feature-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--amber-dim); color: var(--amber); display: flex; align-items: center; justify-content: center; }

            .auth-card { padding: 40px; border-radius: var(--radius-xl); }
            .auth-tabs { display: flex; background: var(--surface-2); padding: 6px; border-radius: 16px; margin-bottom: 32px; }
            .auth-tab { flex: 1; padding: 12px; border-radius: 12px; font-weight: 800; color: var(--text-secondary); background: transparent; border: none; cursor: pointer; }
            .auth-tab.active { background: var(--bg); color: var(--text-primary); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

            .auth-form { display: grid; gap: 20px; }
            .input-group label { display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px; }
            .input-wrapper { position: relative; display: flex; align-items: center; }
            .input-icon { position: absolute; left: 20px; color: var(--text-disabled); }
            .input-wrapper input { width: 100%; padding: 14px 14px 14px 54px; background: var(--surface-2); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); transition: all 0.2s ease; }
            .input-wrapper input.with-eye { padding-right: 50px; }
            .input-wrapper input:focus { outline: none; border-color: var(--amber); background: var(--bg); box-shadow: 0 0 0 4px var(--amber-dim); }
            .toggle-password { position: absolute; right: 16px; background: transparent; border: none; color: var(--text-disabled); cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; transition: color 0.2s; }
            .toggle-password:hover { color: var(--text-primary); }

            .forgot-password-row { text-align: right; margin-top: -10px; }
            .forgot-link { background: none; border: none; color: var(--amber); font-size: 0.82rem; font-weight: 700; cursor: pointer; padding: 0; transition: opacity 0.2s; }
            .forgot-link:hover { opacity: 0.8; text-decoration: underline; }

            .termos-check { margin-top: -4px; }
            .checkbox-label { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
            .termos-checkbox { display: none; }
            .checkbox-custom { flex-shrink: 0; width: 22px; height: 22px; border-radius: 6px; border: 2px solid var(--border); background: var(--surface-2); display: flex; align-items: center; justify-content: center; color: var(--amber); transition: all 0.2s; }
            .termos-checkbox:checked + .checkbox-custom { background: var(--amber-dim); border-color: var(--amber); }
            .checkbox-text { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; padding-top: 1px; }
            .termos-link { color: var(--amber); font-weight: 700; text-decoration: underline; transition: opacity 0.2s; }
            .termos-link:hover { opacity: 0.8; }

            .w-full { width: 100%; }
            .error-msg { color: var(--error); font-size: 0.85rem; font-weight: 600; text-align: center; }
            .divider { display: flex; align-items: center; gap: 16px; color: var(--text-disabled); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
            .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }

            .btn-google { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 14px; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-md); font-weight: 700; color: var(--text-primary); cursor: pointer; }

            .reset-info { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--amber-dim); border-radius: 12px; margin-bottom: 8px; }
            .reset-info p { font-size: 0.85rem; color: var(--text-primary); font-weight: 600; margin: 0; }
            .btn-back-login { background: none; border: none; color: var(--text-disabled); font-size: 0.85rem; font-weight: 600; cursor: pointer; margin-top: 10px; transition: color 0.2s; }
            .btn-back-login:hover { color: var(--text-primary); text-decoration: underline; }

            /* Modal Reset */
            .reset-overlay { position: fixed; inset: 0; z-index: 10000; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 24px; }
            .reset-modal { position: relative; max-width: 420px; width: 100%; padding: 36px; border-radius: var(--radius-xl); display: grid; gap: 20px; }
            .reset-close { position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-disabled); cursor: pointer; }
            .reset-close:hover { color: var(--text-primary); }
            .reset-header { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px; }
            .reset-header h3 { font-size: 1.3rem; font-weight: 900; color: var(--text-primary); margin: 4px 0 0; }
            .reset-header p { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; }
            .reset-success { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
            .reset-success-icon { color: var(--success, #4ade80); }
            .reset-success h3 { font-size: 1.3rem; font-weight: 900; color: var(--text-primary); }
            .reset-success p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 8px; }
            .reset-success strong { color: var(--text-primary); }

            @media (max-width: 1024px) {
                .landing-grid { grid-template-columns: 1fr; gap: 60px; text-align: center; }
                .brand-section { max-width: 100%; }
                .brand-features { justify-content: center; }
            }
        `}</style>
    </div>
  );
}
