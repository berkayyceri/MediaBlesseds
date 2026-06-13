import React, { useState } from 'react';
import { Calendar as CalendarIcon, User, Layers, Plus, ExternalLink, Image, Sparkles, Heart, FileText, CheckCircle, Check, Trash2, Clock, Users, X } from 'lucide-react';
import { Appointment, Artist, ServiceItem, CustomNotification, PortfolioItem, Studio } from '../types';

interface ArtistPanelProps {
  artists: Artist[];
  appointments: Appointment[];
  services: ServiceItem[];
  onUpdateArtists: (updated: Artist[]) => void;
  onUpdateAppointments: (updated: Appointment[]) => void;
  onOpenAppointmentDetail: (appId: string) => void;
  onAddNotification: (notif: CustomNotification) => void;
  artistUser?: { name: string; email: string; artistId: string } | null;
  studios: Studio[];
}

export default function ArtistPanel({
  artists,
  appointments,
  services,
  onUpdateArtists,
  onUpdateAppointments,
  onOpenAppointmentDetail,
  onAddNotification,
  artistUser,
  studios,
}: ArtistPanelProps) {
  // Select which artist's view to simulate (Efe, Derin, Canberk)
  const [selectedArtistId, setSelectedArtistId] = useState(artistUser?.artistId || artists[0]?.id || '');
  const activeArtist = artists.find(a => a.id === selectedArtistId) || artists[0];

  React.useEffect(() => {
    if (artistUser?.artistId) {
      setSelectedArtistId(artistUser.artistId);
    }
  }, [artistUser?.artistId]);

  // Timeline & Calendar states
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('2026-06-10');
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [quickDate, setQuickDate] = useState('');
  const [quickTime, setQuickTime] = useState('');
  const [quickType, setQuickType] = useState<'appointment' | 'break'>('appointment');
  const [quickCustomerName, setQuickCustomerName] = useState('');
  const [quickCustomerPhone, setQuickCustomerPhone] = useState('');
  const [quickCustomerEmail, setQuickCustomerEmail] = useState('');
  const [quickServices, setQuickServices] = useState<string[]>([]);
  const [quickNotes, setQuickNotes] = useState('');

  const DATES_ACCORDION = [
    { label: 'CMT', day: '6', full: '2026-06-06' },
    { label: 'PAZ', day: '7', full: '2026-06-07' },
    { label: 'PZT', day: '8', full: '2026-06-08' },
    { label: 'SAL', day: '9', full: '2026-06-09' },
    { label: 'ÇAR', day: '10', full: '2026-06-10' },
    { label: 'PER', day: '11', full: '2026-06-11' },
    { label: 'CUM', day: '12', full: '2026-06-12' },
  ];

  const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const findAppointmentInTimeline = (timeSlot: string) => {
    return appointments.find(apt => 
      apt.artistId === activeArtist.id && 
      apt.date === selectedCalendarDate && 
      apt.time === timeSlot &&
      apt.status !== 'Cancelled'
    );
  };

  const openQuickFormForSlot = (date: string, time: string) => {
    setQuickDate(date);
    setQuickTime(time || '10:00');
    setQuickType('appointment');
    setQuickCustomerName('');
    setQuickCustomerPhone('');
    setQuickCustomerEmail('');
    setQuickServices([]);
    setQuickNotes('');
    setShowQuickForm(true);
  };

  const handleQuickFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const chosenDateTime = new Date(`${quickDate}T${quickTime}:00`);
    if (chosenDateTime < new Date()) {
      alert('Geçmiş bir tarihe veya saate randevu / mola planlayamazsınız. Lütfen ileri bir tarih/saat seçin.');
      return;
    }

    if (quickType === 'break') {
      const newMola: Appointment = {
        id: `mola_art_${Date.now()}`,
        studioId: activeArtist.studioId || 'studio_default',
        customerName: '☕ MOLA / DİNLENME',
        customerPhone: '-',
        customerEmail: '-',
        artistId: activeArtist.id,
        artistName: activeArtist.name,
        date: quickDate,
        time: quickTime,
        services: [],
        notes: quickNotes || 'Sanatçı tarafından girildi.',
        status: 'Confirmed',
        clientImages: [],
        createdAt: new Date().toISOString(),
        totalPrice: 0,
        totalDuration: 60,
      };

      onUpdateAppointments([newMola, ...appointments]);
      onAddNotification({
        id: `ntf_mola_art_${Date.now()}`,
        title: 'Mola Saati Kaydedildi ☕',
        description: `${activeArtist.name} kendisi için ${quickDate} - ${quickTime} dilimine mola ekledi.`,
        appointmentId: newMola.id,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'status_change'
      });
    } else {
      if (!quickCustomerName) {
        alert('Lütfen müşteri adını giriniz.');
        return;
      }

      const newApt: Appointment = {
        id: `apt_art_${Date.now()}`,
        studioId: activeArtist.studioId || 'studio_default',
        customerName: quickCustomerName,
        customerPhone: quickCustomerPhone || 'Numara Yok',
        customerEmail: quickCustomerEmail || 'E-posta Yok',
        artistId: activeArtist.id,
        artistName: activeArtist.name,
        date: quickDate,
        time: quickTime,
        services: quickServices,
        notes: quickNotes || 'Sanatçı tarafından hızlı ajanda formundan kaydedildi.',
        status: 'Confirmed',
        clientImages: [],
        createdAt: new Date().toISOString(),
        totalPrice: 0,
        totalDuration: 60,
      };

      onUpdateAppointments([newApt, ...appointments]);
      onAddNotification({
        id: `ntf_apt_art_${Date.now()}`,
        title: 'Hızlı Randevu Tanımlandı 📅',
        description: `Sanatçı ${activeArtist.name}, "${quickCustomerName}" adlı müşteri için randevu kaydetti.`,
        appointmentId: newApt.id,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'new_appointment'
      });
    }

    setShowQuickForm(false);
  };

  // Artist Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editSpecialties, setEditSpecialties] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const handleStartEditProfile = () => {
    if (activeArtist) {
      setEditName(activeArtist.name);
      setEditTitle(activeArtist.title);
      setEditBio(activeArtist.bio);
      setEditAvatar(activeArtist.avatar);
      setEditSpecialties(activeArtist.specialties.join(', '));
      setEditPhone(activeArtist.phone || '');
      setIsEditingProfile(true);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName) return;

    const updated = artists.map(art => {
      if (art.id === activeArtist.id) {
        return {
          ...art,
          name: editName,
          title: editTitle,
          bio: editBio,
          avatar: editAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          phone: editPhone,
          specialties: editSpecialties
            .split(',')
            .map(s => s.trim())
            .filter(Boolean),
        };
      }
      return art;
    });

    onUpdateArtists(updated);
    setIsEditingProfile(false);

    onAddNotification({
      id: `ntf_art_upd_${Date.now()}`,
      title: 'Profil Güncellendi ✨',
      description: `Sanatçı "${editName}" profil bilgilerini güncelledi.`,
      appointmentId: '',
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'portfolio_upload'
    });
  };

  // Forms for uploading new portfolio work (Örnek görsel paylaşma)
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Realizm & Siyah');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');

  if (!activeArtist) {
    return (
      <div className="p-8 text-center text-zinc-400 bg-[#121212] border border-white/10 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-2">Sanatçı Profili Yükleniyor...</h3>
        <p className="text-xs">Eğer sisteme yeni kayıt olduysanız profiliniz senkronize ediliyor olabilir.</p>
      </div>
    );
  }

  // Built-in list of cool realistic sample images if they don't want to enter Custom URL
  const READY_MADE_SAMPLES = [
    'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550537687-c91072c4792d?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611501275019-9b5cdae94fa8?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560707303-4e980c876ad1?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1562962230-16e4623d36e6?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590246814883-57c511e76523?w=500&auto=format&fit=crop&q=80'
  ];

  const handlePortfolioUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    // Use selected URL or default to first sample
    const finalUrl = newUrl || READY_MADE_SAMPLES[Math.floor(Math.random() * READY_MADE_SAMPLES.length)];

    const newItem: PortfolioItem = {
      id: `p_art_${Date.now()}`,
      url: finalUrl,
      title: newTitle,
      category: newCategory,
      artistId: activeArtist.id,
      likes: Math.floor(Math.random() * 50) + 12,
      comments: Math.floor(Math.random() * 5),
      description: newDesc
    };

    // Update Artists
    const updatedArtists = artists.map(art => {
      if (art.id === activeArtist.id) {
        return {
          ...art,
          portfolio: [...art.portfolio, newItem]
        };
      }
      return art;
    });

    onUpdateArtists(updatedArtists);

    // Notify Stüdyo & users
    onAddNotification({
      id: `ntf_p_${Date.now()}`,
      title: 'Yeni Portfolyo Görseli Eklendi! 🎨',
      description: `${activeArtist.name} yeni çalşması "${newTitle}" görselini portfolyosunda paylaştı.`,
      appointmentId: '',
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'portfolio_upload'
    });

    // Reset fields
    setNewTitle('');
    setNewDesc('');
    setNewUrl('');
    setShowUploadForm(false);
  };

  const handleRemovePortfolioItem = (itemId: string) => {
    const updatedArtists = artists.map(art => {
      if (art.id === activeArtist.id) {
        return {
          ...art,
          portfolio: art.portfolio.filter(item => item.id !== itemId)
        };
      }
      return art;
    });
    onUpdateArtists(updatedArtists);
  };

  // Artist personal appointment filters
  const personalAppointments = appointments.filter(a => a.artistId === activeArtist.id);

  return (
    <div className="space-y-6" id="artist-panel-container">
      
      {/* Simulation Selector Bar */}
      {!artistUser ? (
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Simüle Edilen Sanatçı Görünümü:
          </label>
          <div className="flex overflow-x-auto scrollbar-none gap-2 pb-1 sm:pb-0 sm:flex-wrap w-full sm:w-auto">
            {artists.map(art => (
              <button
                key={art.id}
                onClick={() => setSelectedArtistId(art.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition flex items-center gap-2 shrink-0 ${
                  selectedArtistId === art.id
                    ? 'bg-[#C7D5F0] border-white text-black font-semibold shadow-lg shadow-[#C7D5F0]/10'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100'
                }`}
              >
                <img src={art.avatar} alt="mini" className="w-4 h-4 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                <span>{art.name}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#121212] p-4 rounded-xl border border-[#C7D5F0]/35 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Güvenli Oturum Açık: {artistUser.name}</span>
          </div>
          <span className="text-[10px] text-white/40 font-mono">SANATÇI YÖNETİM MODU AKTİF</span>
        </div>
      )}

      {/* 🏢 STUDIO RECRUITMENT INVITATIONS ACCORDION */}
      {(() => {
        const invites = JSON.parse(localStorage.getItem('studio_invites') || '[]');
        const artistInvites = invites.filter((inv: any) => inv.artistId === activeArtist.id && inv.status === 'pending');
        
        if (artistInvites.length === 0) return null;

        return (
          <div className="bg-zinc-900 border border-[#C7D5F0]/20 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-[#C7D5F0] uppercase tracking-wider font-mono flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Gelen Dövme Stüdyosu Şube Kadro Teklifleri ({artistInvites.length})</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Aşağıdaki stüdyolardan biri sizi dövme sanatçısı kadrolarına davet etti. Teklifi kabul etmeniz halinde, profiliniz o stüdyoya bağlanır ve sistem gereği eski zaman çizelgeniz ile randevularınız tamamen sıfırlanarak sıfırdan zaman çizelgesi tanımlanır.
            </p>

            <div className="space-y-3">
              {artistInvites.map((inv: any) => (
                <div key={inv.id} className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="font-black text-xs text-zinc-200 tracking-wider">🏢 {inv.studioName}</h4>
                    <span className="text-[10px] text-zinc-500 font-mono">Davet Zamanı: {new Date(inv.timestamp).toLocaleString('tr-TR')}</span>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        // 1. Link artist to new studioId
                        const updatedArtists = artists.map(a => a.id === activeArtist.id ? { ...a, studioId: inv.studioId } : a);
                        onUpdateArtists(updatedArtists);

                        // 2. Clear all of this artist's existing appointments/breaks to start from scratch!
                        const updatedAppoints = appointments.filter(apt => apt.artistId !== activeArtist.id);
                        onUpdateAppointments(updatedAppoints);

                        // 3. Mark invite as accepted
                        const invitesList = JSON.parse(localStorage.getItem('studio_invites') || '[]');
                        const updatedInvites = invitesList.map((item: any) => item.id === inv.id ? { ...item, status: 'accepted' } : item);
                        localStorage.setItem('studio_invites', JSON.stringify(updatedInvites));

                        // 4. Send success notification
                        onAddNotification({
                          id: `ntf_accepted_${Date.now()}`,
                          title: 'Kadro Teklifi Kabul Edildi! 🎉',
                          description: `"${activeArtist.name}", "${inv.studioName}" stüdyosunun kadro teklifini kabul etti ve stüdyoya katıldı. Eski zaman çizelgesi sıfırlandı.`,
                          appointmentId: '',
                          timestamp: new Date().toISOString(),
                          isRead: false,
                          type: 'status_change'
                        });

                        alert(`"${inv.studioName}" stüdyosuna başarıyla bağlandınız! Eski stüdyo seanslarınız ve zaman çizelgeleriniz sıfırlandı.`);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 bg-[#C7D5F0] hover:bg-[#C7D5F0]/80 text-black font-extrabold text-[11px] uppercase tracking-wider rounded-lg transition"
                    >
                      Kabul Et ve Kadroya Katıl
                    </button>
                    <button
                      onClick={() => {
                        const invitesList = JSON.parse(localStorage.getItem('studio_invites') || '[]');
                        const updatedInvites = invitesList.map((item: any) => item.id === inv.id ? { ...item, status: 'rejected' } : item);
                        localStorage.setItem('studio_invites', JSON.stringify(updatedInvites));
                        alert('Daveti reddettiniz.');
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-extrabold text-[11px] uppercase tracking-wider border border-zinc-800 rounded-lg transition"
                    >
                      Reddet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Artist Profile Intro Card (With Profile Updating capabilities) */}
      <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-6 relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C7D5F0]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Affiliate Studio information */}
        {(() => {
          const matchedStudio = studios.find(s => s.id === activeArtist.studioId);
          return (
            <div className="mb-4 bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex items-center justify-between text-xs gap-4">
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="font-mono uppercase text-[9px] tracking-widest text-[#C7D5F0]">Aktif Şube:</span>
                {matchedStudio ? (
                  <span className="font-bold text-white uppercase">{matchedStudio.name} — {matchedStudio.branch}</span>
                ) : (
                  <span className="font-bold text-red-400 uppercase">HERHANGİ BİR STÜDYOYA BAĞLI DEĞİL (Bağımsız)</span>
                )}
              </div>
              {matchedStudio && (
                <span className="text-[10px] text-zinc-500 italic">📞 Stüdyo Tlf: {matchedStudio.phone}</span>
              )}
            </div>
          );
        })()}

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 relative z-10">
            <h3 className="text-sm font-bold text-[#C7D5F0] uppercase tracking-wider font-rushel">Profil Bilgilerini Güncelle</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 block uppercase">Sanatçı Adı</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  required
                  className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 block uppercase">Ünvan / Stil Uzmanlığı</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  required
                  className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 block uppercase">Profil Fotoğrafı (Cihazdan Yükleyin)</label>
                <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded p-1.5">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-zinc-900 border border-[#C7D5F0]/35 flex items-center justify-center">
                    {editAvatar ? (
                      <img src={editAvatar} alt="Önizleme" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-zinc-500" />
                    )}
                  </div>
                  <div className="flex-1 relative">
                    <input
                      type="file"
                      accept="image/*"
                      id="artist-avatar-file-upload"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setEditAvatar(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label
                      htmlFor="artist-avatar-file-upload"
                      className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-[#C7D5F0]/45 rounded text-[11px] text-zinc-300 hover:text-white cursor-pointer transition w-full font-sans font-medium"
                    >
                      <Image className="w-3.5 h-3.5 text-[#C7D5F0]" />
                      <span>Dosya Seçin</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 block uppercase">Uzmanlık Alanları</label>
                  <input
                    type="text"
                    value={editSpecialties}
                    onChange={e => setEditSpecialties(e.target.value)}
                    placeholder="Örn: Realizm, Blackwork"
                    className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 block uppercase">Cep Telefonu</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="Örn: 0532 123 45 67"
                    className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 block uppercase">Sanatçı Biyografisi</label>
              <textarea
                value={editBio}
                onChange={e => setEditBio(e.target.value)}
                rows={3}
                placeholder="Kendinizden ve dövme felsefenizden bahsedin..."
                className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-bold uppercase transition"
              >
                İptal Temizle
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase transition shadow-lg shadow-emerald-600/10"
              >
                ✓ Değişiklikleri Kaydet
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <img
              src={activeArtist.avatar}
              alt={activeArtist.name}
              className="w-24 h-24 rounded-full shrink-0 border-2 border-[#C7D5F0]/35 object-cover"
              referrerPolicy="no-referrer"
            />

            <div className="space-y-3 flex-1 text-center md:text-left">
              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                  <h2 className="text-xl font-extrabold text-[#C7D5F0] font-rushel tracking-[0.12em] uppercase">{activeArtist.name}</h2>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase rounded border border-emerald-500/20">
                    SİSTEM ÜYESİ SANATÇI
                  </span>
                  
                  {/* Edit profile trigger */}
                  <button
                    onClick={handleStartEditProfile}
                    className="ml-auto inline-flex items-center gap-1 text-[10px] text-zinc-400 hover:text-[#C7D5F0] bg-zinc-950 py-1 px-2.5 rounded border border-zinc-850 hover:border-[#C7D5F0]/30 transition animate-pulse"
                  >
                    <span>Profili Düzenle</span>
                  </button>
                </div>
                <p className="text-xs text-[#C7D5F0]/80 font-mono font-medium">{activeArtist.title}</p>
                {activeArtist.phone && (
                  <p className="text-[11px] text-zinc-400 font-sans mt-1 bg-zinc-950/40 py-1 px-2.5 rounded inline-block border border-zinc-850">
                    📱 İletişim Numarası: <span className="text-zinc-200 font-mono select-all font-semibold">{activeArtist.phone}</span>
                  </p>
                )}
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">{activeArtist.bio}</p>

              <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                {activeArtist.specialties.map(sp => (
                  <span key={sp} className="text-[10px] bg-zinc-950 text-zinc-300 px-2 py-0.5 rounded border border-zinc-800 font-medium">
                    {sp}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800 text-center text-xs font-mono shrink-0">
              <div className="text-base font-bold text-white">{activeArtist.completedTattoos}</div>
              <div className="text-[9px] text-zinc-500">TAMAMLANAN</div>
            </div>
          </div>
        )}

      </div>

      {/* NEW: Sanatçı Zaman Çizelgesi (Timeline) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5" id="artist-timeline-widget">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-850 pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#C7D5F0] uppercase tracking-wider font-rushel flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C7D5F0]" />
              <span>AJANDA ZAMAN ÇİZELGESİ (KİŞİSEL PORTAL)</span>
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Seçtiğiniz tarihte saat dilimlerine göre kişisel seans ve mola programınızı yönetin. Boş saatlere tıklayarak doğrudan yeni randevu kaydedebilir veya dinlenme mola süresi tanımlayabilirsiniz.
            </p>
          </div>
          
          <div className="px-3.5 py-1.5 bg-[#C7D5F0]/10 text-[#C7D5F0] text-[10px] font-bold uppercase rounded border border-[#C7D5F0]/20 font-mono">
            Sadece Sizin Ajandanız: {activeArtist.name}
          </div>
        </div>

        {/* Day / Date Navigation */}
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              id="btn-artist-day-prev"
              type="button"
              onClick={() => {
                const currentIdx = DATES_ACCORDION.findIndex(d => d.full === selectedCalendarDate);
                if (currentIdx > 0) setSelectedCalendarDate(DATES_ACCORDION[currentIdx - 1].full);
              }}
              className="p-1 px-2.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-white font-mono text-xs transition hover:border-[#C7D5F0]/45"
            >
              &lt;
            </button>
            <span className="font-bold font-sans text-xs text-zinc-200">
              {selectedCalendarDate} Günü Program Akışınız
            </span>
            <button
              id="btn-artist-day-next"
              type="button"
              onClick={() => {
                const currentIdx = DATES_ACCORDION.findIndex(d => d.full === selectedCalendarDate);
                if (currentIdx !== -1 && currentIdx < DATES_ACCORDION.length - 1) {
                  setSelectedCalendarDate(DATES_ACCORDION[currentIdx + 1].full);
                }
              }}
              className="p-1 px-2.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-white font-mono text-xs transition hover:border-[#C7D5F0]/45"
            >
              &gt;
            </button>
          </div>

          {/* Date buttons */}
          <div className="flex gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {DATES_ACCORDION.map(item => (
              <button
                key={item.full}
                type="button"
                onClick={() => setSelectedCalendarDate(item.full)}
                className={`px-3 py-1.5 rounded-lg border flex flex-col items-center transition shrink-0 ${
                  selectedCalendarDate === item.full
                    ? 'bg-[#C7D5F0] border-white text-black shadow-lg shadow-[#C7D5F0]/15 font-bold'
                    : 'bg-zinc-900 border-zinc-850 hover:border-zinc-700 text-zinc-400 text-xs'
                }`}
              >
                <span className="text-[9px] font-mono opacity-85">{item.label}</span>
                <span className="text-xs font-semibold">{item.day}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hours / Schedule Slots Matrix */}
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl overflow-hidden divide-y divide-zinc-850">
          {TIME_SLOTS.map(slot => {
            const matchedApt = findAppointmentInTimeline(slot);
            const isMola = matchedApt?.customerName.includes('MOLA');
            return (
              <div key={slot} className="grid grid-cols-12 items-center p-3.5 hover:bg-zinc-900/35 transition">
                {/* Left time marker */}
                <div className="col-span-3 sm:col-span-2 font-mono font-bold text-xs text-[#C7D5F0] flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#C7D5F0]/80" />
                  <span>{slot}</span>
                </div>

                {/* Right content */}
                <div className="col-span-9 sm:col-span-10 px-2">
                  {matchedApt ? (
                    <div
                      onClick={() => onOpenAppointmentDetail(matchedApt.id)}
                      className={`w-full text-left rounded-xl p-2.5 px-4 text-xs font-medium cursor-pointer transition border hover:scale-[1.01] flex items-center justify-between ${
                        isMola
                          ? 'bg-zinc-900/80 hover:bg-zinc-850 border-zinc-800 text-[#C7D5F0]/90'
                          : matchedApt.status === 'Pending'
                          ? 'bg-[#C7D5F0]/5 hover:bg-[#C7D5F0]/10 text-white border-[#C7D5F0]/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/35'
                      }`}
                      title={isMola ? 'Mola veya dinlenme saati. Detaylar için tıklayın.' : `Müşteri: ${matchedApt.customerName}. Detaylar için tıklayın.`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-zinc-150 text-sm font-sans">{matchedApt.customerName}</span>
                        {!isMola && (
                          <span className="text-[10px] text-zinc-450 font-sans hidden sm:inline">
                            ({matchedApt.services.map(sId => services.find(s => s.id === sId)?.name || sId).join(', ')})
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono tracking-wider uppercase bg-zinc-950/90 p-1 px-2.5 rounded border border-white/5 font-bold">
                          {isMola ? '☕ MOLA' : matchedApt.status === 'Pending' ? '🔔 Randevu Talebi' : '✓ Onaylı'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openQuickFormForSlot(selectedCalendarDate, slot)}
                      className="w-full text-left py-2.5 px-4 border border-dashed border-zinc-800 hover:border-[#C7D5F0]/50 bg-transparent hover:bg-zinc-900/30 rounded-xl flex items-center justify-between text-xs text-zinc-500 hover:text-[#C7D5F0] transition duration-150 cursor-pointer font-sans"
                    >
                      <span className="font-medium">+ Randevu Planla veya Mola Tanımla</span>
                      <span className="text-[10px] font-mono opacity-60">BOŞ SLOT</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main interactive grid (Personal bookings vs Portfolyo manager) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Personal Daily Bookings (6 cols) */}
        <div className="lg:col-span-6 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 px-5 border-b border-zinc-850 bg-zinc-950/80 flex items-center justify-between">
            <h3 className="font-bold text-xs text-zinc-250 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-[#C7D5F0]" />
              <span>AJANDAM & RANDEVU TAKVİMİ ({personalAppointments.length})</span>
            </h3>
          </div>

          <div className="p-5 space-y-4 max-h-[800px] overflow-y-auto divide-y divide-zinc-800/60">
            {personalAppointments.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <p className="text-xs text-zinc-400">Ajandanızda henüz kayıtlı dövme seansı bulunmuyor.</p>
                <p className="text-[10px] text-zinc-500">Müşterilerden gelen talepler anında burada listelenir.</p>
              </div>
            ) : (
              personalAppointments
                .sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())
                .map(apt => (
                  <div key={apt.id} className="pt-4 first:pt-0 space-y-3.5">
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-white bg-zinc-950/80 p-1 px-2 border border-zinc-800 rounded">
                        {apt.date} / {apt.time} Seansı
                      </span>
                      
                      <span className={`text-[10px] uppercase font-bold text-zinc-350 px-2 py-0.5 rounded border ${
                        apt.status === 'Pending' ? 'bg-[#C7D5F0]/5 text-white border-[#C7D5F0]/20' :
                        apt.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        apt.status === 'Completed' ? 'bg-indigo-505/10 text-indigo-400 border-indigo-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {apt.status === 'Pending' ? 'Onay Bekliyor' :
                         apt.status === 'Confirmed' ? 'Onaylandı' :
                         apt.status === 'Completed' ? 'Tamamlandı' : 'İptal Edildi'}
                      </span>
                    </div>

                    <div className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Müşteri Adı:</span>
                        <span className="font-bold text-zinc-100">{apt.customerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Seçilen Stil:</span>
                        <span className="text-zinc-300">
                          {apt.services.map(sId => services.find(s => s.id === sId)?.name || sId).join(', ')}
                        </span>
                      </div>
                      
                      {apt.notes && (
                        <div className="text-[10.5px] italic text-zinc-400 bg-zinc-900 leading-normal p-2.5 rounded border border-zinc-850 mt-1">
                          "{apt.notes}"
                        </div>
                      )}

                      {/* Display Client reference photos */}
                      {apt.clientImages && apt.clientImages.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-zinc-500 font-bold block uppercase mt-1">Gönderdiği Taslaklar:</span>
                          <div className="flex gap-2">
                            {apt.clientImages.map((img, i) => (
                              <div key={i} className="relative w-12 h-12 rounded overflow-hidden border border-zinc-800 bg-black shrink-0">
                                <img src={img} className="w-full h-full object-cover" alt="ref" referrerPolicy="no-referrer" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => onOpenAppointmentDetail(apt.id)}
                        className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-[10px] font-bold uppercase rounded transition"
                      >
                        Detaylı İncele / Karar Ver
                      </button>
                    </div>

                  </div>
                ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Studio & Artist Portfolio Manager (6 cols) */}
        <div id="portfolio-manager-sec" className="lg:col-span-6 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl p-5 space-y-4">
            
            <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <h3 className="font-bold text-xs text-[#C7D5F0] uppercase tracking-[0.12em] font-rushel">Örnek Portfolyo Görsellerim</h3>
                <p className="text-[10px] text-zinc-400">Profilinizde ve randevu formunda paylaşılan çalışmalarınız.</p>
              </div>
              <button
                id="btn-trigger-upload-form"
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="px-3.5 py-2 bg-[#C7D5F0] hover:bg-[#b0c4eb] text-black rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-[#C7D5F0]/10"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni Görsel Paylaş</span>
              </button>
            </div>

            {/* Simulated Portfolio item upload form */}
            {showUploadForm && (
              <form onSubmit={handlePortfolioUploadSubmit} className="p-4 bg-zinc-950/60 rounded-xl border border-[#C7D5F0]/20 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 block">Tasarım Başlığı (Örn: Tribal Eagle Sleeve)</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    placeholder="İsim giriniz..."
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 block">Kategori</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-300 focus:outline-none focus:border-[#C7D5F0]"
                    >
                      <option value="Realizm">Realizm</option>
                      <option value="Blackwork">Blackwork</option>
                      <option value="Suluboya">Suluboya</option>
                      <option value="Fine Line">Fine Line</option>
                      <option value="Geleneksel">Geleneksel</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 block pb-1">Cihazdan Fotoğraf Seçin</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        id="portfolio-file-upload-input"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setNewUrl(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="portfolio-file-upload-input"
                        className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-[#C7D5F0]/40 rounded text-xs text-zinc-300 cursor-pointer transition flex items-center gap-1.5 font-sans flex-1"
                      >
                        <Image className="w-3.5 h-3.5 text-[#C7D5F0]" />
                        <span className="truncate">{newUrl ? 'Fotoğraf Seçildi ✔' : 'Dosya Seçin'}</span>
                      </label>
                      {newUrl && (
                        <div className="w-9 h-9 rounded overflow-hidden border border-[#C7D5F0]/30 shrink-0">
                          <img src={newUrl} className="w-full h-full object-cover" alt="Önizleme" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Alternative Quick template choice as fallback */}
                <div className="text-[10px] text-zinc-500 flex items-center justify-between">
                  <span>Veya hızlıca hazır şablondan seçin:</span>
                  <select
                    value={READY_MADE_SAMPLES.includes(newUrl) ? newUrl : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        setNewUrl(e.target.value);
                      }
                    }}
                    className="bg-zinc-900 text-zinc-400 text-[10px] border border-zinc-800 rounded p-1 outline-none"
                  >
                    <option value="">-- Şablonlardan Seç --</option>
                    {READY_MADE_SAMPLES.map((s, idx) => (
                      <option key={idx} value={s}>Premium Şablon {idx + 1}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 block font-semibold">Tasarımın Hikayesi / Açıklaması</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Göbeğe, sırt parçasına veya bileğe kaç saatlik seansla işlendiği detaylarını yazabilirsiniz..."
                    rows={2}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded transition"
                >
                  FOTOĞRAFI PAYLAŞ & PORTFOLYOYA EKLE
                </button>
              </form>
            )}

            {/* Portfolio display grid */}
            <div className="grid grid-cols-2 gap-4">
              {activeArtist.portfolio.map(item => (
                <div key={item.id} className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-850 group relative">
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 bg-black/75 p-1 rounded backdrop-blur">
                      <span className="text-[9px] text-[#C7D5F0] font-mono font-bold uppercase tracking-widest">{item.category}</span>
                    </div>
                  </div>
                  
                  <div className="p-3 space-y-1">
                    <span className="text-xs font-bold text-white block truncate">{item.title}</span>
                    <p className="text-[10px] text-zinc-450 line-clamp-2 leading-normal italic">{item.description}</p>
                    
                    <div className="pt-2 border-t border-zinc-800/60 mt-2 flex justify-end items-center text-[10px] text-zinc-500">
                      {/* Delete */}
                      <button
                        onClick={() => handleRemovePortfolioItem(item.id)}
                        className="text-rose-500 hover:scale-105 transition font-bold uppercase tracking-wider"
                        title="Resmi kaldır"
                      >
                        SİL / KALDIR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

      {/* QUICK FORM MODAL */}
      {showQuickForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-[#0f0f0f] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950 p-5">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-[#C7D5F0]/10 text-[#C7D5F0] border border-[#C7D5F0]/20 rounded-lg">
                  <Plus className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white font-rushel tracking-[0.12em] uppercase">Hızlı Ajanda Planlayıcı</h3>
                  <p className="text-[10px] text-zinc-400">Takviminize hızlıca seans veya dinlenme (mola) saati ekleyin.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickForm(false)}
                className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleQuickFormSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Type Switcher */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">İşlem Türü</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setQuickType('appointment')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                      quickType === 'appointment'
                        ? 'bg-[#C7D5F0]/10 border-[#C7D5F0] text-[#C7D5F0]'
                        : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Müşteri Randevusu Yaz</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuickType('break')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                      quickType === 'break'
                        ? 'bg-[#C7D5F0]/5 border-[#C7D5F0]/30 text-zinc-300'
                        : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Mola / Dinlenme Yaz</span>
                  </button>
                </div>
              </div>

              {/* Grid: Date, Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 block">Planlanan Tarih</label>
                  <input
                    type="date"
                    value={quickDate}
                    onChange={(e) => setQuickDate(e.target.value)}
                    required
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0] font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 block">Seans Saat Dilimi</label>
                  <select
                    value={quickTime}
                    onChange={(e) => setQuickTime(e.target.value)}
                    required
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-100 focus:outline-none focus:border-[#C7D5F0]"
                  >
                    {TIME_SLOTS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Fields based on Type selection */}
              {quickType === 'appointment' ? (
                <div className="space-y-4 pt-2 border-t border-zinc-850">
                  <p className="text-[11px] text-zinc-400 font-sans">Kişisel takviminize yeni bir müşteri randevu kaydı girin.</p>
                  
                  {/* Customer Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 block">Müşteri Tam Adı</label>
                      <input
                        type="text"
                        value={quickCustomerName}
                        onChange={(e) => setQuickCustomerName(e.target.value)}
                        required={quickType === 'appointment'}
                        placeholder="Örn: Ahmet Yılmaz"
                        className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 block">İletişim Telefonu</label>
                      <input
                        type="text"
                        value={quickCustomerPhone}
                        onChange={(e) => setQuickCustomerPhone(e.target.value)}
                        placeholder="Örn: 0555 Xxx Xx Xx"
                        className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 block">E-posta Adresi</label>
                    <input
                      type="email"
                      value={quickCustomerEmail}
                      onChange={(e) => setQuickCustomerEmail(e.target.value)}
                      placeholder="Örn: ahmet@gmail.com"
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0] font-sans"
                    />
                  </div>

                  {/* Services select list checkable */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 block">Uygulanacak Dövme Stili / Hizmeti</label>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 max-h-36 overflow-y-auto space-y-2">
                      {services.map(srv => {
                        const isChecked = quickServices.includes(srv.id);
                        return (
                          <label key={srv.id} className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-zinc-300 hover:text-white">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setQuickServices(quickServices.filter(id => id !== srv.id));
                                } else {
                                  setQuickServices([...quickServices, srv.id]);
                                }
                              }}
                              className="accent-[#C7D5F0]"
                            />
                            <span>{srv.name} ({srv.durationMin} dk) - {srv.basePriceSec} ₺</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* General description */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 block">Açıklama / Mola Notu</label>
                <textarea
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder="Mola konusu veya seansla ilgli hatırlatıcı detaylar..."
                  rows={2.5}
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setShowQuickForm(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-white rounded text-xs font-bold uppercase transition"
                >
                  İptal Et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C7D5F0] hover:bg-[#b0c4eb] text-black rounded text-xs font-bold uppercase transition shadow-lg shadow-[#C7D5F0]/10"
                >
                  ✓ Takvime Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
