export const CATEGORIAS_PRODUTO = [
    { id: 'barba-acabamento', nome: 'Barba e Acabamento', emoji: '🪒' },
    { id: 'tratamento-capilar', nome: 'Tratamento Capilar', emoji: '🧴' },
    { id: 'coloracao', nome: 'Coloração', emoji: '🎨' },
    { id: 'quimica-relaxamento', nome: 'Química e Relaxamento', emoji: '🧪' },
    { id: 'styling', nome: 'Produtos de Styling', emoji: '💈' },
    { id: 'lavagem-spa', nome: 'Lavagem e Serviços de Spa', emoji: '🧖' },
    { id: 'iluminacao-mechas', nome: 'Iluminação e Mechas', emoji: '✨' },
    { id: 'descartaveis', nome: 'Descartáveis e Consumíveis', emoji: '🧤' },
    { id: 'pele-estetica', nome: 'Pele e Estética', emoji: '💆' },
];

export function getCategoriaProdutoById(id: string) {
    return CATEGORIAS_PRODUTO.find(c => c.id === id);
}
