import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Document } from '../model/chatbot.model';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import * as fs from 'fs';
import * as path from 'path';
import type { CreationAttributes } from 'sequelize';
import axios from 'axios';

const EMBEDDING_SIZE = 1536;
function randomEmbedding(): number[] {
  return Array.from({ length: EMBEDDING_SIZE }, () => Math.random());
}

export const SYSTEM_PROMPT = `
You are a helpful, concise, and intelligent assistant. Answer the user's query using ONLY the provided context (top 3 most relevant chunks).

Instructions:
- If the answer is clearly present in the context, provide it directly in a friendly and detailed manner, referencing the relevant content.
- If the answer is not exact but there are strong keyword matches or approximately 70% relevance, give your best-guess answer based strictly on the context, improving clarity and helpfulness.
- If the context does not contain meaningful information, reply exactly with:
  "Sorry! I can't provide you the answer from out of context."
- If the user greets you (e.g., "hi", "hello", etc.), respond with a friendly greeting.
- If the user asks for all stored data, reply:
  "Sorry! I can't provide all stored data, but I can answer your question based on the data I have."
- If there are spelling mistakes in the question, silently correct them and proceed.
- If the query is unclear, politely ask the user for clarification instead of guessing.
- For yes/no questions, provide a clear yes or no answer based only on the context.
- If the user asks a math question, reply:
  "Sorry! I can't provide answers out of the context."

Strict Rules:
- DO NOT say phrases like "based on the context", "your query is", etc.
- DO NOT rephrase or repeat the user's question.
- DO NOT add any information not present in the context.
- DO NOT provide personal opinions or assumptions.
`;

@Injectable()
export class ChatbotService {
  private readonly groqEndpoint =
    'https://api.groq.com/openai/v1/chat/completions';
  private readonly groqApiKey = process.env.GROQ_API_KEY;

  constructor(
    @InjectModel(Document)
    private readonly documentModel: typeof Document,
  ) {}

  async processPdf(file: Express.Multer.File) {
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const tempPath = path.join(uploadsDir, file.originalname);
    fs.writeFileSync(tempPath, file.buffer);

    const loader = new PDFLoader(tempPath);
    const docs = await loader.load();
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });
    const splitDocs = await splitter.splitDocuments(docs);
    for (const doc of splitDocs) {
      const embedding = randomEmbedding();
      const embeddingString = `[${embedding.join(',')}]`; // <-- convert to string
      await this.documentModel.create({
        content: doc.pageContent,
        embedding: embeddingString, 
      } as CreationAttributes<Document>);
    }
    fs.unlinkSync(tempPath);
    return { status: 'ok', chunks: splitDocs.length };
  }
  // chat
  async chatWithRag(
    question: string,
  ): Promise<{ text: string; chunks: Document[] }> {
    const questionEmbedding = `[${randomEmbedding().join(',')}]`; 
    const docs = await this.documentModel.sequelize!.query(
      `
SELECT *, (embedding <#> $1) AS distance
FROM documents
ORDER BY distance ASC
LIMIT 3
`,
      {
        bind: [questionEmbedding],
        model: Document,
        mapToModel: true,
      },
    );

    if (!docs.length) {
      return {
        text: `Sorry! I can't provide you the answer from out of context.`,
        chunks: [],
      };
    }
    const context = docs.map((d: Document) => d.content).join('\n\n');
    const prompt = `${SYSTEM_PROMPT}\n\nContext:\n${context}\n\nUser Question:\n${question}`;
    const response = await axios.post(
      this.groqEndpoint,
      {
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Context:\n${context}\n\nUser Question:\n${question}`,
          },
        ],
        max_tokens: 512,
        temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const answer =
      response.data.choices?.[0]?.message?.content?.trim() ||
      "Sorry! Couldn't extract a valid response.";

    return { text: answer, chunks: docs };
  }
}
