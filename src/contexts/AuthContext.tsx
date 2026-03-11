'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUsuarioAtual, Usuario, logout as storageLogout } from '@/lib/storage';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextType {
    user: Usuario | null;
    loading: boolean;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const u = await getUsuarioAtual();
            setUser(u);
        } catch (err) {
            console.error('Erro ao atualizar usuário no context:', err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Carga inicial
        refreshUser();

        // Escutar mudanças de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                await refreshUser();
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const logout = async () => {
        await storageLogout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated: !!user,
            refreshUser,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}
