'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SideNav from './SideNav';
import BottomNav from './BottomNav';
import TopBar from './TopBar';
import Chatbot from './Chatbot';
import { useAuth } from '@/contexts/AuthContext';
import { updateLastSeen } from '@/lib/storage';

export default function NavigationWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user, isAuthenticated, loading } = useAuth();

    // Rotas que NÃO devem mostrar navegação padrão
    const standaloneRoutes = ['/', '/termos'];
    const isStandalone = standaloneRoutes.includes(pathname);

    useEffect(() => {
        if (isAuthenticated && !isStandalone) {
            updateLastSeen();
            const interval = setInterval(updateLastSeen, 1000 * 60 * 5);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, isStandalone]);

    // Lógica dinâmica para o TopBar
    const getTopBarProps = () => {
        if (pathname === '/dashboard') return { title: 'Painel Principal' };
        if (pathname === '/categorias') return { title: 'O que vamos precificar?', showBack: true, backHref: '/dashboard' };
        if (pathname === '/historico') return { title: 'Histórico de Preços', showBack: true, backHref: '/dashboard' };
        if (pathname === '/produtos') return { title: 'Gerenciar Insumos', showBack: true, backHref: '/dashboard' };
        if (pathname === '/configuracoes') return { title: 'Ajustes & Margens', showBack: true, backHref: '/dashboard', showLogout: true };
        if (pathname === '/stats') return { title: 'Estatísticas do App', showBack: true, backHref: '/dashboard' };
        if (pathname.startsWith('/precificar')) return { title: 'Precificando', showBack: true };
        if (pathname.startsWith('/resultado')) return { title: 'Resultado da Precificação', showBack: true, backHref: '/historico' };
        if (pathname === '/produtos/novo') return { title: 'Novo Produto', showBack: true, backHref: '/produtos' };
        if (pathname.includes('/editar')) return { title: 'Editar Produto', showBack: true, backHref: '/produtos' };
        return { title: 'Preço Afiado' };
    };

    if (isStandalone) return <>{children}</>;
    if (loading) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {isAuthenticated && (
                <div className="hidden lg:block w-72 h-full flex-shrink-0">
                    <SideNav />
                </div>
            )}

            <div className="flex flex-col flex-1 min-w-0 h-full relative">
                {isAuthenticated && <TopBar {...getTopBarProps()} />}

                <main className={`flex-1 overflow-x-hidden overflow-y-auto ${isAuthenticated ? 'pb-24 lg:pb-0' : ''}`}>
                    {children}
                </main>

                {isAuthenticated && (
                    <div className="lg:hidden">
                        <BottomNav />
                    </div>
                )}

                {isAuthenticated && <Chatbot />}
            </div>
        </div>
    );
}
