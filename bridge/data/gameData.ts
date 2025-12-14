export const STAGES = {
    FOUNDATION: 'FOUNDATION',
    PILLARS: 'PILLARS',
    WALLS: 'WALLS',
    ROOF: 'ROOF',
    COMPLETED: 'COMPLETED',
};

export const BLOCKS = {
    [STAGES.FOUNDATION]: [
        { id: 'f1', text: 'Gia đình là tế bào của xã hội', type: 'FOUNDATION' },
        { id: 'f2', text: 'Gia đình là tổ ấm', type: 'FOUNDATION' },
        { id: 'f3', text: 'Gia đình là cầu nối cá nhân – xã hội', type: 'FOUNDATION' },
    ],
    [STAGES.PILLARS]: [
        { id: 'p1', text: 'Tái sản xuất con người', type: 'PILLARS' },
        { id: 'p2', text: 'Nuôi dưỡng – giáo dục', type: 'PILLARS' },
        { id: 'p3', text: 'Kinh tế – tiêu dùng', type: 'PILLARS' },
        { id: 'p4', text: 'Tâm sinh lý – tình cảm', type: 'PILLARS' },
    ],
    [STAGES.WALLS]: [
        { id: 'w1', text: 'Tự nguyện – tình yêu', type: 'WALLS' },
        { id: 'w2', text: 'Một vợ một chồng', type: 'WALLS' },
        { id: 'w3', text: 'Bình đẳng vợ chồng', type: 'WALLS' },
        { id: 'w4', text: 'Pháp luật bảo vệ', type: 'WALLS' },
    ],
    [STAGES.ROOF]: [
        { id: 'r1', text: 'Tăng cường lãnh đạo & nhận thức', type: 'ROOF' },
        { id: 'r2', text: 'Phát triển kinh tế – nâng cao đời sống', type: 'ROOF' },
        { id: 'r3', text: 'Kết hợp truyền thống – hiện đại', type: 'ROOF' },
        { id: 'r4', text: 'Gia đình văn hóa:\nấm no – bình đẳng – tiến bộ – hạnh phúc', type: 'ROOF' },
    ],
};

export const QUESTIONS = [
    {
        id: 'q1',
        question: 'Chức năng nào được coi là đặc thù nhất của gia đình?',
        options: [
            'Tái sản xuất con người',
            'Phát triển kinh tế',
            'Tham gia hoạt động chính trị',
            'Bảo vệ môi trường'
        ],
        correctAnswer: 0,
        hint: 'Đây là chức năng duy trì nòi giống.'
    },
    {
        id: 'q2',
        question: 'Hôn nhân tiến bộ dựa trên cơ sở nào?',
        options: [
            'Môn đăng hộ đối',
            'Tự nguyện và tình yêu chân chính',
            'Sự sắp đặt của cha mẹ',
            'Lợi ích kinh tế'
        ],
        correctAnswer: 1,
        hint: 'Tình yêu là nền tảng của hạnh phúc.'
    },
    {
        id: 'q3',
        question: 'Gia đình văn hóa là gia đình như thế nào?',
        options: [
            'Chỉ cần giàu có',
            'Ấm no, bình đẳng, tiến bộ, hạnh phúc',
            'Đông con nhiều cháu',
            'Có quyền lực trong xã hội'
        ],
        correctAnswer: 1,
        hint: 'Phản ánh sự toàn diện về vật chất và tinh thần.'
    },
    {
        id: 'q4',
        question: 'Cơ sở chính trị - xã hội của gia đình trong thời kỳ quá độ là gì?',
        options: [
            'Kinh tế tư nhân',
            'Nhà nước XHCN & Luật pháp',
            'Truyền thống dòng họ',
            'Tôn giáo'
        ],
        correctAnswer: 1,
        hint: 'Được bảo vệ bởi thiết chế cao nhất.'
    },
    {
        id: 'q5',
        question: 'Chế độ hôn nhân trong gia đình quá độ lên CNXH là:',
        options: [
            'Đa thê',
            'Một vợ một chồng',
            'Đa phu',
            'Tự do tuyệt đối'
        ],
        correctAnswer: 1,
        hint: 'Đảm bảo sự bình đẳng và chung thủy.'
    },
    {
        id: 'q6',
        question: 'Gia đình có trách nhiệm gì trong việc giáo dục con cái?',
        options: [
            'Khoán trắng cho nhà trường',
            'Nuôi dưỡng và giáo dục nhân cách',
            'Chỉ lo ăn mặc',
            'Không cần quan tâm'
        ],
        correctAnswer: 1,
        hint: 'Gia đình là trường học đầu tiên.'
    },
    {
        id: 'q7',
        question: 'Chức năng kinh tế của gia đình thể hiện ở chỗ:',
        options: [
            'Tổ chức sản xuất và tiêu dùng hợp lý',
            'Chỉ tiêu tiền, không làm ra tiền',
            'Phụ thuộc vào trợ cấp',
            'Cạnh tranh gay gắt'
        ],
        correctAnswer: 0,
        hint: 'Đảm bảo đời sống vật chất.'
    },
    {
        id: 'q8',
        question: 'Sự bình đẳng vợ chồng được hiểu là:',
        options: [
            'Ai kiếm nhiều tiền hơn được quyền quyết định',
            'Bình đẳng về nghĩa vụ, quyền lợi và cơ hội',
            'Vợ phải nghe lời chồng',
            'Chồng phải nghe lời vợ'
        ],
        correctAnswer: 1,
        hint: 'Tôn trọng lẫn nhau.'
    },
    {
        id: 'q9',
        question: 'Yếu tố nào giúp hòa giải "Mâu thuẫn thế hệ"?',
        options: [
            'Áp đặt ý kiến',
            'Lắng nghe, thấu hiểu và giáo dục',
            'Sống tách biệt',
            'Bỏ qua không giải quyết'
        ],
        correctAnswer: 1,
        hint: 'Giao tiếp là chìa khóa.'
    },
    {
        id: 'q10',
        question: 'Để xây dựng gia đình trong thời kỳ quá độ, cần kết hợp yếu tố nào?',
        options: [
            'Chỉ cần truyền thống',
            'Chỉ cần hiện đại',
            'Truyền thống và hiện đại',
            'Học theo phương Tây'
        ],
        correctAnswer: 2,
        hint: 'Kế thừa và phát triển.'
    },
    {
        id: 'q11',
        question: 'Gia đình là cầu nối giữa:',
        options: [
            'Cá nhân và Xã hội',
            'Nhà trường và Xã hội',
            'Vợ và Chồng',
            'Ông bà và Cháu'
        ],
        correctAnswer: 0,
        hint: 'Mối quan hệ biện chứng.'
    },
    {
        id: 'q12',
        question: 'Điều gì bảo vệ chế độ hôn nhân và gia đình?',
        options: [
            'Dư luận xã hội',
            'Pháp luật',
            'Tiền bạc',
            'Lời hứa'
        ],
        correctAnswer: 1,
        hint: 'Công cụ cưỡng chế và giáo dục của Nhà nước.'
    }
    // ... Questions ...
];

export const SLOTS = {
    [STAGES.FOUNDATION]: [
        { id: 'f_slot_1', pos: [-2, 0.75, 0] },
        { id: 'f_slot_2', pos: [0, 0.75, 0] },
        { id: 'f_slot_3', pos: [2, 0.75, 0] },
    ],
    [STAGES.PILLARS]: [
        { id: 'p_slot_1', pos: [-1.5, 2.5, 1.5] },
        { id: 'p_slot_2', pos: [1.5, 2.5, 1.5] },
        { id: 'p_slot_3', pos: [-1.5, 2.5, -1.5] },
        { id: 'p_slot_4', pos: [1.5, 2.5, -1.5] },
    ],
    [STAGES.WALLS]: [
        { id: 'w_slot_1', pos: [0, 2.4, 1.5], rot: [0, 0, 0] },
        { id: 'w_slot_2', pos: [0, 2.4, -1.5], rot: [0, 0, 0] },
        { id: 'w_slot_3', pos: [-1.5, 2.4, 0], rot: [0, Math.PI / 2, 0] },
        { id: 'w_slot_4', pos: [1.5, 2.4, 0], rot: [0, Math.PI / 2, 0] },
    ],
    [STAGES.ROOF]: [
        { id: 'r_slot_1', pos: [-1, 5.5, 1] },
        { id: 'r_slot_2', pos: [1, 5.5, 1] },
        { id: 'r_slot_3', pos: [-1, 5.5, -1] },
        { id: 'r_slot_4', pos: [1, 5.5, -1] },
    ],
};
