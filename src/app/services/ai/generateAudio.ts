import * as path from "path";
import * as fs from "fs";
import OpenAI from "openai";

interface Options {
  prompt: string;
  voice?: string;
}

export const textToAudioUseCase = async ({ prompt, voice }: Options) => {
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

  const selectedVoice = "nova";

  const folderPath = path.resolve(__dirname, "../../../generated/audios/");
  const speechFile = path.resolve(`${folderPath}/${new Date().getTime()}.wav`);
  const subtitlesFile = path.resolve(
    `${folderPath}/${new Date().getTime()}.srt`
  );

  fs.mkdirSync(folderPath, { recursive: true });

  // Generar el audio
  const wav = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice: selectedVoice,
    input: prompt,
    response_format: "wav",
  });

  // Guardar el archivo de audio
  const buffer = Buffer.from(await wav.arrayBuffer());
  fs.writeFileSync(speechFile, buffer);

  // Generar transcripción para subtítulos
  const subtitles = await openai.audio.transcriptions.create({
    file: fs.createReadStream(speechFile),
    model: "whisper-1",
    response_format: "verbose_json",
    language: "en",
  });

  return {
    audio: speechFile,
    subtitles,
  };
};


/*
    const { audio, subtitles } = await textToAudioUseCase({ prompt, voice });
*/
