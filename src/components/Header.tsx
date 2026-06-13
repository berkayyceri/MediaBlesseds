import React, { useState, useEffect } from 'react';
import { Bell, Shield, User, Scissors, Calendar, Clock, Sparkles, Smile, Star, ArrowRight, LogOut } from 'lucide-react';
import { CustomNotification, Appointment } from '../types';

interface HeaderProps {
  currentRole: 'customer' | 'studio' | 'artist' | 'super_admin';
  onRoleChange: (role: 'customer' | 'studio' | 'artist' | 'super_admin') => void;
  notifications: CustomNotification[];
  appointments: Appointment[];
  onNotificationSelect: (appId: string) => void;
  onClearNotifications: (idsToClear?: string[]) => void;
  customerUser: { name: string; email: string; phone: string } | null;
  studioUser: { name: string; email: string } | null;
  artistUser: { name: string; email: string; artistId: string } | null;
  onLogout: (role: 'customer' | 'studio' | 'artist' | 'super_admin') => void;
}

export default function Header({
  currentRole,
  onRoleChange,
  notifications,
  appointments,
  onNotificationSelect,
  onClearNotifications,
  customerUser,
  studioUser,
  artistUser,
  onLogout,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Setup current time clock (Turkish locale formatted)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
      };
      // Format with Turkish locale
      setCurrentTime(now.toLocaleDateString('tr-TR', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const getFilteredNotifications = () => {
    if (!notifications) return [];

    return notifications.filter((notif) => {
      // 1. Explicit Role assignment checks
      if (notif.role) {
        return notif.role === currentRole;
      }

      // 2. Reminder specific rules
      if (notif.type === 'reminder') {
        if (currentRole === 'customer') {
          return notif.id.includes('cust') || notif.title.includes('Müşteri');
        }
        if (currentRole === 'artist') {
          return notif.id.includes('art') || notif.title.includes('Sanatçı');
        }
        return false; // Studio doesn't track live clock client reminders directly
      }

      // 3. Studio Invite / Kadro updates
      if (notif.type === 'studio_invite' || notif.type === 'studio_invite_accepted' || notif.type === 'studio_invite_rejected') {
        if (currentRole === 'artist') {
          return true; // Artist receives invitations or sees status
        }
        if (currentRole === 'studio') {
          return notif.type !== 'studio_invite'; // Studio gets accepts/rejects
        }
        return false;
      }

      // 4. Appointment mapping
      if (notif.appointmentId) {
        const apt = appointments.find((a) => a.id === notif.appointmentId);
        if (apt) {
          if (currentRole === 'artist') {
            // Artist sees notifications about their own appointments
            if (artistUser && artistUser.artistId) {
              return apt.artistId === artistUser.artistId;
            }
            return true;
          }
          if (currentRole === 'customer') {
            // Customer sees their own appointments
            if (customerUser) {
              const nameMatch = apt.customerName.toLowerCase().includes(customerUser.name.toLowerCase());
              const emailMatch = !customerUser.email ? false : (apt.customerEmail.toLowerCase() === customerUser.email.toLowerCase());
              return nameMatch || emailMatch;
            }
            return true;
          }
          if (currentRole === 'studio') {
            // Studio sees all appointment updates
            return true;
          }
        }
      }

      // 5. Generics / Fallback string searches
      const descLower = notif.description.toLowerCase();
      const titleLower = notif.title.toLowerCase();

      if (currentRole === 'customer') {
        return (
          titleLower.includes('onaylandı') ||
          titleLower.includes('müşteri') ||
          titleLower.includes('randevunuz') ||
          descLower.includes('müşteri') ||
          notif.type === 'status_change'
        );
      }

      if (currentRole === 'artist') {
        return (
          titleLower.includes('sanatçı') ||
          titleLower.includes('portfolyo') ||
          descLower.includes('sanatçı') ||
          descLower.includes('tasarımcı')
        );
      }

      if (currentRole === 'studio') {
        return (
          notif.type === 'new_appointment' ||
          notif.type === 'client_note' ||
          titleLower.includes('yeni') ||
          titleLower.includes('hizmet menüsü') ||
          titleLower.includes('silindi') ||
          descLower.includes('yönetici')
        );
      }

      return true;
    });
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = filteredNotifications.filter((n) => !n.isRead).length;

  return (
    <header className="border-b border-white/10 bg-[#050505]/95 text-white sticky top-0 z-40 backdrop-blur-md" id="tattoo-reserve-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Brand Logo & Sub */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shrink-0">
              <img 
                src="https://r.resimlink.com/79xHR3v.jpg" 
                alt="Tattoo Reserve Logo" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black font-rushel tracking-[0.2em] uppercase text-[#C7D5F0]">Tattoo Reserve</span>
              </div>
              <p className="text-[10px] text-white/40 tracking-[0.25em] font-medium uppercase font-rushel">PREMIUM DÖVME ATÖLYESİ</p>
            </div>
          </div>

          {/* Quick Stats & Live Clock */}
          <div className="hidden lg:flex items-center gap-6 text-xs text-white/40 border-l border-white/10 pl-6">
            <div className="space-y-0.5">
              <span className="text-white/40 uppercase font-mono tracking-wider">Aktif Sanatçılar:</span>
              <div className="font-bold text-[#C7D5F0]">● 3 Uzman Sanatçı</div>
            </div>
            <div className="space-y-0.5">
              <span className="text-white/40 uppercase font-mono tracking-wider">Canlı Zaman:</span>
              <div className="font-semibold text-white/80 font-mono">{currentTime}</div>
            </div>
          </div>

          {/* Role-Specific Status & Notification Hub */}
          <div className="flex items-center justify-between md:justify-end gap-3.5 flex-1 md:flex-none">

            {/* Logged in indicator & Logout */}
            {currentRole === 'customer' && customerUser && (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 px-3 rounded-lg max-w-[150px] sm:max-w-xs shrink-0" id="header-user-badge-customer">
                <div className="w-5 h-5 bg-[#C7D5F0] text-black text-[9px] font-black rounded-full flex items-center justify-center font-mono">
                  {customerUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block overflow-hidden">
                  <p className="text-[10px] font-serif font-bold text-white leading-none truncate">{customerUser.name}</p>
                </div>
                <button
                  onClick={() => onLogout('customer')}
                  title="Güvenli Çıkış Yap"
                  className="p-1 text-white/40 hover:text-rose-400 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {currentRole === 'studio' && studioUser && (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 px-3 rounded-lg shrink-0" id="header-user-badge-studio">
                <div className="w-5 h-5 bg-[#C7D5F0] text-black text-[9px] font-black rounded-full flex items-center justify-center font-mono">
                  S
                </div>
                <div className="hidden sm:block overflow-hidden">
                  <p className="text-[10px] font-serif font-bold text-white leading-none truncate">{studioUser.name}</p>
                </div>
                <button
                  onClick={() => onLogout('studio')}
                  title="Güvenli Çıkış Yap"
                  className="p-1 text-white/40 hover:text-rose-400 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {currentRole === 'artist' && artistUser && (
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 px-3 rounded-lg shrink-0" id="header-user-badge-artist">
                <div className="w-5 h-5 bg-[#C7D5F0] text-black text-[9px] font-black rounded-full flex items-center justify-center font-mono">
                  {artistUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block overflow-hidden">
                  <p className="text-[10px] font-serif font-bold text-white leading-none truncate">{artistUser.name}</p>
                </div>
                <button
                  onClick={() => onLogout('artist')}
                  title="Güvenli Çıkış Yap"
                  className="p-1 text-white/40 hover:text-rose-400 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {currentRole === 'super_admin' && (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 p-1.5 px-3 rounded-lg shrink-0" id="header-user-badge-super-admin">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <div className="hidden sm:block overflow-hidden">
                  <p className="text-[10px] font-mono font-bold text-amber-300 leading-none truncate uppercase tracking-wider">Süper Yönetici</p>
                </div>
                <button
                  onClick={() => onLogout('super_admin')}
                  title="Oturumu Sonlandır"
                  className="p-1 text-amber-400 hover:text-rose-400 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Notification bell dropdown parent */}
            <div className="relative">
              <button
                id="btn-header-bell"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white transition-all duration-150 active:scale-95"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#C7D5F0] text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#050505] animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Box */}
              {showNotifications && (
                <div 
                  id="notifications-box"
                  className="absolute right-0 mt-3 w-80 md:w-96 bg-[#121212] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 text-white"
                >
                  <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                    <span className="font-bold text-sm font-serif">Bildirim Paneli ({filteredNotifications.length})</span>
                    {filteredNotifications.length > 0 && (
                      <button 
                        id="btn-clear-notif"
                        onClick={() => {
                          onClearNotifications(filteredNotifications.map(n => n.id));
                          setShowNotifications(false);
                        }}
                        className="text-[10px] uppercase tracking-wider font-bold text-[#C7D5F0] hover:text-white transition"
                      >
                        Temizle
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                    {filteredNotifications.length === 0 ? (
                      <div className="p-8 text-center text-white/40 text-xs">
                        Yeni bildirim bulunmuyor.
                      </div>
                    ) : (
                      filteredNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            onNotificationSelect(notif.appointmentId);
                            setShowNotifications(false);
                          }}
                          className={`p-3.5 hover:bg-white/5 cursor-pointer transition flex flex-col gap-1 ${
                            !notif.isRead ? 'bg-[#C7D5F0]/5 border-l-2 border-[#C7D5F0] pl-3' : 'pl-3.5'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-xs text-white">{notif.title}</span>
                            <span className="text-[9px] text-[#C7D5F0] font-mono">
                              {new Date(notif.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-white/60 line-clamp-2">{notif.description}</p>
                          <div className="flex items-center gap-1 text-[10px] text-[#C7D5F0] font-semibold mt-1">
                            <span>Detayları Gör</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 bg-white/5 border-t border-white/10 text-center">
                    <p className="text-[10px] text-white/40 font-mono">Bildirimlere tıklayarak randevu detaylarını görebilirsiniz.</p>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
