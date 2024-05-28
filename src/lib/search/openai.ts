import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_SECRET,
});

// Make sure to use the same model as the one used to
// create the embeddings for cord index in ask-cord
export async function createEmbedding(input: string) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input,
  });
  return response.data[0].embedding;
}
