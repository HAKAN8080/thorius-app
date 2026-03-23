import { ChatInterface } from '@/components/ChatInterface';
import { DEFAULT_MENTORS } from '@/lib/types';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[128px]" />
        <div className="absolute right-1/4 bottom-0 h-[300px] w-[300px] rounded-full bg-secondary/10 blur-[128px]" />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/mentors"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Mentorlara Dön
        </Link>

        {/* Chat Interface */}
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
