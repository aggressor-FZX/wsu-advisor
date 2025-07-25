# 🎓 CougAdvisor: WSU Academic Advising AI

**Live demo:** [www.cogitometric.org](http://www.cogitometric.org)  
**Hosted on:** Vercel frontend, GoDaddy domain  
**Backed by:** Pinecone (RAG), OpenAI GPT-3.5, LangChain, Selenium-based web crawler

---

## 🚀 Overview

**CougAdvisor** simulates a Washington State University academic advisor using Retrieval-Augmented Generation (RAG). Users ask advising questions through a web UI, and answers are generated based on scraped course and advising content.

This demo highlights how structured context, semantic search, and prompt discipline can improve reliability in academic QA systems.

---

## 🧠 Tech Stack

| Component              | Purpose                                              |
|------------------------|------------------------------------------------------|
| `Next.js` + `Vercel`   | UI and backend hosting                               |
| `OpenAI GPT-3.5`       | Large language model for response generation         |
| `Pinecone`             | Vector search for relevant advising context          |
| `LangChain`            | Chunking, embedding, and orchestrating RAG pipeline |
| `Selenium + crawl4ai`  | Automated scraping of WSU advising pages             |

---

## 📦 API Details

**File:** `pages/api/query.js`

### Process Flow

1. Receive a `POST` request with a student question.
2. Search Pinecone index `rag2riches` with topK = 18.
3. Format results into context string:  
   > _“---CONTEXT---\n... \n---QUESTION---”_
4. Send prompt to GPT-3.5 with system role instructions.
5. Return JSON with structured academic advising reply.

---

## 🧭 Prompt Design

System instructions restrict model behavior:

- ❗ Always cite courses like `MATH 105`, `CS 211`
- 🔗 Refer to WSU links like `https://advising.wsu.edu`
- 🫂 Use empathetic student language:  
  _“I understand your concern…”_
- ❓ If info is missing:  
  _“I’m sorry, I don’t have enough information...”_

---

## 🕸️ Crawling + Indexing

Sources scraped using headless Selenium:

- WSU advising pages
- Term schedules
- Course catalog

Text is chunked and embedded via LangChain, then stored in the `rag2riches` namespace of Pinecone.

---

## 🔐 Environment Variables

Create a `.env` file with:

```bash
OPENAI_API_KEY=your-openai-key
PINECONE_API_KEY=your-pinecone-key
# Optional:
PINECONE_ENVIRONMENT=us-west1-gcp
