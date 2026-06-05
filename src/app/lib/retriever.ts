import { ai } from "./gemini";
import { supabase } from "./supabase";

async function getEmbedding(text: string) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
  });

  return response.embeddings?.[0]?.values || [];
}

export async function retrieve(query: string) {
  const embedding = await getEmbedding(query);

  const { data, error } = await supabase.rpc(
    "match_documents",
    {
      query_embedding: embedding,
      match_count: 3,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}