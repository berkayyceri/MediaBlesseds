import { Artist, ServiceItem, Appointment, CustomNotification, Studio, Announcement } from './types';

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv_small',
    name: 'Minimal & Fine Line Tasarım (Küçük Boy)',
    durationMin: 60,
    basePriceSec: 1500,
    description: '5x5 cm boyutuna kadar olan ince çizgili, yazı veya minimal geometrik dövmeler. Kısa sürede tamamlanır.'
  },
  {
    id: 'srv_medium',
    name: 'Özel Tasarım Dövme (Orta Boy)',
    durationMin: 150,
    basePriceSec: 3500,
    description: '10x10 cm boyutuna kadar olan siyah/gri veya renkli özel tasarım çalışmalar. Detaylı gölgelendirme içerir.'
  },
  {
    id: 'srv_sleeve_session',
    name: 'Tam Kol / Büyük Proje Seansı',
    durationMin: 300,
    basePriceSec: 7500,
    description: 'Kol kaplama, sırt veya göğüs gibi büyük ölçekli projeler için 5 saatlik yarım gün veya tam gün seansı.'
  },
  {
    id: 'srv_coverup',
    name: 'Cover-Up (Dövme Kapatma/Düzeltme)',
    durationMin: 180,
    basePriceSec: 4500,
    description: 'Eski veya beğenilmeyen dövmenizin üzerine yepyeni bir tasarım uyarlanması seansı.'
  },
  {
    id: 'srv_flash_custom',
    name: 'Stüdyo Flash Tasarımı',
    durationMin: 120,
    basePriceSec: 2500,
    description: 'Tasarımcılarımızın önceden hazırladığı, kişiye özel rezerve edilecek hazır "Flash" katalog çalışmalarından biri.'
  }
];

export const INITIAL_ARTISTS: Artist[] = [
  {
    id: 'art_efe',
    name: 'Efe Yılmaz',
    title: 'Siyah Mürekkep & Realizm Uzmanı',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces&q=80',
    bio: '12 yıllık stüdyo deneyimi ile Efe, gerçekçi portreler, karanlık sanat temaları ve yoğun gölgeli Blackwork çalışmalarında benzersiz bir üsluba sahiptir.',
    rating: 4.9,
    completedTattoos: 1420,
    specialties: ['Mandala & Dotwork', 'Portre Realizmi', 'Karanlık Sanat', 'Yazı Sanatı'],
    studioId: 'studio_default',
    phone: '0544 111 22 33',
    portfolio: [
      {
        id: 'p_efe_1',
        url: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600&auto=format&fit=crop&q=80',
        title: 'Geometrik Kurt Portresi',
        category: 'Realizm & Blackwork',
        artistId: 'art_efe',
        likes: 342,
        comments: 24,
        description: 'İnce mandala detayları ve geometrik çizgilerle zenginleştirilmiş gerçekçi kurt göğüs çalışması.'
      },
      {
        id: 'p_efe_2',
        url: 'https://images.unsplash.com/photo-1550537687-c91072c4792d?w=600&auto=format&fit=crop&q=80',
        title: 'Kuzgun & Mekanik Saat',
        category: 'Realizm',
        artistId: 'art_efe',
        likes: 218,
        comments: 15,
        description: 'Sonsuzluk ve zaman temalı, tam kol (sleeve) geçiş seansı eseri.'
      },
      {
        id: 'p_efe_3',
        url: 'https://images.unsplash.com/photo-1611501275019-9b5cdae94fa8?w=600&auto=format&fit=crop&q=80',
        title: 'Neo-Gothic Katedral Kapısı',
        category: 'Blackwork',
        artistId: 'art_efe',
        likes: 412,
        comments: 31,
        description: 'Sırt bölgesine uygulanan yüksek kontrastlı, gotik mimari silüet tasarımı.'
      }
    ]
  },
  {
    id: 'art_derin',
    name: 'Derin Sönmez',
    title: 'Suluboya & İnce Çizgi Sanatçısı',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces&q=80',
    bio: 'Güzel Sanatlar Fakültesi çıkışlı Derin, suluboyanın akışkanlığını insan cildine kusursuzca aktarıyor. Minimal, renkli ve narin çizgiler vazgeçilmezidir.',
    rating: 4.8,
    completedTattoos: 890,
    specialties: ['Suluboya Efekti', 'Fine-Line Çiçekler', 'Minimal Sanat', 'Geometrik Hayvanlar'],
    studioId: 'studio_default',
    phone: '0555 222 33 44',
    portfolio: [
      {
        id: 'p_derin_1',
        url: 'https://images.unsplash.com/photo-1560707303-4e980c876ad1?w=600&auto=format&fit=crop&q=80',
        title: 'Samanyolu & Kozmik Balina',
        category: 'Suluboya',
        artistId: 'art_derin',
        likes: 512,
        comments: 42,
        description: 'Mürekkep akış detayları ve canlı mavi-mor tonlar barındıran kozmik balina el bileği çalışması.'
      },
      {
        id: 'p_derin_2',
        url: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=600&auto=format&fit=crop&q=80',
        title: 'Narin Japon Kiraz Çiçekleri (Sakura)',
        category: 'Fine Line',
        artistId: 'art_derin',
        likes: 310,
        comments: 18,
        description: 'Omuzdan köprücük kemiğine uzanan, narin soft pembe çiçek geçişleri.'
      }
    ]
  },
  {
    id: 'art_canberk',
    name: 'Canberk Tekin',
    title: 'Amerikan Geleneksel (Old School) Ustası',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces&q=80',
    bio: 'Kalın dış çizgilere, parlak birincil renklere ve klasik denizci motiflerine tutkuyla bağlı olan Canberk, geleneksel dövme ruhunu yaşatıyor.',
    rating: 4.9,
    completedTattoos: 1650,
    specialties: ['Old School', 'Neo-Traditional', 'Japon İrezumi', 'Kalın Linework'],
    studioId: 'studio_default',
    phone: '0533 333 44 55',
    portfolio: [
      {
        id: 'p_can_1',
        url: 'https://images.unsplash.com/photo-1590246814883-57c511e76523?w=600&auto=format&fit=crop&q=80',
        title: 'Klasik Kaplan & Hançer',
        category: 'Geleneksel',
        artistId: 'art_canberk',
        likes: 289,
        comments: 19,
        description: 'Canlı kırmızılar ve vintage yeşil tonları içeren, bacak üst bölgesine klasik agresif dövme projesi.'
      }
    ]
  }
];

export const SAMPLE_CLIENT_IDEAS = [
  {
    id: 'idea_1',
    name: 'Kozmik pusula',
    url: 'https://images.unsplash.com/photo-1611501275019-9b5cdae94fa8?w=300&auto=format&fit=crop&q=60',
    category: 'Geometrik'
  },
  {
    id: 'idea_2',
    name: 'Minimalist Dağ ve Gece',
    url: 'https://images.unsplash.com/photo-1560707303-4e980c876ad1?w=300&auto=format&fit=crop&q=60',
    category: 'Fine Line'
  },
  {
    id: 'idea_3',
    name: 'Soyut Çizgisel Yüz portresi',
    url: 'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=300&auto=format&fit=crop&q=60',
    category: 'Line Art'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_1',
    studioId: 'studio_default',
    customerName: 'Berkay Çeri',
    customerPhone: '0532 123 45 67',
    customerEmail: 'berkayceri200442@gmail.com',
    artistId: 'art_efe',
    artistName: 'Efe Yılmaz',
    date: '2026-06-10',
    time: '11:00',
    services: ['srv_medium'],
    notes: 'Göğsümün sol üst köşesine bir geometrik tasarım istiyorum, gönderdiğim referans çizgiye sadık kalalım lütfen.',
    status: 'Confirmed',
    clientImages: ['https://images.unsplash.com/photo-1611501275019-9b5cdae94fa8?w=300&auto=format&fit=crop&q=60'],
    createdAt: '2026-06-09T10:30:00Z',
    totalPrice: 3500,
    totalDuration: 150
  },
  {
    id: 'apt_2',
    studioId: 'studio_default',
    customerName: 'Aylin Yılmaz',
    customerPhone: '0544 987 65 43',
    customerEmail: 'aylin.yilmaz@email.com',
    artistId: 'art_derin',
    artistName: 'Derin Sönmez',
    date: '2026-06-10',
    time: '14:30',
    services: ['srv_small'],
    notes: 'Koldan omuza uzanan çok narin kiraz çiçekleri istiyoruz. Örnek görsel paylaşımındaki gibi renk geçişleri yumuşak olmalı.',
    status: 'Pending',
    clientImages: ['https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=300&auto=format&fit=crop&q=60'],
    createdAt: '2026-06-09T11:15:00Z',
    totalPrice: 1500,
    totalDuration: 60
  },
  {
    id: 'apt_3',
    studioId: 'studio_default',
    customerName: 'Can Katipoğlu',
    customerPhone: '0555 444 33 22',
    customerEmail: 'cankatip@gmail.com',
    artistId: 'art_canberk',
    artistName: 'Canberk Tekin',
    date: '2026-06-11',
    time: '10:00',
    services: ['srv_sleeve_session'],
    notes: 'Amerikan geleneksel tam kol seansının 2. aşaması için geliyorum. Detaylı aslan eklenecek.',
    status: 'Confirmed',
    clientImages: [],
    createdAt: '2026-06-08T18:40:00Z',
    totalPrice: 7500,
    totalDuration: 300
  },
  {
    id: 'apt_4',
    studioId: 'studio_default',
    customerName: 'Melis Arslan',
    customerPhone: '0533 111 22 33',
    customerEmail: 'melisars@icloud.com',
    artistId: 'art_efe',
    artistName: 'Efe Yılmaz',
    date: '2026-06-09',
    time: '09:00',
    services: ['srv_coverup'],
    notes: 'Eski ayak bileğimde kalan kötü yapılmış dövmeyi kapatmak istiyorum.',
    status: 'Completed',
    clientImages: [],
    createdAt: '2026-06-07T12:00:00Z',
    totalPrice: 4500,
    totalDuration: 180
  }
];

export const INITIAL_NOTIFICATIONS: CustomNotification[] = [
  {
    id: 'ntf_1',
    title: 'Yeni Randevu Talebi 🔔',
    description: 'Berkay Çeri, Efe Yılmaz ile Orta Boy Özel Tasarım randevusu oluşturdu.',
    appointmentId: 'apt_1',
    timestamp: '2026-06-09T10:30:00Z',
    isRead: false,
    type: 'new_appointment'
  },
  {
    id: 'ntf_2',
    title: 'Yeni Referans Fotoğrafı Eklendi 🖼️',
    description: 'Aylin Yılmaz randevu formuna bir adet referans örnek görsel ekledi.',
    appointmentId: 'apt_2',
    timestamp: '2026-06-09T11:17:00Z',
    isRead: false,
    type: 'client_note'
  },
  {
    id: 'ntf_3',
    title: 'Randevu Onaylandı ✅',
    description: 'Can Katipoğlu randevusu Canberk Tekin tarafından onaylandı.',
    appointmentId: 'apt_3',
    timestamp: '2026-06-09T08:00:00Z',
    isRead: true,
    type: 'status_change'
  }
];

export const INITIAL_STUDIOS: Studio[] = [
  {
    id: 'studio_default',
    name: 'Studio Noir',
    email: 'admin@studio.co',
    phone: '0532 999 88 77',
    branch: 'İzmir - Alsancak Merkez',
    address: 'Kültür, Kıbrıs Şehitleri Cd. No:44, Kat:2 D:5, 35220 Alsancak, Konak/İzmir',
    gallery: [
      'https://images.unsplash.com/photo-1621600411688-4be93cc685e5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1605497746444-17f18b52fb82?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=800&auto=format&fit=crop&q=80'
    ]
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_1',
    title: 'Yeni Sezon Portfolyo Çalışmaları Başladı! 🎨',
    content: 'Sanatçılarımız bu ay yeni tarzlar deniyor! Eğer sıra dışı bir tasarım hayal ediyorsanız, hemen randevu talebi formundan fikirlerinizi paylaşın.',
    createdAt: '2026-06-09T09:00:00Z',
    isPinned: true
  },
  {
    id: 'ann_2',
    title: 'Alsancak Şubesi Çalışma Saatleri Değişikliği ⏰',
    content: 'Yaz dönemi boyunca Alsancak stüdyomuz akşam saat 22:00\'ye kadar açık olacaktır. Randevularınızı buna göre planlayabilirsiniz.',
    createdAt: '2026-06-08T15:30:00Z',
    isPinned: false
  }
];
