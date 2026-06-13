import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, User, Phone, Mail, Image, FileText, Check, Star, ShieldAlert, Sparkles, Plus, Trash2, ArrowRight, Upload, Heart, MessageCircle, Instagram, Grid, Search, MapPin, Copy, ExternalLink, Navigation, Compass, ZoomIn, ZoomOut, Layers, Megaphone, Share2 } from 'lucide-react';
import { Artist, ServiceItem, Appointment, CustomNotification, Studio, Announcement } from '../types';
import { INITIAL_SERVICES, INITIAL_ARTISTS, SAMPLE_CLIENT_IDEAS } from '../data';

interface CustomerPanelProps {
  artists: Artist[];
  appointments: Appointment[];
  services: ServiceItem[];
  onAddAppointment: (newApt: Appointment) => void;
  onCancelAppointment: (id: string, reason?: string) => void;
  onAddNotification: (notif: CustomNotification) => void;
  customerUser?: { name: string; email: string; phone: string } | null;
  onUpdateCustomerUser?: (user: { name: string; email: string; phone: string }) => void;
  studios: Studio[];
  announcements?: Announcement[];
}

export default function CustomerPanel({
  artists,
  appointments,
  services,
  onAddAppointment,
  onCancelAppointment,
  onAddNotification,
  customerUser,
  onUpdateCustomerUser,
  studios,
  announcements = [],
}: CustomerPanelProps) {
  // Studio Selection state (default to first studio)
  const [selectedStudioId, setSelectedStudioId] = useState(studios[0]?.id || 'studio_default');

  // Mobile Active Tab selection to switch views responsively and look 100% like a native mobile app
  const [mobileActiveTab, setMobileActiveTab] = useState<'booking' | 'appointments'>('booking');

  // Announcement copy sharing state (shares feedback tooltip)
  const [copiedAnnId, setCopiedAnnId] = useState<string | null>(null);

  // Artist search query filter by artist name or studio/branch name
  const [artistSearchQuery, setArtistSearchQuery] = useState('');

  // Filter artists based on selected studio & search query
  const filteredArtists = artists.filter(a => {
    const matchesStudio = a.studioId === selectedStudioId;
    if (!artistSearchQuery.trim()) {
      return matchesStudio;
    }

    const query = artistSearchQuery.toLowerCase();
    const artistNameMatches = a.name.toLowerCase().includes(query) || 
                              (a.title && a.title.toLowerCase().includes(query)) || 
                              a.specialties.some(s => s.toLowerCase().includes(query));

    // Find studio info of this artist
    const matchedStudio = studios.find(s => s.id === a.studioId);
    const studioMatches = matchedStudio 
      ? (matchedStudio.name.toLowerCase().includes(query) || matchedStudio.branch.toLowerCase().includes(query))
      : false;

    // When searching, match either artist name/title/specialties OR their studio name/branch
    return artistNameMatches || studioMatches;
  });

  // Google Maps Imitation States
  const [mapZoom, setMapZoom] = useState(18);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [addressCopied, setAddressCopied] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [showStreetView, setShowStreetView] = useState(false);

  const selectedStudio = studios.find(st => st.id === selectedStudioId) || studios[0] || {
    id: 'studio_default',
    name: 'Studio Noir',
    email: 'admin@studio.co',
    phone: '0532 999 88 77',
    branch: 'İzmir - Alsancak Merkez'
  };

  const studioAnnouncements = (announcements || []).filter(
    ann => (ann.studioId || 'studio_default') === selectedStudio.id
  );

  const getStudioAddress = (st: Studio) => {
    if (!st) return 'Adres Bilgisi Yok';
    if (st.address) return st.address;
    if (st.id === 'studio_default') {
      return 'Kültür, Kıbrıs Şehitleri Cd. No:44, Kat:2 D:5, 35220 Alsancak, Konak/İzmir';
    }
    const bLower = st.branch.toLowerCase();
    if (bLower.includes('alsancak')) {
      return 'Kültür, Kıbrıs Şehitleri Cd. No:44, Kat:2 D:5, 35220 Alsancak, Konak/İzmir';
    }
    if (bLower.includes('buca')) {
      return 'Yiğitler, Vali Rahmi Bey Mh. Menderes Cd. No:112, 35390 Buca/İzmir';
    }
    if (bLower.includes('bornova')) {
      return 'Kazımdirik, Süvari Cd. No:18/A, 35100 Bornova/İzmir';
    }
    if (bLower.includes('karşıyaka') || bLower.includes('karsiyaka')) {
      return 'Cemal Gürsel Cd. No:256, Donanmacı, 35000 Karşıyaka/İzmir';
    }
    if (bLower.includes('istanbul') || bLower.includes('kadıköy') || bLower.includes('kadikoy')) {
      return 'Caferağa, Bahariye Cd. No:32, 34710 Kadıköy/İstanbul';
    }
    if (bLower.includes('ankara')) {
      return 'Tunalı Hilmi Cd. No:82, Barbaros Mh., 06680 Çankaya/Ankara';
    }
    return `${st.branch}, Merkez, Türkiye`;
  };

  const getStudioCoordinates = (st: Studio) => {
    if (!st) return { lat: '38.4358° N', lng: '27.1396° E' };
    const bLower = st.branch.toLowerCase();
    if (bLower.includes('buca')) {
      return { lat: '38.3846° N', lng: '27.1652° E' };
    }
    if (bLower.includes('bornova')) {
      return { lat: '38.4633° N', lng: '27.2163° E' };
    }
    if (bLower.includes('karşıyaka') || bLower.includes('karsiyaka')) {
      return { lat: '38.4554° N', lng: '27.1147° E' };
    }
    if (bLower.includes('istanbul') || bLower.includes('kadıköy') || bLower.includes('kadikoy')) {
      return { lat: '40.9892° N', lng: '29.0270° E' };
    }
    if (bLower.includes('ankara')) {
      return { lat: '39.9022° N', lng: '32.8601° E' };
    }
    return { lat: '38.4358° N', lng: '27.1396° E' };
  };

  const getScaleText = (z: number) => {
    switch (z) {
      case 15: return '500 m';
      case 16: return '200 m';
      case 17: return '100 m';
      case 18: return '50 m';
      case 19: return '20 m';
      case 20: return '10 m';
      case 21: return '5 m';
      default: return '50 m';
    }
  };

  const activeAddress = getStudioAddress(selectedStudio);
  const activeCoords = getStudioCoordinates(selectedStudio);

  const handleCopyAddress = () => {
    if (!selectedStudio) return;
    const textToCopy = activeAddress;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          setAddressCopied(true);
          setTimeout(() => setAddressCopied(false), 2000);
        })
        .catch(() => {
          const textArea = document.createElement("textarea");
          textArea.value = textToCopy;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          setAddressCopied(true);
          setTimeout(() => setAddressCopied(false), 2000);
        });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    }
  };

  // Form State
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(['srv_medium']);
  const [appointmentDate, setAppointmentDate] = useState('2026-06-10');
  const [appointmentTime, setAppointmentTime] = useState('11:00');

  // Interactive Artist Profile and Portfolio preview states
  const [activeProfileArtistId, setActiveProfileArtistId] = useState('');

  // Sync artist selections when selected studio or search query changes
  React.useEffect(() => {
    if (filteredArtists.length > 0) {
      const isProfileActive = filteredArtists.some(a => a.id === activeProfileArtistId);
      if (!isProfileActive) {
        setActiveProfileArtistId(filteredArtists[0].id);
      }
      const isSelectedActive = filteredArtists.some(a => a.id === selectedArtistId);
      if (!isSelectedActive) {
        setSelectedArtistId(filteredArtists[0].id);
      }
    } else {
      setSelectedArtistId('');
      setActiveProfileArtistId('');
    }
  }, [selectedStudioId, artistSearchQuery, artists]);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<any | null>(null);
  const [activeStudioImageIdx, setActiveStudioImageIdx] = useState<number | null>(null);
  
  // Client Details
  const [customerName, setCustomerName] = useState(customerUser?.name || 'Berkay Çeri');
  const [customerPhone, setCustomerPhone] = useState(customerUser?.phone || '0532 123 45 67');
  const [customerEmail, setCustomerEmail] = useState(customerUser?.email || 'berkayceri200442@gmail.com');
  const [customNote, setCustomNote] = useState('Geometrik ve koyu havalı bir çalışma istiyorum.');

  React.useEffect(() => {
    if (customerUser) {
      setCustomerName(customerUser.name);
      setCustomerPhone(customerUser.phone);
      setCustomerEmail(customerUser.email);
    }
  }, [customerUser?.name, customerUser?.phone, customerUser?.email]);

  // Customer Profile Edit State
  const [isEditingCustomerProfile, setIsEditingCustomerProfile] = useState(false);
  const [custEditName, setCustEditName] = useState(customerName);
  const [custEditPhone, setCustEditPhone] = useState(customerPhone);
  const [custEditEmail, setCustEditEmail] = useState(customerEmail);

  const handleStartEditCustProfile = () => {
    setCustEditName(customerName);
    setCustEditPhone(customerPhone);
    setCustEditEmail(customerEmail);
    setIsEditingCustomerProfile(true);
  };

  const handleSaveCustProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custEditName || !custEditPhone || !custEditEmail) return;

    if (onUpdateCustomerUser) {
      onUpdateCustomerUser({
        name: custEditName,
        phone: custEditPhone,
        email: custEditEmail
      });
    } else {
      setCustomerName(custEditName);
      setCustomerPhone(custEditPhone);
      setCustomerEmail(custEditEmail);
    }

    setIsEditingCustomerProfile(false);
    setSuccessMessage('Müşteri profil bilgileriniz başarıyla güncellendi! ✨');

    onAddNotification({
      id: `ntf_cust_upd_${Date.now()}`,
      title: 'Müşteri Profili Güncellendi 👤',
      description: `Müşteri "${custEditName}" kişisel bilgilerini ve iletişim adresini güncelledi.`,
      appointmentId: '',
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'client_note'
    });
  };

  // Attached Images (Either selected from ideas or custom uploaded base64)
  const [attachedReferences, setAttachedReferences] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [customImageInput, setCustomImageInput] = useState('');

  // Toast / Form Feedback state
  const [successMessage, setSuccessMessage] = useState('');

  // Cancellation Reason states
  const [cancellingAptId, setCancellingAptId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  const selectedArtist = filteredArtists.find((a) => a.id === selectedArtistId) || filteredArtists[0];

  // Duration & Price calculations
  const totalDuration = selectedServiceIds.reduce((sum, srvId) => {
    const srv = services.find((s) => s.id === srvId);
    return sum + (srv ? srv.durationMin : 0);
  }, 0);

  const totalPrice = selectedServiceIds.reduce((sum, srvId) => {
    const srv = services.find((s) => s.id === srvId);
    return sum + (srv ? srv.basePriceSec : 0);
  }, 0);

  // Toggle Service
  const handleServiceToggle = (srvId: string) => {
    if (selectedServiceIds.includes(srvId)) {
      if (selectedServiceIds.length > 1) {
        setSelectedServiceIds(selectedServiceIds.filter((id) => id !== srvId));
      }
    } else {
      setSelectedServiceIds([...selectedServiceIds, srvId]);
    }
  };

  // Toggle template ideas
  const handleTemplateToggle = (imageUrl: string) => {
    if (attachedReferences.includes(imageUrl)) {
      setAttachedReferences(attachedReferences.filter((url) => url !== imageUrl));
    } else {
      setAttachedReferences([...attachedReferences, imageUrl]);
    }
  };

  // Custom base64 file uploader simulated
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAttachedReferences([...attachedReferences, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag over handler
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAttachedReferences([...attachedReferences, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit appointment handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedArtist) {
      alert('Lütfen randevu için bir dövme sanatçısı seçin.');
      return;
    }

    if (!customerName || !customerPhone || !customerEmail) {
      alert('Lütfen adınızı, telefon numaranızı ve e-postanızı doldurun.');
      return;
    }

    const chosenDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`);
    if (chosenDateTime < new Date()) {
      alert('Geçmiş bir tarihe veya saate randevu oluşturamazsınız. Lütfen ileri bir tarih/saat seçin.');
      return;
    }

    const uniqueId = `apt_${Date.now()}`;
    const newApt: Appointment = {
      id: uniqueId,
      studioId: selectedStudioId, // Associate appointment with selected studio
      customerName,
      customerPhone,
      customerEmail,
      artistId: selectedArtist.id,
      artistName: selectedArtist.name,
      date: appointmentDate,
      time: appointmentTime,
      services: [...selectedServiceIds],
      notes: customNote,
      status: 'Pending',
      clientImages: [...attachedReferences],
      createdAt: new Date().toISOString(),
      totalPrice,
      totalDuration,
    };

    // Add to state
    onAddAppointment(newApt);

    // Create notifications (Multiple notifications for detailed tracking panel)
    const notif1: CustomNotification = {
      id: `ntf_new_${Date.now()}`,
      title: 'Yeni Randevu Oluşturuldu! 📥',
      description: `${customerName}, ${selectedArtist.name} ile yeni bir rezervasyon oluşturdu.`,
      appointmentId: uniqueId,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'new_appointment',
    };
    onAddNotification(notif1);

    if (attachedReferences.length > 0) {
      const notif2: CustomNotification = {
        id: `ntf_img_${Date.now() + 1}`,
        title: 'Referans Görseller İletildi 🖼️',
        description: `${customerName} dövme tasarımcısına ${attachedReferences.length} adet ilham görseli gönderdi.`,
        appointmentId: uniqueId,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'client_note',
      };
      // Delay slightly so order is correct
      setTimeout(() => onAddNotification(notif2), 150);
    }

    // Clear reference state and output feedback toast
    setSuccessMessage('Harika! Randevu talebiniz başarıyla oluşturuldu ve dövme sanatçınıza iletildi.');
    setAttachedReferences([]);
    setCustomNote('');

    // Auto-clear message
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="customer-panel-container">

      {/* Banner */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C7D5F0]/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full" />
        
        <div className="relative space-y-2 max-w-xl font-serif">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#C7D5F0]/15 text-[#C7D5F0] border border-[#C7D5F0]/25 font-sans">
            <Sparkles className="w-3 h-3" />
            <span>Kişiselleştirilmiş Mürekkep Deneyimi</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-rushel text-[#C7D5F0] tracking-[0.15em] leading-tight uppercase">Yaratıcı Dövmenizi Rezerve Edin</h2>
          <p className="text-white/70 text-xs leading-relaxed font-serif">
            CutReserve konseptimizi dövme dünyasına taşıdık! Istediğiniz dövme sanatçısını seçin, seans detaylarınızı belirleyin, referans görsellerinizi ekleyin ve hızlıca randevunuzu tamamlayın.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2 p-5 bg-[#121212] rounded-xl border border-white/10 text-center min-w-[200px]">
          <div className="text-lg font-black text-[#C7D5F0] font-mono uppercase tracking-wider">Fiyat İletişimi</div>
          <p className="text-xs text-white/60 font-medium">Birebir Planlama</p>
          <div className="text-[10px] text-white/40 uppercase tracking-widest font-sans">Sanatçınız ile Belirleyin</div>
        </div>
      </div>

      {/* Mobile-Only Segmented Tab Switcher */}
      <div className="flex lg:hidden bg-zinc-950 border border-white/10 rounded-2xl p-1 gap-1 shadow-xl relative z-20">
        <button
          type="button"
          onClick={() => setMobileActiveTab('booking')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-[0.12em] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
            mobileActiveTab === 'booking'
              ? 'bg-[#C7D5F0] text-black shadow-md shadow-[#C7D5F0]/15'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Rezervasyon Yap</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileActiveTab('appointments')}
          className={`flex-1 py-3 text-xs font-black uppercase tracking-[0.12em] rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
            mobileActiveTab === 'appointments'
              ? 'bg-[#C7D5F0] text-black shadow-md shadow-[#C7D5F0]/15'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4 shrink-0" />
          <span>Randevularım ({appointments.filter(a => a.customerPhone === customerPhone || a.customerName.toLowerCase().includes(customerName.toLowerCase())).length})</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm flex items-center gap-3 animate-bounce">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Customer Profile Management Widget */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C7D5F0]/5 rounded-full blur-2xl pointer-events-none" />
        
        {isEditingCustomerProfile ? (
          <form onSubmit={handleSaveCustProfile} className="space-y-4 relative z-10">
            <h3 className="text-xs font-bold text-[#C7D5F0] uppercase tracking-wider font-rushel">Müşteri Profil Bilgilerimi Güncelle</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/40 block uppercase">Ad Soyad</label>
                <input
                  type="text"
                  value={custEditName}
                  onChange={e => setCustEditName(e.target.value)}
                  required
                  className="w-full text-xs bg-black/60 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/40 block uppercase">Telefon Numarası</label>
                <input
                  type="text"
                  value={custEditPhone}
                  onChange={e => setCustEditPhone(e.target.value)}
                  required
                  className="w-full text-xs bg-black/60 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-white/40 block uppercase">E-posta Adresi</label>
                <input
                  type="email"
                  value={custEditEmail}
                  onChange={e => setCustEditEmail(e.target.value)}
                  required
                  className="w-full text-xs bg-black/60 border border-white/10 rounded p-2 text-white focus:outline-none focus:border-[#C7D5F0]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingCustomerProfile(false)}
                className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white/80 rounded text-xs font-bold uppercase transition"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-[#C7D5F0] hover:bg-[#b0c4eb] text-black rounded text-xs font-bold uppercase transition shadow-lg shadow-[#C7D5F0]/15"
              >
                Profilimi Kaydet
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4.5">
              <div className="w-11 h-11 rounded-full bg-[#C7D5F0]/10 border border-[#C7D5F0]/20 flex items-center justify-center shrink-0">
                <span className="text-[#C7D5F0] font-bold text-sm tracking-wider">
                  {customerName.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white tracking-wide">{customerName}</span>
                  <span className="text-[9px] bg-[#C7D5F0]/10 text-[#C7D5F0] font-bold px-2 py-0.5 rounded border border-[#C7D5F0]/15 font-sans">MÜŞTERİ HESABI</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-white/50">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#C7D5F0]/60" />
                    <span>{customerPhone}</span>
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#C7D5F0]/60" />
                    <span>{customerEmail}</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartEditCustProfile}
              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-[#C7D5F0] rounded-xl text-xs border border-white/10 hover:border-[#C7D5F0]/45 transition duration-150 font-medium"
            >
              Profil Bilgilerimi Düzenle
            </button>
          </div>
        )}
      </div>

      {/* Mobile view wrap-toggle for booking details */}
      <div className={mobileActiveTab === 'booking' ? 'block space-y-8 animate-fade-in' : 'hidden lg:block lg:space-y-8'}>
        {/* 1. ADIM: STÜDYO ŞUBE SEÇİMİ */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 space-y-4" id="studio-selector-section">
        <div className="flex items-center gap-2 text-[#C7D5F0]">
          <h3 className="text-sm font-black tracking-[0.15em] uppercase font-rushel">
            🏢 1. ADIM: DÖVME STÜDYOSU / ŞUBE SEÇİMİ
          </h3>
        </div>
        <p className="text-xs text-zinc-400">
          Rezervasyon sürecine başlamak için lütfen hizmet almak istediğiniz stüdyoyu seçin. Seçtiğiniz şubeye göre dövme sanatçılarımız ve ajandaları özel olarak listelenecektir.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {studios.map((st) => {
            const isSelected = selectedStudioId === st.id;
            const studioArtCount = artists.filter(a => a.studioId === st.id).length;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStudioId(st.id)}
                className={`p-5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between gap-3 relative overflow-hidden group ${
                  isSelected
                    ? 'border-[#C7D5F0] bg-[#C7D5F0]/5 ring-1 ring-[#C7D5F0]'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-[#C7D5F0] text-black text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider font-mono">
                    ✓ Seçili Şube
                  </div>
                )}
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-white group-hover:text-[#C7D5F0] transition font-sans">{st.name}</h4>
                  <p className="text-[11px] text-zinc-400 font-serif">{st.branch}</p>
                </div>
                <div className="flex items-center justify-between w-full border-t border-white/5 pt-3 mt-1 text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1 font-mono">
                    📞 {st.phone}
                  </span>
                  <span className="bg-white/5 text-[#C7D5F0] px-2 py-0.5 rounded border border-white/10 font-bold font-mono text-[9px] uppercase tracking-wider">
                    {studioArtCount} Sanatçı
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Studio Details Block */}
        {selectedStudio && (
          <div className="mt-6 border-t border-white/5 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="studio-google-maps-integration">
            {/* Center Info Panel */}
            <div className="lg:col-span-12 max-w-2xl mx-auto w-full bg-white/[0.01] border border-white/5 rounded-2xl p-6 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] uppercase tracking-wider font-mono">
                    <MapPin className="w-3.5 h-3.5 text-[#C7D5F0]/60" />
                    <span>Konum & İletişim Detayları</span>
                  </div>
                  <h4 className="text-base font-black text-white mt-1">{selectedStudio.name}</h4>
                  <p className="text-xs text-[#C7D5F0] font-serif">{selectedStudio.branch}</p>
                </div>

                <div className="text-xs space-y-2.5 text-zinc-300">
                  <div className="flex items-start gap-2.5">
                    <span className="text-emerald-500 font-bold shrink-0">🟢 Açık</span>
                    <span className="text-zinc-500">|</span>
                    <span className="text-zinc-400">Çalışma Saatleri: 10:00 - 22:00</span>
                  </div>
                  
                  <div className="p-3 bg-zinc-950/60 border border-white/5 rounded-xl text-xs space-y-1 mt-1">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Stüdyo Adresi</span>
                    <p className="text-white/90 leading-relaxed font-sans">{activeAddress}</p>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="text-zinc-500 font-mono text-[10px] w-12 text-right">Tel:</span>
                      <span className="font-mono text-white">{selectedStudio.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="text-zinc-500 font-mono text-[10px] w-12 text-right">E-posta:</span>
                      <span className="font-mono text-white text-[11px]">{selectedStudio.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <button
                  type="button"
                  id="btn-copy-address"
                  onClick={handleCopyAddress}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition duration-150 border uppercase tracking-wider cursor-pointer ${
                    addressCopied
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-[#C7D5F0] hover:bg-[#b0c4eb] border-transparent text-black font-extrabold shadow-lg shadow-black/30'
                  }`}
                >
                  {addressCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3px]" />
                      <span>Adres Kopyalandı</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-current" />
                      <span>Adresi Kopyala</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* NEW SUB-SECTION: STUDIO INTERIOR GALLERY */}
            <div className="lg:col-span-12 mt-4 border-t border-white/5 pt-6 space-y-4" id="studio-salon-photos">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-[10px] font-mono uppercase tracking-widest text-[#C7D5F0]/80">ATÖLYEMİZİN ATMOSFERİ</h5>
                  <h4 className="text-base font-black text-white uppercase tracking-wider font-sans mt-0.5">Stüdyo Salonumuzdan Kareler</h4>
                </div>
                <span className="text-[10.5px] text-zinc-400 font-mono bg-white/[0.03] border border-white/5 rounded-full px-3 py-0.5">
                  {((selectedStudio.gallery && selectedStudio.gallery.length > 0)
                    ? selectedStudio.gallery
                    : [
                        'https://images.unsplash.com/photo-1621600411688-4be93cc685e5?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1605497746444-17f18b52fb82?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=800&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1560185127-6a2806647f81?w=800&auto=format&fit=crop&q=80'
                      ]
                  ).length} Fotoğraf
                </span>
              </div>

              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {((selectedStudio.gallery && selectedStudio.gallery.length > 0) 
                  ? selectedStudio.gallery 
                  : [
                      'https://images.unsplash.com/photo-1621600411688-4be93cc685e5?w=800&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1605497746444-17f18b52fb82?w=800&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=800&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=800&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1560185127-6a2806647f81?w=800&auto=format&fit=crop&q=80'
                    ]
                ).map((imgUrl, uIdx) => {
                  // Varied aspect ratios for cohesive masonry styling based on index (masonry look)
                  const aspects = ['aspect-[3/4]', 'aspect-[4/3]', 'aspect-[4/5]', 'aspect-square', 'aspect-video', 'aspect-[3/2]'];
                  const aspectClass = aspects[uIdx % aspects.length];

                  return (
                    <div 
                      key={uIdx}
                      onClick={() => setActiveStudioImageIdx(uIdx)}
                      className={`break-inside-avoid mb-4 group relative bg-[#0a0a0c] border border-white/5 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-[#C7D5F0]/40 shadow-lg hover:shadow-[#C7D5F0]/5 hover:scale-[1.015] flex flex-col ${aspectClass}`}
                    >
                      <img 
                        src={imgUrl} 
                        alt={`${selectedStudio.name} Salon Görseli`} 
                        className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent opacity-0 group-hover:opacity-100 transition duration-250 flex flex-col justify-end p-4">
                        <span className="text-[9px] text-[#C7D5F0] font-mono leading-none tracking-widest uppercase font-bold">
                          Görsel {uIdx + 1}
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-white font-sans font-black tracking-wide uppercase">
                            BÜYÜTÜLMÜŞ GÖRÜNÜM
                          </span>
                          <span className="text-xs text-zinc-400">🔎</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SELECTED STUDIO ANNOUNCEMENTS */}
      {studioAnnouncements.length > 0 && (
        <div className="bg-[#121212] border border-[#C7D5F0]/20 rounded-2xl p-5 space-y-4" id="studio-announcements-section">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#C7D5F0]/10 rounded-xl text-[#C7D5F0] border border-[#C7D5F0]/20">
                <Megaphone className="w-4 h-4 text-[#C7D5F0]" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white tracking-wide uppercase font-mono">{selectedStudio.branch} Şubesi Duyuruları</h3>
                <p className="text-[10px] text-zinc-400 font-sans">Bu şubemize ait en son gelişmeler, haberler ve duyurular</p>
              </div>
            </div>
            <span className="text-[10px] bg-[#C7D5F0]/15 text-[#C7D5F0] px-2 py-0.5 rounded font-mono uppercase font-bold border border-[#C7D5F0]/20">
              {studioAnnouncements.length} Aktif Duyuru
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studioAnnouncements.map((ann, idx) => {
              const formattedDate = new Date(ann.createdAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              return (
                <motion.div
                  key={ann.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: idx * 0.05 }}
                  whileHover={{ y: -2, scale: 1.008 }}
                  className={`p-4 rounded-xl relative overflow-hidden flex flex-col justify-between transition duration-205 border ${
                    ann.isPinned
                      ? 'bg-[#C7D5F0]/5 border-[#C7D5F0]/30 shadow-lg shadow-[#C7D5F0]/5 hover:border-[#C7D5F0]/50'
                      : 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 font-sans">
                    {ann.isPinned && (
                      <div className="flex items-center gap-1 bg-[#C7D5F0] text-black px-1.5 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider uppercase">
                        📌 Sabitlendi
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const shareText = `📣 STÜDYO DUYURUSU: ${ann.title}\n\n${ann.content}\n\n📍 Bizimle iletişime geçin: ${window.location.origin}`;
                        navigator.clipboard.writeText(shareText);
                        setCopiedAnnId(ann.id);
                        setTimeout(() => setCopiedAnnId(null), 2000);
                      }}
                      className="p-1 px-1.5 bg-white/5 border border-white/10 rounded text-zinc-400 hover:text-[#C7D5F0] hover:bg-white/10 transition duration-150 flex items-center gap-1 cursor-pointer"
                      title="Duyuruyu Kopyala / Paylaş"
                    >
                      {copiedAnnId === ann.id ? (
                        <span className="text-[8.5px] font-extrabold text-emerald-400 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-400" /> Kopyalandı!
                        </span>
                      ) : (
                        <>
                          <Share2 className="w-2.5 h-2.5" />
                          <span className="text-[8.5px] font-mono font-bold uppercase tracking-wider">Paylaş</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="space-y-2 pr-28">
                    <h4 className="text-xs font-black text-white hover:text-[#C7D5F0] transition font-sans leading-relaxed">
                      {ann.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      {ann.content}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-zinc-500">
                    <span>{formattedDate}</span>
                    <span className="uppercase text-[8px] tracking-wider text-[#C7D5F0] font-bold">Stüdyo Yönetimi</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* NEW SECTION: SANATÇI PROFİLLERİ & PORTFOLYO KOLEKSİYONU */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl shadow-xl overflow-hidden p-6 space-y-6" id="artists-portfolio-section">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#C7D5F0]">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <h3 className="text-base font-black tracking-[0.15em] uppercase font-rushel">
                Sanatçı Profilleri & Portfolyo Koleksiyonu
              </h3>
            </div>
            <p className="text-[11.5px] text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Seçtiğiniz stüdyodaki uzman dövme tasarımcılarının özgün çalışmalarından oluşan portfolyo albümlerini inceleyin, kendinize en uygun tarzı bularak doğrudan sanatçıyı seçip randevunuzu planlayın.
            </p>
          </div>

          {/* Quick Stats or filter info */}
          <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-mono uppercase text-[#C7D5F0] shrink-0">
            Aktif Tasarımcı: {filteredArtists.length}
          </div>
        </div>

        {/* Dynamic Search Bar implementation */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-xl">
          <div className="text-xs font-semibold text-zinc-300 flex items-center gap-2 w-full sm:w-auto">
            <span className="w-2 h-2 rounded-full bg-[#C7D5F0] animate-pulse shrink-0 animate-duration-[2000ms]"></span>
            <span>Sanatçı & Stüdyo Ara:</span>
          </div>
          <div className="relative w-full sm:max-w-md">
            <input
              id="artist-search-input"
              type="text"
              value={artistSearchQuery}
              onChange={(e) => setArtistSearchQuery(e.target.value)}
              placeholder="Sanatçı adı (Örn: Julian), uzmanlık veya şube..."
              className="w-full text-xs bg-zinc-950 border border-white/10 hover:border-white/15 focus:border-[#C7D5F0] rounded-xl py-2.5 pl-10 pr-10 text-white focus:outline-none transition-all duration-150 shadow-inner"
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            {artistSearchQuery && (
              <button
                type="button"
                onClick={() => setArtistSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white text-xs transition font-mono font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {filteredArtists.length === 0 ? (
          <div className="text-center py-12 space-y-4 border border-dashed border-white/10 rounded-2xl bg-white/[0.01] px-4">
            {artistSearchQuery ? (
              <div className="space-y-2">
                <p className="text-xs text-zinc-400 font-medium">
                  "{artistSearchQuery}" arama sorgunuza uygun bir dövme sanatçısı veya stüdyo şubesi bulunamadı.
                </p>
                <p className="text-[10px] text-zinc-500">
                  Lütfen aramak istediğiniz ismi kontrol edin veya sol taraftan farklı bir şubeyi deneyin.
                </p>
                <button
                  type="button"
                  onClick={() => setArtistSearchQuery('')}
                  className="mt-2 text-[11px] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#C7D5F0]/40 px-3.5 py-1.5 rounded-lg text-[#C7D5F0] font-semibold transition"
                >
                  Filtreyi Temizle
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs text-zinc-400">Bu şubeye henüz kayıtlı bir dövme sanatçısı bulunmuyor.</p>
                <p className="text-[10px] text-zinc-500">Lütfen üst adımdan diğer dövme stüdyosu şubelerimizi inceleyin.</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Artist Tabs Selection menu */}
            <div className="flex overflow-x-auto scrollbar-none gap-2 pt-2 border-b border-white/5 pb-4 md:flex-wrap scroll-smooth">
              {filteredArtists.map((art) => {
                const isActive = activeProfileArtistId === art.id;
                return (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => setActiveProfileArtistId(art.id)}
                    className={`p-2 px-4 rounded-xl border text-xs font-bold transition flex items-center gap-3 shrink-0 ${
                      isActive
                        ? 'border-[#C7D5F0] bg-[#C7D5F0]/5 text-[#C7D5F0] ring-1 ring-[#C7D5F0]/35 shadow-lg shadow-[#C7D5F0]/5'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <img
                      src={art.avatar}
                      alt={art.name}
                      className="w-6 h-6 rounded-full object-cover border border-white/15"
                      referrerPolicy="no-referrer"
                    />
                    <span>{art.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Artist detailed card profile layout */}
            {(() => {
              const art = filteredArtists.find((a) => a.id === activeProfileArtistId) || filteredArtists[0];
              if (!art) return null;

              return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Left Bio Column (5 cols) */}
              <div className="lg:col-span-4 bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#C7D5F0]/40 shrink-0">
                      <img src={art.avatar} alt={art.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-white font-sans">{art.name}</h4>
                      <p className="text-xs text-[#C7D5F0] font-mono tracking-wider mt-0.5 uppercase">{art.title}</p>
                    </div>
                  </div>

                  {/* Bio Description block */}
                  <div className="space-y-1 bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="text-[9.5px] font-mono uppercase text-zinc-500 tracking-wider font-bold block">Sanatçı Biyografisi</span>
                    <p className="text-xs text-zinc-300 leading-normal italic font-sans">{art.bio || "Özgün tasarımlar ve konsept dövme sanatı ile stüdyomuzda kusursuz işlere imza atmaktadır."}</p>
                  </div>

                  {/* Specialties tag labels */}
                  <div className="space-y-1.5">
                    <span className="text-[9.5px] font-mono uppercase text-zinc-500 tracking-wider font-bold block">Uzmanlık Alanları</span>
                    <div className="flex flex-wrap gap-1.5">
                      {art.specialties.map((spec) => (
                        <span
                          key={spec}
                          className="text-[9.5px] bg-[#C7D5F0]/10 border border-[#C7D5F0]/20 text-[#C7D5F0] font-semibold px-2 py-0.5 rounded-md font-sans"
                        >
                          ✔ {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-2 mt-4 lg:mt-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedArtistId(art.id);
                      setMobileActiveTab('booking');
                      // Smooth scroll down to quick reservation form
                      setTimeout(() => {
                        const formElement = document.getElementById('quick-booking-form-section');
                        if (formElement) {
                          formElement.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                    className="w-full py-2.5 bg-[#C7D5F0] hover:bg-[#b0c4eb] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-[#C7D5F0]/10"
                  >
                    <Check className="w-4 h-4" />
                    <span>Bu Sanatçıdan Randevu Al</span>
                  </button>
                  <p className="text-[9px] text-zinc-500 text-center uppercase tracking-widest">
                    Seçiminiz rezervasyon formuna otomatik yansır.
                  </p>
                </div>
              </div>

              {/* Right Portfolio showcase Grid (8 cols) */}
              <div className="lg:col-span-8 space-y-3">


                {art.portfolio.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl text-center space-y-2">
                    <Image className="w-8 h-8 text-zinc-650" />
                    <p className="text-xs text-zinc-400">Bu tasarımcı henüz portfolyo görseli yüklemedi.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-1 sm:gap-2 max-h-[460px] overflow-y-auto pr-1 pb-1">
                    {art.portfolio.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedPortfolioItem(item)}
                        className="relative aspect-square overflow-hidden bg-black/80 rounded-lg border border-white/5 hover:border-[#C7D5F0]/50 transition-all duration-300 group cursor-pointer"
                      >
                        {/* Feed Image */}
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />

                        {/* Premium Instagram Style Hover Card */}
                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-2 text-center">
                          {/* Category Tag */}
                          <span className="text-[8px] sm:text-[9px] text-[#C7D5F0] font-extrabold tracking-widest uppercase font-mono mb-1.5 bg-black/50 px-2 py-0.5 rounded border border-[#C7D5F0]/20">
                            {item.category}
                          </span>

                          {/* Image Title */}
                          <span className="font-sans font-bold text-[9px] sm:text-[11px] text-white line-clamp-2 px-1 mb-2 uppercase tracking-wide">
                            {item.title}
                          </span>

                          {/* Action Button */}
                          <span className="text-[9px] uppercase tracking-widest font-mono text-[#C7D5F0] sm:mt-3 bg-white/5 py-1 px-3 rounded-md hover:bg-[#C7D5F0] hover:text-black transition">
                            Görseli İncele
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
          </>
        )}
      </div>

      {/* PORTFOLIO DETAIL POPUP MODAL */}
      {selectedPortfolioItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col md:flex-row">
            {/* Left side Image */}
            <div className="md:w-3/5 bg-zinc-950 flex items-center justify-center relative min-h-[250px] md:min-h-[420px]">
              <img
                src={selectedPortfolioItem.url}
                alt={selectedPortfolioItem.title}
                className="w-full h-full object-contain max-h-[70vh] md:max-h-[85vh]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 left-3 bg-black/75 p-1 px-2.5 rounded border border-white/10">
                <span className="text-[10px] text-[#C7D5F0] font-mono font-bold uppercase tracking-widest">
                  {selectedPortfolioItem.category}
                </span>
              </div>
            </div>

            {/* Right side Details */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/10 bg-zinc-950/40">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-[#C7D5F0] uppercase tracking-widest">DÖVME TASARIM DETAYI</span>
                    <h3 className="text-base font-bold text-white font-sans">{selectedPortfolioItem.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPortfolioItem(null)}
                    className="p-1 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-zinc-500 block uppercase">Açıklama & Hikaye</span>
                  <p className="text-xs text-zinc-350 leading-relaxed font-sans">{selectedPortfolioItem.description || "Tasarımcımız tarafından özenle çizilip işlenen özel dövme sanat eseri."}</p>
                </div>

                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-500">Tasarımcı:</span>
                    <span className="font-bold text-[#C7D5F0]">
                      {artists.find(a => a.id === selectedPortfolioItem.artistId)?.name || 'Stüdyo Sanatçısı'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-500">Kategori:</span>
                    <span className="font-medium text-zinc-300">{selectedPortfolioItem.category}</span>
                  </div>

                </div>
              </div>

              <div className="pt-6 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedArtistId(selectedPortfolioItem.artistId);
                    setSelectedPortfolioItem(null);
                    setMobileActiveTab('booking');
                    // Smooth scroll to form
                    setTimeout(() => {
                      const formElement = document.getElementById('quick-booking-form-section');
                      if (formElement) {
                        formElement.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className="w-full py-2 bg-[#C7D5F0] hover:bg-[#b0c4eb] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition font-sans"
                >
                  ✓ Bu Tasarımcıyı Seç
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDIO GALLERY DETAIL POPUP LIGHTBOX */}
      {activeStudioImageIdx !== null && selectedStudio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          {/* Close button outside */}
          <button
            type="button"
            onClick={() => setActiveStudioImageIdx(null)}
            className="absolute top-6 right-6 p-3 bg-zinc-900/80 hover:bg-zinc-850 border border-white/10 text-white rounded-full transition shadow-2xl scale-110 cursor-pointer z-50"
            title="Kapat"
          >
            ✕
          </button>

          {/* Previous image button */}
          <button
            type="button"
            onClick={() => {
              const galleryImages = (selectedStudio.gallery && selectedStudio.gallery.length > 0)
                ? selectedStudio.gallery
                : [
                    'https://images.unsplash.com/photo-1621600411688-4be93cc685e5?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1605497746444-17f18b52fb82?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1560185127-6a2806647f81?w=800&auto=format&fit=crop&q=80'
                  ];
              setActiveStudioImageIdx(prev => (prev !== null ? (prev - 1 + galleryImages.length) % galleryImages.length : 0));
            }}
            className="absolute left-4 sm:left-6 p-4 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-white rounded-full transition shadow-2xl cursor-pointer z-40 select-none text-xl font-bold"
            title="Önceki"
          >
            &larr;
          </button>

          {/* Next image button */}
          <button
            type="button"
            onClick={() => {
              const galleryImages = (selectedStudio.gallery && selectedStudio.gallery.length > 0)
                ? selectedStudio.gallery
                : [
                    'https://images.unsplash.com/photo-1621600411688-4be93cc685e5?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1605497746444-17f18b52fb82?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=800&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1560185127-6a2806647f81?w=800&auto=format&fit=crop&q=80'
                  ];
              setActiveStudioImageIdx(prev => (prev !== null ? (prev + 1) % galleryImages.length : 0));
            }}
            className="absolute right-4 sm:right-6 p-4 bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-white rounded-full transition shadow-2xl cursor-pointer z-40 select-none text-xl font-bold"
            title="Sonraki"
          >
            &rarr;
          </button>

          {/* Image & details wrap */}
          <div className="relative max-w-4xl max-h-[80vh] flex flex-col items-center">
            <img
              src={
                ((selectedStudio.gallery && selectedStudio.gallery.length > 0)
                  ? selectedStudio.gallery
                  : [
                      'https://images.unsplash.com/photo-1621600411688-4be93cc685e5?w=800&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1605497746444-17f18b52fb82?w=800&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=800&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=800&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=800&auto=format&fit=crop&q=80',
                      'https://images.unsplash.com/photo-1560185127-6a2806647f81?w=800&auto=format&fit=crop&q=80'
                    ]
                )[activeStudioImageIdx]
              }
              alt={`${selectedStudio.name} Atölye İç Mekan`}
              className="w-auto max-w-full max-h-[70vh] object-contain rounded-2xl border border-white/10 shadow-2xl"
              referrerPolicy="no-referrer"
            />
            {/* Legend info block */}
            <div className="mt-4 bg-zinc-950/90 border border-white/10 p-3.5 rounded-xl text-center backdrop-blur-md max-w-md w-full">
              <h4 className="text-xs font-bold text-[#C7D5F0] leading-none uppercase tracking-wider">{selectedStudio.name}</h4>
              <p className="text-[11px] text-zinc-450 mt-1">{selectedStudio.branch} Şubesi İç Görünümü</p>
              <div className="text-[10px] text-zinc-500 font-mono mt-1 select-none">
                Görsel {(activeStudioImageIdx + 1)} / {
                  ((selectedStudio.gallery && selectedStudio.gallery.length > 0) 
                    ? selectedStudio.gallery 
                    : [1, 2, 3, 4, 5, 6]
                  ).length
                }
              </div>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* Grid: Form on Left, Bookings Tracker on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Booking Form (Value: 7 cols) */}
        <div id="quick-booking-form-section" className={`lg:col-span-7 bg-[#121212] border border-white/10 rounded-2xl shadow-xl overflow-hidden ${mobileActiveTab === 'booking' ? 'block' : 'hidden lg:block'}`}>
          <div className="p-5 px-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-[#C7D5F0]/15 text-[#C7D5F0]">
                <Plus className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-white font-rushel tracking-[0.12em] uppercase">Hızlı Rezervasyon Formu</h3>
            </div>
            <span className="text-[10px] text-white/40 font-mono">TÜM BİLGİLER OTOMATİK İLETİLİR</span>
          </div>

          <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
            
            {/* Step 1: Barber/Artist Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-white/40">
                Dövme Tasarımcınızı Seçin
              </label>
              <div className="flex overflow-x-auto scrollbar-none pb-2 gap-3 sm:grid sm:grid-cols-3 w-full">
                {filteredArtists.length === 0 ? (
                  <div className="col-span-full py-6 pr-4 text-xs text-zinc-500 italic bg-white/[0.01] border border-dashed border-white/15 rounded-xl p-4 text-center w-full">
                    Seçilen stüdyo şubesinde henüz kayıtlı sanatçı bulunmuyor. Lütfen yukarıdan farklı bir şube seçin.
                  </div>
                ) : (
                  filteredArtists.map((art) => (
                    <button
                      key={art.id}
                      type="button"
                      onClick={() => {
                        setSelectedArtistId(art.id);
                        setActiveProfileArtistId(art.id);
                        const profileSection = document.getElementById('artists-portfolio-section');
                        if (profileSection) {
                          profileSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between h-40 transition-all duration-150 relative group shrink-0 w-[78%] sm:w-auto ${
                        selectedArtistId === art.id
                          ? 'border-[#C7D5F0] bg-[#C7D5F0]/5 ring-1 ring-[#C7D5F0]'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={art.avatar}
                          alt={art.name}
                          className="w-10 h-10 rounded-full border border-white/10 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="overflow-hidden">
                          <span className="font-bold text-xs truncate block text-white group-hover:text-[#C7D5F0] transition">
                            {art.name}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 mt-2">
                         <span className="text-[10px] font-mono text-white/60 line-clamp-1 block">
                          {art.title}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {art.specialties.slice(0, 2).map((sp) => (
                            <span key={sp} className="text-[8px] bg-white/10 text-white/80 font-medium px-1 rounded">
                              {sp}
                            </span>
                          ))}
                        </div>
                      </div>
                      {selectedArtistId === art.id && (
                        <div className="absolute top-2 right-2 bg-[#C7D5F0] text-black rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Step 2: Service Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-white/40 flex items-center justify-between">
                <span>Dövme Çalışma Grupları (Çoklu Seçim)</span>
                <span className="text-[10px] text-white/30 font-mono">Minimum 1 seçim gereklidir</span>
              </label>
              <div className="space-y-2">
                {services.map((srv) => {
                  const isChecked = selectedServiceIds.includes(srv.id);
                  return (
                    <div
                      key={srv.id}
                      onClick={() => handleServiceToggle(srv.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-4 ${
                        isChecked
                          ? 'border-[#C7D5F0]/50 bg-[#C7D5F0]/5'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition ${
                          isChecked 
                            ? 'bg-[#C7D5F0] border-[#C7D5F0] text-black' 
                            : 'border-white/20 bg-white/5'
                        }`}>
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-bold text-white">{srv.name}</span>
                          <span className="block text-[10px] text-white/60 leading-normal mt-0.5 max-w-sm">
                            {srv.description}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Date & Hour details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-white/40">Randevu Günü</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                    className="w-full bg-[#050505] border border-white/10 hover:border-white/20 focus:border-[#C7D5F0] rounded-lg py-2.5 pl-10 pr-4 text-xs font-mono font-semibold text-white focus:outline-none transition"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-white/40">Randevu Saati</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/40">
                    <Clock className="w-4 h-4" />
                  </span>
                  <select
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 hover:border-white/20 focus:border-[#C7D5F0] rounded-lg py-2.5 pl-10 pr-4 text-xs font-mono font-semibold text-white focus:outline-none transition appearance-none"
                  >
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                    <option value="18:00">18:00</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 4: Client Contact Details */}
            <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-mono font-bold block">İletişim Bilgileriniz</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/40">Ad Soyad</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    placeholder="Örn: Berkay Çeri"
                    className="w-full text-xs bg-[#050505] border border-white/10 rounded py-2 px-3 text-white focus:outline-none focus:border-[#C7D5F0] transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/40">Telefon Numarası</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    placeholder="Örn: 0532 ..."
                    className="w-full text-xs bg-[#050505] border border-white/10 rounded py-2 px-3 text-white focus:outline-none focus:border-[#C7D5F0] transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-white/40">E-Posta Adresi</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    placeholder="b.ceri@example.com"
                    className="w-full text-xs bg-[#050505] border border-white/10 rounded py-2 px-3 text-white focus:outline-none focus:border-[#C7D5F0] transition"
                  />
                </div>
              </div>
            </div>

            {/* Step 5: Notes & Image Upload Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5 font-sans">
                  <FileText className="w-3.5 h-3.5 text-[#C7D5F0]" />
                  <span>Dövme Sanatçısına Not Bırakın (İsteğe Bağlı)</span>
                </label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="İstediğiniz ek çizimler, boyut detayları, vücut bölgesi veya özel isteklerinizi yazın..."
                  rows={3}
                  className="w-full bg-[#050505] border border-white/10 hover:border-white/20 focus:border-[#C7D5F0] rounded-lg p-3 text-xs text-white focus:outline-none transition leading-relaxed"
                />
              </div>

              {/* Sample ideas to toggle OR Drag and Drop to Upload */}
              <div className="space-y-3.5">
                <span className="block text-xs font-bold uppercase tracking-wider text-white/40 font-sans">
                  Örnek Tasarım Görselleri Ekle (İsteğe Bağlı)
                </span>
                
                {/* Visual grid picker */}
                <div className="grid grid-cols-3 gap-2.5">
                  {SAMPLE_CLIENT_IDEAS.map((idea) => {
                    const isAttached = attachedReferences.includes(idea.url);
                    return (
                      <div
                        key={idea.id}
                        onClick={() => handleTemplateToggle(idea.url)}
                        className={`relative rounded-lg overflow-hidden h-20 border cursor-pointer group transition duration-200 ${
                          isAttached ? 'border-[#C7D5F0] ring-2 ring-[#C7D5F0]/40' : 'border-white/10'
                        }`}
                      >
                        <img
                          src={idea.url}
                          alt={idea.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-1.5 text-center group-hover:bg-black/45 transition">
                          <span className="text-[10px] text-white/80 font-bold leading-tight truncate">
                            {idea.name}
                          </span>
                        </div>
                        {isAttached && (
                          <div className="absolute top-1 right-1 bg-[#C7D5F0] rounded-md p-0.5 animate-pulse">
                            <Check className="w-2.5 h-2.5 text-black" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Simulated Custom File Area */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border border-dashed rounded-xl p-4 text-center transition ${
                    dragActive 
                      ? 'border-[#C7D5F0] bg-[#C7D5F0]/5' 
                      : 'border-white/10 hover:border-white/25 bg-white/5'
                  }`}
                >
                  <Upload className="w-5 h-5 mx-auto text-white/40 mb-2" />
                  <p className="text-xs text-white/80 font-medium">Büyük Dövme Referans Görselini Sürükleyin veya Dosya Seçin</p>
                  <p className="text-[10px] text-white/40 mt-1 font-mono">PNG, JPG, SVG desteklenir</p>
                  
                  <div className="mt-3 flex justify-center">
                    <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded font-bold transition">
                      Görsel Yükle
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Displaying attached previews */}
                {attachedReferences.length > 0 && (
                  <div className="p-3 bg-[#0c0c0c] rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-white/40 font-mono">EKLENEN REFERANSLAR ({attachedReferences.length})</span>
                      <button 
                        type="button" 
                        onClick={() => setAttachedReferences([])}
                        className="text-[9px] font-bold text-rose-500 hover:underline"
                      >
                        Tümünü Çıkar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {attachedReferences.map((url, i) => (
                        <div key={i} className="relative w-14 h-14 rounded overflow-hidden border border-white/15">
                          <img src={url} alt="Reference thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button
                            type="button"
                            onClick={() => setAttachedReferences(attachedReferences.filter((_, idx) => idx !== i))}
                            className="absolute -top-1 -right-1 bg-black/80 hover:bg-black p-0.5 rounded text-rose-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price Estimator & Submit Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono text-white/40 tracking-wider font-semibold">Tasarım & Planlama</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#C7D5F0] font-medium">Birebir Özel Detaylandırma</span>
                </div>
              </div>
              <button
                id="btn-confirm-booking"
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-[#C7D5F0] hover:bg-[#b0c4eb] text-black font-bold text-xs uppercase tracking-widest rounded-xl transition duration-150 flex items-center justify-center gap-2 shadow-lg shadow-[#C7D5F0]/15 group"
              >
                <span>REZERVASYONU TAMAMLA VE OLUŞTUR</span>
                <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition" />
              </button>
            </div>

          </form>
        </div>

        {/* RIGHT COLUMN: Bookings Tracker (Value: 5 cols) */}
        <div id="booking-tracker-column" className={`lg:col-span-5 space-y-6 ${mobileActiveTab === 'appointments' ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-[#121212] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            
            <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-white/5 text-[#C7D5F0]">
                  <Calendar className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-bold text-white font-rushel tracking-[0.12em] uppercase">Mevcut Rezervasyonlarım</h3>
              </div>
              <span className="text-[9px] font-bold text-white/40 font-mono bg-white/5 px-2 py-1 rounded">
                Giriş: {customerName}
              </span>
            </div>

            {/* Filter warning */}
            <div className="p-3 px-5 bg-[#C7D5F0]/5 text-[10.5px] text-white/80 font-medium border-b border-white/10 flex items-center justify-between">
              <span>Telefon eşleşen güncel randevular listelenir.</span>
              <span className="font-mono text-[#C7D5F0]">{customerPhone}</span>
            </div>

            <div className="p-5 space-y-4 max-h-[110vh] overflow-y-auto divide-y divide-white/5">
              {appointments.filter(a => a.customerPhone === customerPhone || a.customerName.toLowerCase().includes(customerName.toLowerCase())).length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <ShieldAlert className="w-8 h-8 text-white/20 mx-auto" />
                  <p className="text-xs text-white/60 font-medium">Bu telefon veya isim adına kayıtlı randevu bulunamadı.</p>
                  <p className="text-[10px] text-white/40">Soldaki rezervasyon formunu kullanarak hızlıca ilk randevunuzu oluşturabilirsiniz.</p>
                </div>
              ) : (
                appointments
                  .filter(a => a.customerPhone === customerPhone || a.customerName.toLowerCase().includes(customerName.toLowerCase()))
                  .sort((x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime())
                  .map((apt, index) => {
                    const statusConfig = () => {
                      switch (apt.status) {
                        case 'Pending':
                          return { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Beklemede' };
                        case 'Confirmed':
                          return { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Onaylandı' };
                        case 'Completed':
                          return { bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', label: 'Tamamlandı' };
                        default:
                          return { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'İptal Edildi' };
                      }
                    };
                    const config = statusConfig();

                    return (
                      <div key={apt.id} className={`pt-4 ${index === 0 ? 'pt-0' : 'pt-4'} space-y-3.5 group`}>
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-xs text-white flex items-center gap-1.5 font-sans">
                            <span className="text-[#C7D5F0] font-bold">{apt.date}</span>
                            <span className="text-white/20">•</span>
                            <span className="font-mono text-white/80">{apt.time} Saat</span>
                          </div>
                          
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${config.bg}`}>
                            {config.label}
                          </span>
                        </div>

                        <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs space-y-2 relative">
                          <div className="flex justify-between items-center">
                            <span className="text-white/40">Sanatçı:</span>
                            <span className="font-semibold text-[#C7D5F0]">{apt.artistName}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/40">Hizmet Alan:</span>
                            <span className="text-white/80">
                              {apt.services.map(i => services.find(s => s.id === i)?.name || i).join(', ')}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs border-t border-white/5 pt-1.5 mt-1">
                            <span className="text-white/40">Fiyat Bilgisi:</span>
                            <span className="font-semibold text-[#C7D5F0]">Yüz Yüze Kararlaştırılacak</span>
                          </div>

                          {/* Render notes preview */}
                          {apt.notes && (
                            <div className="text-[10px] text-white/50 leading-relaxed italic bg-white/5 px-2 py-1.5 rounded mt-3 text-ellipsis overflow-hidden border border-white/5">
                              "{apt.notes}"
                            </div>
                          )}

                          {/* Reference thumbnails */}
                          {apt.clientImages && apt.clientImages.length > 0 && (
                            <div className="mt-2.5">
                              <span className="text-[9px] font-mono font-bold text-white/40 tracking-wider block mb-1">Referans Görseller:</span>
                              <div className="flex gap-1.5 overflow-x-auto">
                                {apt.clientImages.map((src, j) => (
                                  <div key={j} className="w-10 h-10 rounded border border-white/10 overflow-hidden relative flex-shrink-0 bg-black">
                                    <img src={src} className="w-full h-full object-cover" alt="mini reference" referrerPolicy="no-referrer" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions for client like cancelling */}
                        {apt.status === 'Pending' && (
                          <div className="mt-3 pt-3 border-t border-white/5">
                            {cancellingAptId === apt.id ? (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 overflow-hidden"
                              >
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-rose-400 font-mono uppercase tracking-wider block">
                                    İptal Nedeni (Opsiyonel)
                                  </label>
                                  <textarea
                                    className="w-full bg-[#181818] border border-white/10 rounded-lg p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500/50 min-h-[60px]"
                                    placeholder="Lütfen iptal etme nedeninizi yazın (sanatçıya ve yöneticilere iletilecektir)..."
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    maxLength={200}
                                  />
                                </div>
                                <div className="flex justify-end gap-2 text-[10px]">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCancellingAptId(null);
                                      setCancelReason('');
                                    }}
                                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold uppercase rounded border border-white/5 transition"
                                  >
                                    Vazgeç
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onCancelAppointment(apt.id, cancelReason);
                                      setCancellingAptId(null);
                                      setCancelReason('');
                                    }}
                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase rounded transition"
                                  >
                                    İptali Onayla
                                  </button>
                                </div>
                              </motion.div>
                            ) : (
                              <div className="flex justify-end">
                                <button
                                  id={`cancel-booking-${apt.id}`}
                                  type="button"
                                  onClick={() => {
                                    setCancellingAptId(apt.id);
                                    setCancelReason('');
                                  }}
                                  className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase rounded border border-rose-500/25 transition cursor-pointer"
                                >
                                  Randevuyu İptal Et
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
