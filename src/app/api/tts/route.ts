import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

const MENTOR_VOICES: Record<string, string> = {
  // Erkek sesler
  'executive-coach':    'dDcfsSsiSzmphdMGCECb',  // Tok, otoriter erkek sesi
  'tech-mentor':        'TxGEqnHWrfWFTfGW9XjX',  // Josh - teknik, net
  'business-mentor':    'VR6AewLTigWG4xSOukaG',  // Arnold - otoriteli
  'entrepreneur-mentor':'yoZ06UM52cGeYr0cd1gS',  // Erkek - enerjik
  'brand-mentor':       'ErXwobaYiN019PkySvjV',  // Antoni - yaratıcı, sıcak erkek
  'ai-future-mentor':   'TxGEqnHWrfWFTfGW9XjX',  // Josh - teknoloji odaklı
  // Kadın sesler
  'career-coach':       '8WPhqbK1tiExOyeiOUT0',  // AI Koç 2 özel sesi
  'student-coach':      'pFZP5JQG7iQjIQuC4Bku',  // Lily - sakin, huzurlu (öğrenci koçu için)
  'reverse-mentor':     'otKlcYhsm8jfsCjDAfhX',  // Z kuşağı - genç
  'life-balance-coach': 'pFZP5JQG7iQjIQuC4Bku', // Lily - sakin, huzurlu kadın
  'communication-coach':'jBpfuIE2acCO8z3wKNLl', // Gigi - net, etkili kadın
  'business-development-coach': 'oWAxZDx7w5VEj9dCyTzz', // Grace - enerjik kadın
};

// Her mentor için ses ayarları
const VOICE_SETTINGS: Record<string, object> = {
  'executive-coach': {
    stability: 0.55,        // dengeli kararlılık = tok, tutarlı
    similarity_boost: 0.90,
    style: 0.30,            // hafif ekspresif ama ağır başlı
    use_speaker_boost: true,
    speed: 0.95,            // hafif yavaş = otoriter his
  },
  'student-coach': {
    stability: 0.50,       // sakin, tutarlı
    similarity_boost: 0.85,
    style: 0.35,           // yumuşak, destekleyici
    use_speaker_boost: true,
    speed: 0.92,           // yavaş, huzurlu tempo
  },
  'reverse-mentor': {
    stability: 0.25,
    similarity_boost: 0.80,
    style: 0.65,
    use_speaker_boost: true,
    speed: 1.15,
  },
  'life-balance-coach': {
    stability: 0.45,  // daha sakin
    similarity_boost: 0.85,
    style: 0.40,      // yumuşak
    use_speaker_boost: true,
    speed: 0.95,      // yavaş, huzurlu
  },
  'communication-coach': {
    stability: 0.35,
    similarity_boost: 0.85,
    style: 0.55,
    use_speaker_boost: true,
    speed: 1.05,
  },
  'business-development-coach': {
    stability: 0.30,
    similarity_boost: 0.85,
    style: 0.60,      // enerjik
    use_speaker_boost: true,
    speed: 1.10,
  },
  'brand-mentor': {
    stability: 0.35,
    similarity_boost: 0.85,
    style: 0.55,      // yaratıcı
    use_speaker_boost: true,
    speed: 1.05,
  },
  'ai-future-mentor': {
    stability: 0.40,
    similarity_boost: 0.85,
    style: 0.50,
    use_speaker_boost: true,
    speed: 1.08,
  },
};

const DEFAULT_VOICE_SETTINGS = {
  stability: 0.28,
  similarity_boost: 0.85,
  style: 0.58,
  use_speaker_boost: true,
  speed: 1.08,
};

const DEFAULT_VOICE = 'pNInz6obpgDQGcFmaJgB';

interface ElevenLabsAlignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

interface WordTiming {
  word: string;
  start: number;
  end: number;
}

/** Markdown ve özel sembolleri TTS için temizler */
function cleanTextForTTS(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')    // **bold** → bold
    .replace(/\*(.+?)\*/g, '$1')         // *italic* → italic
    .replace(/#{1,6}\s+/g, '')           // # Başlık → Başlık
    .replace(/^---+$/gm, '')             // yatay çizgi
    .replace(/`{1,3}[^`]*`{1,3}/g, '')  // `kod` → kaldır
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // [link](url) → link metni
    .replace(/^>\s+/gm, '')             // > alıntı
    .replace(/\n{3,}/g, '\n\n')         // fazla boş satır
    .trim();
}

function buildWordTimings(alignment: ElevenLabsAlignment): WordTiming[] {
  const words: WordTiming[] = [];
  let currentWord = '';
  let wordStart = 0;

  for (let i = 0; i < alignment.characters.length; i++) {
    const char = alignment.characters[i];
    const endTime = alignment.character_end_times_seconds[i];

    if (char === ' ' || char === '\n' || char === '\t') {
      if (currentWord) {
        words.push({ word: currentWord, start: wordStart, end: alignment.character_end_times_seconds[i - 1] });
        currentWord = '';
      }
    } else {
      if (!currentWord) wordStart = alignment.character_start_times_seconds[i];
      currentWord += char;
    }
    if (i === alignment.characters.length - 1 && currentWord) {
      words.push({ word: currentWord, start: wordStart, end: endTime });
    }
  }
  return words;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

  const { text, mentorId } = await req.json();
  if (!text) return NextResponse.json({ error: 'Metin gerekli' }, { status: 400 });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'TTS yapılandırılmamış' }, { status: 500 });

  const voiceId = MENTOR_VOICES[mentorId] ?? DEFAULT_VOICE;
  const voiceSettings = VOICE_SETTINGS[mentorId] ?? DEFAULT_VOICE_SETTINGS;

  const cleanedText = cleanTextForTTS(text).slice(0, 2500);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
    {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanedText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: voiceSettings,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error('[TTS] ElevenLabs error:', err);
    return NextResponse.json({ error: 'Ses üretilemedi' }, { status: 500 });
  }

  const data = await response.json() as {
    audio_base64: string;
    alignment: ElevenLabsAlignment;
  };

  const wordTimings = buildWordTimings(data.alignment);
  return NextResponse.json({ audioBase64: data.audio_base64, wordTimings });
}
