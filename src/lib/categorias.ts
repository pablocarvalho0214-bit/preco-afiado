export interface Categoria {
    id: string;
    emoji: string;
    nome: string;
    exemplos: string[];
}

export const CATEGORIAS: Categoria[] = [
    { id: 'corte', emoji: '✂️', nome: 'Corte de Cabelo', exemplos: ['Degradê', 'Navalhado', 'Social', 'Americano', 'Tesoura'] },
    { id: 'barba', emoji: '🪒', nome: 'Barba', exemplos: ['Aparar', 'Contorno', 'Barba Completa', 'Nevou', 'Selagem'] },
    { id: 'terapia', emoji: '🧴', nome: 'Terapias Capilares', exemplos: ['Hidratação', 'Cauterização', 'Reconstrução', 'Cronograma'] },
    { id: 'coloracao', emoji: '🎨', nome: 'Coloração', exemplos: ['Luzes', 'Mechas', 'Ombré Hair', 'Tintura Completa', 'Platinado'] },
    { id: 'quimica', emoji: '🧪', nome: 'Química Capilar', exemplos: ['Progressiva', 'Relaxamento', 'Permanente', 'Botox Capilar'] },
    { id: 'sobrancelha', emoji: '💅', nome: 'Sobrancelha & Estética', exemplos: ['Design', 'Henna', 'Micropigmentação', 'Barbeação'] },
    { id: 'limpeza', emoji: '🧖', nome: 'Limpeza de Pele', exemplos: ['Limpeza Simples', 'Peeling', 'Esfoliação Facial', 'Máscaras'] },
    { id: 'depilacao', emoji: '👃', nome: 'Depilação', exemplos: ['Narinas', 'Orelhas', 'Costas', 'Peitoral'] },
    { id: 'relaxamento', emoji: '🌿', nome: 'Relaxamento & Bem-Estar', exemplos: ['Massagem Craniana', 'Compressa Quente', 'Aromaterapia'] },
    { id: 'tratamento', emoji: '💊', nome: 'Tratamentos Especiais', exemplos: ['Anti-Queda', 'Nutrição Profunda', 'Implante Capilar Fake'] },
    { id: 'micropig', emoji: '🖋️', nome: 'Micropigmentação', exemplos: ['Sobrancelha', 'Hairline', 'Barba Falha'] },
    { id: 'trancas', emoji: '🦱', nome: 'Tranças & Dreads', exemplos: ['Box Braids', 'Dreads', 'Rastafári', 'Twist'] },
    { id: 'escova', emoji: '🪮', nome: 'Escova & Penteado', exemplos: ['Escova Progressiva', 'Penteado Social', 'Babyliss'] },
    { id: 'infantil', emoji: '👶', nome: 'Corte Infantil', exemplos: ['Corte Kids', 'Corte de Bebê', 'Nhac Nhac'] },
    { id: 'especial', emoji: '🤵', nome: 'Serviço Especial', exemplos: ['Noivo', 'Formando', 'Ensaio Fotográfico', 'Aniversariante'] },
    { id: 'visagismo', emoji: '📐', nome: 'Consultoria Visagismo', exemplos: ['Análise Facial', 'Morfologia', 'Temperamentos', 'Proporção Áurea'] },
    { id: 'pacote', emoji: '💈', nome: 'Pacotes & Combos', exemplos: ['Corte + Barba', 'Combo Premium', 'Pacote Mensal', 'VIP'] },
];

export function getCategoriaById(id: string): Categoria | undefined {
    return CATEGORIAS.find((c) => c.id === id);
}
