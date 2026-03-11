import React, { useMemo, useState } from "react";
import { useGameStore } from "../../store/gameStore";
import { STAGE_META } from "../../data/gameData";

const QuestionPanel = () => {
  const {
    gameState,
    currentQuestion,
    answerQuiz,
    currentStage,
    stageQuizProgress,
  } = useGameStore();
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState<string>("");

  const stageMeta = STAGE_META[currentStage];
  const stageProgress = stageQuizProgress[currentStage] ?? {
    asked: 0,
    correct: 0,
    usedQuestionIds: [],
  };

  const totalQuiz = stageMeta?.quizCount ?? 0;
  const currentIndex = useMemo(
    () => Math.min(stageProgress.asked + 1, totalQuiz || stageProgress.asked + 1),
    [stageProgress.asked, totalQuiz]
  );

  if (gameState !== "QUIZ" || !currentQuestion) return null;

  const handleAnswer = (index: number) => {
    if (locked) return;
    setLocked(true);
    const result = answerQuiz(index);
    const text = result.correct ? "Đúng. " : "Chưa đúng. ";
    setFeedback(`${text}${result.explanation ?? ""}`);
    setTimeout(() => setLocked(false), 300);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.badge}>
            {stageMeta?.shortTitle} · Cau {currentIndex}/{totalQuiz}
          </span>
          <span style={styles.subtitle}>{stageMeta?.title}</span>
        </div>

        <h2 style={styles.question}>{currentQuestion.question}</h2>

        <div style={styles.options}>
          {currentQuestion.options.map((opt, idx) => (
            <button
              key={`${currentQuestion.id}-${idx}`}
              style={styles.optionBtn}
              className="quiz-option-btn"
              onClick={() => handleAnswer(idx)}
              disabled={locked}
            >
              <span style={styles.optionLabel}>{String.fromCharCode(65 + idx)}</span>
              <span>{opt}</span>
            </button>
          ))}
        </div>

        {feedback && <div style={styles.feedback}>{feedback}</div>}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(2, 6, 23, 0.82)",
    backdropFilter: "blur(4px)",
    zIndex: 280,
    display: "grid",
    placeItems: "center",
    padding: 20,
  },
  card: {
    width: "min(860px, 92vw)",
    borderRadius: 16,
    border: "1px solid rgba(125, 211, 252, 0.45)",
    background: "rgba(15, 23, 42, 0.96)",
    boxShadow: "0 24px 80px rgba(2, 132, 199, 0.2)",
    padding: 24,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 14,
  },
  badge: {
    width: "fit-content",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.7,
    background: "rgba(14, 116, 144, 0.35)",
    border: "1px solid rgba(125, 211, 252, 0.45)",
    borderRadius: 999,
    padding: "5px 10px",
    color: "#bae6fd",
  },
  subtitle: {
    fontSize: 14,
    color: "#cbd5e1",
  },
  question: {
    margin: "0 0 18px 0",
    color: "#f8fafc",
    lineHeight: 1.5,
    fontWeight: 600,
  },
  options: {
    display: "grid",
    gap: 10,
  },
  optionBtn: {
    borderRadius: 12,
    border: "1px solid rgba(148, 163, 184, 0.45)",
    background: "rgba(30, 41, 59, 0.85)",
    color: "#e2e8f0",
    padding: "12px 14px",
    textAlign: "left",
    fontSize: 15,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  optionLabel: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0ea5e9",
    color: "#082f49",
    fontWeight: 700,
    flexShrink: 0,
  },
  feedback: {
    marginTop: 14,
    color: "#c7f9cc",
    fontSize: 14,
    lineHeight: 1.4,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(34, 197, 94, 0.4)",
    background: "rgba(20, 83, 45, 0.4)",
  },
};

export default QuestionPanel;
