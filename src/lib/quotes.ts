export interface Quote {
  id: number;
  text: string;
  author: string;
  category: 'general' | 'railway' | 'police' | 'ssc' | 'banking' | 'defence' | 'wb';
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  {
    id: 1,
    text: "The difference between a uniform and a suit is that the uniform represents service, sacrifice, and the nation.",
    author: "Indian Armed Forces Veteran",
    category: "defence"
  },
  {
    id: 2,
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "general"
  },
  {
    id: 3,
    text: "The hard work you put in today will build the badge you wear with pride tomorrow.",
    author: "IPS Academy Motto",
    category: "police"
  },
  {
    id: 4,
    text: "Patience and persistence are the keys to cracking the toughest exam. Stay focused, stay disciplined.",
    author: "WBCS Topper, Rank 1",
    category: "wb"
  },
  {
    id: 5,
    text: "The railway tracks of life don't guide you to destinations; your engine of determination does.",
    author: "Railway Board Achiever",
    category: "railway"
  },
  {
    id: 6,
    text: "Your Speed & Accuracy in the exam hall are a direct reflection of your consistency in your study room.",
    author: "SBI PO Mentor",
    category: "banking"
  },
  {
    id: 7,
    text: "Every negative mark avoided in the mock test is a mark earned in the real exam. Analyze your mistakes.",
    author: "SSC CGL Mentor",
    category: "ssc"
  },
  {
    id: 8,
    text: "Do not study to cover the syllabus, study to conquer the concepts.",
    author: "Srinivasa Ramanujan",
    category: "general"
  },
  {
    id: 9,
    text: "The stars on your shoulders are far brighter than any diamonds in the world.",
    author: "West Bengal Police Academy",
    category: "police"
  },
  {
    id: 10,
    text: "Numbers have life; they are not just figures on a paper. Learn the magic of Vedic Mathematics.",
    author: "Vedic Math Scholar",
    category: "general"
  },
  {
    id: 11,
    text: "The pain of discipline is nothing compared to the joy of seeing your name in the final selection list.",
    author: "WPSC Civil Servant",
    category: "wb"
  },
  {
    id: 12,
    text: "A bank officer is trusted with the wealth of the nation, but you must first trust yourself with your preparation.",
    author: "RBI Grade B Officer",
    category: "banking"
  },
  {
    id: 13,
    text: "The track is long, but the whistle of success is closer than you think. Keep training.",
    author: "RRB Loco Pilot Instructor",
    category: "railway"
  },
  {
    id: 14,
    text: "Sweat more in practice, bleed less in battle.",
    author: "Indian Army Proverb",
    category: "defence"
  },
  {
    id: 15,
    text: "Every chapter completed is one step closer to your dream posting. Finish it today.",
    author: "ExamSprint AI Team",
    category: "general"
  }
];

export function getRandomQuote(category?: string, excludeIds: number[] = []): Quote {
  let filtered = MOTIVATIONAL_QUOTES;
  
  if (category && category !== 'general') {
    filtered = MOTIVATIONAL_QUOTES.filter(q => q.category === category || q.category === 'general');
  }

  // Filter out recently used quotes if possible
  const fresh = filtered.filter(q => !excludeIds.includes(q.id));
  const pool = fresh.length > 0 ? fresh : filtered;
  
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
