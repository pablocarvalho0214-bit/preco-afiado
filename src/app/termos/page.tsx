'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, FileText, Users, AlertTriangle, Scale, ArrowLeft, CheckCircle } from 'lucide-react';

export default function TermosPage() {
    const dataAtual = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const secoes = [
        {
            id: 'aceitacao',
            titulo: '1. Aceitação dos Termos',
            icone: <Shield className="text-amber-600" size={24} />,
            conteudo: 'Ao acessar ou usar o aplicativo Preço Afiado, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá acessar o aplicativo. O Preço Afiado é uma ferramenta de precificação inteligente voltada a profissionais de barbearia.'
        },
        {
            id: 'cadastro',
            titulo: '2. Cadastro e Conta',
            icone: <Users className="text-amber-600" size={24} />,
            conteudo: [
                'Você é responsável por manter a confidencialidade da sua conta e senha.',
                'As informações fornecidas no cadastro devem ser verdadeiras e atualizadas.',
                'Cada usuário pode manter apenas uma conta ativa.'
            ]
        },
        {
            id: 'uso',
            titulo: '3. Uso do Serviço',
            icone: <FileText className="text-amber-600" size={24} />,
            conteudo: 'O aplicativo deve ser utilizado apenas para fins de gestão e precificação de serviços de barbearia. É proibido qualquer uso que viole leis locais ou internacionais.'
        },
        {
            id: 'privacidade',
            titulo: '4. Privacidade e Dados',
            icone: <CheckCircle className="text-amber-600" size={24} />,
            conteudo: 'Coletamos dados básicos para o funcionamento do sistema. Seus dados de faturamento e custos são privados e não são compartilhados com terceiros.'
        },
        {
            id: 'responsabilidade',
            titulo: '5. Limitação de Responsabilidade',
            icone: <AlertTriangle className="text-amber-600" size={24} />,
            conteudo: 'O Preço Afiado fornece sugestões baseadas nos dados inseridos, mas a decisão final de preço e a saúde financeira do negócio são de total responsabilidade do usuário.'
        },
        {
            id: 'propriedade',
            titulo: '6. Propriedade Intelectual',
            icone: <Scale className="text-amber-600" size={24} />,
            conteudo: 'Todo o conteúdo do Preço Afiado, incluindo design, algoritmos e logotipos, é propriedade exclusiva e protegido por direitos autorais.'
        },
        {
            id: 'alteracoes',
            titulo: '7. Alterações nos Termos',
            icone: <FileText className="text-amber-600" size={24} />,
            conteudo: 'Reservamos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre mudanças significativas.'
        },
        {
            id: 'contato',
            titulo: '8. Contato',
            icone: <Users className="text-amber-600" size={24} />,
            conteudo: 'Dúvidas sobre estes termos podem ser enviadas através do suporte oficial no aplicativo.'
        }
    ];

    return (
        <div className="termos-container">
            <header className="termos-header">
                <div className="header-content">
                    <Link href="/" className="btn-voltar">
                        <ArrowLeft size={20} />
                        <span>Voltar para o Login</span>
                    </Link>
                    <div className="header-title">
                        <FileText className="text-amber-600" size={32} />
                        <h1>Termos de Uso</h1>
                        <p>Última atualização: {dataAtual}</p>
                    </div>
                </div>
            </header>

            <main className="termos-content">
                <div className="content-wrapper">
                    {secoes.map((secao) => (
                        <section key={secao.id} className="termos-section">
                            <div className="section-header">
                                {secao.icone}
                                <h2>{secao.titulo}</h2>
                            </div>
                            <div className="section-body">
                                {Array.isArray(secao.conteudo) ? (
                                    <ul>
                                        {secao.conteudo.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>{secao.conteudo}</p>
                                )}
                            </div>
                        </section>
                    ))}
                </div>
            </main>

            <footer className="termos-footer">
                <p>&copy; {new Date().getFullYear()} Preço Afiado. Todos os direitos reservados.</p>
            </footer>

            <style jsx>{`
                .termos-container {
                    min-height: 100vh;
                    background-color: #ffffff;
                    color: #1a1a1a;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }

                .termos-header {
                    background-color: #f8f9fa;
                    border-bottom: 1px solid #e9ecef;
                    padding: 40px 20px;
                }

                .header-content {
                    max-width: 800px;
                    margin: 0 auto;
                    position: relative;
                }

                .btn-voltar {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #6c757d;
                    text-decoration: none;
                    font-weight: 500;
                    font-size: 0.9rem;
                    margin-bottom: 30px;
                    transition: color 0.2s;
                }

                .btn-voltar:hover {
                    color: #D4AF37;
                }

                .header-title {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                }

                .header-title h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin: 0;
                    color: #111;
                }

                .header-title p {
                    color: #6c757d;
                    margin: 0;
                }

                .termos-content {
                    padding: 60px 20px;
                }

                .content-wrapper {
                    max-width: 800px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 40px;
                }

                .termos-section {
                    background: #fff;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .section-header h2 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin: 0;
                    color: #111;
                }

                .section-body {
                    color: #4a4a4a;
                    line-height: 1.6;
                }

                .section-body p {
                    margin: 0;
                }

                .section-body ul {
                    margin: 0;
                    padding-left: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .termos-footer {
                    padding: 40px 20px;
                    text-align: center;
                    background-color: #f8f9fa;
                    border-top: 1px solid #e9ecef;
                    color: #6c757d;
                    font-size: 0.875rem;
                }

                @media (max-width: 640px) {
                    .header-title h1 {
                        font-size: 1.75rem;
                    }
                    
                    .termos-content {
                        padding: 40px 15px;
                    }
                }
            `}</style>
        </div>
    );
}
