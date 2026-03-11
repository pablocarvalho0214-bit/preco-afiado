// Server Component — Route Segment Config
// Força renderização dinâmica para quebrar cache SSG
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PrecificarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
