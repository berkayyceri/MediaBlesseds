/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import CustomerPanel from './components/CustomerPanel';
import StudioPanel from './components/StudioPanel';
import ArtistPanel from './components/ArtistPanel';
import SuperAdminPanel from './components/SuperAdminPanel';
import NotificationModal from './components/NotificationModal';
import AuthGateway from './components/AuthGateway';
import { Appointment, Artist, ServiceItem, CustomNotification, Studio, Announcement } from './types';
import { INITIAL_ARTISTS, INITIAL_SERVICES, INITIAL_APPOINTMENTS, INITIAL_NOTIFICATIONS, INITIAL_STUDIOS, INITIAL_ANNOUNCEMENTS } from './data';
import { Scissors, AlertCircle, Sparkles, CheckCircle2, Clock, Bell, Eye } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';

export default function App() {
  // --- Persistent State Loaders ---
  const [studios, setStudios] = useState<Studio[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<CustomNotification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const [currentRole, setCurrentRole] = useState<'customer' | 'studio' | 'artist' | 'super_admin'>(() => {
    const saved = localStorage.getItem('tattoo_current_role');
    if (saved === 'customer' || saved === 'studio' || saved === 'artist' || saved === 'super_admin') {
      return saved as 'customer' | 'studio' | 'artist' | 'super_admin';
    }
    if (localStorage.getItem('tattoo_studio_user')) return 'studio';
    if (localStorage.getItem('tattoo_artist_user')) return 'artist';
    if (localStorage.getItem('tattoo_super_admin_user')) return 'super_admin';
    return 'customer';
  });

  useEffect(() => {
    localStorage.setItem('tattoo_current_role', currentRole);
  }, [currentRole]);

  // App entrance splash animation states
  const [isSplashActive, setIsSplashActive] = useState(true);
  const [isSplashFading, setIsSplashFading] = useState(false);

  // Account system states (keep in localStorage for device local session)
  const [customerUser, setCustomerUser] = useState<{ name: string; email: string; phone: string } | null>(() => {
    try {
      const saved = localStorage.getItem('tattoo_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing tattoo_customer_user from localStorage", e);
      return null;
    }
  });

  const [studioUser, setStudioUser] = useState<{ name: string; email: string; studioId?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('tattoo_studio_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing tattoo_studio_user from localStorage", e);
      return null;
    }
  });

  const [artistUser, setArtistUser] = useState<{ name: string; email: string; artistId: string } | null>(() => {
    try {
      const saved = localStorage.getItem('tattoo_artist_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing tattoo_artist_user from localStorage", e);
      return null;
    }
  });

  const [superAdminUser, setSuperAdminUser] = useState<{ name: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem('tattoo_super_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing tattoo_super_admin_user from localStorage", e);
      return null;
    }
  });

  // Popup detailed modal controller
  const [openAppointmentId, setOpenAppointmentId] = useState<string | null>(null);

  // --- Real-Time Sync with Cloud Firestore ---
  useEffect(() => {
    const unsubStudios = onSnapshot(collection(db, 'studios'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_STUDIOS.forEach((std) => {
          setDoc(doc(db, 'studios', std.id), std).catch(e => console.error(e));
        });
        setStudios(INITIAL_STUDIOS);
      } else {
        const list: Studio[] = [];
        snapshot.forEach((d) => list.push(d.data() as Studio));
        setStudios(list);
      }
    }, err => handleFirestoreError(err, OperationType.GET, 'studios'));

    const unsubArtists = onSnapshot(collection(db, 'artists'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_ARTISTS.forEach((art) => {
          setDoc(doc(db, 'artists', art.id), art).catch(e => console.error(e));
        });
        setArtists(INITIAL_ARTISTS);
      } else {
        const list: Artist[] = [];
        snapshot.forEach((d) => list.push(d.data() as Artist));
        setArtists(list);
      }
    }, err => handleFirestoreError(err, OperationType.GET, 'artists'));

    const unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_SERVICES.forEach((srv) => {
          setDoc(doc(db, 'services', srv.id), srv).catch(e => console.error(e));
        });
        setServices(INITIAL_SERVICES);
      } else {
        const list: ServiceItem[] = [];
        snapshot.forEach((d) => list.push(d.data() as ServiceItem));
        setServices(list);
      }
    }, err => handleFirestoreError(err, OperationType.GET, 'services'));

    const unsubAppointments = onSnapshot(collection(db, 'appointments'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_APPOINTMENTS.forEach((apt) => {
          setDoc(doc(db, 'appointments', apt.id), apt).catch(e => console.error(e));
        });
        setAppointments(INITIAL_APPOINTMENTS);
      } else {
        const list: Appointment[] = [];
        snapshot.forEach((d) => list.push(d.data() as Appointment));
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setAppointments(list);
      }
    }, err => handleFirestoreError(err, OperationType.GET, 'appointments'));

    const unsubNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_NOTIFICATIONS.forEach((ntf) => {
          setDoc(doc(db, 'notifications', ntf.id), ntf).catch(e => console.error(e));
        });
        setNotifications(INITIAL_NOTIFICATIONS);
      } else {
        const list: CustomNotification[] = [];
        snapshot.forEach((d) => list.push(d.data() as CustomNotification));
        list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        setNotifications(list);
      }
    }, err => handleFirestoreError(err, OperationType.GET, 'notifications'));

    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_ANNOUNCEMENTS.forEach((ann) => {
          setDoc(doc(db, 'announcements', ann.id), ann).catch(e => console.error(e));
        });
        setAnnouncements(INITIAL_ANNOUNCEMENTS);
      } else {
        const list: Announcement[] = [];
        snapshot.forEach((d) => list.push(d.data() as Announcement));
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setAnnouncements(list);
      }
    }, err => handleFirestoreError(err, OperationType.GET, 'announcements'));

    return () => {
      unsubStudios();
      unsubArtists();
      unsubServices();
      unsubAppointments();
      unsubNotifications();
      unsubAnnouncements();
    };
  }, []);

  const handleUpdateServices = async (updated: ServiceItem[]) => {
    const currentIds = services.map(s => s.id);
    const updatedIds = updated.map(s => s.id);
    const removedIds = currentIds.filter(id => !updatedIds.includes(id));
    for (const id of removedIds) {
      await deleteDoc(doc(db, 'services', id)).catch(e => console.error(e));
    }
    for (const item of updated) {
      await setDoc(doc(db, 'services', item.id), item).catch(e => console.error(e));
    }
  };

  const handleUpdateAppointments = async (updated: Appointment[]) => {
    const currentIds = appointments.map(a => a.id);
    const updatedIds = updated.map(a => a.id);
    const removedIds = currentIds.filter(id => !updatedIds.includes(id));
    for (const id of removedIds) {
      await deleteDoc(doc(db, 'appointments', id)).catch(e => console.error(e));
    }
    for (const item of updated) {
      await setDoc(doc(db, 'appointments', item.id), item).catch(e => console.error(e));
    }
  };

  const handleUpdateArtists = async (updated: Artist[]) => {
    const currentIds = artists.map(a => a.id);
    const updatedIds = updated.map(a => a.id);
    const removedIds = currentIds.filter(id => !updatedIds.includes(id));
    for (const id of removedIds) {
      await deleteDoc(doc(db, 'artists', id)).catch(e => console.error(e));
    }
    for (const item of updated) {
      await setDoc(doc(db, 'artists', item.id), item).catch(e => console.error(e));
    }
  };

  const handleUpdateStudios = async (updated: Studio[]) => {
    const currentIds = studios.map(s => s.id);
    const updatedIds = updated.map(s => s.id);
    const removedIds = currentIds.filter(id => !updatedIds.includes(id));
    for (const id of removedIds) {
      await deleteDoc(doc(db, 'studios', id)).catch(e => console.error(e));
    }
    for (const item of updated) {
      await setDoc(doc(db, 'studios', item.id), item).catch(e => console.error(e));
    }
  };

  const handleUpdateAnnouncements = async (updated: Announcement[]) => {
    const currentIds = announcements.map(a => a.id);
    const updatedIds = updated.map(a => a.id);
    const removedIds = currentIds.filter(id => !updatedIds.includes(id));
    for (const id of removedIds) {
      await deleteDoc(doc(db, 'announcements', id)).catch(e => console.error(e));
    }
    for (const item of updated) {
      await setDoc(doc(db, 'announcements', item.id), item).catch(e => console.error(e));
    }
  };

  const handleAddStudio = async (newStudio: Studio) => {
    await setDoc(doc(db, 'studios', newStudio.id), newStudio).catch(e => console.error(e));
  };

  useEffect(() => {
    if (customerUser) {
      localStorage.setItem('tattoo_customer_user', JSON.stringify(customerUser));
    } else {
      localStorage.removeItem('tattoo_customer_user');
    }
  }, [customerUser]);

  useEffect(() => {
    if (studioUser) {
      localStorage.setItem('tattoo_studio_user', JSON.stringify(studioUser));
    } else {
      localStorage.removeItem('tattoo_studio_user');
    }
  }, [studioUser]);

  useEffect(() => {
    if (artistUser) {
      localStorage.setItem('tattoo_artist_user', JSON.stringify(artistUser));
    } else {
      localStorage.removeItem('tattoo_artist_user');
    }
  }, [artistUser]);

  useEffect(() => {
    if (superAdminUser) {
      localStorage.setItem('tattoo_super_admin_user', JSON.stringify(superAdminUser));
    } else {
      localStorage.removeItem('tattoo_super_admin_user');
    }
  }, [superAdminUser]);

  // Entrance Splash Screen duration and fade out timer (1 Second show + 700ms fade transition)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashFading(true);
      const removeTimer = setTimeout(() => {
        setIsSplashActive(false);
      }, 700);
      return () => clearTimeout(removeTimer);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Initial welcome notification if new session
  useEffect(() => {
    if (notifications.length === INITIAL_NOTIFICATIONS.length) {
      const welcomeExists = notifications.some(n => n.id === 'welcome_tattoo');
      if (!welcomeExists) {
        handleAddNotification({
          id: 'welcome_tattoo',
          title: 'Tattoo Reserve Hoş Geldiniz! 🎨',
          description: 'Uygulamayı dilediğinizce test edebilirsiniz. Müşteri, Stüdyo Yönetimi ve Sanatçı panelleri arasında yukarıdaki menüden saniyeler içinde geçiş yapın.',
          appointmentId: 'apt_1', 
          timestamp: new Date().toISOString(),
          isRead: false,
          type: 'portfolio_upload'
        });
      }
    }
  }, [notifications]);

  // --- Handlers & Controllers ---
  const handleAddAppointment = async (newApt: Appointment) => {
    await setDoc(doc(db, 'appointments', newApt.id), newApt).catch(e => console.error(e));
  };

  const handleCancelAppointment = async (id: string, reason?: string) => {
    const matched = appointments.find(a => a.id === id);
    if (matched) {
      const updated = { ...matched, status: 'Cancelled' as const, cancelReason: reason };
      await setDoc(doc(db, 'appointments', id), updated).catch(e => console.error(e));

      // Create cancel notification
      const clientName = matched.customerName;
      const reasonText = reason ? `\n\nİptal Nedeni: "${reason}"` : '';
      
      await handleAddNotification({
        id: `ntf_cnc_${Date.now()}`,
        title: 'Randevu İptal Edildi ⚠️',
        description: `${clientName} adlı müşteri randevusunu iptal etti.${reasonText}`,
        appointmentId: id,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'status_change',
        artistId: matched.artistId,
        studioId: matched.studioId,
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: Appointment['status']) => {
    const matched = appointments.find(a => a.id === id);
    if (matched) {
      const updated = { ...matched, status: newStatus };
      await setDoc(doc(db, 'appointments', id), updated).catch(e => console.error(e));

      const clientName = matched.customerName;
      const artistName = matched.artistName;

      let notifTitle = 'Durum Güncellendi 📢';
      let notifDesc = `${clientName} randevusu güncellendi.`;

      if (newStatus === 'Confirmed') {
        notifTitle = 'Randevu Onaylandı! ✅';
        notifDesc = `${clientName} talebi, ${artistName} tarafından onaylandı.`;
      } else if (newStatus === 'Completed') {
        notifTitle = 'Dövme Seansı Tamamlandı! 🎉';
        notifDesc = `${clientName} seansı başarıyla bitti ve sisteme kaydedildi.`;
      } else if (newStatus === 'Cancelled') {
        notifTitle = 'Randevu İptal Edildi ❌';
        notifDesc = `${clientName} seansı iptal edilmiş veya reddedilmiş durumda.`;
      }

      await handleAddNotification({
        id: `ntf_st_${Date.now()}`,
        title: notifTitle,
        description: notifDesc,
        appointmentId: id,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'status_change',
        artistId: matched.artistId,
        studioId: matched.studioId,
      });
    }
  };

  const handleAddNotification = async (newNotif: CustomNotification) => {
    await setDoc(doc(db, 'notifications', newNotif.id), newNotif).catch(e => console.error(e));
  };

  const handleNotificationSelect = async (appId: string) => {
    const targetNotifs = notifications.filter(n => n.appointmentId === appId && !n.isRead);
    for (const n of targetNotifs) {
      await setDoc(doc(db, 'notifications', n.id), { ...n, isRead: true }).catch(e => console.error(e));
    }
    const matched = appointments.find(a => a.id === appId);
    if (matched) {
      setOpenAppointmentId(appId);
    }
  };

  const handleClearNotifications = async (idsToClear?: string[]) => {
    if (idsToClear && idsToClear.length > 0) {
      for (const id of idsToClear) {
        await deleteDoc(doc(db, 'notifications', id)).catch(e => console.error(e));
      }
    } else {
      for (const n of notifications) {
        await deleteDoc(doc(db, 'notifications', n.id)).catch(e => console.error(e));
      }
    }
  };

  const handleAddArtist = async (newArtist: Artist) => {
    await setDoc(doc(db, 'artists', newArtist.id), newArtist).then(() => {
      let local: any[] = [];
      try {
        local = JSON.parse(localStorage.getItem('auth_artists') || '[]');
      } catch (e) {
        console.error("Error parsing auth_artists from localStorage", e);
      }
      if (!Array.isArray(local)) {
        local = [];
      }
      if (!local.some((l: any) => l.artistId === newArtist.id)) {
        const demoArtistCred = {
          id: `user_art_${Date.now()}`,
          email: `${newArtist.name.toLowerCase().replace(/\s+/g, '')}@tattoo.co`,
          password: 'password123',
          name: newArtist.name,
          phone: newArtist.phone || '0530 000 00 00',
          artistId: newArtist.id
        };
        localStorage.setItem('auth_artists', JSON.stringify([...local, demoArtistCred]));
      }
    }).catch(e => console.error(e));
  };

  const handleLogin = (user: {
    role: 'customer' | 'studio' | 'artist' | 'super_admin';
    email: string;
    name: string;
    phone?: string;
    artistId?: string;
    studioId?: string;
  }) => {
    if (user.role === 'customer') {
      setCustomerUser({ name: user.name, email: user.email, phone: user.phone || '' });
    } else if (user.role === 'studio') {
      setStudioUser({ name: user.name, email: user.email, studioId: user.studioId || 'studio_default' });
    } else if (user.role === 'artist') {
      setArtistUser({ name: user.name, email: user.email, artistId: user.artistId || '' });
    } else if (user.role === 'super_admin') {
      setSuperAdminUser({ name: user.name, email: user.email });
    }
    setCurrentRole(user.role);
  };

  const handleLogout = (role: 'customer' | 'studio' | 'artist' | 'super_admin') => {
    if (role === 'customer') {
      setCustomerUser(null);
    } else if (role === 'studio') {
      setStudioUser(null);
    } else if (role === 'artist') {
      setArtistUser(null);
    } else if (role === 'super_admin') {
      setSuperAdminUser(null);
      setCurrentRole('studio');
    }
  };

  // --- Automated notification state ---
  const [lastNotificationToast, setLastNotificationToast] = useState<string | null>(null);

  // Background checker for appointments scheduled 2 hours from now
  useEffect(() => {
    const checkUpcomingReminders = () => {
      const now = new Date();
      let addedAny = false;
      const newNotificationsList = [...notifications];

      appointments.forEach(apt => {
        // Only trigger reminders for Confirmed or Pending appointments
        if (apt.status !== 'Confirmed' && apt.status !== 'Pending') return;

        // Parse date and time in local format (YYYY-MM-DDTHH:MM)
        const aptDateTime = new Date(`${apt.date}T${apt.time}:00`);
        if (isNaN(aptDateTime.getTime())) return;

        const diffMs = aptDateTime.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        // Within 2 hours before the appointment (0 to 2 hours)
        if (diffHours > 0 && diffHours <= 2) {
          const customerReminderId = `remind_cust_${apt.id}`;
          const artistReminderId = `remind_art_${apt.id}`;

          const isCustomerReminded = newNotificationsList.some(n => n.id === customerReminderId);
          const isArtistReminded = newNotificationsList.some(n => n.id === artistReminderId);

          if (!isCustomerReminded && !isArtistReminded) {
            newNotificationsList.unshift({
              id: customerReminderId,
              title: '⏰ Randevu Hatırlatması (Müşteri)',
              description: `Sayın ${apt.customerName}, ${apt.artistName} ile olan dövme seansınıza tam 2 saat kaldı! Lütfen stüdyoda vaktinde bulunmayı unutmayın.`,
              appointmentId: apt.id,
              timestamp: new Date().toISOString(),
              isRead: false,
              type: 'reminder'
            });

            newNotificationsList.unshift({
              id: artistReminderId,
              title: '⏰ Randevu Hatırlatması (Sanatçı)',
              description: `Sevgili ${apt.artistName}, müşteriniz ${apt.customerName} ile gerçekleşecek seansınıza tam 2 saat kaldı! Hazırlıkları tamamlayabilirsiniz.`,
              appointmentId: apt.id,
              timestamp: new Date().toISOString(),
              isRead: false,
              type: 'reminder'
            });

            addedAny = true;
          }
        }
      });

      if (addedAny) {
        setNotifications(newNotificationsList);
        setLastNotificationToast('Otomatik Sistem: 2 saat kala randevu tespit edildi. Müşteriye ve Sanatçıya anlık hatırlatıcılar iletildi!');
        setTimeout(() => setLastNotificationToast(null), 6000);
      }
    };

    checkUpcomingReminders();
    const intervalId = setInterval(checkUpcomingReminders, 20000); // scan every 20 seconds
    return () => clearInterval(intervalId);
  }, [appointments, notifications]);




  const handleDeleteAppointment = async (id: string) => {
    await deleteDoc(doc(db, 'appointments', id)).catch(e => console.error(e));
    setOpenAppointmentId(null);
  };

  const getOpenAppointment = () => {
    return appointments.find(a => a.id === openAppointmentId) || null;
  };

  return (
    <div id="tattoo-reserve-app" className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-[#C7D5F0] selection:text-black">
      
      {/* Premium Entrance Splash Screen with centered logo and site name */}
      {isSplashActive && (
        <div 
          className={`fixed inset-0 z-[10000] bg-[#050505] flex flex-col items-center justify-center transition-all duration-700 ease-in-out select-none ${
            isSplashFading ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
          }`}
          id="app-entrance-splash-screen"
        >
          <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-sm px-6 relative">
            {/* Glowing background decor */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#C7D5F0]/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Circular Logo with brand colored accent glow */}
            <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-[#C7D5F0]/20 shadow-[0_0_35px_rgba(199,213,240,0.15)] bg-black shrink-0 transition-transform duration-1000 hover:scale-105">
              <img 
                src="https://r.resimlink.com/79xHR3v.jpg" 
                alt="Tattoo Reserve Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Title branding with spacious tracking matching premium touch */}
            <div className="space-y-1.5 z-10">
              <h1 className="text-3xl font-rushel font-black tracking-[0.25em] text-[#C7D5F0] uppercase">
                Tattoo Reserve
              </h1>
              <p className="text-[10px] md:text-xs text-zinc-450 tracking-[0.35em] uppercase font-sans font-bold">
                Premium Dövme Atölyesi
              </p>
            </div>

            {/* Micro loading progress line with active shimmer */}
            <div className="w-16 h-[1.5px] bg-white/5 rounded-full relative overflow-hidden mt-3 z-10">
              <div className="absolute top-0 left-0 h-full w-[40%] bg-[#C7D5F0] rounded-full animate-shimmer" />
            </div>
          </div>
        </div>
      )}

      {/* 1. Brand Header with notification manager dropdown */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        notifications={notifications}
        appointments={appointments}
        onNotificationSelect={handleNotificationSelect}
        onClearNotifications={handleClearNotifications}
        customerUser={customerUser}
        studioUser={studioUser}
        artistUser={artistUser}
        onLogout={handleLogout}
      />

      {/* 2. Main content container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentRole === 'customer' && (
            <motion.div
              key="customer-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {customerUser ? (
                <CustomerPanel
                  artists={artists}
                  appointments={appointments}
                  services={services}
                  onAddAppointment={handleAddAppointment}
                  onCancelAppointment={handleCancelAppointment}
                  onAddNotification={handleAddNotification}
                  customerUser={customerUser}
                  onUpdateCustomerUser={setCustomerUser}
                  studios={studios}
                  announcements={announcements}
                />
              ) : (
                <AuthGateway
                  onLogin={handleLogin}
                  artists={artists}
                  onAddArtist={handleAddArtist}
                  initialTab="customer"
                  studios={studios}
                  onAddStudio={handleAddStudio}
                />
              )}
            </motion.div>
          )}

          {currentRole === 'studio' && (
            <motion.div
              key="studio-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {studioUser ? (
                <StudioPanel
                  artists={artists}
                  appointments={appointments}
                  services={services}
                  onUpdateServices={handleUpdateServices}
                  onUpdateAppointments={handleUpdateAppointments}
                  onOpenAppointmentDetail={setOpenAppointmentId}
                  onAddNotification={handleAddNotification}
                  studioUser={studioUser}
                  onUpdateStudioUser={setStudioUser}
                  onUpdateArtists={handleUpdateArtists}
                  studios={studios}
                  onUpdateStudios={handleUpdateStudios}
                  announcements={announcements}
                  onUpdateAnnouncements={handleUpdateAnnouncements}
                />
              ) : (
                <AuthGateway
                  onLogin={handleLogin}
                  artists={artists}
                  onAddArtist={handleAddArtist}
                  initialTab="studio"
                  studios={studios}
                  onAddStudio={handleAddStudio}
                />
              )}
            </motion.div>
          )}

          {currentRole === 'artist' && (
            <motion.div
              key="artist-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {artistUser ? (
                <ArtistPanel
                  artists={artists}
                  appointments={appointments}
                  services={services}
                  onUpdateArtists={handleUpdateArtists}
                  onUpdateAppointments={handleUpdateAppointments}
                  onOpenAppointmentDetail={setOpenAppointmentId}
                  onAddNotification={handleAddNotification}
                  artistUser={artistUser}
                  studios={studios}
                />
              ) : (
                <AuthGateway
                  onLogin={handleLogin}
                  artists={artists}
                  onAddArtist={handleAddArtist}
                  initialTab="artist"
                  studios={studios}
                  onAddStudio={handleAddStudio}
                />
              )}
            </motion.div>
          )}

          {currentRole === 'super_admin' && (
            <motion.div
              key="super-admin-panel"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <SuperAdminPanel onLogout={() => handleLogout('super_admin')} />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* 3. Global details popup when notification or slot is clicked */}
      <NotificationModal
        isOpen={openAppointmentId !== null}
        appointment={getOpenAppointment()}
        onClose={() => setOpenAppointmentId(null)}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteAppointment}
      />



      {/* Floating System-Wide Automation Alert Toast */}
      {lastNotificationToast && (
        <div 
          onClick={() => setLastNotificationToast(null)}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-[#121212] border border-[#C7D5F0]/60 rounded-xl p-4 shadow-2xl max-w-sm w-[92vw] flex items-start gap-3 transition-transform cursor-pointer hover:scale-102 border-l-4 border-l-[#C7D5F0]"
        >
          <div className="p-1.5 rounded-lg bg-[#C7D5F0]/10 text-[#C7D5F0] shrink-0 mt-0.5">
            <Clock className="w-4 h-4 text-[#C7D5F0]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold font-mono text-[#C7D5F0] uppercase tracking-wider">Otomasyon Bildirimi</h4>
            <p className="text-xs text-white/80 leading-normal">{lastNotificationToast}</p>
          </div>
        </div>
      )}

      {/* 5. Elegant Footer matching CutReserve */}
      <footer className="border-t border-white/10 bg-[#050505] py-6" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40 font-mono">
          <div>
            <span>© 2026 Tattoo Reserve. Tüm Hakları Saklıdır.</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 p-2 px-3 border border-white/10 rounded-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C7D5F0]" />
            <span>Premium Dövme Randevusu ve Portfolyo Denetimi</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

