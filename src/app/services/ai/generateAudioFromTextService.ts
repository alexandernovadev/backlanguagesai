import * as path from "path";
import * as fs from "fs";
import OpenAI from "openai";
import { execSync } from "child_process";

interface Options {
  prompt: string;
  voice?: string;
}

const chunkText = (text: string, size: number) => {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return chunks;
};

export const generateAudioFromTextService = async ({
  prompt,
  voice,
}: Options) => {
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
  const chunkSize = 3000;

  const chunks = chunkText(prompt, chunkSize);
  const audioChunkPaths: string[] = new Array(chunks.length);

  // 1. Crear audios por chunk
  await Promise.all(
    chunks.map(async (chunk, i) => {
      const response = await openai.audio.speech.create({
        model: "tts-1-hd",
        voice: selectedVoice,
        input: chunk,
        response_format: "wav",
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      const chunkPath = path.resolve(folderPath, `${timestamp}_chunk${i}.wav`);
      fs.writeFileSync(chunkPath, buffer);
      audioChunkPaths[i] = chunkPath;
    })
  );

  // 2. Concatenar con ffmpeg
  const listFilePath = path.resolve(folderPath, `${timestamp}_list.txt`);
  fs.writeFileSync(
    listFilePath,
    audioChunkPaths.map((p) => `file '${p}'`).join("\n")
  );

  const finalAudioPath = path.resolve(folderPath, `${timestamp}.wav`);
  execSync(
    `ffmpeg -f concat -safe 0 -i "${listFilePath}" -c copy "${finalAudioPath}"`
  );

  // 3. Limpiar chunks y list.txt
  audioChunkPaths.forEach((p) => fs.unlinkSync(p));
  fs.unlinkSync(listFilePath);

  return {
    audio: finalAudioPath,
  };
};
