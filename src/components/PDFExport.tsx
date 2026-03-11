'use client';

import { useState, useRef } from 'react';
import { X, Check, FileDown, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, Scissors, Coffee, Star, Shield, Zap, Sparkles, User, Watch, Package, Gem, Palette, Type } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

interface PDFExportProps {
    items: any[];
    onClose: () => void;
}

type LayoutType = 'classic' | 'grid' | 'menu';
type Alignment = 'left' | 'center' | 'right';
type FontType = 'serif' | 'sans' | 'modern';

const PREMIUM_ICONS = [
    { id: 'scissors', Icon: Scissors },
    { id: 'coffee', Icon: Coffee },
    { id: 'star', Icon: Star },
    { id: 'shield', Icon: Shield },
    { id: 'zap', Icon: Zap },
    { id: 'sparkles', Icon: Sparkles },
    { id: 'gem', Icon: Gem },
    { id: 'watch', Icon: Watch },
    { id: 'package', Icon: Package },
    { id: 'user', Icon: User },
];

const FONTS = [
    { id: 'serif', name: 'Vintage Lux', family: "'Playfair Display', serif" },
    { id: 'sans', name: 'Minimalist', family: "'Inter', sans-serif" },
    { id: 'modern', name: 'Premium Tech', family: "'Outfit', sans-serif" },
];

export default function PDFExport({ items, onClose }: PDFExportProps) {
    const [selectedLayout, setSelectedLayout] = useState<LayoutType>('classic');
    const [selectedItems, setSelectedItems] = useState<string[]>(items.map(i => i.id));
    const [alignment, setAlignment] = useState<Alignment>('center');
    const [bgImage, setBgImage] = useState<string | null>(null);
    const [topMargin, setTopMargin] = useState(60);
    const [textColor, setTextColor] = useState('#D4AF37');
    const [selectedFont, setSelectedFont] = useState<FontType>('sans');
    const [itemIcons, setItemIcons] = useState<Record<string, string>>({});
    const [activeIconPicker, setActiveIconPicker] = useState<string | null>(null);

    const contentToPrintRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: contentToPrintRef,
        documentTitle: 'Tabela de Preços Personalizada',
    });

    const toggleItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setBgImage(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const printableItems = items.filter(i => selectedItems.includes(i.id));
    const currentFont = FONTS.find(f => f.id === selectedFont)?.family || 'sans-serif';

    return (
        <div className="pdf-export-modal glass-panel animate-fadeIn">
            <div className="modal-header">
                <h3>Editor de Tabela Premium</h3>
                <button onClick={onClose} className="close-btn"><X size={20} /></button>
            </div>

            <div className="modal-body-layout">
                <div className="config-pane">
                    <section className="config-section">
                        <h4>1. Conteúdo</h4>
                        <div className="items-list">
                            {items.map(item => (
                                <div key={item.id} className="item-row">
                                    <div
                                        className={`selectable-item ${selectedItems.includes(item.id) ? 'active' : ''}`}
                                        onClick={() => toggleItem(item.id)}
                                    >
                                        <span className="item-name">{item.categoriaNome}</span>
                                        {selectedItems.includes(item.id) && <Check size={14} />}
                                    </div>
                                    <button
                                        className={`icon-picker-btn ${itemIcons[item.id] ? 'has-icon' : ''}`}
                                        onClick={() => setActiveIconPicker(activeIconPicker === item.id ? null : item.id)}
                                        title="Adicionar ícone"
                                    >
                                        {itemIcons[item.id] ? (
                                            (() => {
                                                const Icon = PREMIUM_ICONS.find(i => i.id === itemIcons[item.id])?.Icon || Star;
                                                return <Icon size={16} />;
                                            })()
                                        ) : <Star size={16} opacity={0.3} />}
                                    </button>

                                    {activeIconPicker === item.id && (
                                        <div className="icon-popover glass-panel">
                                            {PREMIUM_ICONS.map(({ id, Icon }) => (
                                                <button key={id} onClick={() => {
                                                    setItemIcons(prev => ({ ...prev, [item.id]: id }));
                                                    setActiveIconPicker(null);
                                                }}>
                                                    <Icon size={18} />
                                                </button>
                                            ))}
                                            <button className="clear-icon" onClick={() => {
                                                setItemIcons(prev => {
                                                    const next = { ...prev };
                                                    delete next[item.id];
                                                    return next;
                                                });
                                                setActiveIconPicker(null);
                                            }}><X size={14} /></button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="config-section">
                        <h4>2. Design & Estilo</h4>
                        <div className="layout-grid">
                            {[
                                { id: 'classic', label: 'Elegante' },
                                { id: 'grid', label: 'Grade' },
                                { id: 'menu', label: 'Cardápio' }
                            ].map(l => (
                                <button
                                    key={l.id}
                                    className={`layout-option ${selectedLayout === l.id ? 'active' : ''}`}
                                    onClick={() => setSelectedLayout(l.id as LayoutType)}
                                >
                                    <span>{l.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="custom-row-flex">
                            <div className="control-group">
                                <label><Palette size={14} /> Cor do Texto</label>
                                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="color-input" />
                            </div>
                            <div className="control-group">
                                <label><Type size={14} /> Estilo da Fonte</label>
                                <select value={selectedFont} onChange={(e) => setSelectedFont(e.target.value as FontType)} className="font-select">
                                    {FONTS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="controls-row">
                            <div className="control-group">
                                <span>Alinhamento</span>
                                <div className="btn-group">
                                    <button className={alignment === 'left' ? 'active' : ''} onClick={() => setAlignment('left')}><AlignLeft size={16} /></button>
                                    <button className={alignment === 'center' ? 'active' : ''} onClick={() => setAlignment('center')}><AlignCenter size={16} /></button>
                                    <button className={alignment === 'right' ? 'active' : ''} onClick={() => setAlignment('right')}><AlignRight size={16} /></button>
                                </div>
                            </div>
                        </div>

                        <div className="controls-row">
                            <button className="btn-upload" onClick={() => fileInputRef.current?.click()}>
                                <ImageIcon size={16} /> Subir Imagem de Fundo (A4)
                            </button>
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleBgUpload} />
                            {bgImage && <button className="btn-remove-bg" onClick={() => setBgImage(null)}>Remover Fundo</button>}
                        </div>

                        <div className="control-group">
                            <span>Posição Vertical: {topMargin}mm</span>
                            <input type="range" min="10" max="150" value={topMargin} onChange={(e) => setTopMargin(parseInt(e.target.value))} />
                        </div>
                    </section>
                </div>

                <div className="preview-pane">
                    <div className="preview-header">
                        <h4>PRÉVIA A4</h4>
                        <p className="text-sm">Visualização em tempo real</p>
                    </div>
                    <div className="preview-scroll">
                        <div className={`a4-page-preview layout-${selectedLayout}`} style={{ textAlign: alignment, fontFamily: currentFont }}>
                            {bgImage && <img src={bgImage} className="bg-preview" alt="" />}
                            <div className="preview-overlay" style={{ paddingTop: `${topMargin}px`, color: textColor }}>
                                <h2 className="preview-logo" style={{ color: textColor }}>PREÇO AFIADO</h2>
                                <div className="preview-table-content">
                                    {printableItems.map(i => (
                                        <div key={i.id} className="preview-item" style={{ borderBottomColor: `${textColor}22` }}>
                                            {itemIcons[i.id] && (
                                                (() => {
                                                    const Icon = PREMIUM_ICONS.find(ic => ic.id === itemIcons[i.id])?.Icon || Star;
                                                    return <Icon size={12} className="item-icon" style={{ color: textColor }} />;
                                                })()
                                            )}
                                            <span className="p-name">{i.categoriaNome}</span>
                                            {selectedLayout === 'menu' && <span className="p-dots" style={{ borderBottomColor: `${textColor}44` }}></span>}
                                            <span className="p-price" style={{ color: textColor }}>R$ {i.precoFinal.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal-footer">
                <button className="btn btn-primary w-full" onClick={handlePrint} disabled={printableItems.length === 0}>
                    <FileDown size={20} />
                    <span>Baixar em PDF</span>
                </button>
            </div>

            {/* Hidden area for Printing */}
            <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
                <div ref={contentToPrintRef} className={`print-doc layout-${selectedLayout}`}
                    style={{
                        textAlign: alignment,
                        fontFamily: currentFont,
                        backgroundImage: bgImage ? `url(${bgImage})` : 'none',
                        color: textColor
                    }}>
                    <div className="print-overlay" style={{ paddingTop: `${topMargin}mm` }}>
                        <h1 className="print-title" style={{ color: textColor }}>PREÇO AFIADO</h1>
                        <div className="print-subtitle" style={{ color: textColor, borderColor: textColor }}>TABELA DE SERVIÇOS</div>

                        <div className="print-list">
                            {printableItems.map(item => (
                                <div key={item.id} className="print-item" style={{ borderBottomColor: `${textColor}33` }}>
                                    <div className="print-item-main">
                                        {itemIcons[item.id] && (
                                            (() => {
                                                const Icon = PREMIUM_ICONS.find(ic => ic.id === itemIcons[item.id])?.Icon || Star;
                                                return <Icon size={24} className="print-icon" style={{ color: textColor }} />;
                                            })()
                                        )}
                                        <span className="name">{item.categoriaNome}</span>
                                    </div>
                                    {selectedLayout === 'menu' && <span className="dots" style={{ borderBottomColor: `${textColor}66` }}></span>}
                                    <span className="price" style={{ color: textColor }}>R$ {item.precoFinal.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="print-footer" style={{ borderTopColor: `${textColor}33` }}>
                            <p style={{ color: textColor }}>Qualidade e Precisão Profissional</p>
                            <span className="date" style={{ color: textColor }}>{new Date().toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .pdf-export-modal { width: 95vw; max-width: 1000px; padding: 24px; border-radius: var(--radius-xl); background: var(--bg-offset); }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .modal-header h3 { font-size: 1.2rem; font-weight: 900; color: var(--text-primary); }
                .close-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; }

                .modal-body-layout { display: grid; grid-template-columns: 340px 1fr; gap: 24px; }
                @media (max-width: 800px) { .modal-body-layout { grid-template-columns: 1fr; } .pdf-export-modal { height: 95vh; overflow-y: auto; } }

                .config-pane { display: flex; flex-direction: column; gap: 20px; }
                h4 { font-size: 0.65rem; font-weight: 800; color: var(--text-disabled); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }

                .items-list { max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding-right: 8px; }
                .item-row { display: flex; align-items: center; gap: 8px; position: relative; }
                .selectable-item {
                    flex: 1; padding: 10px 14px; background: var(--surface-2); border: 1px solid var(--border);
                    border-radius: 10px; cursor: pointer; transition: 0.2s; font-size: 0.8rem; font-weight: 600;
                    display: flex; justify-content: space-between; align-items: center; color: var(--text-primary);
                }
                .selectable-item.active { background: var(--amber-dim); border-color: var(--amber); color: var(--amber); }
                .icon-picker-btn { width: 34px; height: 34px; border-radius: 8px; background: var(--surface-2); border: 1px solid var(--border); color: var(--text-disabled); cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .icon-popover { position: absolute; left: 100%; top: 0; z-index: 100; padding: 8px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-left: 8px; width: 150px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
                .icon-popover button { width: 30px; height: 30px; border-radius: 4px; border: 1px solid var(--border); background: var(--surface-3); color: var(--text-primary); cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .icon-popover .clear-icon { background: var(--error); color: #fff; }

                .layout-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 12px; }
                .layout-option { padding: 8px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); cursor: pointer; font-size: 0.65rem; font-weight: 800; color: var(--text-secondary); }
                .layout-option.active { border-color: var(--amber); background: var(--amber-dim); color: var(--amber); }

                .custom-row-flex { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .color-input { width: 100%; height: 38px; padding: 4px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); cursor: pointer; }
                .font-select { width: 100%; height: 38px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text-primary); font-size: 0.75rem; font-weight: 600; }

                .control-group { display: flex; flex-direction: column; gap: 6px; }
                .control-group label { display: flex; align-items: center; gap: 6px; font-size: 0.65rem; font-weight: 700; color: var(--text-secondary); }
                .control-group span { font-size: 0.65rem; font-weight: 700; color: var(--text-disabled); }
                .btn-group { display: flex; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
                .btn-group button { flex: 1; padding: 8px; background: var(--surface-2); border: none; color: var(--text-disabled); cursor: pointer; }
                .btn-group button.active { background: var(--amber); color: #000; }

                .btn-upload { width: 100%; padding: 12px; border-radius: 10px; border: 1px dashed var(--amber); color: var(--amber); background: var(--amber-dim); font-size: 0.75rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 10px; }
                .btn-remove-bg { width: 100%; font-size: 0.65rem; color: var(--error); margin-top: 4px; cursor: pointer; background: none; border: none; text-decoration: underline; }

                .preview-pane { background: var(--bg); border-radius: var(--radius-lg); padding: 16px; overflow: hidden; display: flex; flex-direction: column; border: 1px solid var(--border); }
                .preview-header { margin-bottom: 12px; }
                .preview-scroll { flex: 1; max-height: 480px; overflow-y: auto; background: #222; padding: 20px; border-radius: 8px; display: flex; justify-content: center; }
                .a4-page-preview { width: 210px; min-height: 297px; background: #fff; transform-origin: top center; transform: scale(1.6); position: relative; padding: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .bg-preview { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.6; }
                .preview-overlay { position: relative; z-index: 1; height: 100%; }
                .preview-logo { font-size: 10px; font-weight: 900; margin-bottom: 10px; letter-spacing: 0.1em; }
                .preview-item { display: flex; align-items: baseline; gap: 3px; font-size: 7px; padding: 5px 0; border-bottom: 0.5px solid #eee; }
                .p-name { font-weight: 700; flex: 1; text-align: left; }
                .p-dots { border-bottom: 0.5px dotted #ccc; flex: 2; height: 5px; }
                .p-price { font-weight: 800; }
                .item-icon { margin-right: 2px; }

                .modal-footer { margin-top: 20px; border-top: 1px solid var(--border); padding-top: 16px; }
                .btn-primary { background: var(--amber); color: #000; font-weight: 800; border: none; padding: 16px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 15px var(--amber-glow); }

                /* PRINT DOC */
                .print-doc { width: 210mm; min-height: 297mm; background-color: #fff; background-size: cover; background-position: center; font-family: 'Inter', sans-serif; position: relative; display: block; overflow: hidden; }
                .print-overlay { position: relative; z-index: 2; padding: 25mm; min-height: 297mm; background: rgba(255,255,255,0.2); }
                .print-title { font-size: 42pt; font-weight: 900; margin-bottom: 8mm; letter-spacing: 0.1em; }
                .print-subtitle { font-size: 14pt; font-weight: 800; letter-spacing: 0.4em; border: 2pt solid #000; display: inline-block; padding: 3mm 12mm; margin-bottom: 25mm; }
                .print-list { display: flex; flex-direction: column; gap: 10mm; }
                .print-item { display: flex; align-items: baseline; gap: 6mm; font-size: 22pt; padding: 6mm 0; border-bottom: 1pt solid #ddd; }
                .print-item-main { display: flex; align-items: center; gap: 5mm; flex: 1; }
                .print-icon { }
                .print-item .name { font-weight: 700; flex: 1; text-transform: uppercase; }
                .print-item .price { font-weight: 900; margin-left: auto; }
                .print-item .dots { flex: 2; border-bottom: 2pt dotted #666; height: 15pt; }

                .layout-grid .print-list { display: grid; grid-template-columns: 1fr 1fr; gap: 15mm; }
                .layout-grid .print-item { border: 2pt solid #aaa; padding: 12mm; border-radius: 8mm; flex-direction: column; align-items: center; text-align: center; }
                .layout-grid .print-item .name { width: 100%; text-align: center; margin-bottom: 5mm; }
                .layout-grid .print-item .price { width: 100%; text-align: center; font-size: 28pt; }

                .print-footer { margin-top: 40mm; border-top: 1pt solid #ddd; padding-top: 12mm; text-align: center; font-size: 11pt; }
                .date { font-weight: 700; margin-top: 5mm; display: block; }
            `}</style>
        </div>
    );
}
