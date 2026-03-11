// ─────────────────────────────────────────────────────────────
//  TIPOS
// ─────────────────────────────────────────────────────────────

export interface ConfiguracaoUsuario {
  numPessoas: number;          // ex: 5
  horasDiarias: number;        // ex: 8
  diasTrabalhadosMes: number;  // ex: 22
  percProdutividade: number;   // ex: 90 (%)
  custoFixoTotal: number;      // ex: 23614.65 (R$)
  percImpostos: number;        // ex: 3 (%)
  percComissoes: number;       // ex: 40 (%)
  percTaxaCartao: number;      // ex: 2 (%)
  percInvestimentos: number;   // ex: 0 (%)
  percLucroDesejado: number;   // ex: 21.56 (%)
  usarMarkup2: boolean;
  tempoServicoMinutos?: number;
  itensPacote?: {
    precificacaoId: string;
    quantidade: number;
    nome: string;
    precoOriginal: number;
    custoOriginal: number
  }[];
  descontoPacotePerc?: number;
}

export interface Produto {
  id: string;
  nome: string;
  unidade: string;
  volumeTotal: number;   // ml, g, etc.
  precoCompra: number;
  categoriaProduto?: string;   // R$
}

export interface ProdutoUsado {
  produto: Produto;
  volumeUsado: number;           // quantidade usada no serviço
  custoCalculado?: number;       // calculado automaticamente
}

export interface ResultadoPrecificacao {
  horasMaximas: number;
  horasReais: number;
  cfUni: number;
  cvUni: number;
  cutTotal: number;
  markup: number;
  markup2: number;
  precoFinal: number;
  tempoServicoMinutos: number;
  cfRateado: number;
  itensPacote?: {
    precificacaoId: string;
    quantidade: number;
    nome: string;
    precoOriginal: number;
    custoOriginal: number
  }[];
  descontoPacotePerc?: number;
  precoOriginalTotal?: number;
  lucroReal: number;
  percLucroReal: number;
  breakdownProdutos: { nome: string; custo: number }[];
}

// ─────────────────────────────────────────────────────────────
//  1. CAPACIDADE PRODUTIVA
// ─────────────────────────────────────────────────────────────

export function calcularCapacidadeProdutiva(config: ConfiguracaoUsuario) {
  const horasMaximas =
    config.numPessoas * config.horasDiarias * config.diasTrabalhadosMes;
  const horasReais = horasMaximas * (config.percProdutividade / 100);
  return { horasMaximas, horasReais };
}

// ─────────────────────────────────────────────────────────────
//  2. CUSTO FIXO UNITÁRIO (CF uni)
// ─────────────────────────────────────────────────────────────

export function calcularCFUni(config: ConfiguracaoUsuario): number {
  const { horasReais } = calcularCapacidadeProdutiva(config);
  if (horasReais === 0) return 0;
  return config.custoFixoTotal / horasReais;
}

// ─────────────────────────────────────────────────────────────
//  3. CUSTO VARIÁVEL UNITÁRIO (CV uni)
//     CV = Σ (volume_usado × preco_compra / volume_total)
// ─────────────────────────────────────────────────────────────

export function calcularCustoProduto(produto: Produto, volumeUsado: number): number {
  if (produto.volumeTotal === 0) return 0;
  return volumeUsado * (produto.precoCompra / produto.volumeTotal);
}

export function calcularCVUni(produtosUsados: ProdutoUsado[]): number {
  return produtosUsados.reduce((acc, pu) => {
    return acc + calcularCustoProduto(pu.produto, pu.volumeUsado);
  }, 0);
}

// ─────────────────────────────────────────────────────────────
//  4. MARKUP
//     Markup = 1 / (1 - (Impostos + Comissões + Cartão + Invest + Lucro) / 100)
// ─────────────────────────────────────────────────────────────

export function calcularMarkup(config: ConfiguracaoUsuario): number {
  const somaPerc =
    config.percImpostos +
    config.percComissoes +
    config.percTaxaCartao +
    config.percInvestimentos +
    config.percLucroDesejado;

  const denominador = 1 - somaPerc / 100;
  if (denominador <= 0) return 0;
  return 1 / denominador;
}

// ─────────────────────────────────────────────────────────────
//  5. MARKUP 2 (sobre CV uni — somente deduções operacionais)
//     Markup2 = 1 / (1 - (Impostos + Comissões + Cartão) / 100)
//     Quando usarMarkup2 = false → retorna 0
// ─────────────────────────────────────────────────────────────

export function calcularMarkup2(config: ConfiguracaoUsuario): number {
  if (!config.usarMarkup2) return 0;
  const somaPerc =
    config.percImpostos +
    config.percComissoes +
    config.percTaxaCartao;

  const denominador = 1 - somaPerc / 100;
  if (denominador <= 0) return 0;
  return 1 / denominador;
}

// ─────────────────────────────────────────────────────────────
//  6. PREÇO FINAL DE VENDA
//     Preço = (CF uni × Markup) + (CV uni × (Markup + Markup2))
// ─────────────────────────────────────────────────────────────

export function calcularPrecoFinal(
  config: ConfiguracaoUsuario,
  produtosUsados: ProdutoUsado[]
): ResultadoPrecificacao {
  const { horasMaximas, horasReais } = calcularCapacidadeProdutiva(config);
  const cfUni = calcularCFUni(config);
  const tempoServicoMinutos = config.tempoServicoMinutos || 60;
  const cfPorMinuto = cfUni / 60;
  const cfRateado = cfPorMinuto * tempoServicoMinutos;

  const markup = calcularMarkup(config);
  const markup2 = calcularMarkup2(config);
  const cvUni = calcularCVUni(produtosUsados);

  let precoFinal = 0;
  let precoOriginalTotal = 0;
  const items = config.itensPacote || [];
  const isPacote = items.length > 0;

  if (isPacote) {
    precoOriginalTotal = items.reduce((acc, item) => acc + (item.precoOriginal * item.quantidade), 0);
    const desconto = config.descontoPacotePerc || 0;
    precoFinal = precoOriginalTotal * (1 - desconto / 100);
  } else {
    precoFinal = cfRateado * markup + cvUni * (markup + markup2);
    // Arredonda para inteiro — evita centavos na precificação de serviços simples
    precoFinal = Math.round(precoFinal);
  }

  const breakdownProdutos = produtosUsados.map((pu) => ({
    nome: pu.produto.nome,
    custo: calcularCustoProduto(pu.produto, pu.volumeUsado),
  }));

  // Lucro Real (R$) = Preço Final - Custo Total - Deduções
  // Deduções = Preço Final * (Impostos + Comissões + Cartão + Investimentos) / 100
  const somaDeducoesPerc =
    config.percImpostos +
    config.percComissoes +
    config.percTaxaCartao +
    config.percInvestimentos;

  const custoTotalDeducoes = precoFinal * (somaDeducoesPerc / 100);
  const cutTotal = isPacote ? items.reduce((acc, item) => acc + (item.custoOriginal * item.quantidade), 0) : cfRateado + cvUni;
  const lucroReal = precoFinal - cutTotal - custoTotalDeducoes;
  const percLucroReal = precoFinal > 0 ? (lucroReal / precoFinal) * 100 : 0;

  return {
    horasMaximas,
    horasReais,
    cfUni,
    cvUni,
    cutTotal,
    markup,
    markup2,
    precoFinal,
    tempoServicoMinutos,
    cfRateado,
    itensPacote: items,
    descontoPacotePerc: config.descontoPacotePerc,
    precoOriginalTotal: isPacote ? precoOriginalTotal : undefined,
    lucroReal,
    percLucroReal,
    breakdownProdutos,
  };
}

// ─────────────────────────────────────────────────────────────
//  FORMATADORES
// ─────────────────────────────────────────────────────────────

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

export function formatarNumero(valor: number, decimais = 2): string {
  return valor.toFixed(decimais).replace('.', ',');
}
