import { supabase } from './supabaseClient';
import type { ConfiguracaoUsuario, Produto } from './calculos';
export type { ConfiguracaoUsuario, Produto };

// ─────────────────────────────────────────────────────────────
//  TIPOS DE DOMÍNIO
// ─────────────────────────────────────────────────────────────

export interface Usuario {
    id: string;
    nome: string;
    email: string;
    tipo: 'autonomo' | 'empresario';
    avatarUrl?: string;
    criadoEm: string;
}

export interface PrecificacaoSalva {
    id: string;
    userId: string;
    nomeServico: string;
    categoriaId: string;
    categoriaNome: string;
    categoriaEmoji: string;
    config: ConfiguracaoUsuario;
    produtosUsados: { produto: Produto; volumeUsado: number }[];
    itensPacote?: {
        precificacaoId: string;
        quantidade: number;
        nome: string;
        precoOriginal: number;
        custoOriginal: number
    }[];
    descontoPacotePerc?: number;
    precoFinal: number;
    cfUni: number;
    cfRateado: number;
    cvUni: number;
    tempoServicoMinutos: number;
    markup: number;
    markup2: number;
    lucroReal: number;
    percLucroReal: number;
    precoOriginalTotal?: number;
    cutTotal: number;
    criadoEm: string;
}

export interface Subcategoria {
    id: string;
    userId: string;
    categoriaId: string;
    nome: string;
    criadoEm: string;
}

export interface Feedback {
    id?: string;
    userId: string;
    rating: number;
    q1: string; // O app ajudou com os custos?
    q2: string; // Interface fácil?
    q3: string; // Recomendaria?
    q4: string; // Chatbot útil?
    q5: string; // Comentário livre
    criadoEm?: string;
}

export interface StatsAdmin {
    totalUsuarios: number;
    usuariosOnline: number;
    totalProdutos: number;
    totalServicos: number;
    mediaRating: number;
    novosHoje: number;
    distribuicao: { autonomo: number; empresario: number };
    feedbacks: Feedback[];
}

// ─────────────────────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────────────────────

let cachedUser: Usuario | null = null;

export async function getUsuarioAtual(): Promise<Usuario | null> {
    if (cachedUser) return cachedUser;

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            cachedUser = null;
            return null;
        }

        // Tentar buscar perfil, mas não travar se falhar
        const { data: perfil } = await supabase
            .from('perfis')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        const meta = user.user_metadata || {};

        // Ordem de prioridade para o nome: Perfil DB > Metadata manual > Google Full Name > Display Name > Email > Fallback
        const nome = perfil?.nome ||
            meta.nome ||
            meta.full_name ||
            meta.display_name ||
            meta.given_name ||
            user.email?.split('@')[0] ||
            'Barbeiro';

        const tipo = perfil?.tipo || meta.tipo || 'autonomo';

        cachedUser = {
            id: user.id,
            nome,
            email: user.email || '',
            tipo,
            avatarUrl: perfil?.avatar_url || meta.avatar_url || meta.picture,
            criadoEm: user.created_at
        };

        return cachedUser;
    } catch (e) {
        console.error('Erro crítico em getUsuarioAtual:', e);
        return null;
    }
}

export async function login(email: string, senha: string) {
    cachedUser = null; // Limpar cache no login
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    return { ok: !error, error: error?.message };
}

export async function loginComGoogle() {
    cachedUser = null; // Limpar cache no login
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : ''
        }
    });
    return { ok: !error, error: error?.message };
}

export async function cadastrar(data: { nome: string; email: string; senha: string; tipo: 'autonomo' | 'empresario' }) {
    cachedUser = null; // Limpar cache no cadastro
    const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.senha,
        options: {
            data: {
                nome: data.nome,
                tipo: data.tipo
            }
        }
    });

    return { ok: !error, error: error?.message };
}

export async function logout() {
    cachedUser = null; // Limpar cache no logout
    await supabase.auth.signOut();
}

export async function deletarConta(): Promise<{ ok: boolean; error?: string }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { ok: false, error: 'Usuário não autenticado' };

        const uid = user.id;

        // 1. Deletar feedbacks do usuário
        await supabase.from('feedbacks').delete().eq('user_id', uid);

        // 2. Deletar precificações do usuário
        await supabase.from('precificacoes').delete().eq('user_id', uid);

        // 3. Deletar produtos do usuário
        await supabase.from('produtos').delete().eq('user_id', uid);

        // 4. Deletar configuração do usuário
        await supabase.from('configuracoes').delete().eq('user_id', uid);

        // 5. Deletar perfil do usuário
        await supabase.from('perfis').delete().eq('id', uid);

        // 6. Limpar cache e deslogar
        cachedUser = null;
        await supabase.auth.signOut();

        return { ok: true };
    } catch (err: any) {
        return { ok: false, error: err?.message || 'Erro desconhecido ao deletar conta' };
    }
}

export async function resetarSenha(email: string) {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}` : '';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo
    });
    return { ok: !error, error: error?.message };
}

export async function atualizarSenha(novaSenha: string) {
    const { error } = await supabase.auth.updateUser({
        password: novaSenha
    });
    return { ok: !error, error: error?.message };
}

export async function atualizarUsuario(dados: { nome?: string; tipo?: 'autonomo' | 'empresario' }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Não autenticado');

    // 1. Atualizar Auth Metadata (para persistir no token/sessão)
    const { error: authError } = await supabase.auth.updateUser({
        data: {
            nome: dados.nome || user.user_metadata.nome,
            tipo: dados.tipo || user.user_metadata.tipo
        }
    });
    if (authError) throw authError;

    // 2. Atualizar tabela perfis (se o trigger não bastar ou para consistência)
    const { error: dbError } = await supabase
        .from('perfis')
        .update({
            nome: dados.nome,
            tipo: dados.tipo
        })
        .eq('id', user.id);

    if (dbError) {
        console.warn('Erro ao atualizar tabela perfis, mas metadados de Auth foram atualizados:', dbError);
    }
}

export async function updateLastSeen() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
        .from('perfis')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', user.id);
}

// ─────────────────────────────────────────────────────────────
//  FEEDBACK ELIGIBILITY
// ─────────────────────────────────────────────────────────────

export async function usuarioJaAvaliou(): Promise<boolean> {
    const user = await getUsuarioAtual();
    if (!user) return true; // Se não logado, considerar como já avaliou (não mostrar)

    const { count } = await supabase
        .from('feedbacks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    return (count || 0) > 0;
}

export async function checkUserFeedbackEligibility(): Promise<boolean> {
    const user = await getUsuarioAtual();
    if (!user) return false;

    // Verificar se já avaliou
    const jaAvaliou = await usuarioJaAvaliou();
    if (jaAvaliou) return false;

    // Contar produtos do usuário
    const { count: totalProdutos } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    // Contar precificações (serviços) do usuário
    const { count: totalServicos } = await supabase
        .from('precificacoes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    // Elegível se tem ≥3 produtos E ≥2 serviços
    return (totalProdutos || 0) >= 3 && (totalServicos || 0) >= 2;
}

// ─────────────────────────────────────────────────────────────
//  FEEDBACK & ADMIN
// ─────────────────────────────────────────────────────────────

export async function salvarFeedback(feedback: Omit<Feedback, 'id' | 'criadoEm'>) {
    const { error } = await supabase
        .from('feedbacks')
        .insert({
            user_id: feedback.userId,
            rating: feedback.rating,
            q1: feedback.q1,
            q2: feedback.q2,
            q3: feedback.q3,
            q4: feedback.q4,
            q5: feedback.q5
        });
    return { ok: !error, error: error?.message };
}

export const ADMIN_EMAILS = [
    'pablocarvalho0214@gmail.com',
    'gabrielaconsultorafinanceira@gmail.com'
];

export async function getAdminStats(): Promise<StatsAdmin | null> {
    const user = await getUsuarioAtual();
    if (!user || !ADMIN_EMAILS.includes(user.email)) return null;

    // 1. Total de usuários (Contagem exata na tabela perfis)
    const { count: totalUsuarios } = await supabase
        .from('perfis')
        .select('*', { count: 'exact', head: true });

    // 2. Usuários "Online" (Viram o app nos últimos 15 min)
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count: usuariosOnline } = await supabase
        .from('perfis')
        .select('*', { count: 'exact', head: true })
        .gt('last_seen', fifteenMinAgo);

    // 3. Novos Hoje (Últimas 24h)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: novosHoje } = await supabase
        .from('perfis')
        .select('*', { count: 'exact', head: true })
        .gt('criado_em', twentyFourHoursAgo);

    // 4. Distribuição de Tipos
    const { data: perfisTipos } = await supabase
        .from('perfis')
        .select('tipo');

    const distribuicao = {
        autonomo: perfisTipos?.filter(p => p.tipo === 'autonomo').length || 0,
        empresario: perfisTipos?.filter(p => p.tipo === 'empresario').length || 0
    };

    // 5. Total de Produtos
    const { count: totalProdutos } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true });

    // 6. Total de Serviços (Precificações)
    const { count: totalServicos } = await supabase
        .from('precificacoes')
        .select('*', { count: 'exact', head: true });

    // 7. Feedbacks e Rating
    const { data: feedbacks } = await supabase
        .from('feedbacks')
        .select('*')
        .order('criado_em', { ascending: false })
        .limit(10);

    const mediaRating = feedbacks && feedbacks.length > 0
        ? feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length
        : 0;

    return {
        totalUsuarios: totalUsuarios || 0,
        usuariosOnline: usuariosOnline || 0,
        totalProdutos: totalProdutos || 0,
        totalServicos: totalServicos || 0,
        mediaRating: mediaRating,
        novosHoje: novosHoje || 0,
        distribuicao,
        feedbacks: feedbacks || []
    };
}

// ─────────────────────────────────────────────────────────────
//  CONFIGURAÇÕES
// ─────────────────────────────────────────────────────────────

export const defaultConfig: ConfiguracaoUsuario = {
    numPessoas: 1,
    horasDiarias: 8,
    diasTrabalhadosMes: 22,
    percProdutividade: 90,
    custoFixoTotal: 0,
    percImpostos: 0,
    percComissoes: 0,
    percTaxaCartao: 0,
    percInvestimentos: 0,
    percLucroDesejado: 30,
    usarMarkup2: false,
};

export async function getConfig(): Promise<ConfiguracaoUsuario> {
    const user = await getUsuarioAtual();
    if (!user) return defaultConfig;

    const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error || !data) return defaultConfig;

    return {
        numPessoas: data.num_pessoas,
        horasDiarias: Number(data.horas_diarias),
        diasTrabalhadosMes: data.dias_trabalhados_mes,
        percProdutividade: Number(data.perc_produtividade),
        custoFixoTotal: Number(data.custo_fixo_total),
        percImpostos: Number(data.perc_impostos),
        percComissoes: Number(data.perc_comissoes),
        percTaxaCartao: Number(data.perc_taxa_cartao),
        percInvestimentos: Number(data.perc_investimentos),
        percLucroDesejado: Number(data.perc_lucro_desejado),
        usarMarkup2: data.usar_markup2,
    };
}

export async function salvarConfig(config: ConfiguracaoUsuario) {
    const user = await getUsuarioAtual();
    if (!user) return;

    const { error } = await supabase
        .from('configuracoes')
        .upsert({
            user_id: user.id,
            num_pessoas: config.numPessoas,
            horas_diarias: config.horasDiarias,
            dias_trabalhados_mes: config.diasTrabalhadosMes,
            perc_produtividade: config.percProdutividade,
            custo_fixo_total: config.custoFixoTotal,
            perc_impostos: config.percImpostos,
            perc_comissoes: config.percComissoes,
            perc_taxa_cartao: config.percTaxaCartao,
            perc_investimentos: config.percInvestimentos,
            perc_lucro_desejado: config.percLucroDesejado,
            usar_markup2: config.usarMarkup2,
        }, {
            onConflict: 'user_id'
        });

    if (error) {
        console.error('Erro ao salvar configurações:', error);
        throw error;
    }
}

// ─────────────────────────────────────────────────────────────
//  PRODUTOS
// ─────────────────────────────────────────────────────────────

export async function getProdutos(): Promise<Produto[]> {
    const user = await getUsuarioAtual();
    if (!user) return [];

    const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false });

    if (error || !data) return [];

    return data.map(p => ({
        id: p.id,
        nome: p.nome,
        precoCompra: Number(p.preco_compra),
        volumeTotal: Number(p.volume_pote),
        unidade: p.unidade,
        categoriaProduto: p.categoria_produto
    }));
}

export async function salvarProduto(produto: Omit<Produto, 'id'>) {
    const user = await getUsuarioAtual();
    if (!user) throw new Error('Não autenticado');

    const { error } = await supabase
        .from('produtos')
        .insert({
            user_id: user.id,
            nome: produto.nome,
            preco_compra: produto.precoCompra,
            volume_pote: produto.volumeTotal,
            unidade: produto.unidade,
            categoria_produto: produto.categoriaProduto
        });

    if (error) throw error;
}

export async function atualizarProduto(id: string, dados: Partial<Omit<Produto, 'id'>>) {
    const { error } = await supabase
        .from('produtos')
        .update({
            nome: dados.nome,
            preco_compra: dados.precoCompra,
            volume_pote: dados.volumeTotal,
            unidade: dados.unidade,
            categoria_produto: dados.categoriaProduto
        })
        .eq('id', id);

    if (error) throw error;
}

export async function excluirProduto(id: string) {
    await supabase.from('produtos').delete().eq('id', id);
}

// ─────────────────────────────────────────────────────────────
//  PRECIFICAÇÕES
// ─────────────────────────────────────────────────────────────

export async function getPrecificacoes(): Promise<PrecificacaoSalva[]> {
    const user = await getUsuarioAtual();
    if (!user) return [];

    const { data, error } = await supabase
        .from('precificacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false });

    if (error || !data) return [];

    return data.map(p => ({
        id: p.id,
        userId: p.user_id,
        nomeServico: p.nome_servico,
        categoriaId: p.categoria_id,
        categoriaNome: p.categoria_nome,
        categoriaEmoji: p.categoria_emoji,
        config: p.config,
        produtosUsados: p.produtos_usados,
        precoFinal: Number(p.preco_final),
        cfUni: Number(p.cf_uni),
        cfRateado: Number(p.cf_rateado || Number(p.cf_uni)), // fallback para cf_uni se for antigo
        cvUni: Number(p.cv_uni),
        tempoServicoMinutos: Number(p.tempo_servico_minutos || 60),
        markup: Number(p.markup || 0),
        markup2: Number(p.markup2 || 0),
        lucroReal: Number(p.lucro_real || 0),
        percLucroReal: Number(p.perc_lucro_real || 0),
        precoOriginalTotal: p.preco_original_total ? Number(p.preco_original_total) : undefined,
        cutTotal: Number(p.cut_total || (Number(p.cf_rateado || p.cf_uni) + Number(p.cv_uni))),
        itensPacote: p.itens_pacote || [],
        descontoPacotePerc: Number(p.desconto_pacote_perc || 0),
        criadoEm: p.criado_em
    }));
}

export async function salvarPrecificacao(dados: Omit<PrecificacaoSalva, 'id' | 'userId' | 'criadoEm'>) {
    const user = await getUsuarioAtual();
    if (!user) throw new Error('Não autenticado');

    // Sobrescrever se já existe na mesma categoria (conforme lógica anterior)
    await supabase
        .from('precificacoes')
        .delete()
        .eq('user_id', user.id)
        .eq('categoria_id', dados.categoriaId);

    const { data, error } = await supabase
        .from('precificacoes')
        .insert({
            user_id: user.id,
            nome_servico: dados.nomeServico,
            categoria_id: dados.categoriaId,
            categoria_nome: dados.categoriaNome,
            categoria_emoji: dados.categoriaEmoji,
            config: dados.config,
            produtos_usados: dados.produtosUsados,
            preco_final: dados.precoFinal,
            cf_uni: dados.cfUni,
            cf_rateado: dados.cfRateado,
            cv_uni: dados.cvUni,
            tempo_servico_minutos: dados.tempoServicoMinutos,
            markup: dados.markup,
            markup2: dados.markup2,
            lucro_real: dados.lucroReal,
            perc_lucro_real: dados.percLucroReal,
            itens_pacote: dados.itensPacote,
            desconto_pacote_perc: dados.descontoPacotePerc,
            preco_original_total: dados.precoOriginalTotal,
            cut_total: dados.cutTotal
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getPrecificacaoPorId(id: string): Promise<PrecificacaoSalva | null> {
    const { data, error } = await supabase
        .from('precificacoes')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) return null;

    return {
        id: data.id,
        userId: data.user_id,
        nomeServico: data.nome_servico,
        categoriaId: data.categoria_id,
        categoriaNome: data.categoria_nome,
        categoriaEmoji: data.categoria_emoji,
        config: data.config,
        produtosUsados: data.produtos_usados,
        precoFinal: Number(data.preco_final),
        cfUni: Number(data.cf_uni),
        cfRateado: Number(data.cf_rateado || Number(data.cf_uni)),
        cvUni: Number(data.cv_uni),
        tempoServicoMinutos: Number(data.tempo_servico_minutos || 60),
        markup: Number(data.markup || 0),
        markup2: Number(data.markup2 || 0),
        lucroReal: Number(data.lucro_real || 0),
        percLucroReal: Number(data.perc_lucro_real || 0),
        precoOriginalTotal: data.preco_original_total ? Number(data.preco_original_total) : undefined,
        cutTotal: Number(data.cut_total || (Number(data.cf_rateado || data.cf_uni) + Number(data.cv_uni))),
        itensPacote: data.itens_pacote || [],
        descontoPacotePerc: Number(data.desconto_pacote_perc || 0),
        criadoEm: data.criado_em || new Date().toISOString()
    };
}

export async function excluirPrecificacao(id: string) {
    await supabase.from('precificacoes').delete().eq('id', id);
}

// ─────────────────────────────────────────────────────────────
//  SUBCATEGORIAS (VARIAÇÕES)
// ─────────────────────────────────────────────────────────────

export async function getSubcategorias(categoriaId: string): Promise<Subcategoria[]> {
    const user = await getUsuarioAtual();
    if (!user) return [];

    const { data, error } = await supabase
        .from('subcategorias')
        .select('*')
        .eq('user_id', user.id)
        .eq('categoria_id', categoriaId)
        .order('criado_em', { ascending: true });

    if (error || !data) return [];

    return data.map(s => ({
        id: s.id,
        userId: s.user_id,
        categoriaId: s.categoria_id,
        nome: s.nome,
        criadoEm: s.criado_em
    }));
}

export async function getTodasSubcategorias(): Promise<Subcategoria[]> {
    const user = await getUsuarioAtual();
    if (!user) return [];

    const { data, error } = await supabase
        .from('subcategorias')
        .select('*')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: true });

    if (error || !data) return [];

    return data.map(s => ({
        id: s.id,
        userId: s.user_id,
        categoriaId: s.categoria_id,
        nome: s.nome,
        criadoEm: s.criado_em
    }));
}

export async function salvarSubcategoria(categoriaId: string, nome: string) {
    const user = await getUsuarioAtual();
    if (!user) throw new Error('Não autenticado');

    // Verificar limite de 3
    const existentes = await getSubcategorias(categoriaId);
    if (existentes.length >= 3) {
        throw new Error('Limite de 3 variações atingido para esta categoria.');
    }

    const { data, error } = await supabase
        .from('subcategorias')
        .insert({
            user_id: user.id,
            categoria_id: categoriaId,
            nome: nome.trim()
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function atualizarSubcategoria(id: string, novoNome: string) {
    const { error } = await supabase
        .from('subcategorias')
        .update({ nome: novoNome.trim() })
        .eq('id', id);

    if (error) throw error;
}

export async function excluirSubcategoria(id: string) {
    const { error } = await supabase
        .from('subcategorias')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function deletarUsuario() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // O Supabase tem uma função para deletar o usuário logado
    // Nota: Dependendo da config do Supabase, isso pode exigir uma Edge Function se o usuário for deletar a si mesmo e o schema de permissões for restrito.
    // Para simplificar no contexto local, usamos o RPC ou Chamada direta se permitido.
    const { error } = await supabase.rpc('delete_user');

    // Se o RPC não existir, pelo menos deslogamos.
    // Em um sistema real, aqui chamáriamos uma Edge Function administrativa.
    if (error) {
        console.error('Erro ao deletar via RPC, tentando apenas logout:', error);
        await logout();
    } else {
        await logout();
    }
}
