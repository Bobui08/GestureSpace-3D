# TECH STACK ĐỀ XUẤT CHO REVOLUTION NETWORK (UI ĐẸP, CHUYỂN ĐỘNG MƯỢT)

## 1) Nền tảng code chính
- `Next.js + TypeScript`
  - Lý do: tổ chức dự án tốt, dễ chia module game/UI/API, build ổn định.
- `React 19` (hoặc bản tương thích với Next đang dùng)
  - Lý do: phù hợp component hóa HUD, panel câu hỏi, overlay.

## 2) 3D Engine và render
- `Three.js`
  - Lõi đồ họa 3D, kiểm soát scene/camera/light/material.
- `@react-three/fiber`
  - Gắn Three.js vào React theo cách declarative, dễ quản lý scene.
- `@react-three/drei`
  - Có sẵn helper camera, controls, environment, text, preload.
- `@react-three/postprocessing`
  - Bloom, DOF, vignette, noise tinh tế cho cảm giác cao cấp.

## 3) Hand tracking và gesture
- `@mediapipe/tasks-vision` (hoặc MediaPipe Hands nếu giữ hệ cũ)
  - Nhận diện landmark ổn định, latency thấp.
- `fingerpose` hoặc rule-based gesture engine tự viết
  - Mapping gesture rõ ràng: pinch, fist, open palm, swipe.
- Gợi ý kỹ thuật mượt:
  - Làm mượt landmark bằng EMA/Kalman.
  - Tách luồng nhận diện sang WebWorker nếu cần.

## 4) State management và game loop
- `zustand`
  - Quản lý game state nhẹ, đơn giản, hiệu năng tốt.
- `immer` (optional)
  - Cập nhật state phức tạp dễ đọc hơn.
- `r3f useFrame + fixed timestep`
  - Tách render FPS và simulation tick để gameplay ổn định.

## 5) UI đẹp và animation 2D
- `Tailwind CSS`
  - Thiết kế nhanh, đồng nhất token màu/spacing.
- `shadcn/ui + Radix UI`
  - Panel, dialog, progress, tooltip đẹp và chuẩn accessibility.
- `Framer Motion`
  - Animation UI mềm: panel trượt, fade, stagger.
- `GSAP` (optional, cho sequence intro)
  - Dựng timeline cinematic mở màn và chuyển stage.

## 6) Animation 3D
- `react-spring/three` hoặc `framer-motion-3d` (chọn 1)
  - Tween camera, node pulse, edge glow.
- `maath` (math utilities)
  - Damp/slerp mượt cho chuyển động và camera follow.
- `gltfjsx` + `draco`
  - Tối ưu model GLB, tải nhanh hơn.

## 7) Âm thanh và phản hồi
- `howler.js`
  - Quản lý nhiều lớp âm thanh: ambient, alert, success, fail.
- `Web Audio API` (nâng cao)
  - Spatial audio cơ bản cho sự kiện ở từng vùng bản đồ.

## 8) Tối ưu hiệu năng (bắt buộc để mượt)
- Dùng `InstancedMesh` cho node/particle số lượng lớn.
- Dùng `Line2`/shader cho đường nối sáng mượt, hạn chế mesh dư thừa.
- Giới hạn `devicePixelRatio`: `Math.min(window.devicePixelRatio, 1.5)`.
- Frustum culling và level of detail theo khoảng cách camera.
- Debounce các cập nhật UI không cần real-time.
- Preload asset trước khi vào stage (`drei/Preload`).

## 9) Testing và chất lượng code
- `Vitest + Testing Library`: unit test logic rule/câu hỏi/chấm điểm.
- `Playwright`: test luồng UI chính (vào màn, trả lời câu hỏi, qua stage).
- `ESLint + Prettier + Husky`: giữ code sạch và đồng bộ.

## 10) Stack tối ưu để triển khai nhanh trên code hiện tại
- Giữ: `Next.js`, `Three.js`, `@react-three/fiber`, `zustand`, `MediaPipe`.
- Bổ sung ngay:
  - `@react-three/drei`
  - `@react-three/postprocessing`
  - `Framer Motion`
  - `howler`
- Lý do: ít phá kiến trúc cũ, cải thiện rõ nhất về UI và độ mượt trong thời gian ngắn.
