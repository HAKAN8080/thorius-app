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
    <div className="fixed inset-0 flex flex-col bg-gray-50 dark:bg-gray-950" style={{ top: 'var(--header-height, 4rem)' }}>
      <ChatInterface mentor={mentor} />
    </div>
  );
}

export function generateStaticParams() {
  return DEFAULT_MENTORS.map((mentor) => ({
    mentorId: mentor.id,
  }));
}
