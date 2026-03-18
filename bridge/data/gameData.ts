export const STAGES = {
  STAGE_1_1954_1960: "stage_1_1954_1960",
  STAGE_2_1961_1963: "stage_2_1961_1963",
  STAGE_3_1964_1965: "stage_3_1964_1965",
  COMPLETED: "COMPLETED",
} as const;

export type StageId = (typeof STAGES)[keyof typeof STAGES];

export const STAGE_SEQUENCE: StageId[] = [
  STAGES.STAGE_1_1954_1960,
  STAGES.STAGE_2_1961_1963,
  STAGES.STAGE_3_1964_1965,
];

export type NodeType =
  | "CO_SO_QUAN_CHUNG"
  | "DU_KICH"
  | "TUYEN_VAN_CHUYEN"
  | "VUNG_AN_TOAN"
  | "DIEM_CHI_HUY";

export interface GameBlock {
  id: string;
  text: string;
  type: StageId;
  nodeType: NodeType;
}

export const STAGE_META: Record<
  StageId,
  {
    title: string;
    shortTitle: string;
    years: string;
    image: string;
    quizCount: number;
    passRatio: number;
    defenseDuration: number;
    targets: {
      influence: number;
      stability: number;
      logistics: number;
      exposureMax: number;
    };
  }
> = {
  [STAGES.STAGE_1_1954_1960]: {
    title: "Giữ lực lượng, xây nền, mở thế",
    shortTitle: "Giai đoạn 1",
    years: "1954-1960",
    image: "Miền Bắc xây dựng chủ nghĩa xã hội.webp",
    quizCount: 5,
    passRatio: 0.8,
    defenseDuration: 14,
    targets: { influence: 45, stability: 35, logistics: 20, exposureMax: 95 },
  },
  [STAGES.STAGE_2_1961_1963]: {
    title: "Phá Chiến tranh đặc biệt",
    shortTitle: "Giai đoạn 2",
    years: "1961-1963",
    image: "Phong trào Đồng khởi miền Nam 1960.jpg",
    quizCount: 5,
    passRatio: 0.8,
    defenseDuration: 18,
    targets: { influence: 65, stability: 45, logistics: 50, exposureMax: 90 },
  },
  [STAGES.STAGE_3_1964_1965]: {
    title: "Chống leo thang chiến tranh",
    shortTitle: "Giai đoạn 3",
    years: "1964-1965",
    image: "Chiến tranh leo thang.jpg",
    quizCount: 6,
    passRatio: 5 / 6,
    defenseDuration: 22,
    targets: { influence: 80, stability: 60, logistics: 60, exposureMax: 85 },
  },
  [STAGES.COMPLETED]: {
    title: "Hoàn thành chiến dịch",
    shortTitle: "Hoàn thành",
    years: "",
    image: "bản đồ việt nam.jpg",
    quizCount: 0,
    passRatio: 1,
    defenseDuration: 0,
    targets: { influence: 0, stability: 0, logistics: 0, exposureMax: 100 },
  },
};

export const NODE_ICON_FILES: Record<NodeType, string> = {
  CO_SO_QUAN_CHUNG: "cơ sở.png",
  DU_KICH: "du kích.png",
  TUYEN_VAN_CHUYEN: "vận chuyển.png",
  VUNG_AN_TOAN: "vùng an toàn.png",
  DIEM_CHI_HUY: "chỉ huy.png",
};

export const BLOCKS: Record<StageId, GameBlock[]> = {
  [STAGES.STAGE_1_1954_1960]: [
    {
      id: "s1-b1",
      text: "Xây cơ sở quần chúng",
      type: STAGES.STAGE_1_1954_1960,
      nodeType: "CO_SO_QUAN_CHUNG",
    },
    {
      id: "s1-b2",
      text: "Tổ chức lực lượng du kích",
      type: STAGES.STAGE_1_1954_1960,
      nodeType: "DU_KICH",
    },
    {
      id: "s1-b3",
      text: "Mở tuyến vận chuyển cấp 1",
      type: STAGES.STAGE_1_1954_1960,
      nodeType: "TUYEN_VAN_CHUYEN",
    },
    {
      id: "s1-b4",
      text: "Thiết lập vùng an toàn",
      type: STAGES.STAGE_1_1954_1960,
      nodeType: "VUNG_AN_TOAN",
    },
    {
      id: "s1-b5",
      text: "Kích hoạt điểm chỉ huy ban đầu",
      type: STAGES.STAGE_1_1954_1960,
      nodeType: "DIEM_CHI_HUY",
    },
  ],
  [STAGES.STAGE_2_1961_1963]: [
    {
      id: "s2-b1",
      text: "Mở rộng cơ sở ở vùng trọng điểm",
      type: STAGES.STAGE_2_1961_1963,
      nodeType: "CO_SO_QUAN_CHUNG",
    },
    {
      id: "s2-b2",
      text: "Tăng cường du kích cơ động",
      type: STAGES.STAGE_2_1961_1963,
      nodeType: "DU_KICH",
    },
    {
      id: "s2-b3",
      text: "Nâng cấp tuyến vận chuyển",
      type: STAGES.STAGE_2_1961_1963,
      nodeType: "TUYEN_VAN_CHUYEN",
    },
    {
      id: "s2-b4",
      text: "Tạo vùng an toàn liên hoàn",
      type: STAGES.STAGE_2_1961_1963,
      nodeType: "VUNG_AN_TOAN",
    },
    {
      id: "s2-b5",
      text: "Mở điểm chỉ huy cấp 1",
      type: STAGES.STAGE_2_1961_1963,
      nodeType: "DIEM_CHI_HUY",
    },
    {
      id: "s2-b6",
      text: "Củng cố tuyến dự phòng",
      type: STAGES.STAGE_2_1961_1963,
      nodeType: "TUYEN_VAN_CHUYEN",
    },
  ],
  [STAGES.STAGE_3_1964_1965]: [
    {
      id: "s3-b1",
      text: "Mạng cơ sở bám dân",
      type: STAGES.STAGE_3_1964_1965,
      nodeType: "CO_SO_QUAN_CHUNG",
    },
    {
      id: "s3-b2",
      text: "Du kích chống càn quét",
      type: STAGES.STAGE_3_1964_1965,
      nodeType: "DU_KICH",
    },
    {
      id: "s3-b3",
      text: "Tuyến vận chuyển chiến lược",
      type: STAGES.STAGE_3_1964_1965,
      nodeType: "TUYEN_VAN_CHUYEN",
    },
    {
      id: "s3-b4",
      text: "Vùng an toàn liên khu",
      type: STAGES.STAGE_3_1964_1965,
      nodeType: "VUNG_AN_TOAN",
    },
    {
      id: "s3-b5",
      text: "Điểm chỉ huy trung tâm",
      type: STAGES.STAGE_3_1964_1965,
      nodeType: "DIEM_CHI_HUY",
    },
    {
      id: "s3-b6",
      text: "Trạm phục hồi hậu cần",
      type: STAGES.STAGE_3_1964_1965,
      nodeType: "TUYEN_VAN_CHUYEN",
    },
  ],
  [STAGES.COMPLETED]: [],
};

export const SLOTS: Record<
  StageId,
  { id: string; pos: [number, number, number] }[]
> = {
  [STAGES.STAGE_1_1954_1960]: [
    { id: "s1-slot-1", pos: [-3.2, 1.2, 0] },
    { id: "s1-slot-2", pos: [-1.4, 2.2, 0] },
    { id: "s1-slot-3", pos: [0.4, 1.2, 0] },
    { id: "s1-slot-4", pos: [2.2, 2.1, 0] },
    { id: "s1-slot-5", pos: [0, 3.2, 0] },
  ],
  [STAGES.STAGE_2_1961_1963]: [
    { id: "s2-slot-1", pos: [-3.8, 1.4, 0] },
    { id: "s2-slot-2", pos: [-2.0, 2.5, 0] },
    { id: "s2-slot-3", pos: [-0.2, 1.4, 0] },
    { id: "s2-slot-4", pos: [1.6, 2.5, 0] },
    { id: "s2-slot-5", pos: [3.4, 1.5, 0] },
    { id: "s2-slot-6", pos: [0.8, 3.4, 0] },
  ],
  [STAGES.STAGE_3_1964_1965]: [
    { id: "s3-slot-1", pos: [-4.2, 1.6, 0] },
    { id: "s3-slot-2", pos: [-2.2, 2.8, 0] },
    { id: "s3-slot-3", pos: [-0.2, 1.5, 0] },
    { id: "s3-slot-4", pos: [1.8, 2.8, 0] },
    { id: "s3-slot-5", pos: [3.8, 1.6, 0] },
    { id: "s3-slot-6", pos: [0.8, 4.0, 0] },
  ],
  [STAGES.COMPLETED]: [],
};

export const STAGE_LINKS: Record<StageId, [number, number][]> = {
  [STAGES.STAGE_1_1954_1960]: [
    [0, 1],
    [1, 2],
    [2, 3],
    [1, 4],
    [3, 4],
  ],
  [STAGES.STAGE_2_1961_1963]: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [2, 5],
    [1, 5],
    [3, 5],
  ],
  [STAGES.STAGE_3_1964_1965]: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [1, 5],
    [3, 5],
    [2, 5],
  ],
  [STAGES.COMPLETED]: [],
};

export const getImagePath = (fileName: string): string =>
  encodeURI(`/images/${fileName}`);
