import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "./supabase";
import { ai } from "./gemini";

const DATA_DIR = path.join(process.cwd(), "data");

async function getEmbedding(text: string) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
  });

  return response.embeddings?.[0]?.values || [];
}

export async function ingestDocuments() {
  const files = fs.readdirSync(DATA_DIR);

  for (const file of files) {
    const fullPath = path.join(DATA_DIR, file);

    if (!file.endsWith(".md")) continue;

    const content = fs.readFileSync(fullPath, "utf8");

    const embedding = await getEmbedding(content);

    const { error } = await supabase.from("documents").insert({
      id: uuidv4(),
      source: file,
      content,
      embedding,
    });

    if (error) {
      console.error(`Failed: ${file}`, error);
    } else {
      console.log(`Ingested: ${file}`);
    }
  }
}