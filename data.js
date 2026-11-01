// Initial Seed Data for Samovar.digital
export const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "Toshkent Choyxona Palovi",
    category: "Asosiy Taomlar",
    price: 52000,
    stock: 24,
    status: "mavjud", // 'mavjud' | 'tugadi'
    image: "assets/images/palov.jpg",
    description: "Lagan palov, sarxil dumba yog'i, sariq sabzi, bedana tuxumi, no'xat va sarimsoqpiyoz bilan shohona taom.",
    badge: "Tavsiya etiladi",
    isChefSpecial: true
  },
  {
    id: "prod-2",
    name: "Qozon Kabob (Maxsus)",
    category: "Asosiy Taomlar",
    price: 78000,
    stock: 14,
    status: "mavjud",
    image: "assets/images/qozon-kabob.jpg",
    description: "Qozonda tillarang qilib qovurilgan barra qo'zichoq qovurg'alari va qarsildoq kartoshka.",
    badge: "Eng ko'p sotilgan",
    isChefSpecial: true
  },
  {
    id: "prod-3",
    name: "Samarqandcha Manti (5 dona)",
    category: "Asosiy Taomlar",
    price: 48000,
    stock: 0,
    status: "tugadi", // Initial out of stock to demonstrate red TUGADI badge & disabled state
    image: "assets/images/manti.jpg",
    description: "Yupqa xamir, qo'lda mayda to'g'ralgan barra go'sht, sarxil piyoz va suzma qaymoq bilan.",
    badge: "Kutilmoqda",
    isChefSpecial: false
  },
  {
    id: "prod-4",
    name: "Gijduvoncha Qiyma Shashlik",
    category: "Shashlik",
    price: 26000,
    stock: 35,
    status: "mavjud",
    image: "assets/images/shashlik.jpg",
    description: "Mayin sharbatli qiyma go'sht, sarxil piyoz va sumax sepilgan issiq yupqa lavash bilan.",
    badge: "Xit",
    isChefSpecial: false
  },
  {
    id: "prod-5",
    name: "Qo'y Go'shti Kuskovoy Shashlik",
    category: "Shashlik",
    price: 32000,
    stock: 28,
    status: "mavjud",
    image: "assets/images/shashlik.jpg",
    description: "Olovda pishgan sharbatli barra qo'y go'shti dumbasi bilan, maxsus ziravorlar.",
    badge: null,
    isChefSpecial: false
  },
  {
    id: "prod-6",
    name: "Tovuq Qanotchalari Shashlik",
    category: "Shashlik",
    price: 24000,
    stock: 0,
    status: "tugadi",
    image: "https://images.unsplash.com/photo-1527477378392-1c0ec6c60d37?w=600&auto=format&fit=crop&q=80",
    description: "Maxsus marinadlangan tillarang qarsildoq tovuq qanotchalari tandir cho'g'ida.",
    badge: "Tugagan",
    isChefSpecial: false
  },
  {
    id: "prod-7",
    name: "Achchiq-Chuchuk (Anorli)",
    category: "Salat",
    price: 22000,
    stock: 40,
    status: "mavjud",
    image: "assets/images/achchiq-chuchuk.jpg",
    description: "Yozgi shirin qizil pomidor, yupqa archilgan oq piyoz, xushbo'y rayhon va nordon anor donalari.",
    badge: "Klassika",
    isChefSpecial: false
  },
  {
    id: "prod-8",
    name: "Suzmali Bahor Salati",
    category: "Salat",
    price: 20000,
    stock: 18,
    status: "mavjud",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
    description: "Barra qarsildoq bodring, turp, xushbo'y ko'katlar va yangi tayyorlangan suzma sousi.",
    badge: null,
    isChefSpecial: false
  },
  {
    id: "prod-9",
    name: "Chiroqchi Salati (Til go'shti)",
    category: "Salat",
    price: 34000,
    stock: 0,
    status: "tugadi",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
    description: "Qaynatilgan barra til go'shti, marinadlangan qo'ziqorin, pishloq va maxsus sous.",
    badge: "Mavsumiy",
    isChefSpecial: false
  },
  {
    id: "prod-10",
    name: "Samovar Ko'k Choy (Limon & Navat)",
    category: "Ichimliklar",
    price: 18000,
    stock: 50,
    status: "mavjud",
    image: "assets/images/samovar-tea.jpg",
    description: "Haqiqiy mis samovarda qaynatilgan 95-ko'k choy, barra yalpiz, limon va tabiiy navat shakari.",
    badge: "Samovar Special",
    isChefSpecial: true
  },
  {
    id: "prod-11",
    name: "Samovar Qora Choy (Tog' giyohlari)",
    category: "Ichimliklar",
    price: 18000,
    stock: 45,
    status: "mavjud",
    image: "assets/images/samovar-tea.jpg",
    description: "Tog' kiyiko'ti va yovvoyi na'matak bilan damlangan boy xushbo'y qora choy.",
    badge: "Samovar Special",
    isChefSpecial: true
  },
  {
    id: "prod-12",
    name: "Uy Qaynatma Kompoti (1 Litr)",
    category: "Ichimliklar",
    price: 24000,
    stock: 22,
    status: "mavjud",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
    description: "Quritilgan tog' olchasi, o'rik va olma aralashmasidan tayyorlangan yaxna kompot.",
    badge: null,
    isChefSpecial: false
  },
  {
    id: "prod-13",
    name: "Anor Sharbati (Yangi siqilgan)",
    category: "Ichimliklar",
    price: 36000,
    stock: 0,
    status: "tugadi",
    image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&auto=format&fit=crop&q=80",
    description: "100% tabiiy Dashnobod anoridan yangi siqilgan nordon-shirin barra sharbat (300ml).",
    badge: "Vitamin",
    isChefSpecial: false
  },
  {
    id: "prod-14",
    name: "Issiq Tandir Patir Non",
    category: "Shirinliklar",
    price: 12000,
    stock: 30,
    status: "mavjud",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80",
    description: "Saryog'li qatlama tandir non, chetlari qarsildoq, sedana va kunjut sepilgan.",
    badge: "Issiq",
    isChefSpecial: false
  },
  {
    id: "prod-15",
    name: "Xon Paxlavasi (Yong'oqli)",
    category: "Shirinliklar",
    price: 32000,
    stock: 15,
    status: "mavjud",
    image: "https://images.unsplash.com/photo-1519869325930-281384150729?w=600&auto=format&fit=crop&q=80",
    description: "Yupqa qatlamli xamir, tog' yong'og'i, tabiiy asal qiyomi bilan bezatilgan shirinlik.",
    badge: "Shirinlik",
    isChefSpecial: false
  }
];

export const INITIAL_ORDERS = [
  {
    id: "SMV-8492",
    table: "Stol 3",
    guestCount: 4,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: "yangi", // 'yangi' | 'tayyorlanmoqda' | 'yetkazildi' | 'tolandi'
    items: [
      { id: "prod-1", name: "Toshkent Choyxona Palovi", price: 52000, quantity: 2 },
      { id: "prod-7", name: "Achchiq-Chuchuk (Anorli)", price: 22000, quantity: 1 },
      { id: "prod-10", name: "Samovar Ko'k Choy (Limon & Navat)", price: 18000, quantity: 1 }
    ],
    notes: "Palov sarimsoqpiyozi ko'proq bo'lsin, choy qaynoq bo'lsin",
    serviceFeePercent: 10,
    subtotal: 144000,
    serviceFee: 14400,
    total: 158400,
    waiter: "Oktamboyev Ozodbek (Kassa #1)",
    paymentMethod: "Karta / Payme"
  },
  {
    id: "SMV-8491",
    table: "Stol 7",
    guestCount: 6,
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    status: "tayyorlanmoqda",
    items: [
      { id: "prod-2", name: "Qozon Kabob (Maxsus)", price: 78000, quantity: 2 },
      { id: "prod-4", name: "Gijduvoncha Qiyma Shashlik", price: 26000, quantity: 4 },
      { id: "prod-8", name: "Suzmali Bahor Salati", price: 20000, quantity: 2 },
      { id: "prod-14", name: "Issiq Tandir Patir Non", price: 12000, quantity: 2 },
      { id: "prod-11", name: "Samovar Qora Choy", price: 18000, quantity: 2 }
    ],
    notes: "Shashlik piyoziga sumax ko'proq sepilsin",
    serviceFeePercent: 10,
    subtotal: 360000,
    serviceFee: 36000,
    total: 396000,
    waiter: "Farrux (Kassa #2)",
    paymentMethod: "Naqd"
  },
  {
    id: "SMV-8489",
    table: "Stol 1",
    guestCount: 2,
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    status: "yetkazildi",
    items: [
      { id: "prod-1", name: "Toshkent Choyxona Palovi", price: 52000, quantity: 4 },
      { id: "prod-5", name: "Qo'y Go'shti Kuskovoy Shashlik", price: 32000, quantity: 4 },
      { id: "prod-7", name: "Achchiq-Chuchuk (Anorli)", price: 22000, quantity: 3 },
      { id: "prod-10", name: "Samovar Ko'k Choy", price: 18000, quantity: 3 },
      { id: "prod-15", name: "Xon Paxlavasi", price: 32000, quantity: 2 }
    ],
    notes: "Mehmonlar uchun chiroyli laganda tortilsin",
    serviceFeePercent: 10,
    subtotal: 520000,
    serviceFee: 52000,
    total: 572000,
    waiter: "Oktamboyev Ozodbek (Kassa #1)",
    paymentMethod: "Uzum Bank"
  },
  {
    id: "SMV-8486",
    table: "Stol 5",
    guestCount: 3,
    timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    status: "tolandi",
    items: [
      { id: "prod-1", name: "Toshkent Choyxona Palovi", price: 52000, quantity: 1 },
      { id: "prod-4", name: "Gijduvoncha Qiyma Shashlik", price: 26000, quantity: 2 },
      { id: "prod-10", name: "Samovar Ko'k Choy", price: 18000, quantity: 1 }
    ],
    notes: "To'lov amalga oshirildi",
    serviceFeePercent: 10,
    subtotal: 122000,
    serviceFee: 12200,
    total: 134200,
    waiter: "Farrux (Kassa #2)",
    paymentMethod: "Karta / Humo"
  }
];

export const CATEGORIES = [
  { id: "all", name: "Barchasi", icon: "🍽️" },
  { id: "Asosiy Taomlar", name: "Asosiy Taomlar", icon: "🥘" },
  { id: "Shashlik", name: "Shashlik & Kabob", icon: "🍢" },
  { id: "Salat", name: "Salat & Gazaklar", icon: "🥗" },
  { id: "Ichimliklar", name: "Samovar & Ichimliklar", icon: "🫖" },
  { id: "Shirinliklar", name: "Non & Shirinliklar", icon: "🥐" }
];

// Exactly 9 tables (Table 1 to Table 9)
export const AVAILABLE_TABLES = [
  "Stol 1", "Stol 2", "Stol 3", "Stol 4", "Stol 5",
  "Stol 6", "Stol 7", "Stol 8", "Stol 9"
];
