# RULES GAME - REVOLUTION NETWORK (1954-1965)

## 1) Mục tiêu học tập và mục tiêu chơi
- Người chơi xây dựng và mở rộng "Mạng lưới Cách mạng" trên bản đồ 3D hai miền.
- Mỗi màn tương ứng một giai đoạn lịch sử: 1954-1960, 1961-1963, 1964-1965.
- Muốn qua màn, người chơi phải:
  - Đạt ngưỡng độ phủ mạng lưới.
  - Trả lời đúng bộ câu hỏi của giai đoạn đó.

## 2) Biến số chính trong game
- `Influence` (0-100): mức ảnh hưởng cách mạng trên bản đồ.
- `Stability` (0-100): độ bền vững của mạng lưới trước truy quét.
- `Logistics` (0-100): năng lực vận chuyển và tiếp tế Bắc - Nam.
- `Exposure` (0-100): mức lộ mạng lưới; quá cao sẽ bị tổn thất lớn.
- `KnowledgeScore`: điểm trả lời câu hỏi lịch sử.

## 3) Node trong mạng lưới
- `CoSoQuanChung` (cơ sở quần chúng): tăng Influence bền vững.
- `DuKich` (du kích): tăng khả năng giữ node khi bị tấn công.
- `TuyenVanChuyen` (đường vận chuyển): tăng Logistics, giảm thời gian chi viện.
- `VungAnToan` (vùng an toàn): tăng Stability, giảm Exposure.
- `DiemChiHuy` (điểm chỉ huy): node trung tâm, mở khóa kỹ năng chi viện.

## 4) Luật nối node
- Chỉ nối được khi có đường đi logic:
  - `CoSoQuanChung -> DuKich`
  - `DuKich -> TuyenVanChuyen`
  - `TuyenVanChuyen -> VungAnToan`
  - `VungAnToan -> DiemChiHuy` (hoặc ngược lại khi đã mở khóa màn cao)
- Nối đúng:
  - +Influence, +Stability.
  - Mở rộng vùng sáng trên bản đồ.
- Nối sai:
  - +Exposure.
  - Node bị "nhiễu", khóa tạm thời 5-10 giây.

## 5) Điều khiển 2 tay (dùng lại hand tracking)
- Tay trái:
  - Pinch (ngón cái + trỏ): chọn node nguồn.
  - Di chuyển bàn tay: kéo node theo không gian 3D.
  - Open palm 1.5 giây: hủy thao tác kéo.
- Tay phải:
  - Pinch: chọn node đích để tạo liên kết.
  - Fist 1 giây: kích hoạt "Chi viện nhanh" (cooldown).
  - Swipe phải/trái: chuyển tab câu hỏi hoặc xem giải thích.
- Hai tay:
  - Hai lòng bàn tay mở đồng thời 2 giây: xác nhận trả lời câu hỏi.

## 6) Cấu trúc 1 vòng chơi (core loop)
1. Quan sát bản đồ và trạng thái 4 chỉ số chính.
2. Dùng tay trái chọn node nguồn, tay phải chọn node đích để nối.
3. Kích hoạt chi viện khi tuyến hậu cần nghẽn.
4. Khi đạt checkpoint, hệ thống bật câu hỏi lịch sử.
5. Trả lời đúng để mở node cấp cao và tiếp tục mở rộng mạng.

## 7) Cơ chế câu hỏi
- Mỗi câu có 4 đáp án, 1 đáp án đúng.
- Trả lời đúng:
  - +KnowledgeScore.
  - +Influence hoặc +Stability (thưởng nhỏ).
- Trả lời sai:
  - -Stability hoặc +Exposure.
  - Hiện giải thích ngắn để người học hiểu logic lịch sử.
- Mỗi giai đoạn yêu cầu tối thiểu 70% câu đúng để qua màn.

## 8) Sự kiện ngẫu nhiên (Random Events)
- `Càn quét khu vực`: giảm Stability của node tiền tuyến.
- `Đứt tuyến tiếp tế`: giảm Logistics tạm thời.
- `Lộ cơ sở`: tăng Exposure tại cụm node vừa mở rộng.
- `Thời cơ chính trị`: tăng thưởng Influence nếu trả lời đúng câu hỏi kế tiếp.

## 9) Điều kiện thắng/thua theo màn
- Thắng màn:
  - Đạt ngưỡng Influence yêu cầu.
  - Trả lời đúng >= 70% câu hỏi màn.
  - `Stability > 0`.
- Thua màn:
  - `Stability = 0`, hoặc
  - `Exposure >= 100`, hoặc
  - Hết thời gian nhiệm vụ màn.

## 10) Ngưỡng từng giai đoạn
- Giai đoạn 1 (1954-1960):
  - Influence >= 45, Knowledge >= 70%.
- Giai đoạn 2 (1961-1963):
  - Influence >= 65, Logistics >= 50, Knowledge >= 70%.
- Giai đoạn 3 (1964-1965):
  - Influence >= 80, Stability >= 60, Knowledge >= 75%.

## 11) Chấm điểm cuối game
- `FinalScore = Influence*0.35 + Stability*0.25 + Logistics*0.15 + KnowledgeScore*0.25`
- Xếp hạng:
  - S: 90-100
  - A: 80-89
  - B: 65-79
  - C: 50-64
  - D: < 50

## 12) Ý nghĩa học thuật
- Làm rõ vai trò lãnh đạo của Đảng trong việc:
  - Xây dựng miền Bắc thành hậu phương lớn.
  - Chỉ đạo cách mạng miền Nam phù hợp từng giai đoạn.
  - Kết hợp đấu tranh chính trị, quân sự và hậu cần Bắc - Nam.
