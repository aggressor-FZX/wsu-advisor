import { useState } from "react";
import Image from "next/image";
import logo from "../logo.webp"; // Adjust path if needed

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer]     = useState("");
  const [loading, setLoading]   = useState(false);

  async function ask() {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const { answer } = await res.json();
      setAnswer(answer);
    } catch (e) {
      setAnswer("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

   return (
    <main style={{ maxWidth: 600, margin: "2rem auto", padding: "0 1rem" }}>
     <Image
        src={logo}
        alt="WSU Advisor Logo"
        style={{ display: "block", margin: "0 auto 1rem", maxWidth: 120 }}
        width={120}
        height={120}
      />
      <h1>WSU Course Advisor</h1>
      <p>Ask me for advice on choosing classes at WSU:</p>
      <input
        style={{ width: "100%", padding: ".5rem", fontSize: "1rem" }}
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="e.g. What math do I need to transfer as a junior in Software Engineering?"
      />
      <button
        style={{ width: "100%", padding: ".5rem", fontSize: "1rem", marginTop: ".5rem" }}
        onClick={ask}
        disabled={loading}
      >
        {loading ? "Thinking…" : "Ask"}
      </button>

      {answer && (
        <div
          style={{
            whiteSpace: "pre-wrap",
            marginTop: "1rem",

           
            background: "#f5f5f5",
            color: "#222",             // dark text
            border: "1px solid #ccc",   // subtle border
            padding: "1rem",
            borderRadius: 4,
          }}
        >
          {answer}
        </div>
      )}
    </main>
  );
}