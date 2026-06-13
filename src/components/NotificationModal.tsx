import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, Phone, Mail, FileText, CheckCircle2, User, Scissors, Clipboard, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';
import { Appointment, ServiceItem } from '../types';
import { INITIAL_SERVICES } from '../data';

interface NotificationModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onStatusChange?: (id: string, newStatus: Appointment['status']) => void;
  onDelete?: (id: string) => void;
}

export default function NotificationModal({ isOpen, appointment, onClose, onStatusChange, onDelete }: NotificationModalProps) {
  // Store the active appointment in a ref or state so it is retained during exit animation
  const [activeAppointment, setActiveAppointment] = React.useState<Appointment | null>(null);

  React.useEffect(() => {
    if (appointment) {
      setActiveAppointment(appointment);
    }
  }, [appointment]);

  // Find full service objects
  const getServiceNames = () => {
    if (!activeAppointment) return [];
    return activeAppointment.services.map(srvId => {
      const match = INITIAL_SERVICES.find(s => s.id === srvId);
      return match ? match.name : srvId;
    });
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'Pending':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1.5 animate-pulse">📋 Beklemede</span>;
      case 'Confirmed':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">✅ Onaylandı</span>;
      case 'Completed':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">🎉 Tamamlandı</span>;
      case 'Cancelled':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">❌ İptal Edildi</span>;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && activeAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="notification-modal-wrapper">
          {/* Backdrop with Fade-In & Fade-Out */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Content with Fade-In/Slide-Up & Fade-Out/Slide-Down */}
          <motion.div
            id="notification-modal-container"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-white z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 p-5 px-6">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-lg bg-[#C7D5F0]/10 text-[#C7D5F0] border border-[#C7D5F0]/20">
                  <Clipboard className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold font-serif tracking-wide text-white">Randevu Detayları</h3>
                  <p className="text-xs text-white/40 font-mono">ID: {activeAppointment.id}</p>
                </div>
              </div>
              <button 
                id="close-modal-btn"
                onClick={onClose}
                className="p-1 px-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition duration-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent">
              {/* Status Panel */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-white/40 font-medium">Rezerve Edilen Durum</span>
                  <div className="text-sm font-semibold text-white">{activeAppointment.artistName} Dövme Atölyesi</div>
                </div>
                <div>
                  {getStatusBadge(activeAppointment.status)}
                </div>
              </div>

              {/* Customer Details & Designer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Customer info */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                  <div className="flex items-center gap-1.5 text-white/40 text-xs font-semibold uppercase tracking-wider font-mono">
                    <User className="w-3.5 h-3.5 text-[#C7D5F0]" />
                    <span>Müşteri Bilgileri</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-white text-base">{activeAppointment.customerName}</h4>
                    <div className="text-sm text-white/80 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-white/40" />
                      <span>{activeAppointment.customerPhone}</span>
                    </div>
                    <div className="text-sm text-white/80 flex items-center gap-2 overflow-hidden text-ellipsis">
                      <Mail className="w-4 h-4 text-white/40" />
                      <span>{activeAppointment.customerEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Timing info */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                  <div className="flex items-center gap-1.5 text-white/40 text-xs font-semibold uppercase tracking-wider font-mono">
                    <Calendar className="w-3.5 h-3.5 text-[#C7D5F0]" />
                    <span>Zamanlama ve Sanatçı</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/40">Dövme Sanatçısı:</span>
                      <span className="font-semibold text-[#C7D5F0]">{activeAppointment.artistName}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/40">Tarih:</span>
                      <span className="font-semibold text-white flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {activeAppointment.date}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/40">Saat:</span>
                      <span className="font-semibold text-white flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {activeAppointment.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Services & Price */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <div className="text-white/40 text-xs font-semibold uppercase tracking-wider font-mono">Seçilen Hizmetler</div>
                <div className="divide-y divide-white/5">
                  {getServiceNames().map((name, index) => (
                    <div key={index} className="py-2.5 flex justify-between items-center text-sm">
                      <span className="text-white/80">{name}</span>
                      <span className="text-white/40 text-xs">Seçildi</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                  <div className="text-xs text-white/50 font-medium">Randevu Durumu:</div>
                  <div className="text-[11px] text-white/40 font-serif">Fiyat ve süre seansı sanatçı ile birlikte planlanacaktır</div>
                </div>
              </div>

              {/* Client Notes Section */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2">
                <div className="flex items-center gap-1.5 text-white/40 text-xs font-semibold uppercase tracking-wider font-mono">
                  <FileText className="w-3.5 h-3.5 text-[#C7D5F0]" />
                  <span>Müşteri Özel Notu</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed bg-white/5 border border-white/10 p-3 rounded-lg italic text-white/70">
                  {activeAppointment.notes ? `"${activeAppointment.notes}"` : 'Müşteri herhangi bir özel not bırakmadı.'}
                </p>
              </div>

              {/* Cancellation Reason Section */}
              {activeAppointment.status === 'Cancelled' && activeAppointment.cancelReason && (
                <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold uppercase tracking-wider font-mono">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Müşteri İptal Nedeni</span>
                  </div>
                  <p className="text-sm text-rose-300 leading-relaxed bg-rose-950/20 border border-rose-500/10 p-3 rounded-lg italic font-medium">
                    "{activeAppointment.cancelReason}"
                  </p>
                </div>
              )}

              {/* Client Images Section */}
              {activeAppointment.clientImages && activeAppointment.clientImages.length > 0 && (
                <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-white/40 text-xs font-semibold uppercase tracking-wider font-mono">Müşteri Örnek / Referans Görselleri</div>
                  <div className="grid grid-cols-2 gap-3">
                    {activeAppointment.clientImages.map((img, idx) => (
                      <div key={idx} className="relative rounded-lg overflow-hidden aspect-video border border-white/10 bg-black group shadow">
                        <img 
                          src={img} 
                          alt="Client Reference" 
                          className="object-cover w-full h-full hover:scale-105 transition duration-300" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer (Status changes) */}
            {onStatusChange && (
              <div className="bg-[#0c0c0c] border-t border-white/10 p-4 px-6 flex flex-wrap gap-2.5 justify-end items-center">
                {onDelete && (
                  <motion.button
                    id="action-delete-permanently"
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(239, 68, 68, 0.15)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (confirm('Bu randevuyu veya mola kaydını sistemden kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
                        onDelete(activeAppointment.id);
                        onClose();
                      }
                    }}
                    className="mr-auto flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-widest rounded border border-rose-500/40 text-rose-500 cursor-pointer transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Kalıcı Olarak Sil</span>
                  </motion.button>
                )}

                {activeAppointment.status === 'Pending' && (
                  <>
                    <motion.button
                      id="action-cancel-appointment"
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(244, 63, 94, 0.1)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onStatusChange(activeAppointment.id, 'Cancelled');
                        onClose();
                      }}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded border border-rose-500/30 text-rose-400 cursor-pointer transition"
                    >
                      Talebi Reddet
                    </motion.button>
                    <motion.button
                      id="action-confirm-appointment"
                      whileHover={{ scale: 1.02, backgroundColor: "#e2ecfe" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onStatusChange(activeAppointment.id, 'Confirmed');
                        onClose();
                      }}
                      className="px-5 py-2 text-xs font-bold uppercase tracking-widest rounded bg-[#C7D5F0] text-black cursor-pointer transition"
                    >
                      Rezervasyonu Onayla
                    </motion.button>
                  </>
                )}

                {activeAppointment.status === 'Confirmed' && (
                  <>
                    <motion.button
                      id="action-cancel-appointment-conf"
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(244, 63, 94, 0.1)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onStatusChange(activeAppointment.id, 'Cancelled');
                        onClose();
                      }}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-widest rounded border border-rose-500/20 text-rose-400 cursor-pointer transition"
                    >
                      Randevuyu İptal Et
                    </motion.button>
                    <motion.button
                      id="action-complete-appointment"
                      whileHover={{ scale: 1.02, backgroundColor: "#10b981" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onStatusChange(activeAppointment.id, 'Completed');
                        onClose();
                      }}
                      className="px-5 py-2 text-xs font-bold uppercase tracking-widest rounded bg-emerald-600 text-white cursor-pointer transition focus:ring-2 focus:ring-emerald-500/50"
                    >
                      Dövmeyi Tamamla
                    </motion.button>
                  </>
                )}

                {activeAppointment.status === 'Completed' && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold bg-emerald-950/40 p-2 px-3 border border-emerald-500/20 rounded-md">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>BU DOSYA BAŞARIYLA TAMAMLANDI VE ARŞİVLENDİ</span>
                  </div>
                )}

                {activeAppointment.status === 'Cancelled' && (
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold bg-rose-950/40 p-2 px-3 border border-rose-500/20 rounded-md">
                    <AlertCircle className="w-4 h-4" />
                    <span>BU RANDEVU İPTAL EDİLMİŞ DURUMDA</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
