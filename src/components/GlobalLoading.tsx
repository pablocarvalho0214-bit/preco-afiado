'use client';

export default function GlobalLoading() {
  return (
    <div className="global-loading">
      <div className="progress-bar">
        <div className="progress-fill"></div>
      </div>

      <style jsx>{`
        .global-loading {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(212, 175, 55, 0.1);
          z-index: 10000;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: var(--amber);
          width: 30%;
          box-shadow: 0 0 10px var(--amber);
          animation: progress-move 1.5s infinite ease-in-out;
        }
        @keyframes progress-move {
          0% { transform: translateX(-100%); width: 20%; }
          50% { width: 50%; }
          100% { transform: translateX(300%); width: 20%; }
        }
      `}</style>
    </div>
  );
}
