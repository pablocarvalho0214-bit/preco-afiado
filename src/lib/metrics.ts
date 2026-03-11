import { PrecificacaoSalva, Usuario, ConfiguracaoUsuario } from './storage';

export interface DashboardMetrics {
    valorHora: number;
    ticketMedio: number;
    custoMedioTotal: number;
    markupMedio: number;
    margemLucroAcumulada: number;
    totalFaturadoEstimado: number;
}

export function calcularMetricasDashboard(
    precificacoes: PrecificacaoSalva[],
    config: ConfiguracaoUsuario | null
): DashboardMetrics {
    if (!precificacoes.length || !config) {
        return {
            valorHora: config ? config.custoFixoTotal / (config.diasTrabalhadosMes * config.horasDiarias) : 0,
            ticketMedio: 0,
            custoMedioTotal: 0,
            markupMedio: 0,
            margemLucroAcumulada: 0,
            totalFaturadoEstimado: 0
        };
    }

    let somaPrecosFinais = 0;
    let somaCustosTotais = 0;
    let somaMarkup = 0;
    let somaPercLucroReal = 0;
    let somaValorHoraServicos = 0;
    let countServicosIndividuais = 0;

    precificacoes.forEach(p => {
        somaPrecosFinais += p.precoFinal;

        // Custo total do serviço = Custo Variável (Produtos) + Custo Fixo Rateado
        const custoTotalServico = p.cvUni + p.cfRateado;
        somaCustosTotais += custoTotalServico;

        somaMarkup += p.markup;
        somaPercLucroReal += p.percLucroReal;

        // Valor da hora: somente serviços individuais (combos não têm tempo real)
        const isPacote = (p.itensPacote && p.itensPacote.length > 0) ||
            p.categoriaNome?.toLowerCase().includes('pacote') ||
            p.categoriaNome?.toLowerCase().includes('combo') ||
            p.categoriaId === 'pacote';

        if (!isPacote) {
            const tempo = p.tempoServicoMinutos || 60;
            const valorHoraServico = (p.precoFinal / tempo) * 60;
            somaValorHoraServicos += valorHoraServico;
            countServicosIndividuais++;
        }
    });

    const count = precificacoes.length;

    return {
        valorHora: countServicosIndividuais > 0 ? somaValorHoraServicos / countServicosIndividuais : 0,
        ticketMedio: somaPrecosFinais / count,
        custoMedioTotal: somaCustosTotais / count,
        markupMedio: somaMarkup / count,
        margemLucroAcumulada: somaPercLucroReal / count,
        totalFaturadoEstimado: somaPrecosFinais
    };
}
