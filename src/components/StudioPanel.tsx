import React, { useState } from 'react';
import { Calendar as CalendarIcon, Users, Sliders, TrendingUp, Search, Plus, Edit, DollarSign, Clock, CheckCircle, AlertTriangle, ArrowRight, UserPlus, FileEdit, Trash, X, Phone, Image, Camera, Upload, Megaphone } from 'lucide-react';
import { Appointment, Artist, ServiceItem, CustomNotification, Studio, Announcement } from '../types';

interface StudioPanelProps {
  artists: Artist[];
  appointments: Appointment[];
  services: ServiceItem[];
  onUpdateServices: (updated: ServiceItem[]) => void;
  onUpdateAppointments: (updated: Appointment[]) => void;
  onOpenAppointmentDetail: (appId: string) => void;
  onAddNotification: (notif: CustomNotification) => void;
  studioUser?: { name: string; email: string; studioId?: string } | null;
  onUpdateStudioUser?: (user: { name: string; email: string }) => void;
  onUpdateArtists: (updatedArtists: Artist[]) => void;
  studios: Studio[];
  onUpdateStudios: (updatedStudios: Studio[]) => void;
  announcements?: Announcement[];
  onUpdateAnnouncements?: (updated: Announcement[]) => void;
}

export default function StudioPanel({
  artists: allArtists,
  appointments: allAppointments,
  services,
  onUpdateServices,
  onUpdateAppointments,
  onOpenAppointmentDetail,
  onAddNotification,
  studioUser,
  onUpdateStudioUser,
  onUpdateArtists,
  studios,
  onUpdateStudios,
  announcements = [],
  onUpdateAnnouncements = () => {},
}: StudioPanelProps) {
  const currentStudioId = studioUser?.studioId || 'studio_default';
  const artists = allArtists.filter(a => a.studioId === currentStudioId);
  const appointments = allAppointments.filter(apt => apt.studioId === currentStudioId);

  const [invitePhone, setInvitePhone] = useState('');
  const [inviteStatus, setInviteStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Studio Profile and administrator credentials edit state
  const currentStudio = studios?.find(st => st.id === currentStudioId);
  const [studioBranch, setStudioBranch] = useState(() => localStorage.getItem('studio_branch') || 'İzmir - Buca');
  const [isEditingStudioProfile, setIsEditingStudioProfile] = useState(false);
  const [editAdminName, setEditAdminName] = useState(studioUser?.name || 'Stüdyo Sorumlusu');
  const [editAdminEmail, setEditAdminEmail] = useState(studioUser?.email || 'studio@reserve.com');
  const [editBranchName, setEditBranchName] = useState(studioBranch);
  const [editAddress, setEditAddress] = useState('');
  const [editStudioName, setEditStudioName] = useState('');
  const [editStudioPhone, setEditStudioPhone] = useState('');

  const handleStartEditStudioProfile = () => {
    setEditAdminName(studioUser?.name || 'Stüdyo Sorumlusu');
    setEditAdminEmail(studioUser?.email || 'studio@reserve.com');
    setEditBranchName(currentStudio?.branch || studioBranch);
    setEditAddress(currentStudio?.address || '');
    setEditStudioName(currentStudio?.name || 'Tattoo Reserve');
    setEditStudioPhone(currentStudio?.phone || '0532 999 88 77');
    setIsEditingStudioProfile(true);
  };

  const handleSaveStudioProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAdminName || !editBranchName || !editStudioName) return;

    if (onUpdateStudioUser) {
      onUpdateStudioUser({
        name: editAdminName,
        email: editAdminEmail
      });
    }

    if (onUpdateStudios) {
      const updated = studios.map(st => {
        if (st.id === currentStudioId) {
          return {
            ...st,
            name: editStudioName,
            branch: editBranchName,
            address: editAddress,
            phone: editStudioPhone
          };
        }
        return st;
      });
      onUpdateStudios(updated);
    }

    setStudioBranch(editBranchName);
    localStorage.setItem('studio_branch', editBranchName);
    setIsEditingStudioProfile(false);

    onAddNotification({
      id: `ntf_branch_upd_${Date.now()}`,
      title: 'Stüdyo Profili Güncellendi 🏢',
      description: `Yönetici "${editAdminName}" şube veya yetkili adını güncelledi. Yeni şube: ${editBranchName}`,
      appointmentId: '',
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'portfolio_upload'
    });
  };

  // --- Studio Announcement Management Handlers ---
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;

    if (editingAnnId) {
      // Edit mode
      const updated = announcements.map((ann) => {
        if (ann.id === editingAnnId) {
          return {
            ...ann,
            title: newAnnTitle.trim(),
            content: newAnnContent.trim(),
            isPinned: newAnnIsPinned
          };
        }
        return ann;
      });
      onUpdateAnnouncements(updated);
      onAddNotification({
        id: `ntf_ann_edit_${Date.now()}`,
        title: '📢 Duyuru Güncellendi',
        description: `Stüdyo Duyurusu "${newAnnTitle.trim()}" başarıyla güncellendi.`,
        appointmentId: '',
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'status_change'
      });
    } else {
      // Create mode
      const newAnn: Announcement = {
        id: `ann_${Date.now()}`,
        title: newAnnTitle.trim(),
        content: newAnnContent.trim(),
        createdAt: new Date().toISOString(),
        isPinned: newAnnIsPinned,
        studioId: currentStudioId
      };
      onUpdateAnnouncements([newAnn, ...announcements]);
      onAddNotification({
        id: `ntf_ann_new_${Date.now()}`,
        title: '📢 Yeni Duyuru Yayınlandı!',
        description: `Müşteri paneli ana sayfasında en üstte görüntülenecek "${newAnnTitle.trim()}" duyurusu yayınlandı.`,
        appointmentId: '',
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'status_change'
      });
    }

    setNewAnnTitle('');
    setNewAnnContent('');
    setNewAnnIsPinned(false);
    setEditingAnnId(null);
    setShowAddAnnouncementForm(false);
  };

  const handleEditAnnouncementClick = (ann: Announcement) => {
    setEditingAnnId(ann.id);
    setNewAnnTitle(ann.title);
    setNewAnnContent(ann.content);
    setNewAnnIsPinned(!!ann.isPinned);
    setShowAddAnnouncementForm(true);
  };

  const handleDeleteAnnouncement = (id: string, titleStr: string) => {
    onUpdateAnnouncements(announcements.filter(a => a.id !== id));
    onAddNotification({
      id: `ntf_ann_del_${Date.now()}`,
      title: '🗑️ Duyuru Kaldırıldı',
      description: `"${titleStr}" başlıklı stüdyo duyurusu sistemden silindi.`,
      appointmentId: '',
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'status_change'
    });
  };

  const handleTogglePinAnnouncement = (id: string) => {
    onUpdateAnnouncements(announcements.map(a => a.id === id ? { ...a, isPinned: !a.isPinned } : a));
  };

  const handleAddGalleryImage = (url: string) => {
    if (!url) return;
    const currentList = currentStudio?.gallery || [];
    if (currentList.includes(url)) {
      setGalleryStatus({ type: 'error', text: 'Bu görsel zaten galeride kayıtlı.' });
      setTimeout(() => setGalleryStatus(null), 3000);
      return;
    }
    const updatedList = [...currentList, url];
    
    if (onUpdateStudios) {
      const updated = studios.map(st => {
        if (st.id === currentStudioId) {
          return {
            ...st,
            gallery: updatedList
          };
        }
        return st;
      });
      onUpdateStudios(updated);
    }
    setGalleryUrlInput('');
    setGalleryStatus({ type: 'success', text: 'Görsel başarıyla stüdyo galerisine eklendi!' });
    setTimeout(() => setGalleryStatus(null), 3000);
  };

  const handleRemoveGalleryImage = (urlToRemove: string) => {
    const currentList = currentStudio?.gallery || [];
    const updatedList = currentList.filter(img => img !== urlToRemove);
    
    if (onUpdateStudios) {
      const updated = studios.map(st => {
        if (st.id === currentStudioId) {
          return {
            ...st,
            gallery: updatedList
          };
        }
        return st;
      });
      onUpdateStudios(updated);
    }
    setGalleryStatus({ type: 'success', text: 'Görsel stüdyo galerisinden silindi.' });
    setTimeout(() => setGalleryStatus(null), 3000);
  };

  // Calendar timeline configuration
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('2026-06-10');
  const [appointmentFilter, setAppointmentFilter] = useState<'All' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Service management form state
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(1500);
  const [newServiceDuration, setNewServiceDuration] = useState(60);
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // Active sub-view options inside administration panel
  const [activeTab, setActiveTab] = useState<'schedule' | 'appointments' | 'services' | 'analytics' | 'gallery' | 'artists' | 'announcements'>('schedule');

  // Announcement management form state
  const [showAddAnnouncementForm, setShowAddAnnouncementForm] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnIsPinned, setNewAnnIsPinned] = useState(false);
  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);

  // Studio Interior Gallery management state
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [isGalleryDragActive, setIsGalleryDragActive] = useState(false);
  const [galleryStatus, setGalleryStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Quick Booking / Break Form Modal state
  const [showQuickForm, setShowQuickForm] = useState(false);
  const [quickArtistId, setQuickArtistId] = useState('');
  const [quickDate, setQuickDate] = useState('');
  const [quickTime, setQuickTime] = useState('');
  const [quickType, setQuickType] = useState<'appointment' | 'break'>('appointment');
  const [quickCustomerName, setQuickCustomerName] = useState('');
  const [quickCustomerPhone, setQuickCustomerPhone] = useState('');
  const [quickCustomerEmail, setQuickCustomerEmail] = useState('');
  const [quickNotes, setQuickNotes] = useState('');
  const [quickServices, setQuickServices] = useState<string[]>([]);

  const openQuickFormForSlot = (artistId: string, date: string, time: string) => {
    setQuickArtistId(artistId || (artists[0]?.id || ''));
    setQuickDate(date || '2026-06-10');
    setQuickTime(time || '10:00');
    setQuickType('appointment');
    setQuickCustomerName('');
    setQuickCustomerPhone('');
    setQuickCustomerEmail('');
    setQuickNotes('');
    setQuickServices([]);
    setShowQuickForm(true);
  };

  const handleQuickFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!quickArtistId) {
      alert('Lütfen bir sanatçı seçin.');
      return;
    }

    const chosenDateTime = new Date(`${quickDate}T${quickTime}:00`);
    if (chosenDateTime < new Date()) {
      alert('Geçmiş bir tarihe veya saate randevu / mola planlayamazsınız. Lütfen ileri bir tarih/saat seçin.');
      return;
    }

    const artistObj = artists.find(a => a.id === quickArtistId);
    if (!artistObj) return;

    if (quickType === 'break') {
      const newMola: Appointment = {
        id: `mola_${Date.now()}`,
        studioId: currentStudioId,
        customerName: '☕ MOLA / DİNLENME',
        customerPhone: '-',
        customerEmail: '-',
        artistId: quickArtistId,
        artistName: artistObj.name,
        date: quickDate,
        time: quickTime,
        services: [],
        notes: quickNotes || 'Planlı mola ve dinlenme saati.',
        status: 'Confirmed',
        clientImages: [],
        createdAt: new Date().toISOString(),
        totalPrice: 0,
        totalDuration: 60,
      };

      onUpdateAppointments([newMola, ...allAppointments]);
      onAddNotification({
        id: `ntf_mola_${Date.now()}`,
        title: 'Mola Saati Tanımlandı ☕',
        description: `${artistObj.name} için ${quickDate} - ${quickTime} dilimine mola eklendi.`,
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
        id: `apt_std_${Date.now()}`,
        studioId: currentStudioId,
        customerName: quickCustomerName,
        customerPhone: quickCustomerPhone || 'Numara Yok',
        customerEmail: quickCustomerEmail || 'E-posta Yok',
        artistId: quickArtistId,
        artistName: artistObj.name,
        date: quickDate,
        time: quickTime,
        services: quickServices,
        notes: quickNotes || 'Atölye yöneticisi tarafından kaydedildi.',
        status: 'Confirmed',
        clientImages: [],
        createdAt: new Date().toISOString(),
        totalPrice: 0,
        totalDuration: 60,
      };

      onUpdateAppointments([newApt, ...allAppointments]);
      onAddNotification({
        id: `ntf_apt_${Date.now()}`,
        title: 'Yeni Randevu Girişi 📅',
        description: `Yönetici, ${artistObj.name} için "${quickCustomerName}" adlı müşteriye randevu kaydetti.`,
        appointmentId: newApt.id,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'new_appointment'
      });
    }

    setShowQuickForm(false);
  };

  // Daily hours matrix
  const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  // Toggle/Manage services
  const handleAddNewService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName) return;

    const newSrv: ServiceItem = {
      id: `srv_${Date.now()}`,
      name: newServiceName,
      durationMin: Number(newServiceDuration),
      basePriceSec: Number(newServicePrice),
      description: newServiceDesc
    };

    onUpdateServices([...services, newSrv]);

    // Send Admin action notification
    onAddNotification({
      id: `ntf_srv_${Date.now()}`,
      title: 'Hizmet Menüsü Güncellendi ➕',
      description: `Yeni dövme seansı hizmeti eklendi: "${newServiceName}"`,
      appointmentId: '',
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'portfolio_upload'
    });

    // Reset Form
    setNewServiceName('');
    setNewServiceDesc('');
    setShowAddServiceForm(false);
  };

  const handleDeleteService = (srvId: string) => {
    if (confirm('Bu hizmeti silmek istediğinize emin misiniz?')) {
      onUpdateServices(services.filter(s => s.id !== srvId));
    }
  };

  // Switch Selected Date inside Header
  const DATES_ACCORDION = [
    { label: 'CMT', day: '6', full: '2026-06-06' },
    { label: 'PAZ', day: '7', full: '2026-06-07' },
    { label: 'PZT', day: '8', full: '2026-06-08' },
    { label: 'SAL', day: '9', full: '2026-06-09' },
    { label: 'ÇAR', day: '10', full: '2026-06-10' },
    { label: 'PER', day: '11', full: '2026-06-11' },
    { label: 'CUM', day: '12', full: '2026-06-12' },
  ];

  // Helper inside matrix to find matching appointment for an artist at a specific hour
  const findAppointmentInTimeline = (artistId: string, timeSlot: string) => {
    return appointments.find(apt => 
      apt.artistId === artistId && 
      apt.date === selectedCalendarDate && 
      apt.time === timeSlot &&
      apt.status !== 'Cancelled'
    );
  };

  // Analytics Calcs
  const totalRevenueEstimates = appointments
    .filter(a => a.status === 'Confirmed' || a.status === 'Completed')
    .reduce((sum, a) => sum + a.totalPrice, 0);

  const completedCount = appointments.filter(a => a.status === 'Completed').length;
  const pendingCount = appointments.filter(a => a.status === 'Pending').length;

  return (
    <div className="space-y-6" id="studio-panel-container">
      
      {/* Studio Header Ribbon */}
      <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 flex flex-col gap-6 relative overflow-hidden" id="studio-header-ribbon">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#C7D5F0]/5 rounded-full blur-2xl pointer-events-none" />

        {isEditingStudioProfile ? (
          <form onSubmit={handleSaveStudioProfile} className="space-y-4 relative z-10 w-full border-b border-zinc-900 pb-5">
            <h3 className="text-xs font-bold text-[#C7D5F0] uppercase tracking-wider font-rushel">Stüdyo & Şube Profil Bilgilerini Güncelle</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 block uppercase">Stüdyo Adı / Markası</label>
                <input
                  type="text"
                  value={editStudioName}
                  onChange={e => setEditStudioName(e.target.value)}
                  required
                  placeholder="Örn: Tattoo Reserve"
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 block uppercase">Kayıtlı Şube Adı / Bölge</label>
                <input
                  type="text"
                  value={editBranchName}
                  onChange={e => setEditBranchName(e.target.value)}
                  required
                  placeholder="Örn: Alsancak Şubesi"
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 block uppercase">Stüdyo Telefonu</label>
                <input
                  type="text"
                  value={editStudioPhone}
                  onChange={e => setEditStudioPhone(e.target.value)}
                  required
                  placeholder="Örn: 0532 ..."
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 block uppercase">Yönetici Adı</label>
                <input
                  type="text"
                  value={editAdminName}
                  onChange={e => setEditAdminName(e.target.value)}
                  required
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-zinc-400 block uppercase">Yönetici E-posta</label>
                <input
                  type="email"
                  value={editAdminEmail}
                  onChange={e => setEditAdminEmail(e.target.value)}
                  required
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-zinc-400 block uppercase">Tam Adres Tarifi (Google Haritalar & Müşteri Paneli İçin)</label>
              <textarea
                value={editAddress}
                onChange={e => setEditAddress(e.target.value)}
                placeholder="Örn: Kültür, Kıbrıs Şehitleri Cd. No:44, Kat:2 D:5, 35220 Alsancak, Konak/İzmir"
                required
                rows={2}
                className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingStudioProfile(false)}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded text-xs font-bold uppercase transition"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-[#C7D5F0] hover:bg-[#b0c4eb] text-black rounded text-xs font-bold uppercase transition shadow-lg shadow-[#C7D5F0]/15"
              >
                Bilgileri Kaydet
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10 w-full border-b border-zinc-900 pb-5">
            <div className="space-y-2.5 max-w-4xl">
              <h2 className="text-xl md:text-2xl font-black text-[#C7D5F0] font-rushel tracking-[0.12em] flex flex-wrap items-center gap-2.5 uppercase">
                <span>Stüdyo Yönetici Paneli</span>
                <span className="text-[10px] bg-[#C7D5F0]/10 text-[#C7D5F0] font-sans border border-[#C7D5F0]/20 px-2.5 py-0.5 rounded uppercase font-bold tracking-wider">
                  Şube: {studioBranch}
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-sans border border-emerald-500/20 px-2.5 py-0.5 rounded uppercase font-bold tracking-wider">
                  Yönetici: {studioUser?.name || 'Stüdyo Sorumlusu'}
                </span>
              </h2>
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">Atölyenizin operasyonel durumunu, sanatçı takvimlerini, şube profilinizi ve dövme taleplerini buradan yönetin.</p>
              <div className="text-[10px] text-zinc-500 font-mono">Yönetici E-posta: {studioUser?.email || 'studio@reserve.com'}</div>
              {currentStudio?.address && (
                <div className="text-[10.5px] text-zinc-400 font-sans mt-1">
                  <span className="font-mono text-[9px] text-[#C7D5F0] uppercase tracking-wider block">Kayıtlı Tam Adres:</span>
                  <span className="text-zinc-300">{currentStudio.address}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleStartEditStudioProfile}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-[#C7D5F0] text-xs font-bold uppercase tracking-wider rounded border border-[#C7D5F0]/20 hover:border-[#C7D5F0]/50 transition shrink-0 animate-pulse duration-1000 lg:self-center"
            >
              Şube & Yönetici Düzenle
            </button>
          </div>
        )}

        {/* Dashboard sub tabs switcher */}
        <div className="flex overflow-x-auto scrollbar-none gap-2 text-xs relative z-10 w-full pb-3 md:pb-0 md:flex-wrap scroll-smooth" id="studio-dashboard-tab-switcher">
          <button
            onClick={() => {
              openQuickFormForSlot(artists[0]?.id || '', selectedCalendarDate, '09:00');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C7D5F0] hover:bg-[#b0c4eb] text-black font-bold transition shadow-md shadow-[#C7D5F0]/10 mr-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Hızlı Randevu / Mola Ekle</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg border font-medium transition shrink-0 ${
              activeTab === 'schedule'
                ? 'bg-zinc-100 text-black border-white'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Zaman Çizelgesi</span>
          </button>
          
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg border font-medium transition shrink-0 ${
              activeTab === 'appointments'
                ? 'bg-zinc-100 text-black border-white'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Tüm Randevular ({appointments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg border font-medium transition shrink-0 ${
              activeTab === 'services'
                ? 'bg-zinc-100 text-black border-white'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Hizmet Menüsü</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg border font-medium transition shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-zinc-100 text-black border-white'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Analizler</span>
          </button>

          <button
            onClick={() => setActiveTab('artists')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg border font-medium transition shrink-0 ${
              activeTab === 'artists'
                ? 'bg-zinc-100 text-black border-white'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sanatçı Kadrosu ({artists.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg border font-medium transition shrink-0 ${
              activeTab === 'gallery'
                ? 'bg-zinc-100 text-black border-white'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Stüdyo Galerisi ({(currentStudio?.gallery || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg border font-medium transition shrink-0 ${
              activeTab === 'announcements'
                ? 'bg-zinc-100 text-black border-white font-bold'
                : 'bg-[#181a1d] text-[#C7D5F0] border-[#C7D5F0]/20 hover:text-white hover:border-[#C7D5F0]/40'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-[#C7D5F0]" />
            <span>Stüdyo Duyuruları ({announcements.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MATRIX SCHEDULE GRID */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          
          {/* Day / Date Navigation (Similar to the screenshots) */}
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                id="btn-day-prev"
                onClick={() => {
                  const currentIdx = DATES_ACCORDION.findIndex(d => d.full === selectedCalendarDate);
                  if (currentIdx > 0) setSelectedCalendarDate(DATES_ACCORDION[currentIdx - 1].full);
                }}
                className="p-1 px-2 bg-zinc-950 border border-zinc-800 rounded text-zinc-400 hover:text-white font-mono"
              >
                &lt;
              </button>
              <span className="font-bold font-sans text-sm text-zinc-200">
                {selectedCalendarDate} Günü Program Akışı
              </span>
              <button
                id="btn-day-next"
                onClick={() => {
                  const currentIdx = DATES_ACCORDION.findIndex(d => d.full === selectedCalendarDate);
                  if (currentIdx !== -1 && currentIdx < DATES_ACCORDION.length - 1) {
                    setSelectedCalendarDate(DATES_ACCORDION[currentIdx + 1].full);
                  }
                }}
                className="p-1 px-2 bg-zinc-950 border border-zinc-800 rounded text-zinc-400 hover:text-white font-mono"
              >
                &gt;
              </button>
            </div>

            {/* CMT, PAZ, etc row */}
            <div className="flex gap-1">
              {DATES_ACCORDION.map(item => (
                <button
                  key={item.full}
                  onClick={() => setSelectedCalendarDate(item.full)}
                  className={`px-3 py-1.5 rounded-lg border flex flex-col items-center transition ${
                    selectedCalendarDate === item.full
                      ? 'bg-[#C7D5F0] border-white text-black shadow-lg shadow-[#C7D5F0]/15 font-bold'
                      : 'bg-zinc-950 border-zinc-850 hover:border-zinc-700 text-zinc-400 text-xs'
                  }`}
                >
                  <span className="text-[9px] font-mono opacity-85">{item.label}</span>
                  <span className="text-xs font-semibold">{item.day}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Flow Matrix Grid (Artists columns as headers, Time slots on rows) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
            
            {/* Column Headers */}
            <div className="grid grid-cols-4 bg-zinc-950/80 p-4 border-b border-zinc-800 font-bold text-xs uppercase tracking-wider text-zinc-400 font-mono text-center">
              <div className="text-left">Saat Dilimi</div>
              {artists.map(art => (
                <div key={art.id} className="flex items-center justify-center gap-2">
                  <img src={art.avatar} alt={art.name} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                  <span className="text-zinc-200 truncate">{art.name}</span>
                </div>
              ))}
            </div>

            {/* Matrix Slots */}
            <div className="divide-y divide-zinc-800">
              {TIME_SLOTS.map(slot => (
                <div key={slot} className="grid grid-cols-4 items-center p-3.5 hover:bg-zinc-950/30 text-center">
                  
                  {/* Left row header */}
                  <div className="text-left font-mono font-bold text-xs text-[#C7D5F0]">{slot}</div>

                  {/* Columns for each artist */}
                  {artists.map(art => {
                    const matchedApt = findAppointmentInTimeline(art.id, slot);
                    
                    return (
                      <div key={art.id} className="px-1.5 h-9">
                        {matchedApt ? (
                          (() => {
                            const isMola = matchedApt.customerName.includes('MOLA');
                            return (
                              <div
                                onClick={() => onOpenAppointmentDetail(matchedApt.id)}
                                className={`h-full text-left rounded-lg p-1.5 px-2.5 text-[10px] truncate cursor-pointer transition border hover:scale-[1.02] flex items-center justify-between ${
                                  isMola
                                    ? 'bg-[#151515] hover:bg-zinc-900 border-zinc-700/50 text-[#C7D5F0]/80'
                                    : matchedApt.status === 'Pending'
                                    ? 'bg-[#C7D5F0]/5 hover:bg-[#C7D5F0]/10 text-white border-[#C7D5F0]/30'
                                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                }`}
                                title={isMola ? 'Sanatçı için mola süresi. Detaylar için tıklayın.' : `Müşteri: ${matchedApt.customerName}. Detaylar için tıklayın.`}
                              >
                                <span className="font-bold truncate">{matchedApt.customerName}</span>
                                <span className="text-[8px] font-mono uppercase bg-zinc-900/60 p-0.5 px-1 rounded">
                                  {isMola ? 'Mola' : matchedApt.status === 'Pending' ? 'Talep' : 'Aktif'}
                                </span>
                              </div>
                            );
                          })()
                        ) : (
                          <button
                            onClick={() => openQuickFormForSlot(art.id, selectedCalendarDate, slot)}
                            className="w-full h-full border border-dashed border-zinc-800 hover:border-[#C7D5F0]/50 bg-transparent hover:bg-zinc-950/40 rounded-lg flex items-center justify-center text-[10px] text-zinc-500 hover:text-[#C7D5F0] font-sans transition cursor-pointer"
                          >
                            + Ekle / Mola
                          </button>
                        )}
                      </div>
                    );
                  })}

                </div>
              ))}
            </div>

          </div>

          <p className="text-[10.5px] text-zinc-500 italic text-center font-mono">
            💡 Dolu bloklara tıklayarak o saatteki randevu detaylarını görebilir ve durum güncellemesi (Onayla/Kapat/Reddet) yapabilirsiniz.
          </p>
        </div>
      )}

      {/* VIEW 2: DETAILED APPOINTMENTS LIST */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          
          {/* Filters Bar & Search input */}
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col md:flex-row justify-between gap-4">
            
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {(['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setAppointmentFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    appointmentFilter === tab
                      ? 'bg-[#C7D5F0] border-white text-black font-semibold'
                      : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab === 'All' && 'Hepsi'}
                  {tab === 'Pending' && 'Bekleyenler'}
                  {tab === 'Confirmed' && 'Onaylılar'}
                  {tab === 'Completed' && 'Tamamlananlar'}
                  {tab === 'Cancelled' && 'İptaller'}
                </button>
              ))}
            </div>

            {/* Search inputs */}
            <div className="relative max-w-sm w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Müşteri adı, mail veya telefon ara..."
                className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-[#C7D5F0] rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:outline-none transition"
              />
            </div>
          </div>

          {/* List Table Container */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 bg-zinc-950/70 border-b border-zinc-800 text-xs text-zinc-400 font-mono font-bold flex items-center justify-between">
              <span>Sıralama: En Yeni Randevular Sırada</span>
              <span>Sayfa: 1 limit</span>
            </div>

            <div className="divide-y divide-zinc-800/70 max-h-[750px] overflow-y-auto">
              {appointments
                .filter(a => {
                  const matchesStatus = appointmentFilter === 'All' || a.status === appointmentFilter;
                  const matchesSearch = 
                    a.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.customerPhone.includes(searchQuery) ||
                    a.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
                  return matchesStatus && matchesSearch;
                })
                .sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())
                .map(apt => (
                  <div key={apt.id} className="p-4 hover:bg-zinc-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#C7D5F0]">{apt.date} at {apt.time}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-xs font-bold text-zinc-100">{apt.customerName}</span>
                      </div>
                      <p className="text-xs text-zinc-400">
                        Sanatçı: <span className="font-semibold text-zinc-300">{apt.artistName}</span>
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Durum: Detaylar & Fiyat Yüz Yüze Planlanacak
                      </p>
                      {apt.status === 'Cancelled' && apt.cancelReason && (
                        <p className="text-[10px] text-rose-400 bg-rose-950/20 border border-rose-500/10 px-2 py-1 rounded mt-1.5 italic inline-block">
                          İptal Nedeni: {apt.cancelReason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                        apt.status === 'Pending' ? 'bg-[#C7D5F0]/5 text-[#C7D5F0] border-[#C7D5F0]/20' :
                        apt.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        apt.status === 'Completed' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {apt.status === 'Pending' ? 'Bekliyor' :
                         apt.status === 'Confirmed' ? 'Onaylı' :
                         apt.status === 'Completed' ? 'Tamamlandı' : 'İptal'}
                      </span>

                      <button
                        id={`btn-open-detail-${apt.id}`}
                        onClick={() => onOpenAppointmentDetail(apt.id)}
                        className="p-1 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded text-[10px] font-bold uppercase transition"
                      >
                        Detaylar & Notlar
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`"${apt.customerName}" randevu veya mola kaydını sistemden kalıcı olarak silmek istediğinize emin misiniz?`)) {
                            onUpdateAppointments(allAppointments.filter(a => a.id !== apt.id));
                            onAddNotification({
                              id: `ntf_del_${Date.now()}`,
                              title: 'Randevu Silindi 🗑️',
                              description: `Yönetici tarafından "${apt.customerName}" kaydı sistemden kalıcı olarak silindi.`,
                              appointmentId: '',
                              timestamp: new Date().toISOString(),
                              isRead: false,
                              type: 'status_change'
                            });
                          }
                        }}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-md transition border border-rose-500/20 hover:scale-105"
                        title="Kayıt Sil"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 3: THE SERVICES CATALOG EDITOR */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: Catalog List (8 cols) */}
          <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-6 space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">Mevcut Seans Menüsü</h3>
            
            <div className="space-y-3">
              {services.map((srv) => (
                <div key={srv.id} className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800/40 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-white block">{srv.name}</span>
                    <p className="text-[11px] text-zinc-400 max-w-md mt-1 italic leading-normal">
                      {srv.description}
                    </p>
                    <div className="flex gap-4 text-[10px] text-zinc-500 font-mono mt-2">
                      <span>Tip: Standart Rezerve seansı</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-3">
                    <span className="text-xs font-semibold text-zinc-400 block">Kişiye Özel Fiyat</span>
                    
                    {/* Delete service */}
                    <button
                      onClick={() => handleDeleteService(srv.id)}
                      className="p-1 text-zinc-500 hover:text-rose-500 rounded transition"
                      title="Sil"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right panel: Add service creator form (4 cols) */}
          <div className="lg:col-span-4 bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#C7D5F0]" />
              <span>Yeni Hizmet Ekle</span>
            </h3>
            <p className="text-[11px] text-zinc-400 leading-normal">Buraya ekleyeceğiniz dövme seans tipleri müşterilerin randevu formunda anında görünür hale gelir.</p>

            <form onSubmit={handleAddNewService} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-mono block">Sekme Başlığı (Örn: Minimal Tribal)</label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Başlık girin..."
                  required
                  className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                />
              </div>

              <div className="space-y-1 hidden">
                <input
                  type="number"
                  value={newServiceDuration}
                  onChange={(e) => setNewServiceDuration(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-mono block">Hizmet Detaylı Açıklaması</label>
                <textarea
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                  placeholder="Kullanıcıları bilgilendirecek açıklamayı girin..."
                  rows={3}
                  className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#C7D5F0] hover:bg-[#b0c4eb] text-black font-bold text-xs uppercase tracking-wider rounded transition"
              >
                HİZMET KARTINI EKLE
              </button>
            </form>
          </div>

        </div>
      )}

      {/* VIEW 4: STATISTICS & EARNING ANALYSIS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 font-mono tracking-widest block uppercase">Toplam Randevu Talebi</span>
              <div className="text-2xl font-black text-[#C7D5F0] font-mono">
                {appointments.length} Seans
              </div>
              <p className="text-[10px] text-zinc-500">Sistemde oluşturulmuş toplam başvuru sayısı.</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 font-mono tracking-widest block uppercase">Tamamlanan Projeler</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">{completedCount} Dövme</div>
              <p className="text-[10px] text-zinc-500">Kusursuz teslim edilip arşive gönderilenler.</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 font-mono tracking-widest block uppercase">Sıradaki Bekleyenler</span>
              <div className="text-2xl font-black text-white/95 font-mono">{pendingCount} Randevu</div>
              <p className="text-[10px] text-zinc-500">Aktif onay bekleyen kollar/seanslar.</p>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider font-mono">En Çok Rezerve Edilen Dövmeci Dağılımı</h3>
            <div className="space-y-3.5">
              {artists.map(art => {
                const count = appointments.filter(a => a.artistId === art.id).length;
                const percentage = appointments.length > 0 ? (count / appointments.length) * 100 : 0;
                
                return (
                  <div key={art.id} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="font-bold">{art.name}</span>
                      <span className="font-mono text-zinc-400">{count} Randevu ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-zinc-950 h-2 rounded overflow-hidden border border-zinc-850">
                      <div 
                        className="bg-[#C7D5F0] h-full rounded transition" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 5: ARTIST CADRO ROSTER MANAGEMENT */}
      {activeTab === 'artists' && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-[#C7D5F0]" />
              <span>Telefon ile Yeni Sanatçı Ekle & Kadroya Davet Et</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Sisteme yeni kayıt olmuş olan bağımsız bir dövme sanatçısını cep telefonu numarası ile arayıp stüdyonuz bünyesine katılması için davet edebilirsiniz. Sanatçı onayladığı anda eski stüdyo ve zaman çizelgelerinden silinerek stüdyonuza dahil olur.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setInviteStatus(null);
                if (!invitePhone) return;

                // Find the artist by phone
                const matchedArtist = allArtists.find(a => a.phone === invitePhone || (a.phone && a.phone.replace(/\s+/g, '') === invitePhone.replace(/\s+/g, '')));
                if (!matchedArtist) {
                  setInviteStatus({
                    type: 'error',
                    text: 'Aradığınız telefon numarasına kayıtlı bir dövme sanatçısı bulunamadı. Lütfen numarayı doğru formatta yazdığınızdan (Örn: 0532 ...) veya sanatçının kayıt olduğundan emin olun.'
                  });
                  return;
                }

                if (matchedArtist.studioId === currentStudioId) {
                  setInviteStatus({
                    type: 'error',
                    text: `Bu sanatçı (${matchedArtist.name}) zaten şuan aktif stüdyonuz bünyesinde yer almaktadır.`
                  });
                  return;
                }

                // Create dynamic notification containing the link request
                onAddNotification({
                  id: `ntf_invite_${Date.now()}`,
                  title: '🏢 Stüdyo Daveti Alındı!',
                  description: `"${studioBranch}" stüdyosu seni şubeler kadrosuna eklemek istiyor. Kabul ettiğin takdirde eski stüdyonuzdan ve tüm randevularınızdan tamamen silinerek bu stüdyoya bağlanacaksınız.`,
                  appointmentId: '', 
                  timestamp: new Date().toISOString(),
                  isRead: false,
                  type: 'studio_invite'
                });

                // Set local storage invite registry so artist's panel can show/act on it
                const registry = JSON.parse(localStorage.getItem('studio_invites') || '[]');
                const newInvite = {
                  id: `inv_${Date.now()}`,
                  studioId: currentStudioId,
                  studioName: studioBranch,
                  artistId: matchedArtist.id,
                  artistName: matchedArtist.name,
                  status: 'pending',
                  timestamp: new Date().toISOString()
                };
                localStorage.setItem('studio_invites', JSON.stringify([...registry, newInvite]));

                setInviteStatus({
                  type: 'success',
                  text: `Davet "${matchedArtist.name}" adlı sanatçıya başarıyla gönderildi! Sanatçı kendi panelinde bu teklifi onayladığında kadronuza katılmış olacaktır.`
                });
                setInvitePhone('');
              }}
              className="flex flex-col sm:flex-row gap-3 items-end"
            >
              <div className="flex-1 space-y-1">
                <label className="text-[10px] uppercase font-mono text-zinc-400 tracking-wider">Sanatçının Kayıtlı Telefon Numarası</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    required
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    placeholder="Örn: 0532 123 45 67"
                    className="w-full text-xs bg-zinc-950 border border-zinc-805 rounded-lg py-2.5 pl-10 pr-3 text-white focus:outline-none focus:border-[#C7D5F0] transition"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition"
              >
                Kadro Daveti Gönder
              </button>
            </form>

            {inviteStatus && (
              <div className={`p-4 rounded-xl text-xs font-semibold ${inviteStatus.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
                {inviteStatus.text}
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
              Aktif Sanatçı Kadrosu ({artists.length})
            </h3>
            {artists.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-4">Bu şubede henüz kayıtlı sanatçı bulunmamaktadır. Telefon numarası ile davet göndererek sanatçı ekleyebilirsiniz.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {artists.map(art => {
                  const artApts = appointments.filter(a => a.artistId === art.id);
                  return (
                    <div key={art.id} className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 flex items-start gap-4 hover:border-zinc-700 transition">
                      <img
                        src={art.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&q=80'}
                        alt={art.name}
                        className="w-12 h-12 rounded-full object-cover border border-zinc-850"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-white">{art.name}</h4>
                          <span className="text-[9px] bg-[#C7D5F0]/10 text-[#C7D5F0] border border-[#C7D5F0]/20 rounded-full px-2 py-0.5 font-mono">{art.title}</span>
                        </div>
                        <p className="text-xs text-zinc-400 line-clamp-1">{art.bio}</p>
                        <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500">
                          <span>📱 {art.phone || 'Telefon Kaydı Yok'}</span>
                          <span className="font-mono text-zinc-400">{artApts.length} Randevu / Mola</span>
                        </div>
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => {
                              if (confirm(`"${art.name}" adlı sanatçıyı stüdyonuz kadrosundan tamamen çıkarmak istediğinize emin misiniz?`)) {
                                const updatedArtists = allArtists.map(a => a.id === art.id ? { ...a, studioId: '' } : a);
                                onUpdateArtists(updatedArtists);
                                onAddNotification({
                                  id: `ntf_remove_${Date.now()}`,
                                  title: 'Sanatçı Kadrodan Çıkarıldı 💨',
                                  description: `"${art.name}" stüdyo şubesinden çıkarılarak tekrar bağımsız statüye alındı.`,
                                  appointmentId: '',
                                  timestamp: new Date().toISOString(),
                                  isRead: false,
                                  type: 'status_change'
                                });
                              }
                            }}
                            className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase tracking-wider"
                          >
                            Kadrodan Çıkar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 5: STUDIO INTERIOR GALLERY */}
      {activeTab === 'gallery' && (
        <div className="space-y-6 animate-fade-in" id="studio-gallery-tab-view">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-5">
              <div>
                <h3 className="text-base font-black text-white font-serif uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#C7D5F0]" />
                  <span>Stüdyo Salon & İç Mekan Galerisi</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Müşterilerinizin stüdyo ortamınızı, steril çalışma odalarını, bekleme salonunu ve dekorasyonu görüp güvenle rezervasyon yapmaları için fotoğraflar yükleyin.
                </p>
              </div>
              <div className="text-[11px] font-mono text-[#C7D5F0] bg-[#C7D5F0]/10 border border-[#C7D5F0]/20 px-3 py-1 rounded-full shrink-0">
                Toplam Görsel: {(currentStudio?.gallery || []).length} Adet
              </div>
            </div>

            {/* Gallery Status feedback */}
            {galleryStatus && (
              <div className={`p-4 rounded-xl text-xs font-bold font-sans flex items-center gap-2 ${
                galleryStatus.type === 'success' 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {galleryStatus.type === 'success' ? '✔' : '⚠'} {galleryStatus.text}
              </div>
            )}

            {/* ADD PHOTO INTERFACE: TWO WAY (URL OR HIGH-QUALITY FILE BASE64 Uploader + Presets) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Drag-Drop / File input block */}
              <div 
                onDragEnter={(e) => { e.preventDefault(); setIsGalleryDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsGalleryDragActive(false); }}
                onDragOver={(e) => { e.preventDefault(); setIsGalleryDragActive(true); }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsGalleryDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0];
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (typeof reader.result === 'string') {
                        handleAddGalleryImage(reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center transition-all ${
                  isGalleryDragActive 
                    ? 'border-[#C7D5F0] bg-[#C7D5F0]/5' 
                    : 'border-zinc-800 bg-zinc-950/40 hover:border-zinc-700'
                }`}
              >
                <Upload className="w-8 h-8 text-zinc-400 mb-3 animate-bounce" style={{ animationDuration: '3s' }} />
                <span className="text-xs text-white font-bold block mb-1">Yeni İç Mekan Fotoğrafı Yükle</span>
                <p className="text-[10px] text-zinc-500 max-w-xs mb-4">Cihazınızdan bir fotoğraf sürükleyip bırakın veya seçin.</p>
                <label className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-[#C7D5F0]/40 text-xs text-[#C7D5F0] uppercase tracking-wider font-bold rounded-xl cursor-pointer transition">
                  Dosya Seç
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            handleAddGalleryImage(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden" 
                  />
                </label>
              </div>

              {/* Paste URL or Choose Unsplash Presets */}
              <div className="bg-zinc-950/40 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">ALTERNATİF GÖRSEL LİNKİ EKLE</span>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wide block">Görsel (Image) Web URL Bağlantısı</label>
                    <div className="flex gap-2">
                      <input 
                        type="url" 
                        placeholder="Örn: https://images.unsplash.com/photo-..." 
                        value={galleryUrlInput}
                        onChange={(e) => setGalleryUrlInput(e.target.value)}
                        className="w-full text-xs bg-black border border-zinc-800 rounded-xl p-2.5 text-white pr-2.5 focus:outline-none focus:border-[#C7D5F0] transition"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          if (!galleryUrlInput) {
                            alert('Lütfen geçerli bir internet bağlantısı giriniz.');
                            return;
                          }
                          handleAddGalleryImage(galleryUrlInput);
                        }}
                        className="bg-[#C7D5F0] hover:bg-[#b0c4eb] text-black px-4 text-xs font-bold uppercase rounded-xl transition cursor-pointer"
                      >
                        Ekle
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-900">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest block">HAZIR PREMIUM STÜDYO İÇ MEKAN ŞABLONLARI</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddGalleryImage('https://images.unsplash.com/photo-1621600411688-4be93cc685e5?w=800&auto=format&fit=crop&q=80')}
                      className="bg-zinc-900/60 border border-zinc-800 hover:border-[#C7D5F0]/30 hover:bg-zinc-900 p-2 rounded-xl text-left text-[11px] text-zinc-300 transition cursor-pointer"
                    >
                      🏬 Çalışma Alanı
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddGalleryImage('https://images.unsplash.com/photo-1605497746444-17f18b52fb82?w=800&auto=format&fit=crop&q=80')}
                      className="bg-zinc-900/60 border border-zinc-800 hover:border-[#C7D5F0]/30 hover:bg-zinc-900 p-2 rounded-xl text-left text-[11px] text-zinc-300 transition cursor-pointer"
                    >
                      🛋️ Bekleme Salonu
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddGalleryImage('https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=800&auto=format&fit=crop&q=80')}
                      className="bg-zinc-900/60 border border-zinc-800 hover:border-[#C7D5F0]/30 hover:bg-zinc-900 p-2 rounded-xl text-left text-[11px] text-zinc-300 transition cursor-pointer"
                    >
                      🎨 Detay Köşesi
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddGalleryImage('https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800&auto=format&fit=crop&q=80')}
                      className="bg-zinc-900/60 border border-zinc-800 hover:border-[#C7D5F0]/30 hover:bg-zinc-900 p-2 rounded-xl text-left text-[11px] text-zinc-300 transition cursor-pointer"
                    >
                      ☕ Misafirlere Bar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RENDER CURRENT GALLERY PHOTOS */}
            <div className="space-y-3.5 pt-4 border-t border-white/5">
              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block font-bold">KAYITLI ATÖLYE GÖRSELLERİ</span>
              
              {(!currentStudio?.gallery || currentStudio.gallery.length === 0) ? (
                <div className="text-center p-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20">
                  <Image className="w-10 h-10 text-zinc-650 mx-auto mb-3 opacity-30" />
                  <p className="text-xs text-zinc-500 italic">Galeriniz henüz boş. Yukarından ilk iç mekan fotoğrafını yükleyebilir veya şablonlara tıklayabilirsiniz.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {currentStudio.gallery.map((imgUrl, idx) => (
                    <div 
                      key={idx} 
                      className="group relative bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden aspect-video transition-all duration-300 hover:border-zinc-600 shadow-lg hover:shadow-[#C7D5F0]/5"
                    >
                      <img 
                        src={imgUrl} 
                        alt="Stüdyo İç Mekan Fotoğrafı" 
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-200 flex flex-col justify-between p-3" />
                      
                      {/* Delete icon badge */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Bu iç mekan görselini stüdyo galerisinden kaldırmak istediğinize emin misiniz?')) {
                            handleRemoveGalleryImage(imgUrl);
                          }
                        }}
                        className="absolute top-2.5 right-2.5 p-2 bg-red-950/90 hover:bg-red-800 border border-red-500/30 text-red-400 hover:text-white rounded-xl shadow-2xl transition overflow-hidden cursor-pointer"
                        title="Fotoğrafı Galeriden Sil"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>

                      {/* Number tag */}
                      <span className="absolute bottom-2.5 left-2.5 bg-zinc-950/90 border border-white/10 px-2 py-0.5 rounded-lg text-[10px] text-zinc-400 font-mono select-none">
                        Foto #{(idx + 1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 6: STUDIO ANNOUNCEMENTS MANAGEMENT */}
      {activeTab === 'announcements' && (
        <div className="space-y-6 animate-fade-in" id="studio-announcements-tab-view">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-5">
              <div>
                <h3 className="text-base font-black text-white font-serif uppercase tracking-wider flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-[#C7D5F0]" />
                  <span>Stüdyo Duyuruları Yönetimi</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-1 mb-0">
                  Müşteri paneli ana sayfasında en üstte görüntülenecek stüdyo duyurularını, çalışma güncellemelerini ve kampanyaları buradan ekleyin veya silin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingAnnId(null);
                  setNewAnnTitle('');
                  setNewAnnContent('');
                  setNewAnnIsPinned(false);
                  setShowAddAnnouncementForm(!showAddAnnouncementForm);
                }}
                className="px-4 py-2 bg-[#C7D5F0] hover:bg-[#b0c4eb] text-black text-xs uppercase tracking-wider font-bold rounded-xl flex items-center gap-1.5 transition shrink-0"
              >
                {showAddAnnouncementForm ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span>Vazgeç</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Duyuru Yayınla</span>
                  </>
                )}
              </button>
            </div>

            {/* ADD / EDIT ANNOUNCEMENT FORM */}
            {showAddAnnouncementForm && (
              <form onSubmit={handleSaveAnnouncement} className="bg-zinc-950/50 border border-zinc-850 p-5 rounded-2xl space-y-4 animate-fade-in">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest block font-bold">
                  {editingAnnId ? '📌 Duyuruyu Düzenle' : '🆕 Yeni Duyuru Ekle'}
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-300 font-bold uppercase tracking-wide block">Duyuru Başlığı</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Yeni Sanatçımız Selen Katıldı!"
                      value={newAnnTitle}
                      onChange={(e) => setNewAnnTitle(e.target.value)}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#C7D5F0] transition"
                    />
                  </div>

                  <div className="flex items-end pb-3">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-zinc-300 hover:text-white">
                      <input
                        type="checkbox"
                        checked={newAnnIsPinned}
                        onChange={(e) => setNewAnnIsPinned(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 accent-[#C7D5F0] cursor-pointer"
                      />
                      <span className="font-medium font-sans">Müşteri Ana Sayfasında Duyuruyu Sabitle (📌 🌟)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-300 font-bold uppercase tracking-wide block">Duyuru İçeriği</label>
                  <textarea
                    required
                    placeholder="Müşterilerinize iletmek istediğiniz detaylı mesaj veya kampanya açıklaması..."
                    value={newAnnContent}
                    onChange={(e) => setNewAnnContent(e.target.value)}
                    rows={4}
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-[#C7D5F0] transition"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAnnId(null);
                      setNewAnnTitle('');
                      setNewAnnContent('');
                      setNewAnnIsPinned(false);
                      setShowAddAnnouncementForm(false);
                    }}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 hover:text-white rounded-xl text-xs transition uppercase tracking-wider font-semibold text-zinc-400"
                  >
                    Kapat
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#C7D5F0] hover:bg-[#b0c4eb] text-black font-semibold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-[#C7D5F0]/10"
                  >
                    {editingAnnId ? '💾 Güncellemeyi Kaydet' : '📣 Duyuru Yayınla'}
                  </button>
                </div>
              </form>
            )}

            {/* LIST ACTIVE ANNOUNCEMENTS */}
            <div className="space-y-4">
              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block font-bold">STÜDYO PANOSUNDAKİ TÜM DUYURULAR</span>

              {announcements.length === 0 ? (
                <div className="text-center p-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20">
                  <Megaphone className="w-10 h-10 text-zinc-650 mx-auto mb-3 opacity-30 animate-pulse" />
                  <p className="text-xs text-zinc-500 italic font-sans">Yayınlanmış herhangi bir stüdyo duyurusu bulunmuyor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {announcements.map((ann) => {
                    const formattedDate = new Date(ann.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    return (
                      <div
                        key={ann.id}
                        className={`p-5 rounded-2xl border flex flex-col justify-between transition relative overflow-hidden backdrop-blur-sm ${
                          ann.isPinned
                            ? 'bg-[#C7D5F0]/5 border-[#C7D5F0]/30 shadow-lg shadow-[#C7D5F0]/5'
                            : 'bg-zinc-950/30 border-zinc-800'
                        }`}
                      >
                        {ann.isPinned && (
                          <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#C7D5F0] text-black px-2 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider uppercase">
                            📌 Sabitlendi
                          </div>
                        )}

                        <div className="space-y-2 pr-12">
                          <h4 className="text-sm font-black text-white font-sans">{ann.title}</h4>
                          <p className="text-xs text-zinc-400 font-sans leading-relaxed whitespace-pre-line">{ann.content}</p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {formattedDate}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleTogglePinAnnouncement(ann.id)}
                              className={`p-1.5 rounded transition ${
                                ann.isPinned
                                  ? 'text-[#C7D5F0] bg-[#C7D5F0]/10 hover:bg-[#C7D5F0]/25'
                                  : 'text-zinc-500 bg-zinc-900 hover:text-zinc-300 hover:bg-zinc-800'
                              }`}
                              title={ann.isPinned ? "Duyuru Sabitini Kaldır" : "Müşteri Panelinde Sabitle"}
                            >
                              🌟
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditAnnouncementClick(ann)}
                              className="p-1.5 rounded text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition"
                              title="Duyuruyu Düzenle"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Bu duyuruyu tamamen silmek istediğinize emin misiniz?')) {
                                  handleDeleteAnnouncement(ann.id, ann.title);
                                }
                              }}
                              className="p-1.5 rounded text-red-400 hover:text-white bg-zinc-900 hover:bg-zinc-850 transition"
                              title="Sil"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                  <h3 className="text-sm font-bold text-white font-rushel tracking-[0.12em] uppercase">Hızlı Randevu & Mola Kaydet</h3>
                  <p className="text-[10px] text-zinc-400">Yönetici paneli üzerinden hızlı takvim planlaması yapın.</p>
                </div>
              </div>
              <button
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
                    <span>Dövme Randevusu Ekle</span>
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
                    <span>Mola / Dinlenme Girişi</span>
                  </button>
                </div>
              </div>

              {/* Grid: Artist, Date, Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 block">Dövme Sanatçısı</label>
                  <select
                    value={quickArtistId}
                    onChange={(e) => setQuickArtistId(e.target.value)}
                    required
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-300 focus:outline-none focus:border-[#C7D5F0]"
                  >
                    <option value="">Seçiniz...</option>
                    {artists.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 block">Tarih</label>
                  <input
                    type="date"
                    value={quickDate}
                    onChange={(e) => setQuickDate(e.target.value)}
                    required
                    className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 block">Saat Dilimi</label>
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
                  <p className="text-[11px] text-zinc-400">Müşterinin iletişim ve seans bilgilerini doldurun.</p>
                  
                  {/* Customer Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-zinc-400 block">Müşteri Ad Söyleyd</label>
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
                      <label className="text-[10px] font-mono text-zinc-400 block">Telefon Numarası</label>
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
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                    />
                  </div>

                  {/* Services select list checkable */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-zinc-400 block">Seçilecek Seans Hizmetleri</label>
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
                            <span>{srv.name} (Kişiye Özel Planlama)</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Notes / Explanation */}
              <div className="space-y-1 pt-2">
                <label className="text-[10px] font-mono text-zinc-400 block font-semibold">
                  {quickType === 'break' ? 'Mola Nedeni / Açıklaması' : 'Atölye ve Randevu Notları'}
                </label>
                <textarea
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder={quickType === 'break' ? 'Örn: Yemek molası, dinlenme saati veya dükkan dışı tasarım çalışması.' : 'Müşterinin istediği dövme detayları veya özel randevu direktifleri...'}
                  rows={2}
                  className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                />
              </div>

              {/* Submit Row */}
              <div className="pt-3 border-t border-zinc-850 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setShowQuickForm(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 hover:text-white rounded text-xs transition uppercase tracking-wider font-semibold"
                >
                  Geri Dön
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C7D5F0] hover:bg-[#b0c4eb] text-black font-bold text-xs uppercase tracking-wider rounded transition shadow-lg shadow-[#C7D5F0]/10"
                >
                  {quickType === 'break' ? '☕ MOLAYI KAYDET' : '📅 RANDEVUYU KAYDET'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
