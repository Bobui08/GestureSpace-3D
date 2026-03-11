import React, { useState } from "react";
import { useGameStore } from "../../store/gameStore";

const IntelConsole = () => {
  const {
    currentQuestion,
    submitCampaignQuizAnswer,
    finishCampaignQuiz,
    campaignState,
  } = useGameStore();

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [result, setResult] = useState<{
    correct: boolean;
    explanation?: string;
  } | null>(null);

  if (campaignState !== "INTEL_QUIZ" || !currentQuestion) return null;

  const handleAnswer = (index: number) => {
    if (result) return; // already answered
    setSelectedAnswer(index);
    const res = submitCampaignQuizAnswer(index);
    setResult(res);

    // Auto-advance after a delay
    setTimeout(() => {
      setSelectedAnswer(null);
      setResult(null);
      finishCampaignQuiz();
    }, 3000);
  };

  return (
    <div style={s.overlay}>
      <div style={s.card}>
        <div style={s.headerBadge}>🧠 KIỂM TRA TÌNH BÁO</div>

        <div style={s.question}>{currentQuestion.question}</div>

        <div style={s.optionsGrid}>
          {currentQuestion.options.map((opt, i) => {
            let btnStyle = { ...s.optionBtn };
            if (result !== null) {
              if (i === currentQuestion.correctIndex) {
                btnStyle = { ...btnStyle, borderColor: "#4ade80", background: "rgba(74,222,128,0.12)", color: "#4ade80" };
              } else if (i === selectedAnswer && !result.correct) {
                btnStyle = { ...btnStyle, borderColor: "#fb7185", background: "rgba(251,113,133,0.12)", color: "#fb7185" };
              }
            } else if (i === selectedAnswer) {
              btnStyle = { ...btnStyle, borderColor: "#00f3ff", background: "rgba(0,243,255,0.08)" };
            }
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={result !== null}
                style={{
                  ...btnStyle,
                  cursor: result !== null ? "default" : "pointer",
                  opacity: result !== null && i !== selectedAnswer && i !== currentQuestion.correctIndex ? 0.4 : 1,
                }}
              >
                <span style={s.optionIndex}>{String.fromCharCode(65 + i)}</span>
                <span style={s.optionText}>{opt}</span>
              </button>
            );
          })}
        </div>

        {result && (
          <div style={{
            ...s.resultBox,
            borderColor: result.correct ? "rgba(74,222,128,0.4)" : "rgba(251,113,133,0.4)",
          }}>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              color: result.correct ? "#4ade80" : "#fb7185",
              marginBottom: 6,
            }}>
              {result.correct ? "✓ CHÍNH XÁC" : "✗ SAI"}
            </div>
            {result.explanation && (
              <div style={s.explanation}>{result.explanation}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: 500,
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
  },
  card: {
    width: "min(680px, 90vw)",
    maxHeight: "85vh",
    overflowY: "auto",
    background: "rgba(15,23,42,0.96)",
    border: "1px solid rgba(0,243,255,0.3)",
    borderRadius: 20,
    padding: "28px 32px",
  },
  headerBadge: {
    display: "inline-block",
    padding: "4px 14px",
    fontSize: 12,
    fontWeight: 700,
    color: "#00f3ff",
    background: "rgba(0,243,255,0.1)",
    border: "1px solid rgba(0,243,255,0.3)",
    borderRadius: 999,
    letterSpacing: 1.5,
    textTransform: "uppercase" as const,
    marginBottom: 16,
  },
  question: {
    fontSize: 18,
    fontWeight: 600,
    color: "#f1f5f9",
    lineHeight: 1.5,
    marginBottom: 20,
  },
  optionsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  optionBtn: {
    all: "unset" as const,
    boxSizing: "border-box" as const,
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 18px",
    borderRadius: 12,
    border: "1px solid rgba(71,85,105,0.4)",
    background: "rgba(30,41,59,0.5)",
    color: "#e2e8f0",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  },
  optionIndex: {
    width: 28,
    height: 28,
    display: "grid",
    placeItems: "center",
    fontSize: 13,
    fontWeight: 700,
    borderRadius: 8,
    background: "rgba(51,65,85,0.6)",
    color: "#94a3b8",
    flexShrink: 0,
  },
  optionText: {
    fontSize: 14,
    lineHeight: 1.4,
  },
  resultBox: {
    marginTop: 16,
    padding: "14px 18px",
    borderRadius: 12,
    border: "1px solid",
    background: "rgba(15,23,42,0.8)",
  },
  explanation: {
    fontSize: 13,
    color: "#cbd5e1",
    lineHeight: 1.5,
  },
};

export default IntelConsole;
