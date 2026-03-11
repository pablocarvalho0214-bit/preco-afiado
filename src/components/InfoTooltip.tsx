'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
    text: string;
}

export default function InfoTooltip({ text }: InfoTooltipProps) {
    const [visible, setVisible] = useState(false);

    return (
        <span className="info-tooltip-wrapper">
            <button
                type="button"
                className="info-tooltip-btn"
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
                onFocus={() => setVisible(true)}
                onBlur={() => setVisible(false)}
                onClick={() => setVisible(v => !v)}
                aria-label="Mais informações"
            >
                <HelpCircle size={16} className="text-amber" />
            </button>
            {visible && (
                <span className="info-tooltip-box" role="tooltip">
                    {text}
                </span>
            )}

            <style jsx>{`
                .info-tooltip-wrapper {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    margin-left: 6px;
                }
                .info-tooltip-btn {
                    background: none;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    font-size: 0.9rem;
                    opacity: 0.6;
                    transition: opacity 0.2s;
                    line-height: 1;
                }
                .info-tooltip-btn:hover { opacity: 1; }
                .info-tooltip-box {
                    position: absolute;
                    bottom: calc(100% + 8px);
                    left: 50%;
                    transform: translateX(-50%);
                    background: #1e1e1e;
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    color: #e0e0e0;
                    font-size: 0.8125rem;
                    line-height: 1.5;
                    padding: 10px 14px;
                    border-radius: 10px;
                    width: 240px;
                    z-index: 1000;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                    pointer-events: none;
                    white-space: normal;
                    text-align: left;
                }
                .info-tooltip-box::after {
                    content: '';
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border: 6px solid transparent;
                    border-top-color: rgba(212, 175, 55, 0.3);
                }
            `}</style>
        </span>
    );
}
