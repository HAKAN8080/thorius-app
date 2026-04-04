import { ChatInterface } from '@/components/ChatInterface';
import { SessionTips } from '@/components/SessionTips';
import { DEFAULT_MENTORS } from '@/lib/types';
import { notFound } from 'next/navigation';

interface ChatPageProps {
  params: Promise<{ mentorId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { mentorId } = await params;
  const mentor = DEFAULT_MENTORS.find((m) => m.id === mentorId);

  if (!mentor) {
    notFound();
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-50 flex p-2 sm:p-5">
      {/* Ana Chat Alanı */}
      <div className="flex-1 min-h-0 max-w-3xl mx-auto w-full flex flex-col">
        <ChatInterface mentor={mentor} />
      </div>

      {/* Sağ Sidebar - Sadece Desktop'ta Görünür (lg ve üzeri) */}
      <div className="hidden lg:flex w-72 xl:w-80 shrink-0 ml-4">
        <div className="w-full rounded-2xl border border-violet-200/60 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <SessionTips />
        </div>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return DEFAULT_MENTORS.map((mentor) => ({
    mentorId: mentor.id,
  }));
}
