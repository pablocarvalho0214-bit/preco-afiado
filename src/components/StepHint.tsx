'use client';

interface StepHintProps {
    icon: string;
    title?: string;
    text: string;
}

export default function StepHint({ icon, title, text }: StepHintProps) {
    return (
        <div className="step-hint animate-fadeIn">
            <span className="step-hint-icon">{icon}</span>
            <div className="step-hint-body">
                {title && <p className="step-hint-title">{title}</p>}
                <p className="step-hint-text">{text}</p>
            </div>

            <style jsx>{`
                .step-hint {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 14px 16px;
                    margin-bottom: 20px;
                    background: rgba(212, 175, 55, 0.06);
                    border: 1px solid rgba(212, 175, 55, 0.18);
                    border-left: 3px solid var(--amber, #D4AF37);
                    border-radius: 10px;
                }
                .step-hint-icon {
                    font-size: 1.3rem;
                    flex-shrink: 0;
                    line-height: 1;
                    margin-top: 1px;
                }
                .step-hint-body {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .step-hint-title {
                    font-size: 0.72rem;
                    font-weight: 800;
                    color: var(--amber, #D4AF37);
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }
                .step-hint-text {
                    font-size: 0.85rem;
                    color: var(--text-secondary, rgba(255,255,255,0.6));
                    line-height: 1.5;
                }
            `}</style>
        </div>
    );
}
