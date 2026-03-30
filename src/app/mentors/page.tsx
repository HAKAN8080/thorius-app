import { MentorCard } from '@/components/MentorCard';
import { MentorIntroCard } from '@/components/MentorIntroCard';
import { MentorSuggestionForm } from '@/components/MentorSuggestionForm';
import { DEFAULT_MENTORS } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUser } from '@/lib/auth';

export default async function MentorsPage() {
  const user = await getCurrentUser();
  const userPlan = user?.plan ?? null;

  const coaches = DEFAULT_MENTORS.filter((m) => m.category === 'coach');
  const mentors = DEFAULT_MENTORS.filter((m) => m.category === 'mentor');

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-foreground">
            AI{' '}
            <span className="bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">
              Koç & Mentorlar
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            İhtiyacınıza uygun bir AI koç veya mentor seçin ve hemen sohbete başlayın.
            Her biri farklı uzmanlık alanlarına sahip ve size özel rehberlik sunmaya hazır.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-10 grid w-full max-w-sm mx-auto grid-cols-3">
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="coaches">Koçlar</TabsTrigger>
            <TabsTrigger value="mentors">Mentorlar</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-16">
              {/* Koçlar */}
              <div>
                <h2 className="mb-8 text-center text-xl font-bold text-foreground">
                  <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-primary">
                    AI Koçlar
                  </span>
                </h2>
                <div className="space-y-6">
                  {coaches.map((mentor) => (
                    <MentorIntroCard key={mentor.id} mentor={mentor} userPlan={userPlan} />
                  ))}
                </div>
              </div>

              {/* Mentorlar */}
              <div>
                <h2 className="mb-8 text-center text-xl font-bold text-foreground">
                  <span className="inline-block rounded-full bg-secondary/10 px-4 py-1.5 text-secondary">
                    AI Mentorlar
                  </span>
                </h2>
                <div className="space-y-6">
                  {mentors.map((mentor) => (
                    <MentorIntroCard key={mentor.id} mentor={mentor} userPlan={userPlan} />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="coaches">
            <div className="space-y-6">
              {coaches.map((mentor) => (
                <MentorIntroCard key={mentor.id} mentor={mentor} userPlan={userPlan} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mentors">
            <div className="space-y-6">
              {mentors.map((mentor) => (
                <MentorIntroCard key={mentor.id} mentor={mentor} userPlan={userPlan} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Koç / Mentor Öner Formu */}
        <MentorSuggestionForm isLoggedIn={!!user} userEmail={user?.email} userName={user?.name} />
      </div>
    </div>
  );
}
