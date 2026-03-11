/**
 * Campaign Config — Command Room
 *
 * Chứa stage targets, regions, turn events, và pacing constants.
 * Dùng bởi gameStore.ts và các command-room UI components.
 */

import { STAGES, type StageId } from "./gameData";

// ---------- Campaign Metrics Type ----------

export interface CampaignMetrics {
  control: number;
  support: number;
  logistics: number;
  secrecy: number;
  pressure: number;
}

// ---------- Stage Targets ----------

export const CAMPAIGN_STAGE_TARGETS: Record<string, CampaignMetrics> = {
  [STAGES.STAGE_1_1954_1960]: { control: 45, support: 50, logistics: 35, secrecy: 40, pressure: 70 },
  [STAGES.STAGE_2_1961_1963]: { control: 60, support: 58, logistics: 52, secrecy: 45, pressure: 75 },
  [STAGES.STAGE_3_1964_1965]: { control: 75, support: 65, logistics: 62, secrecy: 50, pressure: 78 },
  [STAGES.COMPLETED]: { control: 0, support: 0, logistics: 0, secrecy: 0, pressure: 100 },
};

// ---------- Regions ----------

export interface CampaignRegion {
  id: string;
  label: string;
  description: string;
  /** Bonus effects khi ra lệnh ở region này */
  bonusEffects: Partial<CampaignMetrics>;
}

export const REGIONS: CampaignRegion[] = [
  {
    id: "mekong-delta",
    label: "Đồng bằng sông Cửu Long",
    description: "Vùng đông dân, thuận lợi dân vận nhưng dễ bị giám sát.",
    bonusEffects: { support: 3, secrecy: -2 },
  },
  {
    id: "central-highlands",
    label: "Tây Nguyên",
    description: "Địa hình hiểm trở, lợi thế quân sự nhưng hậu cần khó.",
    bonusEffects: { control: 3, logistics: -2 },
  },
  {
    id: "ho-chi-minh-trail",
    label: "Đường Hồ Chí Minh",
    description: "Tuyến tiếp tế chiến lược, tăng hậu cần mạnh.",
    bonusEffects: { logistics: 4, pressure: 2 },
  },
  {
    id: "saigon-area",
    label: "Vùng Sài Gòn",
    description: "Trung tâm đối phương, rủi ro cực cao nhưng tác động chính trị lớn.",
    bonusEffects: { support: 4, control: 2, secrecy: -4, pressure: 3 },
  },
  {
    id: "coastal-zone",
    label: "Duyên hải miền Trung",
    description: "Vùng ven biển, dễ tiếp tế đường biển nhưng lộ.",
    bonusEffects: { logistics: 3, secrecy: -1 },
  },
];

/** Lấy region theo ID */
export const getRegionById = (id: string): CampaignRegion | undefined =>
  REGIONS.find((r) => r.id === id);

// ---------- Turn Events ----------

export interface TurnEvent {
  id: string;
  label: string;
  description: string;
  /** Effects tự động apply khi event xảy ra */
  effects: Partial<CampaignMetrics>;
  /** Stages mà event này có thể xuất hiện */
  stages: StageId[];
  /** Xác suất xảy ra (0-1) */
  probability: number;
}

export const TURN_EVENTS: TurnEvent[] = [
  {
    id: "enemy-sweep",
    label: "Địch càn quét",
    description: "Lực lượng địch mở chiến dịch lùng sục khu vực.",
    effects: { secrecy: -6, pressure: 8 },
    stages: [STAGES.STAGE_1_1954_1960, STAGES.STAGE_2_1961_1963, STAGES.STAGE_3_1964_1965],
    probability: 0.25,
  },
  {
    id: "supply-disruption",
    label: "Gián đoạn tiếp tế",
    description: "Tuyến vận chuyển bị phá hoại, hậu cần giảm.",
    effects: { logistics: -8, pressure: 3 },
    stages: [STAGES.STAGE_2_1961_1963, STAGES.STAGE_3_1964_1965],
    probability: 0.2,
  },
  {
    id: "popular-uprising",
    label: "Dân nổi dậy",
    description: "Quần chúng tự phát biểu tình ủng hộ, tăng ủng hộ và kiểm soát.",
    effects: { support: 8, control: 4, secrecy: -3 },
    stages: [STAGES.STAGE_1_1954_1960, STAGES.STAGE_2_1961_1963],
    probability: 0.15,
  },
  {
    id: "intelligence-leak",
    label: "Rò rỉ thông tin",
    description: "Một cơ sở bị lộ, bảo mật giảm nghiêm trọng.",
    effects: { secrecy: -10, pressure: 6 },
    stages: [STAGES.STAGE_2_1961_1963, STAGES.STAGE_3_1964_1965],
    probability: 0.15,
  },
  {
    id: "ally-reinforcement",
    label: "Chi viện đồng minh",
    description: "Miền Bắc gửi tiếp viện, tăng hậu cần và kiểm soát.",
    effects: { logistics: 6, control: 4, pressure: -2 },
    stages: [STAGES.STAGE_2_1961_1963, STAGES.STAGE_3_1964_1965],
    probability: 0.2,
  },
  {
    id: "morale-boost",
    label: "Sĩ khí tăng cao",
    description: "Chiến thắng nhỏ truyền cảm hứng, tăng ủng hộ.",
    effects: { support: 6, pressure: -3 },
    stages: [STAGES.STAGE_1_1954_1960, STAGES.STAGE_2_1961_1963, STAGES.STAGE_3_1964_1965],
    probability: 0.2,
  },
  {
    id: "us-escalation",
    label: "Mỹ leo thang",
    description: "Quân Mỹ tăng cường can thiệp, áp lực tăng mạnh.",
    effects: { pressure: 12, secrecy: -4, control: -3 },
    stages: [STAGES.STAGE_3_1964_1965],
    probability: 0.3,
  },
];

/** Chọn ngẫu nhiên event có thể xảy ra theo stage, dựa vào probability */
export const rollTurnEvent = (stageId: string): TurnEvent | null => {
  const eligible = TURN_EVENTS.filter(
    (e) => e.stages.includes(stageId as StageId) && Math.random() < e.probability
  );
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)];
};

// ---------- Pacing Constants ----------

export const CAMPAIGN_PACING: {
  maxTurnsPerStage: number;
  turnPlanningDuration: number;
  quizCheckpointTurns: number[];
  initialCommandPoints: number;
  quizCorrectCommandBonus: number;
} = {
  /** Số turn tối đa mỗi stage */
  maxTurnsPerStage: 6,
  /** Thời gian planning (giây) */
  turnPlanningDuration: 30,
  /** Turn nào có quiz checkpoint (1-indexed) */
  quizCheckpointTurns: [2, 4, 6],
  /** Command points khởi đầu mỗi stage */
  initialCommandPoints: 2,
  /** Command points thưởng khi trả lời đúng quiz */
  quizCorrectCommandBonus: 1,
};

// ---------- Quiz Impact ----------

export const QUIZ_IMPACT = {
  correct: {
    control: 4,
    support: 4,
    secrecy: 3,
    pressure: -6,
  } as Partial<CampaignMetrics>,
  wrong: {
    support: -4,
    secrecy: -6,
    pressure: 8,
  } as Partial<CampaignMetrics>,
} as const;
