import React, { useState } from 'react';
import { User, Shield, Sparkles, Lock, Mail, Phone, FileText, CheckCircle, ArrowRight, Eye, EyeOff, Key } from 'lucide-react';
import { Artist, Studio } from '../types';
import { db } from '../firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

interface AuthGatewayProps {
  onLogin: (user: {
    role: 'customer' | 'studio' | 'artist' | 'super_admin';
    email: string;
    name: string;
    phone?: string;
    artistId?: string;
    studioId?: string;
  }) => void;
  artists: Artist[];
  onAddArtist: (newArtist: Artist) => void;
  initialTab?: 'customer' | 'studio' | 'artist';
  studios: Studio[];
  onAddStudio: (newStudio: Studio) => void;
}

export default function AuthGateway({ onLogin, artists, onAddArtist, initialTab = 'customer', studios, onAddStudio }: AuthGatewayProps) {
  const [activeTab, setActiveTab] = useState<'customer' | 'studio' | 'artist'>(initialTab);
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  React.useEffect(() => {
    setActiveTab(initialTab);
    setIsRegister(false);
    setErrorStatus(null);
    setSuccessStatus(null);
    setLicenseCode('');
  }, [initialTab]);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Artist register special fields
  const [artistTitle, setArtistTitle] = useState('');
  const [artistBio, setArtistBio] = useState('');
  const [artistSpecialties, setArtistSpecialties] = useState('');

  // Studio register special fields
  const [studioName, setStudioName] = useState('');
  const [studioBranch, setStudioBranch] = useState('');
  const [studioPhone, setStudioPhone] = useState('');
  const [studioAddress, setStudioAddress] = useState('');
  const [licenseCode, setLicenseCode] = useState('');

  // Error/Success Notification
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);

  // Helper autofills for testing
  const handleDemoFill = (role: 'customer' | 'studio' | 'artist', testType: 'login' | 'register') => {
    setErrorStatus(null);
    setSuccessStatus(null);
    setIsRegister(testType === 'register');
    
    if (role === 'customer') {
      if (testType === 'login') {
        setEmail('berkay@reserve.com');
        setPassword('password123');
      } else {
        setName('Sarah Jenkins');
        setEmail('sarah@reserve.com');
        setPhone('0532 111 2233');
        setPassword('password123');
      }
    } else if (role === 'studio') {
      setEmail('admin@studio.co');
      setPassword('adminpassword');
      if (testType === 'register') {
        setName('Studio Noir Admin');
      }
    } else if (role === 'artist') {
      if (testType === 'login') {
        // Find first artist email
        setEmail('efe@tattoo.co');
        setPassword('efe123');
      } else {
        setName('Julian Vance');
        setEmail('julian@tattoo.co');
        setPassword('julian123');
        setPhone('0535 777 8899');
        setArtistTitle('Resident Traditional Artist');
        setArtistBio('Julian specializes in high-contrast american traditional tattooing and dark blackwork aesthetics.');
        setArtistSpecialties('Old School, Realism, Dotwork');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);
    setSuccessStatus(null);

    if (!email || !password) {
      setErrorStatus('E-posta ve şifre alanları zorunludur.');
      return;
    }

    const emailKey = email.toLowerCase().trim();

    try {
      if (isRegister) {
        // REGISTER FLOW
        if (activeTab === 'customer') {
          if (!name || !phone) {
            setErrorStatus('Lütfen Ad Soyad ve Telefon Numarası girin.');
            return;
          }

          // Check if exists in firestore
          const docRef = doc(db, 'auth_customers', emailKey);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() || emailKey === 'berkay@reserve.com') {
            setErrorStatus('Bu e-posta adresiyle daha önce kayıt olunmuş.');
            return;
          }

          const newCustomer = { id: `cust_${Date.now()}`, name, email: emailKey, phone, password };
          await setDoc(docRef, newCustomer);
          
          setSuccessStatus('Müşteri hesabı başarıyla oluşturuldu! Giriş yapılıyor...');
          setTimeout(() => {
            onLogin({
              role: 'customer',
              email: newCustomer.email,
              name: newCustomer.name,
              phone: newCustomer.phone
            });
          }, 1200);

        } else if (activeTab === 'studio') {
          if (emailKey === 'info@mediablessed.com') {
            setErrorStatus('Bu özel e-posta adresi ile yeni bir kayıt oluşturamazsınız.');
            return;
          }

          if (!licenseCode.trim()) {
            setErrorStatus('Yönetici hesabı açabilmek için geçerli bir Lisans Kodu girmelisiniz.');
            return;
          }

          // Validate and self-destruct license code
          const licenseKey = licenseCode.trim().toLowerCase();
          const licDoc = await getDoc(doc(db, 'license_codes', licenseKey));
          if (!licDoc.exists()) {
            setErrorStatus('Girdiğiniz lisans kodu geçersiz veya daha önce kullanılmış.');
            return;
          }

          const docRef = doc(db, 'auth_admins', emailKey);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() || emailKey === 'admin@studio.co') {
            setErrorStatus('Bu e-posta adresiyle kayıtlı bir yönetici bulunuyor.');
            return;
          }

          // Immediatelly self-destruct (delete) used license code
          await deleteDoc(doc(db, 'license_codes', licenseKey));

          const newStudioId = `studio_${Date.now()}`;
          const newAdmin = { 
            id: `admin_${Date.now()}`, 
            name: name || 'Dövme Stüdyosu', 
            email: emailKey, 
            password, 
            phone: studioPhone || '0532 000 00 00', 
            studioId: newStudioId 
          };
          await setDoc(docRef, newAdmin);

          // Generate a new Studio sub-branch entry
          const newStudio: Studio = {
            id: newStudioId,
            name: studioName || name || 'Tattoo Reserve',
            branch: studioBranch || 'Merkez Şube',
            phone: studioPhone || '0532 000 00 00',
            email: emailKey,
            address: studioAddress || 'Kültür, Kıbrıs Şehitleri Cd. No:44, Kat:2 D:5, 35220 Alsancak, Konak/İzmir'
          };
          onAddStudio(newStudio);

          setSuccessStatus('Yönetici hesabı ve yeni stüdyo şubesi başarıyla kaydedildi! Giriş yapılıyor...');
          setTimeout(() => {
            onLogin({
              role: 'studio',
              email: newAdmin.email,
              name: newAdmin.name,
              studioId: newStudioId,
            });
          }, 1200);

        } else if (activeTab === 'artist') {
          if (!name || !artistTitle || !artistBio || !phone) {
            setErrorStatus('Sanatçı Adı, Ünvanı, Cep Telefonu ve Biyografi alanları zorunludur.');
            return;
          }

          const docRef = doc(db, 'auth_artists', emailKey);
          const docSnap = await getDoc(docRef);
          const preloadedEmails = ['efe@tattoo.co', 'derin@tattoo.co', 'canberk@tattoo.co'];
          if (docSnap.exists() || preloadedEmails.includes(emailKey)) {
            setErrorStatus('Bu e-posta adresiyle kayıtlı bir dövme sanatçısı bulunuyor.');
            return;
          }

          // Create new dynamic Artist details in INITIAL_ARTISTS stack
          const newArtistId = `art_dyn_${Date.now()}`;
          const newArtistObj: Artist = {
            id: newArtistId,
            name: name,
            title: artistTitle,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&q=80',
            bio: artistBio,
            completedTattoos: 0,
            specialties: artistSpecialties ? artistSpecialties.split(',').map(s => s.trim()) : ['Tattoo Design'],
            portfolio: [],
            phone: phone, // Link phone number
            studioId: '', // Default unconnected
          };

          // Add to persistent artists
          onAddArtist(newArtistObj);

          // Store in firestore auth list
          const newArtistUser = {
            id: `user_art_${Date.now()}`,
            email: emailKey,
            password,
            name,
            phone,
            artistId: newArtistId
          };
          await setDoc(docRef, newArtistUser);

          setSuccessStatus('Yeni Sanatçı profili ve hesabı başarıyla kaydedildi! Portfolyo yönetim paneline aktarılıyorsunuz.');
          setTimeout(() => {
            onLogin({
              role: 'artist',
              email: newArtistUser.email,
              name: newArtistUser.name,
              artistId: newArtistId
            });
          }, 1200);
        }

      } else {
        // LOGIN FLOW
        if (activeTab === 'customer') {
          // Check firestore, fallback to default seed customer
          const docSnap = await getDoc(doc(db, 'auth_customers', emailKey));
          let matched: any = null;
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.password === password) {
              matched = data;
            }
          } else if (emailKey === 'berkay@reserve.com' && password === 'password123') {
            matched = { name: 'Berkay Çeri', email: 'berkay@reserve.com', phone: '0532 123 45 67' };
          }

          if (!matched) {
            setErrorStatus('Hatalı müşteri e-posta adresi veya şifre.');
            return;
          }

          setSuccessStatus(`Hoş geldiniz, ${matched.name}!`);
          setTimeout(() => {
            onLogin({
              role: 'customer',
              email: matched.email,
              name: matched.name,
              phone: matched.phone
            });
          }, 1000);

        } else if (activeTab === 'studio') {
          // Special Super Admin check
          if (emailKey === 'info@mediablessed.com' && password === 'BlessedAdmin.8613') {
            setSuccessStatus('MediaBlessed Özel Süper Admin Paneline Giriş Yapıldı!');
            setTimeout(() => {
              onLogin({
                role: 'super_admin',
                email: 'info@mediablessed.com',
                name: 'MediaBlessed Süper Admin'
              });
            }, 1000);
            return;
          }

          const docSnap = await getDoc(doc(db, 'auth_admins', emailKey));
          let matched: any = null;
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.password === password) {
              matched = data;
            }
          } else if (emailKey === 'admin@studio.co' && password === 'adminpassword') {
            matched = { name: 'Studio Noir Admin', email: 'admin@studio.co', studioId: 'studio_default' };
          }

          if (!matched) {
            setErrorStatus('Hatalı yönetici şifresi veya e-posta adresi.');
            return;
          }

          setSuccessStatus(`Yönetici Paneline Hoş Geldiniz!`);
          setTimeout(() => {
            onLogin({
              role: 'studio',
              email: matched.email,
              name: matched.name,
              studioId: matched.studioId || 'studio_default'
            });
          }, 1000);

        } else if (activeTab === 'artist') {
          const docSnap = await getDoc(doc(db, 'auth_artists', emailKey));
          let matched: any = null;
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.password === password) {
              matched = data;
            }
          } else {
            // Demo fallback
            if (emailKey === 'efe@tattoo.co' && password === 'efe123') {
              matched = { name: 'Efe Yılmaz', email: 'efe@tattoo.co', artistId: 'art_efe' };
            } else if (emailKey === 'derin@tattoo.co' && password === 'derin123') {
              matched = { name: 'Derin Sönmez', email: 'derin@tattoo.co', artistId: 'art_derin' };
            } else if (emailKey === 'canberk@tattoo.co' && password === 'canberk123') {
              matched = { name: 'Canberk Tekin', email: 'canberk@tattoo.co', artistId: 'art_canberk' };
            }
          }

          if (!matched) {
            setErrorStatus('Hatalı sanatçı giriş bilgileri. (Demo için efe@tattoo.co / efe123 kullanın)');
            return;
          }

          setSuccessStatus(`Sanatçı olarak giriş yapıldı: ${matched.name}`);
          setTimeout(() => {
            onLogin({
              role: 'artist',
              email: matched.email,
              name: matched.name,
              artistId: matched.artistId
            });
          }, 1000);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorStatus('Bağlantı hatası: Sunucu ile iletişim kurulamadı.');
    }
  };

  return (
    <div className="max-w-md mx-auto w-full my-8 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden" id="login-register-gateway">
      
      {/* Brand Header */}
      <div className="p-6 text-center border-b border-white/10 bg-white/5 relative">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border border-white/20">
          <img 
            src="https://r.resimlink.com/79xHR3v.jpg" 
            alt="Tattoo Reserve Logo" 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>
        <h2 className="text-xl font-serif tracking-widest uppercase text-[#C7D5F0]">Tattoo Reserve</h2>
        <p className="text-[10px] text-white/40 tracking-[0.22em] uppercase mt-1">Kimlik Doğrulama Kapısı</p>
      </div>

      {/* Segmented Auth Selector Tabs */}
      <div className="flex border-b border-white/10 bg-black/40">
        <button
          onClick={() => { setActiveTab('customer'); setIsRegister(false); setErrorStatus(null); setSuccessStatus(null); }}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-1 border-b-2 transition ${
            activeTab === 'customer' 
              ? 'border-[#C7D5F0] text-[#C7D5F0] bg-white/5' 
              : 'border-transparent text-white/40 hover:text-white/80 hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4" />
          <span>MÜŞTERİ</span>
        </button>
        <button
          onClick={() => { setActiveTab('studio'); setIsRegister(false); setErrorStatus(null); setSuccessStatus(null); }}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-1 border-b-2 transition ${
            activeTab === 'studio' 
              ? 'border-[#C7D5F0] text-[#C7D5F0] bg-white/5' 
              : 'border-transparent text-white/40 hover:text-white/80 hover:bg-white/5'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>YÖNETİCİ</span>
        </button>
        <button
          onClick={() => { setActiveTab('artist'); setIsRegister(false); setErrorStatus(null); setSuccessStatus(null); }}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex flex-col items-center gap-1 border-b-2 transition ${
            activeTab === 'artist' 
              ? 'border-[#C7D5F0] text-[#C7D5F0] bg-white/5' 
              : 'border-transparent text-white/40 hover:text-white/80 hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>SANATÇI</span>
        </button>
      </div>

      <div className="p-6">
        
        {/* Toggle Login vs Register */}
        <div className="flex border border-white/10 rounded-lg p-1 bg-black/60 mb-6 text-xs font-bold tracking-wider">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setErrorStatus(null); }}
            className={`flex-1 py-1.5 rounded uppercase ${!isRegister ? 'bg-[#C7D5F0] text-black' : 'text-white/60 hover:text-white'}`}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setErrorStatus(null); }}
            className={`flex-1 py-1.5 rounded uppercase ${isRegister ? 'bg-[#C7D5F0] text-black' : 'text-white/60 hover:text-white'}`}
          >
            Kayıt Ol
          </button>
        </div>

        {/* Status Messages */}
        {errorStatus && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-xs flex items-start gap-2">
            <span className="font-bold underline uppercase shrink-0 font-mono">HATA:</span>
            <span>{errorStatus}</span>
          </div>
        )}
        {successStatus && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs flex items-start gap-2">
            <span className="font-bold shrink-0 font-mono text-emerald-300">✓</span>
            <span>{successStatus}</span>
          </div>
        )}

        {/* Instructions */}
        <p className="text-[11px] text-white/50 mb-4 leading-relaxed font-sans block italic border-l-2 border-[#C7D5F0] pl-2">
          {activeTab === 'customer' && !isRegister && "Müşteri girişi yaparak oluşturduğunuz tüm randevuları takip edebilir ve yenilerini kaydedebilirsiniz."}
          {activeTab === 'customer' && isRegister && "Ad, soyad ve e-posta bilgilerinizle kayıt olun ve stüdyoda kart gerektirmeksizin rezervasyon yapın."}
          {activeTab === 'studio' && !isRegister && "Tüm uzman sanatçıların çalışmalarını yönetmek, fiyatlar belirlemek ve çalışma saatlerini koordine etmek için admin hesabı."}
          {activeTab === 'studio' && isRegister && "Stüdyo Noir bünyesinde yeni bir yönetici veya koordinatör profili/hesabı oluşturun."}
          {activeTab === 'artist' && !isRegister && "Sanatçı girişi yaparak, kişisel çalışma portfolyonuzdaki eserleri sevk edin ve randevularınızı onaylayın."}
          {activeTab === 'artist' && isRegister && "Stüdyomuz bünyesinde kendi adınıza sanatçı profili açarak sisteme dahil olun!"}
        </p>

        {/* Main Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Register-only generic Name */}
          {isRegister && (
            <div className="space-y-1">
              <label className="block text-[10px] text-white/50 uppercase tracking-widest font-mono">
                {activeTab === 'artist' ? 'Dövme Sanatçısı İsmi' : 'Ad Soyad'}
              </label>
              <input
                type="text"
                placeholder={activeTab === 'artist' ? 'Örn: Julian Vance' : 'Örn: Sarah Jenkins'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-xs bg-black border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-[#C7D5F0] transition"
              />
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1">
            <label className="block text-[10px] text-white/50 uppercase tracking-widest font-mono">E-posta Adresi</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
              <input
                type="email"
                placeholder="ornek@tattoo.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-xs bg-black border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-white focus:outline-none focus:border-[#C7D5F0] transition"
              />
            </div>
          </div>

          {/* Register-only Customer/Artist Mobile Phone */}
          {isRegister && (activeTab === 'customer' || activeTab === 'artist') && (
            <div className="space-y-1">
              <label className="block text-[10px] text-white/50 uppercase tracking-widest font-mono">Cep Telefonu</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="0532 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full text-xs bg-black border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-white focus:outline-none focus:border-[#C7D5F0] transition"
                />
              </div>
            </div>
          )}

          {/* Register-only Studio sub-branch details */}
          {isRegister && activeTab === 'studio' && (
            <>
              <div className="space-y-1">
                <label className="block text-[10px] text-amber-400 font-bold uppercase tracking-widest font-mono flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lisans Kodu (MB-XXXX-YYYY)*</span>
                </label>
                <input
                  type="text"
                  placeholder="Yalnızca süper admin tarafından üretilen geçerli lisans"
                  value={licenseCode}
                  onChange={(e) => setLicenseCode(e.target.value)}
                  required
                  className="w-full text-xs bg-black border border-amber-500/30 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-amber-400 font-mono tracking-wider uppercase transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-white/50 uppercase tracking-widest font-mono">Stüdyo Adı / Salon Markası</label>
                <div className="relative">
                  <Sparkles className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Örn: Tattoo Reserve"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    required
                    className="w-full text-xs bg-black border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-white focus:outline-none focus:border-[#C7D5F0] transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-white/50 uppercase tracking-widest font-mono">Şube Adı / Bölge</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Örn: Alsancak Şubesi"
                    value={studioBranch}
                    onChange={(e) => setStudioBranch(e.target.value)}
                    required
                    className="w-full text-xs bg-black border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-white focus:outline-none focus:border-[#C7D5F0] transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-white/50 uppercase tracking-widest font-mono">Stüdyo Telefon Numarası</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Örn: 0532 111 22 33"
                    value={studioPhone}
                    onChange={(e) => setStudioPhone(e.target.value)}
                    required
                    className="w-full text-xs bg-black border border-white/10 rounded-lg py-2.5 pl-10 pr-3 text-white focus:outline-none focus:border-[#C7D5F0] transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-white/50 uppercase tracking-widest font-mono">Tam Adres Tarifi (Google Haritalar İçin)</label>
                <textarea
                  placeholder="Örn: Kültür, Kıbrıs Şehitleri Cd. No:44, Kat:2 D:5, 35220 Alsancak, Konak/İzmir"
                  value={studioAddress}
                  onChange={(e) => setStudioAddress(e.target.value)}
                  required
                  rows={2}
                  className="w-full text-xs bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#C7D5F0] transition"
                />
              </div>
            </>
          )}

          {/* Register-only Artist properties (Title, Bio, Specialties) */}
          {isRegister && activeTab === 'artist' && (
            <>
              <div className="space-y-1">
                <label className="block text-[10px] text-white/50 uppercase tracking-widest font-mono">Sanatçı Ünvanı / Tarzı</label>
                <input
                  type="text"
                  placeholder="Örn: Realizm & İnce Çizgi Sanatçısı"
                  value={artistTitle}
                  onChange={(e) => setArtistTitle(e.target.value)}
                  required
                  className="w-full text-xs bg-black border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-[#C7D5F0] transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-white/50 uppercase tracking-widest font-mono">Kısa Biyografi (1 Cümle)</label>
                <textarea
                  placeholder="Sanat geçmişiniz veya tarzınızı özetleyen etkileyici bir cümle..."
                  value={artistBio}
                  onChange={(e) => setArtistBio(e.target.value)}
                  required
                  rows={2}
                  className="w-full text-xs bg-black border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#C7D5F0] transition"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-white/50 uppercase tracking-widest font-mono">Uzmanlık Alanları (Virgülle Ayırın)</label>
                <input
                  type="text"
                  placeholder="Örn: Realizm, Blackwork, Geleneksel"
                  value={artistSpecialties}
                  onChange={(e) => setArtistSpecialties(e.target.value)}
                  className="w-full text-xs bg-black border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-[#C7D5F0] transition"
                />
              </div>
            </>
          )}

          {/* Password input */}
          <div className="space-y-1">
            <label className="block text-[10px] text-white/50 uppercase tracking-widest font-mono">Güvenlik Şifresi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-xs bg-black border border-white/10 rounded-lg py-2.5 pl-10 pr-10 text-white focus:outline-none focus:border-[#C7D5F0] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-white/30 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-3 bg-[#C7D5F0] hover:bg-[#b0c4eb] text-black text-xs font-bold uppercase tracking-widest rounded transition flex items-center justify-center gap-2 mt-6 active:scale-95"
          >
            <span>{isRegister ? 'HESAP OLUŞTUR VE GİRİŞ YAP' : 'OTURUMLARI DOĞRULA VE GİRİŞ YAP'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
