'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minus, GripVertical, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ_DATA = [
    {
        id: 1,
        question: "O que é o Custo Fixo?",
        answer: "São as despesas que não mudam independente de quantos clientes você atende (Ex: Aluguel, Internet, IPTU). É fundamental para saber sua 'hora base'."
    },
    {
        id: 2,
        question: "Como funciona o Markup?",
        answer: "É um multiplicador que aplicamos sobre o seu custo para garantir que o preço final cubra também os impostos, comissões, taxas e o seu lucro desejado."
    },
    {
        id: 3,
        question: "O que são as Comissões?",
        answer: "É a porcentagem que você paga para o barbeiro que realiza o serviço. Se você trabalha sozinho, esse valor pode ser tratado como parte do seu pró-labore."
    },
    {
        id: 4,
        question: "Como precificar um Combo?",
        answer: "No Combo, você seleciona serviços já precificados. O sistema soma os custos e você aplica um desconto promocional para incentivar a venda do pacote."
    },
    {
        id: 5,
        question: "Como cadastrar um produto?",
        answer: "Vá em 'Estoque' > 'Novo Produto'. Informe o volume total (ex: 500ml) e o preço de compra. O sistema calculará o custo de cada ml/grama/unidade automaticamente."
    },
    {
        id: 6,
        question: "O que é a Margem de Lucro?",
        answer: "É o quanto sobra livre no seu bolso após pagar TODAS as despesas (fixas e variáveis) e deduções (impostos/taxas). O sistema diferencia 'Lucro Desejado' de 'Lucro Real'."
    },
    {
        id: 7,
        question: "Como editar um serviço?",
        answer: "No 'Histórico', você encontra todos os serviços salvos. Clique em 'Editar' para ajustar produtos, tempos ou margens de um serviço que já foi precificado."
    },
];

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isFaqOpen, setIsFaqOpen] = useState(false);
    const [messages, setMessages] = useState<{ type: 'bot' | 'user'; text: string }[]>([
        { type: 'bot', text: 'Olá! Sou o assistente do Preço Afiado. Como posso ajudar com sua barbearia hoje?' }
    ]);
    const constraintsRef = useRef(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    function handleSelectQuestion(question: string, answer: string) {
        setMessages(prev => [
            ...prev,
            { type: 'user', text: question },
            { type: 'bot', text: answer }
        ]);
        setIsFaqOpen(false);
    }

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const css = `
        .cb-root {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
            display: flex;
            align-items: flex-end;
            justify-content: flex-end;
            font-family: inherit;
        }

        .cb-trigger {
            width: 60px;
            height: 60px;
            border-radius: 30px;
            background-color: var(--amber, #D4AF37);
            color: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 6px 16px rgba(0,0,0,0.4);
            cursor: pointer;
            border: none;
            outline: none;
            transition: transform 0.2s;
        }

        .cb-panel {
            width: 350px;
            height: 500px;
            background: #ffffff;
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            margin-bottom: 76px;
            border: 1px solid rgba(0,0,0,0.05);
            position: absolute;
            right: 0;
            bottom: 0;
        }

        [data-theme='dark'] .cb-panel, 
        :root:not([data-theme='light']) .cb-panel {
            background: #111b21;
            border-color: rgba(255,255,255,0.05);
        }

        .cb-header {
            background: #f0f2f5;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(0,0,0,0.05);
            z-index: 10;
        }

        [data-theme='dark'] .cb-header,
        :root:not([data-theme='light']) .cb-header {
            background: #202c33;
            border-bottom: 1px solid rgba(255,255,255,0.02);
        }

        .cb-header-left {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .cb-avatar {
            width: 40px;
            height: 40px;
            background: var(--amber, #D4AF37);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #000;
        }

        .cb-title {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .cb-subtitle {
            margin: 0;
            font-size: 0.75rem;
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .cb-online-dot {
            width: 8px;
            height: 8px;
            background: #25D366; 
            border-radius: 50%;
            display: inline-block;
        }

        .cb-close {
            background: transparent;
            border: none;
            color: #666;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }

        .cb-close:hover {
            background: rgba(0,0,0,0.05);
        }

        .cb-body {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            position: relative;
            background: #efeae2; 
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        [data-theme='dark'] .cb-body,
        :root:not([data-theme='light']) .cb-body {
            background: #0b141a; 
        }

        .cb-msg {
            max-width: 85%;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 0.9rem;
            line-height: 1.4;
            position: relative;
            box-shadow: 0 1px 1px rgba(0,0,0,0.1);
            word-wrap: break-word;
        }

        .cb-msg.bot {
            align-self: flex-start;
            background: #ffffff;
            color: #111;
            border-top-left-radius: 0;
        }

        [data-theme='dark'] .cb-msg.bot,
        :root:not([data-theme='light']) .cb-msg.bot {
            background: #202c33;
            color: #e9edef;
        }

        .cb-msg.user {
            align-self: flex-end;
            background: #d9fdd3;
            color: #111;
            border-top-right-radius: 0;
        }

        [data-theme='dark'] .cb-msg.user,
        :root:not([data-theme='light']) .cb-msg.user {
            background: #005c4b;
            color: #e9edef;
        }

        .cb-footer {
            padding: 10px 16px;
            background: #f0f2f5;
            border-top: 1px solid rgba(0,0,0,0.05);
            display: flex;
            flex-direction: column;
            z-index: 10;
        }

        [data-theme='dark'] .cb-footer,
        :root:not([data-theme='light']) .cb-footer {
            background: #202c33;
            border-top: 1px solid rgba(255,255,255,0.02);
        }

        .cb-faq-toggle {
            width: 100%;
            background: var(--amber, #D4AF37);
            color: #000;
            border: none;
            padding: 10px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.85rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.2s;
        }

        .cb-faq-toggle:hover {
            filter: brightness(1.1);
        }

        .cb-faq-drawer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: #ffffff;
            border-top: 1px solid rgba(0,0,0,0.1);
            box-shadow: 0 -5px 20px rgba(0,0,0,0.1);
            z-index: 20;
            max-height: 70%;
            display: flex;
            flex-direction: column;
            border-radius: 16px 16px 0 0;
        }

        [data-theme='dark'] .cb-faq-drawer,
        :root:not([data-theme='light']) .cb-faq-drawer {
            background: #202c33;
            border-top: 1px solid rgba(255,255,255,0.05);
        }

        .cb-faq-drawer-header {
            padding: 12px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .cb-faq-drawer-title {
            margin: 0;
            font-size: 0.9rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .cb-faq-drawer-list {
            padding: 12px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .cb-faq-drawer-item {
            background: rgba(0,0,0,0.03);
            border: 1px solid rgba(0,0,0,0.05);
            padding: 12px 16px;
            border-radius: 10px;
            font-size: 0.85rem;
            color: var(--text-primary);
            cursor: pointer;
            text-align: left;
            transition: all 0.2s;
            font-weight: 500;
        }

        [data-theme='dark'] .cb-faq-drawer-item,
        :root:not([data-theme='light']) .cb-faq-drawer-item {
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
        }

        .cb-faq-drawer-item:hover {
            border-color: var(--amber);
            background: rgba(212, 175, 55, 0.05);
            color: var(--amber);
        }

        .cb-drawer-close {
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .cb-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.4);
            z-index: 15;
        }
    `;

    return (
        <div className="cb-root" ref={constraintsRef}>
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="cb-panel"
                    >
                        <div className="cb-header">
                            <div className="cb-header-left">
                                <div className="cb-avatar">
                                    <HelpCircle size={20} />
                                </div>
                                <div>
                                    <h4 className="cb-title">Suporte Afiado</h4>
                                    <p className="cb-subtitle">
                                        <span className="cb-online-dot"></span> Online
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="cb-close">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="cb-body">
                            {messages.map((msg, i) => (
                                <div key={i} className={`cb-msg ${msg.type}`}>
                                    {msg.text}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="cb-footer">
                            <button
                                className="cb-faq-toggle"
                                onClick={() => setIsFaqOpen(true)}
                            >
                                <ChevronUp size={16} />
                                Ver dúvidas frequentes
                            </button>
                        </div>

                        <AnimatePresence>
                            {isFaqOpen && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="cb-overlay"
                                        onClick={() => setIsFaqOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ y: "100%" }}
                                        animate={{ y: 0 }}
                                        exit={{ y: "100%" }}
                                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                        className="cb-faq-drawer"
                                    >
                                        <div className="cb-faq-drawer-header">
                                            <h5 className="cb-faq-drawer-title">Como posso te ajudar?</h5>
                                            <button className="cb-drawer-close" onClick={() => setIsFaqOpen(false)}>
                                                <X size={20} />
                                            </button>
                                        </div>
                                        <div className="cb-faq-drawer-list">
                                            {FAQ_DATA.map(faq => (
                                                <button
                                                    key={faq.id}
                                                    className="cb-faq-drawer-item"
                                                    onClick={() => handleSelectQuestion(faq.question, faq.answer)}
                                                >
                                                    {faq.question}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="cb-trigger"
                >
                    <MessageCircle size={28} />
                </button>
            )}
        </div>
    );
}
