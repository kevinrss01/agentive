import ConversationsHistory from '@/components/app/ConversationsHistory';
import { Providers } from '@/components/app/providers';
import WelcomeModal from '@/components/app/WelcomeModal';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <Providers>
      {children}
      <WelcomeModal />
      <ConversationsHistory />
    </Providers>
  );
}
