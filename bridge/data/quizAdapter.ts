import QUIZ_DATA from "../questions-revolution-network.json";

export interface CampaignQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const getQuestionForStage = (
  stageId: string,
  ignoredIds: string[]
): CampaignQuestion | null => {
  const stage = QUIZ_DATA.stages.find((s) => s.stageId === stageId);
  if (!stage) return null;

  // Filter out already asked questions
  const availableQuestions = stage.questions.filter(
    (q) => !ignoredIds.includes(q.id)
  );

  if (availableQuestions.length === 0) {
    // If all questions exhausted, fallback to random from the whole pool of this stage
    const fallback = stage.questions;
    if (fallback.length === 0) return null;
    return fallback[Math.floor(Math.random() * fallback.length)];
  }

  // Pick a random available question
  return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
};
