import React, { useState, useEffect } from 'react';
import { 
  Baby, 
  Clock, 
  Droplet, 
  Moon, 
  Plus, 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  Check, 
  Calendar, 
  Sparkles,
  Heart,
  History
} from 'lucide-react';

// Data Profil Bayi Khairel Azka
const INITIAL_BABY = {
  id: "baby_khairel",
  name: "Khairel Azka",
  birthDate: "2026-08-01",
  gender: "male"
};

export default function App() {
  const [baby] = useState(INITIAL_BABY);

  // Inisialisasi awal log dalam keadaan kosong (0 aktivitas)
  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem("baby_tracker_logs_khairel");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // State Modal Cepat
  const [activeModal, setActiveModal] = useState(null); // 'feeding' | 'diaper' | 'sleep' | null
  const [notification, setNotification] = useState(null);

  // Simpan perubahan logs ke localStorage HP
  useEffect(() => {
    try {
      localStorage.setItem("baby_tracker_logs_khairel", JSON.stringify(logs));
    } catch (e) {
      console.warn("Gagal menyimpan ke penyimpanan lokal", e);
    }
  }, [logs]);

  // Notifikasi Toast
  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 2800);
  };

  // Tambah catatan baru
  const handleAddLog = (category, details) => {
    const newLog = {
      id: "log_" + Date.now(),
      baby_id: baby.id,
      category,
      details,
      created_at: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);
    setActiveModal(null);
    showToast(`Catatan ${category === 'feeding' ? 'Susu' : category === 'diaper' ? 'Popok' : 'Tidur'} berhasil disimpan!`);
  };

  // Hapus catatan
  const handleDeleteLog = (id) => {
    setLogs(prev => prev.filter(l => l.id !== id));
    showToast("Catatan telah dihapus");
  };

  // Reset semua data menjadi 0
  const handleClearAll = () => {
    if (window.confirm("Apakah Anda yakin ingin mengosongkan semua riwayat pencatatan?")) {
      setLogs([]);
      localStorage.removeItem("baby_tracker_logs_khairel");
      showToast("Semua data berhasil direset ke 0");
    }
  };

  // Hitung ringkasan hari ini
  const todayLogs = logs.filter(log => {
    const logDate = new Date(log.created_at).toDateString();
    const today = new Date().toDateString();
    return logDate === today;
  });

  // Total susu hari ini (ml)
  const totalMilkToday = todayLogs
    .filter(l => l.category === 'feeding' && l.details?.amount_ml)
    .reduce((sum, curr) => sum + Number(curr.details.amount_ml), 0);

  // Total ganti popok hari ini (kali)
  const totalDiaperToday = todayLogs.filter(l => l.category === 'diaper').length;

  // Total jam tidur hari ini (menit)
  const totalSleepMinutesToday = todayLogs
    .filter(l => l.category === 'sleep' && l.details?.duration_minutes)
    .reduce((sum, curr) => sum + Number(curr.details.duration_minutes), 0);

  const formatHoursMinutes = (totalMin) => {
    if (!totalMin || totalMin === 0) return "0 Menit";
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    if (hours === 0) return `${mins} Menit`;
    return `${hours} Jam ${mins} Mnt`;
  };

  // Hitung umur bayi secara dinamis
  const calculateAge = (birthDateStr) => {
    const birth = new Date(birthDateStr);
    const now = new Date();
    const diffTime = Math.max(0, now - birth);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    if (months === 0) return `${diffDays} Hari`;
    return `${months} Bulan ${days} Hari`;
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-28 select-none flex justify-center font-sans antialiased">
      {/* Container Utama Mobile App */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl flex flex-col relative border-x border-slate-200">
        
        {/* Header Profil Khairel Azka */}
        <header className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white px-5 pt-7 pb-6 rounded-b-3xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 text-white shadow-inner">
                <Baby size={28} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-bold tracking-tight">{baby.name}</h1>
                  <Heart size={14} className="text-rose-300 fill-rose-300" />
                </div>
                <div className="flex items-center space-x-2 text-sky-100 text-xs mt-0.5">
                  <span className="bg-white/20 px-2 py-0.5 rounded-full font-medium">
                    {calculateAge(baby.birthDate)}
                  </span>
                  <span>•</span>
                  <span>{baby.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/15 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/20 text-xs font-semibold flex items-center gap-1.5 text-white">
              <Calendar size={13} />
              <span>Hari Ini</span>
            </div>
          </div>
        </header>

        {/* Notifikasi Pop-up */}
        {notification && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs py-2.5 px-4 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* Konten Dashboard */}
        <main className="p-5 space-y-6 flex-1 overflow-y-auto">
          
          {/* Ringkasan Statistik Hari Ini */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                Ringkasan Harian
              </h2>
              {logs.length > 0 && (
                <button 
                  onClick={handleClearAll}
                  className="text-[11px] text-rose-500 hover:text-rose-600 font-medium transition"
                >
                  Reset ke 0
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Susu */}
              <div className="bg-sky-50/80 border border-sky-100 rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm">
                <div className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-600 flex items-center justify-center mb-1.5">
                  <Droplet size={18} />
                </div>
                <span className="text-[11px] font-medium text-slate-500">Total Susu</span>
                <p className="text-lg font-bold text-slate-800 mt-0.5">
                  {totalMilkToday} <span className="text-[11px] font-medium text-slate-400">ml</span>
                </p>
              </div>

              {/* Popok */}
              <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mb-1.5">
                  <Sparkles size={18} />
                </div>
                <span className="text-[11px] font-medium text-slate-500">Ganti Popok</span>
                <p className="text-lg font-bold text-slate-800 mt-0.5">
                  {totalDiaperToday} <span className="text-[11px] font-medium text-slate-400">kali</span>
                </p>
              </div>

              {/* Tidur */}
              <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm">
                <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-1.5">
                  <Moon size={18} />
                </div>
                <span className="text-[11px] font-medium text-slate-500">Total Tidur</span>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  {formatHoursMinutes(totalSleepMinutesToday)}
                </p>
              </div>
            </div>
          </section>

          {/* Timeline Aktivitas */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <History size={14} className="text-slate-400" />
                <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Aktivitas Khairel Hari Ini
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">{logs.length} catatan</span>
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200/80">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-slate-300">
                  <Baby size={24} />
                </div>
                <p className="text-sm font-semibold text-slate-600">Pelacak Masih Kosong (0)</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Belum ada aktivitas untuk Khairel Azka hari ini. Tekan tombol cepat di bawah untuk mulai mencatat.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => {
                  const logDate = new Date(log.created_at);
                  const timeFormatted = logDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                  let icon = <Droplet size={18} />;
                  let bgIcon = "bg-sky-100 text-sky-600";
                  let title = "Minum Susu";
                  let detailText = "";

                  if (log.category === 'feeding') {
                    if (log.details.type === 'bottle') {
                      title = `Botol (${log.details.sub_type === 'formula' ? 'Formula' : 'ASI Perah'})`;
                      detailText = `${log.details.amount_ml} ml`;
                    } else {
                      title = `ASI Langsung (DBF)`;
                      detailText = `${log.details.side === 'left' ? 'Kiri' : log.details.side === 'right' ? 'Kanan' : 'Kedua Sisi'} • ${log.details.duration_minutes || 0} menit`;
                    }
                  } else if (log.category === 'diaper') {
                    icon = <Sparkles size={18} />;
                    bgIcon = "bg-amber-100 text-amber-600";
                    title = "Ganti Popok";
                    detailText = log.details.status === 'wet' 
                      ? 'Basah (Pipis)' 
                      : log.details.status === 'dirty' 
                        ? 'Kotor (Pup)' 
                        : 'Keduanya (Pipis & Pup)';
                  } else if (log.category === 'sleep') {
                    icon = <Moon size={18} />;
                    bgIcon = "bg-indigo-100 text-indigo-600";
                    title = log.details.type === 'nap' ? 'Tidur Siang (Nap)' : 'Tidur Malam';
                    detailText = `Durasi: ${formatHoursMinutes(log.details.duration_minutes || 0)}`;
                  }

                  return (
                    <div 
                      key={log.id} 
                      className="group bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm flex items-center justify-between hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgIcon}`}>
                          {icon}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-sm text-slate-800">{title}</h3>
                            <span className="text-[11px] text-slate-400 font-normal">{timeFormatted}</span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">{detailText}</p>
                          {log.details.note && (
                            <p className="text-[11px] text-slate-400 italic mt-0.5 max-w-[200px] truncate">
                              "{log.details.note}"
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="opacity-60 hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Hapus Catatan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        {/* Tombol Cepat Bawah */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 z-40">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setActiveModal('feeding')}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl bg-sky-50 text-sky-700 hover:bg-sky-100 active:scale-95 transition font-semibold text-xs border border-sky-200/60 shadow-sm"
            >
              <Droplet size={20} className="mb-1 text-sky-600" />
              <span>+ Susu</span>
            </button>

            <button
              onClick={() => setActiveModal('diaper')}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl bg-amber-50 text-amber-700 hover:bg-amber-100 active:scale-95 transition font-semibold text-xs border border-amber-200/60 shadow-sm"
            >
              <Sparkles size={20} className="mb-1 text-amber-600" />
              <span>+ Popok</span>
            </button>

            <button
              onClick={() => setActiveModal('sleep')}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-2xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-95 transition font-semibold text-xs border border-indigo-200/60 shadow-sm"
            >
              <Moon size={20} className="mb-1 text-indigo-600" />
              <span>+ Tidur</span>
            </button>
          </div>
        </nav>

        {/* Modal Modul Input */}
        {activeModal === 'feeding' && (
          <FeedingModal 
            onClose={() => setActiveModal(null)} 
            onSave={(details) => handleAddLog('feeding', details)} 
          />
        )}

        {activeModal === 'diaper' && (
          <DiaperModal 
            onClose={() => setActiveModal(null)} 
            onSave={(details) => handleAddLog('diaper', details)} 
          />
        )}

        {activeModal === 'sleep' && (
          <SleepModal 
            onClose={() => setActiveModal(null)} 
            onSave={(details) => handleAddLog('sleep', details)} 
          />
        )}

      </div>
    </div>
  );
}

// 1. MODAL SUSU
function FeedingModal({ onClose, onSave }) {
  const [method, setMethod] = useState('breast');
  const [breastSide, setBreastSide] = useState('left');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [subType, setSubType] = useState('formula');
  const [amountMl, setAmountMl] = useState(60);
  const [note, setNote] = useState('');

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (method === 'breast') {
      const minutes = Math.max(1, Math.round(timerSeconds / 60));
      onSave({
        type: 'breast',
        side: breastSide,
        duration_minutes: timerSeconds > 0 ? minutes : 10,
        note: note.trim()
      });
    } else {
      onSave({
        type: 'bottle',
        sub_type: subType,
        amount_ml: Number(amountMl),
        note: note.trim()
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
              <Droplet size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Catat Minum Susu</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1">
            Batal
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl mt-4">
          <button
            type="button"
            onClick={() => setMethod('breast')}
            className={`py-2 text-xs font-semibold rounded-lg transition ${
              method === 'breast' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            ASI Langsung (Timer)
          </button>
          <button
            type="button"
            onClick={() => setMethod('bottle')}
            className={`py-2 text-xs font-semibold rounded-lg transition ${
              method === 'bottle' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Botol (Formula / ASIP)
          </button>
        </div>

        {method === 'breast' ? (
          <div className="mt-5 space-y-4">
            <div className="flex justify-center gap-2">
              {[
                { id: 'left', label: 'Kiri' },
                { id: 'right', label: 'Kanan' },
                { id: 'both', label: 'Dua Sisi' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setBreastSide(item.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition ${
                    breastSide === item.id 
                      ? 'bg-sky-600 text-white border-sky-600' 
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-4xl font-mono font-bold text-slate-800">
                {formatTimer(timerSeconds)}
              </span>
              <p className="text-xs text-slate-400 mt-1">Durasi Menyusui</p>

              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`p-3 rounded-full text-white shadow-md transition ${
                    isTimerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-sky-600 hover:bg-sky-700'
                  }`}
                >
                  {isTimerRunning ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsTimerRunning(false); setTimerSeconds(0); }}
                  className="p-3 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                  title="Reset Timer"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSubType('formula')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-center transition ${
                  subType === 'formula' 
                    ? 'border-sky-600 bg-sky-50 text-sky-700 font-semibold' 
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                Susu Formula
              </button>
              <button
                type="button"
                onClick={() => setSubType('pumped')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-medium text-center transition ${
                  subType === 'pumped' 
                    ? 'border-sky-600 bg-sky-50 text-sky-700 font-semibold' 
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                ASI Perah (ASIP)
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Jumlah Susu (ml)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={amountMl}
                  onChange={(e) => setAmountMl(Math.max(0, Number(e.target.value)))}
                  className="w-full text-center text-2xl font-bold bg-slate-50 border border-slate-200 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="flex justify-between gap-1.5 mt-2">
                {[30, 60, 90, 120, 150].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmountMl(val)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
                  >
                    {val}ml
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <input
            type="text"
            placeholder="Catatan tambahan (opsional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="mt-5">
          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl shadow-md transition active:scale-[0.98] text-sm"
          >
            Simpan Catatan Susu
          </button>
        </div>
      </div>
    </div>
  );
}

// 2. MODAL POPOK
function DiaperModal({ onClose, onSave }) {
  const [status, setStatus] = useState('wet');
  const [note, setNote] = useState('');

  const statusOptions = [
    { id: 'wet', title: 'Basah (Pipis)', desc: 'Popok basah air seni' },
    { id: 'dirty', title: 'Kotor (Pup)', desc: 'Buang air besar / feses' },
    { id: 'both', title: 'Keduanya', desc: 'Pipis sekaligus buang air besar' }
  ];

  const handleSave = () => {
    onSave({
      status,
      note: note.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
              <Sparkles size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Ganti Popok Khairel</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1">
            Batal
          </button>
        </div>

        <div className="space-y-2.5 mt-5">
          {statusOptions.map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStatus(opt.id)}
              className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition ${
                status === opt.id 
                  ? 'border-amber-500 bg-amber-50/70 shadow-sm' 
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div>
                <p className="font-semibold text-sm text-slate-800">{opt.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
              </div>
              {status === opt.id && (
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <input
            type="text"
            placeholder="Catatan tekstur/warna feses (opsional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="mt-5">
          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md transition active:scale-[0.98] text-sm"
          >
            Simpan Catatan Popok
          </button>
        </div>
      </div>
    </div>
  );
}

// 3. MODAL TIDUR
function SleepModal({ onClose, onSave }) {
  const [sleepType, setSleepType] = useState('nap');
  const [mode, setMode] = useState('quick');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSec) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSave = () => {
    const finalDuration = mode === 'timer' 
      ? Math.max(1, Math.round(timerSeconds / 60)) 
      : durationMinutes;

    onSave({
      type: sleepType,
      duration_minutes: Number(finalDuration),
      note: note.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
              <Moon size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Catat Tidur Khairel</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1">
            Batal
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl mt-4">
          <button
            type="button"
            onClick={() => setSleepType('nap')}
            className={`py-2 text-xs font-semibold rounded-lg transition ${
              sleepType === 'nap' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Tidur Siang (Nap)
          </button>
          <button
            type="button"
            onClick={() => setSleepType('night')}
            className={`py-2 text-xs font-semibold rounded-lg transition ${
              sleepType === 'night' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Tidur Malam
          </button>
        </div>

        <div className="flex justify-center gap-4 mt-4 text-xs font-medium">
          <button
            onClick={() => setMode('quick')}
            className={`pb-1 border-b-2 transition ${
              mode === 'quick' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-400'
            }`}
          >
            Pilihan Menit
          </button>
          <button
            onClick={() => setMode('timer')}
            className={`pb-1 border-b-2 transition ${
              mode === 'timer' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-400'
            }`}
          >
            Stopwatch Tidur
          </button>
        </div>

        {mode === 'quick' ? (
          <div className="mt-4 space-y-3">
            <div className="text-center py-2">
              <span className="text-3xl font-bold text-slate-800">{durationMinutes}</span>
              <span className="text-slate-500 text-sm ml-1 font-medium">Menit</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[30, 45, 60, 90, 120, 150, 180, 240].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition ${
                    durationMinutes === mins 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {mins >= 60 ? `${mins / 60}j` : `${mins}m`}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 text-center py-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-3xl font-mono font-bold text-slate-800">
              {formatTimer(timerSeconds)}
            </span>
            <p className="text-xs text-slate-400 mt-1">Timer Tidur Berjalan</p>

            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`p-3 rounded-full text-white shadow-md transition ${
                  isTimerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isTimerRunning ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
              </button>
              <button
                type="button"
                onClick={() => { setIsTimerRunning(false); setTimerSeconds(0); }}
                className="p-3 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        )}

        <div className="mt-4">
          <input
            type="text"
            placeholder="Kondisi tidur / bangun (opsional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="mt-5">
          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition active:scale-[0.98] text-sm"
          >
            Simpan Catatan Tidur
          </button>
        </div>
      </div>
    </div>
  );
}
