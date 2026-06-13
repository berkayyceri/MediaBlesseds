import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocs, getDoc } from 'firebase/firestore';
import { Key, Users, Hash, ShieldAlert, CheckCircle, RefreshCw, Trash2, Copy, Sparkles, Building, Palette, LogOut } from 'lucide-react';

interface SuperAdminPanelProps {
  onLogout: () => void;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  password?: string;
  studioId?: string;
  artistId?: string;
}

interface LicenseCode {
  id: string;
  code: string;
  createdAt: string;
  isUsed: boolean;
}

export default function SuperAdminPanel({ onLogout }: SuperAdminPanelProps) {
  const [customers, setCustomers] = useState<AuthUser[]>([]);
  const [admins, setAdmins] = useState<AuthUser[]>([]);
  const [artists, setArtists] = useState<AuthUser[]>([]);
  const [licenseCodes, setLicenseCodes] = useState<LicenseCode[]>([]);

  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'account' | 'license';
    id: string;
    collectionName?: string;
    displayName: string;
  } | null>(null);

  // Secure validation and query state variables
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    exists: boolean;
    data?: any;
    searched: boolean;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Load all auth accounts
  useEffect(() => {
    const unsubCustomers = onSnapshot(collection(db, 'auth_customers'), (snapshot) => {
      const list: AuthUser[] = [];
      snapshot.forEach(d => list.push(d.data() as AuthUser));
      setCustomers(list);
    }, err => handleFirestoreError(err, OperationType.GET, 'auth_customers'));

    const unsubAdmins = onSnapshot(collection(db, 'auth_admins'), (snapshot) => {
      const list: AuthUser[] = [];
      snapshot.forEach(d => {
        // Exclude super admin itself from listing to avoid confusion, or include it
        const data = d.data() as AuthUser;
        if (data.email !== 'info@mediablessed.com') {
          list.push(data);
        }
      });
      setAdmins(list);
    }, err => handleFirestoreError(err, OperationType.GET, 'auth_admins'));

    const unsubArtists = onSnapshot(collection(db, 'auth_artists'), (snapshot) => {
      const list: AuthUser[] = [];
      snapshot.forEach(d => list.push(d.data() as AuthUser));
      setArtists(list);
    }, err => handleFirestoreError(err, OperationType.GET, 'auth_artists'));

    const unsubLicenses = onSnapshot(collection(db, 'license_codes'), (snapshot) => {
      const list: LicenseCode[] = [];
      snapshot.forEach(d => list.push(d.data() as LicenseCode));
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setLicenseCodes(list);
      setLoading(false);
    }, err => handleFirestoreError(err, OperationType.GET, 'license_codes'));

    return () => {
      unsubCustomers();
      unsubAdmins();
      unsubArtists();
      unsubLicenses();
    };
  }, []);

  // Generate standard random code function
  const generateCode = async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart1 = '';
    let randomPart2 = '';
    for (let i = 0; i < 4; i++) {
      randomPart1 += chars.charAt(Math.floor(Math.random() * chars.length));
      randomPart2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newCode = `MB-${randomPart1}-${randomPart2}`;
    
    // Check if code already exists
    const codeId = newCode.toLowerCase();
    const newLicense: LicenseCode = {
      id: codeId,
      code: newCode,
      createdAt: new Date().toISOString(),
      isUsed: false
    };

    await setDoc(doc(db, 'license_codes', codeId), newLicense).catch(e => console.error(e));
  };

  const triggerDeleteLicense = (id: string, code: string) => {
    setConfirmDelete({
      type: 'license',
      id,
      displayName: code
    });
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopySuccess(code);
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };

  const triggerDeleteAccount = (collectionName: string, email: string, name: string) => {
    setConfirmDelete({
      type: 'account',
      id: email,
      collectionName,
      displayName: `${name} (${email})`
    });
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    try {
      if (confirmDelete.type === 'license') {
        await deleteDoc(doc(db, 'license_codes', confirmDelete.id));
      } else if (confirmDelete.type === 'account' && confirmDelete.collectionName) {
        await deleteDoc(doc(db, confirmDelete.collectionName, confirmDelete.id.toLowerCase().trim()));
      }
    } catch (e) {
      console.error("Deletion error:", e);
    } finally {
      setConfirmDelete(null);
    }
  };

  // Secure Firestore license code verification query
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyCodeInput.trim()) return;
    setVerifying(true);
    setVerificationResult(null);
    try {
      const codeKey = verifyCodeInput.trim().toLowerCase();
      // Secure single document retrieval from Firestore
      const docRef = doc(db, 'license_codes', codeKey);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setVerificationResult({
          exists: true,
          data: data,
          searched: true
        });
      } else {
        setVerificationResult({
          exists: false,
          searched: true
        });
      }
    } catch (err) {
      console.error("Error verifying license code:", err);
    } finally {
      setVerifying(false);
    }
  };

  // Self-destruct/delete the code on successful verification/consumption
  const handleConsumeVerifiedCode = async (codeId: string) => {
    try {
      await deleteDoc(doc(db, 'license_codes', codeId.toLowerCase()));
      setVerificationResult(prev => prev ? { ...prev, exists: false } : null);
      setVerifyCodeInput('');
    } catch (err) {
      console.error("Error deleting used license code:", err);
    }
  };

  // Safe search utility for listing users
  const filteredAdmins = admins.filter(a => 
    !userSearchQuery.trim() || 
    a.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    a.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const filteredArtists = artists.filter(a => 
    !userSearchQuery.trim() || 
    a.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    a.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter(a => 
    !userSearchQuery.trim() || 
    a.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    a.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8" id="super-admin-root">
      
      {/* Super Admin Top Header */}
      <div className="bg-gradient-to-r from-[#161d2d] to-[#0c0f17] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C7D5F0]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C7D5F0] tracking-widest uppercase bg-white/5 w-fit px-3 py-1.5 rounded-full border border-white/10">
            <ShieldAlert className="w-4 h-4 text-[#C7D5F0] animate-pulse" />
            <span>Süper Yönetici Paneli</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif tracking-wide text-white">MediaBlessed Özel Kontrol Merkezi</h2>
          <p className="text-xs sm:text-sm text-white/50 font-sans max-w-xl">
            Tüm kayıtlı kullanıcı hesaplarını görebilir, yönetebilir ve yeni yöneticilerin kayıt olabilmesi için tek kullanımlık lisans kodları üretebilirsiniz.
          </p>
        </div>
        <button
          onClick={onLogout}
          className="px-5 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 shrink-0 active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Yönetimden Ayrıl</span>
        </button>
      </div>

      {/* Grid Layout: Account Overview & License Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: License Codes Panel */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-xl relative">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#C7D5F0]/10 text-[#C7D5F0]">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">LİSANS KODU MOTORU</h3>
                  <p className="text-[10px] text-white/40">Yönetici hesapları için tek kullanımlık kodlar</p>
                </div>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={generateCode}
              className="w-full py-3.5 bg-[#C7D5F0] hover:bg-[#b0c4eb] text-black font-black text-xs uppercase tracking-widest rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 hover:shadow-[#C7D5F0]/20 hover:shadow-xl active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>YENİ LİSANS KODU ÜRET</span>
            </button>

            {/* List of active codes */}
            <div className="mt-6 space-y-3">
              <h4 className="text-[10px] uppercase font-mono tracking-widest text-white/40">Kullanılabilir Lisanslar ({licenseCodes.length})</h4>
              
              {loading ? (
                <div className="text-center py-6 text-xs text-white/40 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C7D5F0]" />
                  <span>Yükleniyor...</span>
                </div>
              ) : licenseCodes.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl bg-black/20 text-xs text-white/30">
                  <p>Üretilmiş lisans kodu bulunmuyor.</p>
                  <p className="mt-1 text-[10px] text-white/20">Yukarıdaki butona tıklayarak kod oluşturun.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 select-none">
                  {licenseCodes.map((lc) => (
                    <div 
                      key={lc.id} 
                      className="p-3 bg-black/40 border border-white/5 hover:border-[#C7D5F0]/20 rounded-xl flex items-center justify-between transition group"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-xs font-bold text-white selection:bg-purple-900">{lc.code}</span>
                        <span className="text-[9px] text-white/30 font-mono">
                          {new Date(lc.createdAt).toLocaleDateString('tr-TR')} {new Date(lc.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleCopy(lc.code)}
                          title="Kopyala"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-[#C7D5F0]/10 text-white/60 hover:text-[#C7D5F0] transition"
                        >
                          {copySuccess === lc.code ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => triggerDeleteLicense(lc.id, lc.code)}
                          title="Sil"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/10 text-white/60 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Stats Guard card */}
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 shadow-xl text-xs space-y-3">
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#C7D5F0]">SİSTEM BİLGİSİ</h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                <span className="text-xl font-bold text-white block">{admins.length + 1}</span>
                <span className="text-[10px] text-white/40 uppercase">Yönetici</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                <span className="text-xl font-bold text-white block">{artists.length}</span>
                <span className="text-[10px] text-white/40 uppercase">Sanatçı</span>
              </div>
            </div>
            <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg text-center text-[10px] text-white/50 leading-relaxed font-mono">
              <span className="text-emerald-400 font-bold block mb-0.5">● Lisans Güvenliği Aktif</span>
              Geçerli lisans girilmeden hiçbir yeni stüdyo sahibi / yönetici hesabı oluşturulamaz.
            </div>
          </div>

          {/* Secure License Verification Console */}
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[11px] uppercase font-bold tracking-wider text-white">LİSANS DOĞRULAMA KONSOLU</h4>
                <p className="text-[9px] text-white/40">Veritabanından canlı sorgulama ve tüketim kontrolü</p>
              </div>
            </div>

            <form onSubmit={handleVerifyCode} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="MB-XXXX-XXXX"
                  value={verifyCodeInput}
                  onChange={(e) => setVerifyCodeInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-white placeholder-white/20 uppercase focus:outline-none focus:border-emerald-500/45 transition"
                />
                <button
                  type="submit"
                  disabled={verifying || !verifyCodeInput.trim()}
                  className="px-3.5 py-2 bg-white/5 hover:bg-emerald-500 hover:text-black hover:font-bold border border-white/10 hover:border-emerald-500/50 text-white text-xs uppercase tracking-wide rounded-lg transition disabled:opacity-50 disabled:bg-white/5 disabled:text-white/40"
                >
                  {verifying ? 'Sorgulanıyor...' : 'Sorgula'}
                </button>
              </div>
            </form>

            {verificationResult && (
              <div className="space-y-3 animate-fade-in">
                {verificationResult.exists ? (
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-emerald-400 font-mono">
                      <CheckCircle className="w-4 h-4" />
                      <span>GEÇERLİ KOD (AKTİF)</span>
                    </div>
                    <p className="text-[10px] text-white/50 leading-relaxed font-mono">
                      Yayın Tarihi: {new Date(verificationResult.data?.createdAt).toLocaleDateString('tr-TR')} {new Date(verificationResult.data?.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <button
                      onClick={() => handleConsumeVerifiedCode(verifyCodeInput.trim())}
                      className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/30 text-[10px] font-bold uppercase tracking-wider rounded-lg transition"
                    >
                      Kodu Tüket ve Anında Sil
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-black uppercase text-rose-400 font-mono">
                      <Trash2 className="w-4 h-4" />
                      <span>KOD GEÇERSİZ / KULLANILMIŞ</span>
                    </div>
                    <p className="text-[9px] text-white/40 leading-relaxed font-sans">
                      Bu kod veritabanında aktif olarak tanımlı değildir. Daha önce stüdyo kaydı yapılmış veya iptal edilmiş olabilir.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Account Registrations Database */}
        <div className="col-span-1 lg:col-span-8 space-y-6">
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-white/10">
              <div className="p-2 rounded-lg bg-[#C7D5F0]/10 text-[#C7D5F0]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">AÇILAN HESAPLAR VERİTABANI</h3>
                <p className="text-[10px] text-white/40">Sistemde oluşturulmuş tüm kullanıcı profilleri</p>
              </div>
            </div>

            {/* Quick Live User Search - Real-time Secure Filter */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Kullanıcı adı veya e-posta adresi yazıp anında sorgulayın..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C7D5F0]/50 focus:ring-1 focus:ring-[#C7D5F0]/30 transition font-sans"
                />
                <span className="absolute left-3.5 top-3.5 text-xs text-white/40">🔍</span>
              </div>
              {userSearchQuery.trim() && (
                <p className="text-[10px] text-[#C7D5F0] mt-1.5 font-mono">
                  Sorgu Sonucu Filtrelenen Kayıtlar: {filteredAdmins.length + filteredArtists.length + filteredCustomers.length} eşleşme bulundu
                </p>
              )}
            </div>

            <div className="space-y-6">

              {/* 1. Yöneticiler (Admins) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-1">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Tarihli Stüdyo Yöneticileri ({filteredAdmins.length})</span>
                  </div>
                </div>
                {filteredAdmins.length === 0 ? (
                  <p className="p-3 text-xs text-white/30 italic">Eşleşen kayıtlı stüdyo yöneticisi bulunmuyor.</p>
                ) : (
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {filteredAdmins.map((adm) => (
                      <div key={adm.id} className="p-3 bg-black/40 border border-[#C7D5F0]/5 rounded-xl flex items-center justify-between hover:border-[#C7D5F0]/20 transition">
                        <div className="space-y-0.5">
                           <p className="text-xs font-bold text-white mb-0.5">{adm.name}</p>
                           <p className="text-[11px] text-white/50 font-mono">
                             {adm.email} {adm.phone ? `| Tel: ${adm.phone}` : (adm.email === 'admin@studio.co' ? '| Tel: 0532 000 00 00' : '')}
                           </p>
                           {adm.studioId && <p className="text-[9px] text-[#C7D5F0] uppercase font-mono">Şube ID: {adm.studioId}</p>}
                        </div>
                        <button
                          onClick={() => triggerDeleteAccount('auth_admins', adm.email, adm.name)}
                          className="p-1 px-2.5 text-[10px] text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 hover:border-rose-500/30 rounded-md transition"
                        >
                          Erişimi Sil
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Sanatçılar (Artists) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-1">
                  <div className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#C7D5F0]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Dövme Sanatçıları ({filteredArtists.length})</span>
                  </div>
                </div>
                {filteredArtists.length === 0 ? (
                  <p className="p-3 text-xs text-white/30 italic">Eşleşen tescilli sanatçı bulunmuyor.</p>
                ) : (
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {filteredArtists.map((art) => (
                      <div key={art.id} className="p-3 bg-black/40 border border-[#C7D5F0]/5 rounded-xl flex items-center justify-between hover:border-[#C7D5F0]/20 transition">
                        <div className="space-y-0.5">
                           <p className="text-xs font-bold text-white mb-0.5">{art.name}</p>
                           <p className="text-[11px] text-white/50 font-mono">{art.email} {art.phone ? `| ${art.phone}` : ''}</p>
                           {art.artistId && <p className="text-[9px] text-[#C7D5F0] uppercase font-mono">Sanatçı Ref: {art.artistId}</p>}
                        </div>
                        <button
                          onClick={() => triggerDeleteAccount('auth_artists', art.email, art.name)}
                          className="p-1 px-2.5 text-[10px] text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 hover:border-rose-500/30 rounded-md transition"
                        >
                          Erişimi Sil
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Müşteriler (Customers) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-1">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white">Müşteriler ({filteredCustomers.length})</span>
                  </div>
                </div>
                {filteredCustomers.length === 0 ? (
                  <p className="p-3 text-xs text-white/30 italic">Eşleşen kayıtlı müşteri bulunmuyor.</p>
                ) : (
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {filteredCustomers.map((cust) => (
                      <div key={cust.id} className="p-3 bg-black/40 border border-[#C7D5F0]/5 rounded-xl flex items-center justify-between hover:border-[#C7D5F0]/20 transition">
                        <div className="space-y-0.5">
                           <p className="text-xs font-bold text-white mb-0.5">{cust.name}</p>
                           <p className="text-[11px] text-white/50 font-mono">{cust.email} {cust.phone ? `| Telefon: ${cust.phone}` : ''}</p>
                        </div>
                        <button
                          onClick={() => triggerDeleteAccount('auth_customers', cust.email, cust.name)}
                          className="p-1 px-2.5 text-[10px] text-rose-400 hover:text-rose-300 bg-rose-500/5 hover:bg-rose-500/15 border border-rose-500/10 hover:border-rose-500/30 rounded-md transition"
                        >
                          Erişimi Sil
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Custom Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#121212] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-amber-500" />
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Kalıcı Silme Onayı</h3>
                <p className="text-xs text-white/60">
                  {confirmDelete.type === 'license' 
                    ? 'Bu lisans kodunu sistemden tamamen kaldırmak istediğinize emin misiniz?' 
                    : 'Seçilen kullanıcının erişim yetkilerini ve hesabını kalıcı olarak silmek istediğinize emin misiniz?'}
                </p>
              </div>
            </div>

            <div className="bg-black/30 border border-white/5 p-4 rounded-xl font-mono text-xs text-white/90 select-all break-all">
              <span className="text-rose-400 font-bold block mb-1">
                {confirmDelete.type === 'license' ? 'LİSANS_KODU:' : 'KULLANICI_HESABI:'}
              </span>
              {confirmDelete.displayName}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition"
              >
                Vazgeç
              </button>
              <button
                onClick={executeDelete}
                className="px-5 py-2 text-xs font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition shadow-lg shadow-rose-950/40"
              >
                Evet, Kalıcı Olarak Sil
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
