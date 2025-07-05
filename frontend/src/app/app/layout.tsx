import ConversationsHistory from '@/components/app/ConversationsHistory';
import WelcomeModal from '@/components/app/WelcomeModal';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <WelcomeModal />
      <ConversationsHistory />
    </>
  );
}
