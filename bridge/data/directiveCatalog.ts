/**
 * Directive Catalog — Command Room Campaign
 *
 * Mỗi directive là một lệnh chiến lược mà người chơi có thể ra trong TURN_PLANNING.
 * Directive có category, cost, effects lên CampaignMetrics, và cooldown tùy chọn.
 */

// ---------- Types ----------

export type DirectiveCategory = "POLITICAL" | "MILITARY" | "LOGISTICS" | "INTELLIGENCE";

export interface CampaignDirective {
  id: string;
  label: string;
  category: DirectiveCategory;
  description: string;
  costs: { commandPoints: number };
  effects: {
    control?: number;
    support?: number;
    logistics?: number;
    secrecy?: number;
    pressure?: number;
  };
  /** Sau khi dùng, bao nhiêu lượt mới dùng lại được (0 = ko cooldown) */
  cooldownTurns: number;
}

// ---------- Catalog ----------

export const DIRECTIVE_CATALOG: CampaignDirective[] = [
  // === POLITICAL ===
  {
    id: "mass-mobilization",
    label: "Dân vận",
    category: "POLITICAL",
    description: "Vận động quần chúng tham gia phong trào, tăng ủng hộ mạnh.",
    costs: { commandPoints: 1 },
    effects: { support: 8, secrecy: -3, pressure: -2 },
    cooldownTurns: 0,
  },
  {
    id: "political-agitation",
    label: "Kích động chính trị",
    category: "POLITICAL",
    description: "Tổ chức biểu tình, đình công — rủi ro cao nhưng hiệu quả lớn.",
    costs: { commandPoints: 1 },
    effects: { support: 12, control: 4, secrecy: -8, pressure: 4 },
    cooldownTurns: 2,
  },

  // === MILITARY ===
  {
    id: "local-offensive",
    label: "Tiến công cục bộ",
    category: "MILITARY",
    description: "Tấn công đồn bốt, mở rộng vùng kiểm soát nhưng tăng áp lực địch.",
    costs: { commandPoints: 1 },
    effects: { control: 9, pressure: 6, logistics: -2 },
    cooldownTurns: 0,
  },
  {
    id: "guerrilla-raid",
    label: "Du kích đột kích",
    category: "MILITARY",
    description: "Phục kích nhanh, gây sát thương rồi rút lui, ít lộ bí mật.",
    costs: { commandPoints: 1 },
    effects: { control: 5, pressure: 3, secrecy: -1 },
    cooldownTurns: 0,
  },
  {
    id: "full-assault",
    label: "Tổng tấn công",
    category: "MILITARY",
    description: "Đánh lớn chiến lược — rủi ro cực cao, hiệu quả cực lớn.",
    costs: { commandPoints: 2 },
    effects: { control: 16, pressure: 12, secrecy: -10, logistics: -5 },
    cooldownTurns: 3,
  },

  // === LOGISTICS ===
  {
    id: "logistics-corridor",
    label: "Mở rộng tiếp tế",
    category: "LOGISTICS",
    description: "Thiết lập tuyến vận chuyển mới, tăng hậu cần nhưng dễ bị phát hiện.",
    costs: { commandPoints: 1 },
    effects: { logistics: 10, control: 2, secrecy: -3, pressure: 3 },
    cooldownTurns: 0,
  },
  {
    id: "supply-cache",
    label: "Kho dự trữ bí mật",
    category: "LOGISTICS",
    description: "Cất giấu vật tư dự phòng — hiệu quả thấp hơn nhưng giữ được bí mật.",
    costs: { commandPoints: 1 },
    effects: { logistics: 6, secrecy: 2 },
    cooldownTurns: 1,
  },

  // === INTELLIGENCE ===
  {
    id: "security-split",
    label: "Phân tán bảo mật",
    category: "INTELLIGENCE",
    description: "Chia nhỏ mạng lưới để giảm rủi ro bị lộ. Giảm ủng hộ nhẹ.",
    costs: { commandPoints: 1 },
    effects: { secrecy: 9, support: -2, pressure: -1 },
    cooldownTurns: 0,
  },
  {
    id: "counter-intelligence",
    label: "Phản gián",
    category: "INTELLIGENCE",
    description: "Phát hiện và loại bỏ gián điệp, giảm áp lực mạnh.",
    costs: { commandPoints: 1 },
    effects: { secrecy: 6, pressure: -8, support: -1 },
    cooldownTurns: 2,
  },
  {
    id: "double-agent",
    label: "Điệp viên hai mang",
    category: "INTELLIGENCE",
    description: "Cài nội gián — rủi ro lớn nhưng thưởng rất cao nếu thành công.",
    costs: { commandPoints: 2 },
    effects: { secrecy: 4, pressure: -12, control: 6 },
    cooldownTurns: 3,
  },
];

// ---------- Helpers ----------

/** Lấy directive theo ID */
export const getDirectiveById = (id: string): CampaignDirective | undefined =>
  DIRECTIVE_CATALOG.find((d) => d.id === id);

/** Lấy danh sách directives theo category */
export const getDirectivesByCategory = (cat: DirectiveCategory): CampaignDirective[] =>
  DIRECTIVE_CATALOG.filter((d) => d.category === cat);

/** Lọc directives đang available (ko bị cooldown) */
export const getAvailableDirectives = (
  cooldowns: Record<string, number>
): CampaignDirective[] =>
  DIRECTIVE_CATALOG.filter((d) => (cooldowns[d.id] ?? 0) <= 0);

/** Tick cooldowns xuống 1 mỗi lượt (gọi ở đầu mỗi turn) */
export const tickCooldowns = (
  cooldowns: Record<string, number>
): Record<string, number> => {
  const next: Record<string, number> = {};
  for (const [id, remaining] of Object.entries(cooldowns)) {
    if (remaining > 0) next[id] = remaining - 1;
  }
  return next;
};
