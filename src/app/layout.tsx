import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Preço Afiado — Precificação para Barbearia',
  description: 'Calcule o preço ideal dos seus serviços de barbearia com base nos seus custos reais, markup e margem desejada.',
  keywords: ['barbearia', 'precificação', 'markup', 'preço', 'barbeiro', 'custo'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#111111',
};

import TransitionProvider from '@/components/TransitionProvider';
import NavigationWrapper from '@/components/NavigationWrapper';
import SplashScreen from '@/components/SplashScreen';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <SplashScreen />
            <NavigationWrapper>
              <TransitionProvider>
                {children}
              </TransitionProvider>
            </NavigationWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
