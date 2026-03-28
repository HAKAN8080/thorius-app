import { ChatInterface } from '@/components/ChatInterface';
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
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-50 flex flex-col p-2 sm:p-5">
      <div className="flex-1 min-h-0 max-w-3xl mx-auto w-full flex flex-col">
        <ChatInterface mentor={mentor} />
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return DEFAULT_MENTORS.map((mentor) => ({
    mentorId: mentor.id,
  }));
}
