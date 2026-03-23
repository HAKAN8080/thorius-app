import { MentorCard } from '@/components/MentorCard';
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
            <div className="space-y-10">
              <div>
                <h2 className="mb-6 text-center text-lg font-semibold text-muted-foreground">Koçlar</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {coaches.map((mentor) => (
                    <MentorCard key={mentor.id} mentor={mentor} userPlan={userPlan} />
                  ))}
                </div>
              </div>
              <div>
                <h2 className="mb-6 text-center text-lg font-semibold text-muted-foreground">Mentorlar</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {mentors.map((mentor) => (
                    <MentorCard key={mentor.id} mentor={mentor} userPlan={userPlan} />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="coaches">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {coaches.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} userPlan={userPlan} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mentors">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} userPlan={userPlan} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
