import { Location, Guide } from "./types";

export const LOCATIONS: Location[] = [
  {
    id: "fansipan",
    name: "Đỉnh Fansipan",
    province: "Sa Pa",
    image: "https://picsum.photos/seed/fansipan/800/600",
    difficulty: "Khó",
    rating: 4.9,
    distance: 12,
    description: "Nóc nhà Đông Dương với độ cao 3.143m, thử thách lòng kiên trì của mọi trekker."
  },
  {
    id: "tanang",
    name: "Tà Năng – Phan Dũng",
    province: "Lâm Đồng - Bình Thuận",
    image: "https://picsum.photos/seed/tanang/800/600",
    difficulty: "Trung bình",
    rating: 4.8,
    distance: 55,
    description: "Cung đường trekking đẹp nhất Việt Nam qua những đồi cỏ xanh mướt."
  },
  {
    id: "catba",
    name: "Vườn Quốc Gia Cát Bà",
    province: "Hải Phòng",
    image: "https://picsum.photos/seed/catba/800/600",
    difficulty: "Dễ",
    rating: 4.5,
    distance: 18,
    description: "Khám phá hệ sinh thái đa dạng và ngắm nhìn vịnh Lan Hạ từ trên cao."
  },
  {
    id: "puluong",
    name: "Pù Luông",
    province: "Thanh Hóa",
    image: "https://picsum.photos/seed/puluong/800/600",
    difficulty: "Dễ",
    rating: 4.7,
    distance: 15,
    description: "Vẻ đẹp hoang sơ của những thửa ruộng bậc thang và bản làng dân tộc Thái."
  },
  {
    id: "baden",
    name: "Núi Bà Đen",
    province: "Tây Ninh",
    image: "https://picsum.photos/seed/baden/800/600",
    difficulty: "Trung bình",
    rating: 4.6,
    distance: 8,
    description: "Đỉnh núi cao nhất miền Nam với hệ thống chùa chiền linh thiêng."
  }
];

export const GUIDES: Record<string, Guide[]> = {
  fansipan: [
    { id: "g1", name: "A Páo", avatar: "https://i.pravatar.cc/150?u=apao", rating: 5.0, experience: 10, dailyRate: 500000 },
    { id: "g2", name: "Hạng A Súa", avatar: "https://i.pravatar.cc/150?u=asua", rating: 4.9, experience: 7, dailyRate: 400000 }
  ],
  tanang: [
    { id: "g3", name: "Anh Tuấn", avatar: "https://i.pravatar.cc/150?u=tuan", rating: 4.8, experience: 5, dailyRate: 450000 },
    { id: "g4", name: "Minh Râu", avatar: "https://i.pravatar.cc/150?u=minh", rating: 4.7, experience: 4, dailyRate: 350000 }
  ],
  catba: [
    { id: "g5", name: "Chú Hải", avatar: "https://i.pravatar.cc/150?u=hai", rating: 4.9, experience: 15, dailyRate: 300000 }
  ],
  puluong: [
    { id: "g6", name: "Chị Lan", avatar: "https://i.pravatar.cc/150?u=lan", rating: 4.8, experience: 6, dailyRate: 350000 }
  ],
  baden: [
    { id: "g7", name: "Quốc Bảo", avatar: "https://i.pravatar.cc/150?u=bao", rating: 4.6, experience: 3, dailyRate: 250000 }
  ]
};
