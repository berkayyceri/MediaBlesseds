export interface Studio {
  id: string;
  name: string;
  email: string;
  phone: string;
  branch: string;
  address?: string;
  gallery?: string[];
}

export interface Artist {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  rating?: number;
  completedTattoos: number;
  specialties: string[];
  portfolio: PortfolioItem[];
  studioId?: string; // Belongs to a Studio
  phone?: string; // For linking by phone number!
}

export interface PortfolioItem {
  id: string;
  url: string;
  title: string;
  category: string;
  artistId: string;
  likes: number;
  comments: number;
  description: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  durationMin: number;
  basePriceSec: number; // For visualization, though payment is not integrated
  description: string;
}

export interface Appointment {
  id: string;
  studioId: string; // Every appointment belongs to a specific studio
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  artistId: string;
  artistName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  services: string[]; // List of service ids
  notes: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  clientImages: string[]; // Base64 or template references
  createdAt: string;
  totalPrice: number;
  totalDuration: number;
  cancelReason?: string;
}

export interface CustomNotification {
  id: string;
  title: string;
  description: string;
  appointmentId: string; // The appointment this notification relates to
  timestamp: string;
  isRead: boolean;
  type: 'new_appointment' | 'status_change' | 'client_note' | 'portfolio_upload' | 'studio_invite' | 'studio_invite_accepted' | 'studio_invite_rejected' | 'reminder';
  artistId?: string;
  studioId?: string;
  studioName?: string;
  status?: 'pending' | 'accepted' | 'declined';
  role?: 'customer' | 'studio' | 'artist';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  studioId?: string;
  isPinned?: boolean;
}
