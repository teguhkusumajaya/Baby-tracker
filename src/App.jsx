import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Baby, Clock, Droplet, Moon, Plus, Play, Pause, RotateCcw, 
  Trash2, Check, Calendar, Sparkles, Heart, History, RefreshCw 
} from 'lucide-react';

// === SUPABASE CLOUD DATABASE CONFIGURATION ===
const SUPABASE_URL = "https://ttkhstbixconbiipwvwe.supabase.co"; 
const SUPABASE_ANON_KEY = "sb_publishable_FgUhuXCgo5iGnjS3urqKtw_p9aGOHRM"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const INITIAL_BABY = {
  id: "baby_khairel",
  name: "Khairel Azka",
  birthDate: "2026-08-01",
  gender: "male"
};

export default function App() {
  const [baby] = useState(INITIAL_BABY);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [notification, setNotification] = useState(null);

  // Ambil Data dari Supabase Cloud & Aktifkan Real-time Sync
  useEffect(() => {
    fetchLogs();

    // Channel Real-time untuk 2 Device
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'logs' },
        () => {
          fetchLogs(); // Otomatis refresh jika HP lain menambah/menghapus data
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2800);
  };

  // Tambah catatan ke Cloud Database
  const handleAddLog = async (category, details) => {
    const newLog = {
      id: "log_" + Date.now(),
      baby_id: baby.id,
      category,
      details,
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('logs').insert([newLog]);

    if (!error) {
      setLogs(prev => [newLog, ...prev]);
      setActiveModal(null);
      showToast(`Catatan tersinkron ke cloud!`);
    } else {
      alert("Gagal menyimpan ke cloud: " + error.message);
    }
  };

  // Hapus catatan dari Cloud Database
  const handleDeleteLog = async (id) => {
    const { error } = await supabase.from('logs').delete().eq('id', id);
    if (!error) {
      setLogs(prev => prev.filter(l => l.id !== id));
      showToast("Catatan dihapus dari cloud");
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus semua catatan dari cloud?")) {
      const { error } = await supabase.from('logs').delete().neq('id', '0');
      if (!error) {
        setLogs([]);
        showToast("Semua data cloud berhasil direset");
      }
    }
  };

  const todayLogs = logs.filter(log => {
    const logDate = new Date(log.created_at).toDateString();
    const today = new Date().toDateString();
    return logDate === today;
  });

  const totalMilkToday = todayLogs
    .filter(l => l.category === 'feeding' && l.details?.amount_ml)
    .reduce((sum, curr) => sum + Number(curr.details.amount_ml), 0);

  const totalDiaperToday = todayLogs.filter(l => l.category === 'diaper').length;

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
      <div className="w-full max-w-md bg-white min-h-screen shadow-xl flex flex-col relative border-x border-slate-200">
        
        {/* Header Profil */}
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

            <button 
              onClick={fetchLogs}
              className="bg-white/15 p-2 rounded-xl backdrop-blur-sm border border-white/20 text-white active:scale-95 transition"
              title="Sinkronkan Data"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        {notification && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs py-2.5 px-4 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* Dashboard Ringkasan */}
        <main className="p-5 space-y-6 flex-1 overflow-y-auto">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Ringkasan Harian</h2>
              {logs.length > 0 && (
                <button onClick={handleClearAll} className="text-[11px] text-rose-500 hover:text-rose-600 font-medium">Reset Data</button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-sky-50/80 border border-sky-100 rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm">
                <div className="w-9 h-9 rounded-full bg-sky-500/10 text-sky-600 flex items-center justify-center mb-1.5"><Droplet size={18} /></div>
                <span className="text-[11px] font-medium text-slate-500">Total Susu</span>
                <p className="text-lg font-bold text-slate-800 mt-0.5">{totalMilkToday} <span className="text-[11px] font-medium text-slate-400">ml</span></p>
              </div>

              <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mb-1.5"><Sparkles size={18} /></div>
                <span className="text-[11px] font-medium text-slate-500">Ganti Popok</span>
                <p className="text-lg font-bold text-slate-800 mt-0.5">{totalDiaperToday} <span className="text-[11px] font-medium text-slate-400">kali</span></p>
              </div>

              <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3.5 flex flex-col items-center text-center shadow-sm">
                <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-1.5"><Moon size={18} /></div>
                <span className="text-[11px] font-medium text-slate-500">Total Tidur</span>
                <p className="text-sm font-bold text-slate-800 mt-1">{formatHoursMinutes(totalSleepMinutesToday)}</p>
              </div>
            </div>
          </section>

          {/* Timeline Real-time */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <History size={14} className="text-slate-400" />
                <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Aktivitas Real-time</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">{logs.length} catatan</span>
            </div>

            {loading && logs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">Memuat data cloud...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200/80">
                <p className="text-sm font-semibold text-slate-600">Pelacak Masih Kosong</p>
                <p className="text-xs text-slate-400 mt-1">Data yang dimasukkan dari HP mana pun akan muncul di sini secara langsung.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => {
                  const timeFormatted = new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                  let icon = <Droplet size={18} />;
                  let bgIcon = "bg-sky-100 text-sky-600";
                  let title = "Minum Susu";
                  let detailText = "";

                  if (log.category === 'feeding') {
                    if (log.details.type === 'bottle') {
                      title = `Botol (${log.details.sub_type === 'formula' ? 'Formula' : 'ASIP'})`;
                      detailText = `${log.details.amount_ml} ml`;
                    } else {
                      title = `ASI Langsung (DBF)`;
                      detailText = `${log.details.side === 'left' ? 'Kiri' : log.details.side === 'right' ? 'Kanan' : 'Dua Sisi'} • ${log.details.duration_minutes || 0}m`;
                    }
                  } else if (log.category === 'diaper') {
                    icon = <Sparkles size={18} />;
                    bgIcon = "bg-amber-100 text-amber-600";
                    title = "Ganti Popok";
                    detailText = log.details.status === 'wet' ? 'Pipis' : log.details.status === 'dirty' ? 'Pup' : 'Pipis & Pup';
                  } else if (log.category === 'sleep') {
                    icon = <Moon size={18} />;
                    bgIcon = "bg-indigo-100 text-indigo-600";
                    title = log.details.type === 'nap' ? 'Tidur Siang' : 'Tidur Malam';
                    detailText = `Durasi: ${formatHoursMinutes(log.details.duration_minutes || 0)}`;
                  }

                  return (
                    <div key={log.id} className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgIcon}`}>{icon}</div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-sm text-slate-800">{title}</h3>
                            <span className="text-[11px] text-slate-400">{timeFormatted}</span>
                          </div>
                          <p className="text-xs text-slate-600 font-medium mt-0.5">{detailText}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteLog(log.id)} className="p-2 text-slate-400 hover:text-rose-500">
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
            <button onClick={() => setActiveModal('feeding')} className="py-2.5 rounded-2xl bg-sky-50 text-sky-700 font-semibold text-xs border border-sky-200/60 flex flex-col items-center">
              <Droplet size={18} className="mb-0.5" /> + Susu
            </button>
            <button onClick={() => setActiveModal('diaper')} className="py-2.5 rounded-2xl bg-amber-50 text-amber-700 font-semibold text-xs border border-amber-200/60 flex flex-col items-center">
              <Sparkles size={18} className="mb-0.5" /> + Popok
            </button>
            <button onClick={() => setActiveModal('sleep')} className="py-2.5 rounded-2xl bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-200/60 flex flex-col items-center">
              <Moon size={18} className="mb-0.5" /> + Tidur
            </button>
          </div>
        </nav>

        {/* Modal-modal Input */}
        {activeModal === 'feeding' && <FeedingModal onClose={() => setActiveModal(null)} onSave={(d) => handleAddLog('feeding', d)} />}
        {activeModal === 'diaper' && <DiaperModal onClose={() => setActiveModal(null)} onSave={(d) => handleAddLog('diaper', d)} />}
        {activeModal === 'sleep' && <SleepModal onClose={() => setActiveModal(null)} onSave={(d) => handleAddLog('sleep', d)} />}

      </div>
    </div>
  );
}

function FeedingModal({ onClose, onSave }) {
  const [method, setMethod] = useState('breast');
  const [breastSide, setBreastSide] = useState('left');
  const [amountMl, setAmountMl] = useState(60);
  const [subType, setSubType] = useState('formula');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b">
          <h3 className="font-bold text-slate-800">Catat Minum Susu</h3>
          <button onClick={onClose} className="text-slate-400 text-xs font-semibold">Batal</button>
        </div>
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl mt-4">
          <button onClick={() => setMethod('breast')} className={`py-2 text-xs font-semibold rounded-lg ${method === 'breast' ? 'bg-white text-sky-600' : 'text-slate-500'}`}>ASI Langsung</button>
          <button onClick={() => setMethod('bottle')} className={`py-2 text-xs font-semibold rounded-lg ${method === 'bottle' ? 'bg-white text-sky-600' : 'text-slate-500'}`}>Botol</button>
        </div>

        {method === 'breast' ? (
          <div className="mt-4 flex justify-center gap-2">
            {['left', 'right', 'both'].map(s => (
              <button key={s} onClick={() => setBreastSide(s)} className={`px-4 py-2 rounded-xl text-xs border ${breastSide === s ? 'bg-sky-600 text-white' : 'border-slate-200'}`}>
                {s === 'left' ? 'Kiri' : s === 'right' ? 'Kanan' : 'Dua Sisi'}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <input type="number" value={amountMl} onChange={(e) => setAmountMl(e.target.value)} className="w-full text-center text-2xl font-bold bg-slate-50 border rounded-xl py-2" />
            <div className="flex justify-between gap-1">
              {[30, 60, 90, 120, 150].map(v => (
                <button key={v} onClick={() => setAmountMl(v)} className="flex-1 py-1 bg-slate-100 rounded text-xs font-semibold">{v}ml</button>
              ))}
            </div>
          </div>
        )}

        <button onClick={() => onSave(method === 'breast' ? { type: 'breast', side: breastSide, duration_minutes: 15 } : { type: 'bottle', sub_type: subType, amount_ml: amountMl })} className="w-full mt-5 py-3 bg-sky-600 text-white font-bold rounded-2xl text-xs">Simpan ke Cloud</button>
      </div>
    </div>
  );
}

function DiaperModal({ onClose, onSave }) {
  const [status, setStatus] = useState('wet');
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end justify-center p-0">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-6">
        <div className="flex justify-between pb-3 border-b"><h3 className="font-bold">Ganti Popok</h3><button onClick={onClose} className="text-xs">Batal</button></div>
        <div className="space-y-2 mt-4">
          {[{ id: 'wet', l: 'Pipis' }, { id: 'dirty', l: 'Pup' }, { id: 'both', l: 'Pipis & Pup' }].map(o => (
            <button key={o.id} onClick={() => setStatus(o.id)} className={`w-full p-3 rounded-xl border text-left text-xs font-semibold ${status === o.id ? 'border-amber-500 bg-amber-50' : ''}`}>{o.l}</button>
          ))}
        </div>
        <button onClick={() => onSave({ status })} className="w-full mt-4 py-3 bg-amber-500 text-white font-bold rounded-2xl text-xs">Simpan ke Cloud</button>
      </div>
    </div>
  );
}

function SleepModal({ onClose, onSave }) {
  const [duration, setDuration] = useState(45);
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end justify-center p-0">
      <div className="bg-white w-full max-w-md rounded-t-3xl p-6">
        <div className="flex justify-between pb-3 border-b"><h3 className="font-bold">Catat Tidur</h3><button onClick={onClose} className="text-xs">Batal</button></div>
        <div className="mt-4 text-center text-2xl font-bold">{duration} Menit</div>
        <div className="grid grid-cols-4 gap-2 mt-3">
          {[30, 45, 60, 90, 120, 180].map(m => (
            <button key={m} onClick={() => setDuration(m)} className={`py-2 rounded-xl text-xs border ${duration === m ? 'bg-indigo-600 text-white' : ''}`}>{m}m</button>
          ))}
        </div>
        <button onClick={() => onSave({ type: 'nap', duration_minutes: duration })} className="w-full mt-4 py-3 bg-indigo-600 text-white font-bold rounded-2xl text-xs">Simpan ke Cloud</button>
      </div>
    </div>
  );
}
