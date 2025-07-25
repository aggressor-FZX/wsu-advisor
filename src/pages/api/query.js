// pages/api/query.js
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";

// 1) Your system prompt
const MODEL_INSTRUCTIONS = `
You are “CougAdvisor,” an expert Washington State University academic advisor.
You have access only to the “context” passed in from the vector database.  You do NOT have external knowledge.
When answering, ALWAYS:
• Cite any courses by their exact prefix + number (e.g. “MATH 105”)
• Point students to relevant campus resources (e.g. “Visit https://advising.wsu.edu for Degree Audit”)
• Summarize degree requirements, credit limits, and important deadlines
• Use empathetic, student-centered language (“I understand your concern…”)
If the context doesn’t answer the question, respond:
“I’m sorry, I don’t have enough information—please check with your advisor or registrar.”
`;

// 2) Helper to interpolate context + question
function model_context_query(context, question) {
  return `
---CONTEXT (from course catalog, term schedules, and advising guides)---
${context}

---QUESTION---
${question}
`;
}

// 3) instantiate OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 4) instantiate Pinecone (v6.x, no .init())
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
  //environment: process.env.PINECONE_ENVIRONMENT, // e.g. "us-east-1-gcp"
});
const index = pc.Index("rag2riches");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Missing question" });
  }
const namespace = index.namespace("default");

const search = await namespace.searchRecords({
  query: {
    inputs: { text: question },
    topK: 18
  },
  includeMetadata: true
});

  const hits = search.result.hits;
  if (hits.length === 0) {
    return res.json({ answer: "No data found." });
  }

  // 6) build context string
  const context = hits
    .map(
      (h) =>
        `${h.fields.text
          .slice(0, 200)
          .replace(/\s+/g, " ")}… (source: ${h.fields.source})`
    )
    .join("\n\n---\n\n");

  // 7) format your prompt
  const userPrompt = model_context_query(context, question);

  // 8) call the LLM
  const chat = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages: [
      { role: "system", content: MODEL_INSTRUCTIONS },
      { role: "user", content: userPrompt },
    ],
  });

  // 9) return the answer
  res.json({ answer: chat.choices[0].message.content });
}
