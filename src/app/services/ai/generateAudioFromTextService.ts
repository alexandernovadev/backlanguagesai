import * as path from "path";
import * as fs from "fs";
import OpenAI from "openai";

interface Options {
  prompt: string;
  voice?: string;
}

export const generateAudioFromTextService = async ({ prompt, voice }: Options) => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
  });

  const voices = {
    nova: "nova",
    alloy: "alloy",
    echo: "echo",
    fable: "fable",
    onyx: "onyx",
    shimmer: "shimmer",
  };

  const selectedVoice = voices[voice || "nova"] || "nova";

  const folderPath = path.resolve(__dirname, "../../../../public/audios");
  fs.mkdirSync(folderPath, { recursive: true });

  const timestamp = new Date().getTime();
  const speechFile = path.resolve(folderPath, `${timestamp}.wav`);
  const subtitlesFile = path.resolve(folderPath, `${timestamp}.srt`);

  const wav = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice: selectedVoice,
    input: prompt,
    response_format: "wav",
  });

  const buffer = Buffer.from(await wav.arrayBuffer());
  fs.writeFileSync(speechFile, buffer);

  const subtitles = await openai.audio.transcriptions.create({
    file: fs.createReadStream(speechFile),
    model: "whisper-1",
    response_format: "srt",
  });

  fs.writeFileSync(subtitlesFile, subtitles); // si `subtitles` es string

  return {
    audio: speechFile,
    subtitles: subtitlesFile,
  };
};
