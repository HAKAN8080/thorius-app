import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

const MENTOR_VOICES: Record<string, string> = {
  'executive-coach':    'pNInz6obpgDQGcFmaJgB',
  'career-coach':       'EXAVITQu4vr4xnSDxMaL',
  'student-coach':      'MF3mGyEYCl7XYWbV9V6O',
  'tech-mentor':        'TxGEqnHWrfWFTfGW9XjX',
  'business-mentor':    'VR6AewLTigWG4xSOukaG',
  'entrepreneur-mentor':'yoZ06UM52cGeYr0cd1gS',
  'reverse-mentor':     'otKlcYhsm8jfsCjDAfhX',
};

// Her mentor için ses ayarları — reverse-mentor daha enerjik ve hızlı
const VOICE_SETTINGS: Record<string, object> = {
  'reverse-mentor': {
    stability: 0.25,
    similarity_boost: 0.80,
    style: 0.65,
    use_speaker_boost: true,
    speed: 1.15,
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
