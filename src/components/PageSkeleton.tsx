'use client';

export default function PageSkeleton() {
    return (
        <div className="page-skeleton">
            <div className="skeleton-hero animate-pulse-slow"></div>

            <div className="skeleton-grid">
                <div className="skeleton-card animate-pulse-slow"></div>
                <div className="skeleton-card animate-pulse-slow"></div>
                <div className="skeleton-card animate-pulse-slow"></div>
                <div className="skeleton-card animate-pulse-slow"></div>
            </div>

            <style jsx>{`
        .page-skeleton {
          padding: 20px 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .skeleton-hero {
          height: 140px;
          background: var(--surface-2);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
        }
        .skeleton-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .skeleton-card {
          height: 100px;
          background: var(--surface-2);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
        </div>
    );
}
