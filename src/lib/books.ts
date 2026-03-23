export interface BookRecommendation {
  title: string;
  author: string;
}

const BOOKS_BY_CATEGORY: Record<string, BookRecommendation[]> = {
  personal: [
    { title: 'Etkili İnsanların 7 Alışkanlığı', author: 'Stephen R. Covey' },
    { title: 'İnsanın Anlam Arayışı', author: 'Viktor E. Frankl' },
    { title: 'İçindeki Devi Uyandır', author: 'Tony Robbins' },
    { title: 'Dört Anlaşma', author: 'Don Miguel Ruiz' },
    { title: 'Savaşçı', author: 'Doğan Cüceloğlu' },
    { title: 'Şu Hortumlu Dünyada Fil Yalnız Bir Hayvandır', author: 'Ahmet Şerif İzgören' },
    { title: 'Özşefkat', author: 'Kristin Neff' },
    { title: 'Şimdinin Gücü', author: 'Eckhart Tolle' },
  ],
  leadership: [
    { title: 'Duygusal Zeka', author: 'Daniel Goleman' },
    { title: 'Takım Oyunu', author: 'Seth Godin' },
    { title: 'İyiden Mükemmele', author: 'Jim Collins' },
    { title: 'Liderliğin Kutsal Kitabı', author: 'Jeffrey Gitomer' },
    { title: 'What Got You Here Won\'t Get You There', author: 'Marshall Goldsmith' },
    { title: 'Leaders Eat Last', author: 'Simon Sinek' },
  ],
  entrepreneurship: [
    { title: 'Zengin Baba Yoksul Baba', author: 'Robert T. Kiyosaki' },
    { title: 'Düşün ve Zengin Ol', author: 'Napoleon Hill' },
    { title: 'Mor İnek', author: 'Seth Godin' },
    { title: 'Steve Jobs Olsa Ne Yapardı?', author: 'Çeşitli Yazarlar' },
    { title: 'Atomic Habits', author: 'James Clear' },
    { title: 'The Lean Startup', author: 'Eric Ries' },
  ],
  psychology: [
    { title: 'Nietzsche Ağladığında', author: 'Irvin D. Yalom' },
    { title: 'Dost Kazanma ve İnsanları Etkileme Sanatı', author: 'Dale Carnegie' },
    { title: 'Hayatı Yeniden Keşfedin', author: 'Jeffrey E. Young' },
    { title: 'Attached', author: 'Amir Levine' },
    { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman' },
  ],
  mindfulness: [
    { title: 'Mindset', author: 'Carol S. Dweck' },
    { title: 'The 5 AM Club', author: 'Robin Sharma' },
    { title: 'Bazen Olmaz', author: 'Mark Manson' },
  ],
};

// Mentör ID'sine göre kitap kategorisi
const MENTOR_CATEGORY_MAP: Record<string, keyof typeof BOOKS_BY_CATEGORY> = {
  'executive-coach': 'leadership',
  'career-coach': 'personal',
  'student-coach': 'mindfulness',
  'tech-mentor': 'entrepreneurship',
  'business-mentor': 'leadership',
  'startup-mentor': 'entrepreneurship',
  'reverse-mentor': 'mindfulness',
};

export function getBookForMentor(mentorId: string): BookRecommendation {
  const category = MENTOR_CATEGORY_MAP[mentorId] ?? 'personal';
  const books = BOOKS_BY_CATEGORY[category];
  return books[Math.floor(Math.random() * books.length)];
}
