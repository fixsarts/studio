/**
 * FIXS.ARTS STUDIO — data.js
 * ---------------------------------------------------------
 * Centralized DEFAULT data. This file is the seed/fallback
 * only. Once the site runs, the source of truth is
 * localStorage via StorageManager (see storage.js).
 *
 * IMPORTANT: never hard-code service/portfolio cards in HTML.
 * Every public page reads from StorageManager, which reads
 * from here on first run.
 * ---------------------------------------------------------
 */

const DEFAULT_SETTINGS = {
  brandName: "FIXS.ARTS STUDIO",
  studioName: "Fixs.Arts Studio",
  whatsappNumber: "6281234567890",
  instagramUrl: "https://instagram.com/fixsarts.studio",
  email: "hello@fixsarts.studio",
  location: "Jakarta, Indonesia",
  footerDescription: "Studio desain kreatif untuk brand yang ingin tampil beda — dari identitas visual sampai materi promosi.",
  copyrightText: "© 2026 Fixs.Arts Studio. Seluruh hak cipta dilindungi.",
  currency: "IDR",
  currencySymbol: "Rp",
  // Logo image shown in the header/footer instead of the "FIXS.ARTS" text
  // wordmark. Leave empty to keep the text logo. Set from Admin > Settings.
  logoUrl: "",
  // Icon slots used across the site. Each value can be either a short
  // text/emoji ("🔍") or an image path/URL/data-URL — the site auto-detects
  // which one it is and renders accordingly. Edit these from
  // Admin > Konfigurasi > Icons.
  icons: {
    search: "🔍",
    cart: "🛍️",
    checkout: "✅",
    whatsapp: "💬",
    instagram: "📷",
    email: "✉️"
  },
  homepage: {
    eyebrow: "Creative Design Studio",
    title: "Desain yang membuat brand kamu pantas dilihat dua kali.",
    description: "Kami membantu brand dan bisnis tampil rapi, konsisten, dan berkelas lewat identitas visual serta materi kreatif yang dirancang khusus untuk kebutuhan kamu.",
    primaryButton: "Lihat Layanan",
    secondaryButton: "Lihat Portfolio",
    ctaTitle: "Siap membangun visual brand kamu?",
    ctaDescription: "Ceritakan kebutuhan desain kamu, tim kami bantu carikan paket yang paling pas.",
    ctaButton: "Mulai Diskusi",
    // Hero banner on the right side of the homepage hero section.
    // heroMediaType: "shape" (default gradient card), "image", or "video".
    // heroMediaUrl: path/URL/data-URL to the image or video file (ignored for "shape").
    heroMediaType: "shape",
    heroMediaUrl: ""
  }
};

const DEFAULT_SERVICES = [
  {
    id: "logo-design",
    title: "Logo Design",
    category: "Branding",
    shortDescription: "Logo profesional yang merepresentasikan karakter brand kamu.",
    description: "Kami merancang logo yang tidak hanya estetis, tapi juga mudah diaplikasikan di berbagai media — dari kartu nama sampai billboard. Proses mencakup riset singkat, eksplorasi konsep, dan revisi terarah.",
    price: 150000,
    priceLabel: "Mulai dari",
    image: "assets/images/logo-design.jpg",
    gallery: ["assets/images/logo-design.jpg","assets/images/logo-design-2.jpg"],
    featured: true,
    active: true,
    tags: ["logo","branding","identitas","merek"],
    createdAt: "2026-01-10",
    packages: [
      { id:"basic", name:"Basic", price:150000, description:"Cocok untuk usaha yang baru mulai.", features:["1 konsep logo","2x revisi","File PNG & JPG"] },
      { id:"professional", name:"Professional", price:300000, description:"Paket lengkap untuk kebutuhan brand jangka panjang.", features:["3 konsep logo","Revisi tanpa batas wajar","PNG, JPG, SVG","File source (AI/PSD)"] }
    ]
  },
  {
    id: "brand-identity",
    title: "Brand Identity",
    category: "Branding",
    shortDescription: "Paket identitas visual lengkap untuk brand yang konsisten.",
    description: "Meliputi logo, palet warna, tipografi, dan panduan penggunaan brand (brand guideline) agar tim kamu bisa menjaga konsistensi visual di semua materi.",
    price: 750000,
    priceLabel: "Mulai dari",
    image: "assets/images/brand-identity.jpg",
    gallery: ["assets/images/brand-identity.jpg"],
    featured: true,
    active: true,
    tags: ["branding","identitas","logo","guideline"],
    createdAt: "2026-01-12",
    packages: [
      { id:"standard", name:"Standard", price:750000, description:"Logo + palet warna + tipografi.", features:["Logo utama","Palet warna","Panduan tipografi","2x revisi"] },
      { id:"complete", name:"Complete", price:1500000, description:"Identitas visual menyeluruh.", features:["Logo + varian","Brand guideline (PDF)","Mockup aplikasi","Revisi tanpa batas wajar"] }
    ]
  },
  {
    id: "banner-design",
    title: "Banner Design",
    category: "Print Design",
    shortDescription: "Desain spanduk/banner untuk promosi, event, atau toko.",
    description: "Desain banner yang jelas dan menarik perhatian dari jarak jauh, siap cetak dengan ukuran dan resolusi yang sesuai kebutuhan.",
    price: 100000,
    priceLabel: "Mulai dari",
    image: "assets/images/banner-design.jpg",
    gallery: ["assets/images/banner-design.jpg"],
    featured: false,
    active: true,
    tags: ["banner","spanduk","promosi","cetak"],
    createdAt: "2026-01-14",
    packages: [
      { id:"single", name:"1 Desain", price:100000, description:"Satu desain banner siap cetak.", features:["1 revisi","File JPG/PDF cetak"] },
      { id:"bundle", name:"Bundle 3 Desain", price:250000, description:"Tiga variasi desain sekaligus.", features:["3 desain","2x revisi per desain","File JPG/PDF cetak"] }
    ]
  },
  {
    id: "poster-design",
    title: "Poster Design",
    category: "Print Design",
    shortDescription: "Poster event, promosi, atau kampanye yang eye-catching.",
    description: "Desain poster dengan hierarki visual yang kuat, cocok untuk event, produk baru, atau kampanye sosial.",
    price: 120000,
    priceLabel: "Mulai dari",
    image: "assets/images/poster-design.jpg",
    gallery: ["assets/images/poster-design.jpg"],
    featured: false,
    active: true,
    tags: ["poster","event","promosi"],
    createdAt: "2026-01-15",
    packages: [
      { id:"basic", name:"Basic", price:120000, description:"Satu desain poster.", features:["1 konsep","2x revisi","File JPG/PDF"] }
    ]
  },
  {
    id: "social-media-design",
    title: "Social Media Design",
    category: "Social Media",
    shortDescription: "Konten visual Instagram/TikTok yang konsisten dan rapi.",
    description: "Template dan desain feed media sosial yang membantu brand kamu tampil konsisten dan profesional di setiap postingan.",
    price: 200000,
    priceLabel: "Mulai dari",
    image: "assets/images/social-media-design.jpg",
    gallery: ["assets/images/social-media-design.jpg"],
    featured: true,
    active: true,
    tags: ["sosial media","instagram","konten","feed"],
    createdAt: "2026-01-18",
    packages: [
      { id:"pack5", name:"5 Desain", price:200000, description:"5 desain feed siap posting.", features:["5 desain","Format Instagram post","1x revisi per desain"] },
      { id:"pack15", name:"15 Desain", price:500000, description:"Paket sebulan penuh konten.", features:["15 desain","Format post & story","2x revisi per desain"] }
    ]
  },
  {
    id: "menu-design",
    title: "Menu Design",
    category: "Print Design",
    shortDescription: "Desain menu restoran atau kafe yang menggugah selera.",
    description: "Layout menu yang mudah dibaca, mencerminkan karakter tempat usaha kamu, dan siap cetak.",
    price: 180000,
    priceLabel: "Mulai dari",
    image: "assets/images/menu-design.jpg",
    gallery: ["assets/images/menu-design.jpg"],
    featured: false,
    active: true,
    tags: ["menu","restoran","kafe","cetak"],
    createdAt: "2026-01-20",
    packages: [
      { id:"basic", name:"Basic", price:180000, description:"Menu 1-2 halaman.", features:["Layout 2 halaman","2x revisi","File cetak"] }
    ]
  },
  {
    id: "label-design",
    title: "Label Design",
    category: "Packaging",
    shortDescription: "Label produk yang rapi dan sesuai regulasi kemasan.",
    description: "Desain label untuk produk makanan, minuman, kosmetik, atau retail, memperhatikan keterbacaan informasi produk.",
    price: 130000,
    priceLabel: "Mulai dari",
    image: "assets/images/label-design.jpg",
    gallery: ["assets/images/label-design.jpg"],
    featured: false,
    active: true,
    tags: ["label","kemasan","produk"],
    createdAt: "2026-01-22",
    packages: [
      { id:"basic", name:"Basic", price:130000, description:"Satu desain label.", features:["1 konsep","2x revisi","File cetak"] }
    ]
  },
  {
    id: "packaging-design",
    title: "Packaging Design",
    category: "Packaging",
    shortDescription: "Desain kemasan produk yang menonjol di rak.",
    description: "Desain kemasan yang memperkuat identitas brand dan menarik perhatian calon pembeli di titik penjualan.",
    price: 400000,
    priceLabel: "Mulai dari",
    image: "assets/images/packaging-design.jpg",
    gallery: ["assets/images/packaging-design.jpg"],
    featured: true,
    active: true,
    tags: ["kemasan","packaging","produk"],
    createdAt: "2026-01-25",
    packages: [
      { id:"basic", name:"Basic", price:400000, description:"Desain kemasan 1 sisi utama.", features:["1 konsep","3x revisi","File cetak siap produksi"] },
      { id:"complete", name:"Complete", price:800000, description:"Kemasan lengkap semua sisi + dieline.", features:["Semua sisi kemasan","Dieline & mockup 3D","Revisi tanpa batas wajar"] }
    ]
  },
  {
    id: "invitation-design",
    title: "Invitation Design",
    category: "Print Design",
    shortDescription: "Undangan digital maupun cetak untuk berbagai acara.",
    description: "Desain undangan yang personal dan elegan, tersedia dalam format digital maupun siap cetak.",
    price: 90000,
    priceLabel: "Mulai dari",
    image: "assets/images/invitation-design.jpg",
    gallery: ["assets/images/invitation-design.jpg"],
    featured: false,
    active: true,
    tags: ["undangan","invitation","event","pernikahan"],
    createdAt: "2026-01-28",
    packages: [
      { id:"digital", name:"Digital", price:90000, description:"Undangan format digital (JPG/video sederhana).", features:["1 konsep","2x revisi","File digital"] },
      { id:"print", name:"Cetak", price:180000, description:"Undangan siap cetak fisik.", features:["1 konsep","2x revisi","File cetak resolusi tinggi"] }
    ]
  }
];

const DEFAULT_PORTFOLIO = [
  {
    id: "kopi-senja-branding",
    title: "Identitas Visual Kopi Senja",
    category: "Branding",
    client: "Kopi Senja",
    year: "2025",
    description: "Membangun identitas visual yang hangat dan konsisten untuk kedai kopi lokal, mencakup logo, kemasan, dan materi promosi.",
    image: "assets/portfolio/kopi-senja.jpg",
    gallery: ["assets/portfolio/kopi-senja.jpg","assets/portfolio/kopi-senja-2.jpg"],
    servicesUsed: ["Brand Identity","Packaging Design"],
    featured: true
  },
  {
    id: "arunika-social",
    title: "Konten Sosial Media Arunika Skincare",
    category: "Social Media",
    client: "Arunika Skincare",
    year: "2025",
    description: "Perancangan konten feed Instagram bulanan yang menonjolkan karakter brand yang lembut dan terpercaya.",
    image: "assets/portfolio/arunika.jpg",
    gallery: ["assets/portfolio/arunika.jpg"],
    servicesUsed: ["Social Media Design"],
    featured: true
  },
  {
    id: "nusantara-fest-poster",
    title: "Materi Promosi Nusantara Fest",
    category: "Print Design",
    client: "Nusantara Fest",
    year: "2024",
    description: "Desain poster dan spanduk untuk festival budaya tahunan, dengan visual yang berani dan mudah dikenali dari jauh.",
    image: "assets/portfolio/nusantara-fest.jpg",
    gallery: ["assets/portfolio/nusantara-fest.jpg"],
    servicesUsed: ["Poster Design","Banner Design"],
    featured: true
  },
  {
    id: "warung-ibu-menu",
    title: "Desain Menu Warung Ibu",
    category: "Print Design",
    client: "Warung Ibu",
    year: "2024",
    description: "Menu baru yang lebih mudah dibaca pelanggan sekaligus memperkuat kesan bersih dan hangat dari tempat makan keluarga ini.",
    image: "assets/portfolio/warung-ibu.jpg",
    gallery: ["assets/portfolio/warung-ibu.jpg"],
    servicesUsed: ["Menu Design"],
    featured: false
  },
  {
    id: "berkah-snack-packaging",
    title: "Kemasan Berkah Snack",
    category: "Packaging",
    client: "Berkah Snack",
    year: "2023",
    description: "Redesain kemasan produk camilan rumahan agar lebih menonjol di rak minimarket dan mudah dikenali.",
    image: "assets/portfolio/berkah-snack.jpg",
    gallery: ["assets/portfolio/berkah-snack.jpg"],
    servicesUsed: ["Packaging Design","Label Design"],
    featured: true
  },
  {
    id: "dian-wedding-invitation",
    title: "Undangan Pernikahan Dian & Raka",
    category: "Print Design",
    client: "Dian & Raka",
    year: "2023",
    description: "Undangan pernikahan digital dan cetak dengan gaya elegan yang personal untuk pasangan pengantin.",
    image: "assets/portfolio/dian-raka.jpg",
    gallery: ["assets/portfolio/dian-raka.jpg"],
    servicesUsed: ["Invitation Design"],
    featured: false
  }
];

const DEFAULT_CATEGORIES = ["Branding","Print Design","Social Media","Packaging","Other"];

// Expose as a single namespace to avoid polluting globals
window.FixsData = {
  settings: DEFAULT_SETTINGS,
  services: DEFAULT_SERVICES,
  portfolio: DEFAULT_PORTFOLIO,
  categories: DEFAULT_CATEGORIES
};
