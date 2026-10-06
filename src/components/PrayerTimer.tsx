import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Bell, 
  Sparkles, Clock, Heart, Flame, Music, CheckCircle2, 
  Plus, Minus, ShieldCheck, Moon, Sun, AlertCircle
} from "lucide-react";

interface PrayerTimerProps {
  triggerToast: (icon: string, message: string) => void;
}

const PRESET_DURATIONS = [
  { label: "5 Min", seconds: 5 * 60, desc: "Quick Morning Ignition" },
  { label: "10 Min", seconds: 10 * 60, desc: "Personal Devotion & Thanks" },
  { label: "15 Min", seconds: 15 * 60, desc: "Quarter Sanctuary Watch" },
  { label: "30 Min", seconds: 30 * 60, desc: "Intercessory Warfare" },
  { label: "60 Min", seconds: 60 * 60, desc: "Upper Room Altar Watch" }
];

const MEDITATION_ANCHORS = [
  { scripture: "Psalm 46:10", text: "Be still, and know that I am God: I will be exalted among the nations." },
  { scripture: "Matthew 26:41", text: "Watch and pray, that you enter not into temptation: the spirit indeed is willing, but the flesh is weak." },
  { scripture: "Jeremiah 33:3", text: "Call unto me, and I will answer thee, and show thee great and mighty things, which thou knowest not." },
  { scripture: "Ephesians 6:18", text: "Praying always with all prayer and supplication in the Spirit, and watching thereunto with all perseverance." },
  { scripture: "1 Thessalonians 5:17", text: "Pray without ceasing. In every thing give thanks." }
];

export default function PrayerTimer({ triggerToast }: PrayerTimerProps) {
  // Timer State
  const [initialSeconds, setInitialSeconds] = useState(15 * 60); // Default 15 min
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Sound & Ambient Settings
  const [soundAlertEnabled, setSoundAlertEnabled] = useState(true);
  const [intervalChimeMinutes, setIntervalChimeMinutes] = useState<number>(0); // 0 = off, 5 = chime every 5 min
  const [ambientDroneActive, setAmbientDroneActive] = useState(false);

  // Meditation Focus Anchor
  const [anchorIdx, setAnchorIdx] = useState(0);

  // Daily Prayer Log
  const [todayMinutesPrayed, setTodayMinutesPrayed] = useState(() => {
    return parseInt(localStorage.getItem("faithflow_timer_today_mins") || "0", 10);
  });
  const [completedSessionsCount, setCompletedSessionsCount] = useState(() => {
    return parseInt(localStorage.getItem("faithflow_timer_sessions_count") || "0", 10);
  });

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ambientOscillatorRef = useRef<OscillatorNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);

  // Helper to lazily initialize AudioContext
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Synthesize cathedral / singing bowl bell chime harmonic
  const playSacredBell = (fundamentalFreq = 528) => {
    if (!soundAlertEnabled) return;
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // Harmonic frequencies for rich cathedral bell overtone
      const harmonics = [1, 2.01, 3.02, 4.1];
      const gains = [0.4, 0.2, 0.1, 0.05];

      harmonics.forEach((h, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(fundamentalFreq * h, now);

        // Exponential decay envelope
        gainNode.gain.setValueAtTime(gains[idx], now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 3.6);
      });
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  };

  // Toggle ambient 432Hz deep prayer drone
  const toggleAmbientDrone = () => {
    const ctx = getAudioContext();
    if (ambientDroneActive) {
      // Stop drone
      if (ambientOscillatorRef.current) {
        ambientOscillatorRef.current.stop();
        ambientOscillatorRef.current.disconnect();
        ambientOscillatorRef.current = null;
      }
      setAmbientDroneActive(false);
      triggerToast("🔇", "Ambient prayer tone muted.");
    } else {
      // Start 432Hz calm drone
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(108, ctx.currentTime); // Low 108Hz harmonic of 432Hz

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 2.0); // Gentle background volume

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        ambientOscillatorRef.current = osc;
        ambientGainRef.current = gain;
        setAmbientDroneActive(true);
        triggerToast("🕊️", "Sacred 432Hz altar meditation atmosphere active.");
      } catch (err) {
        console.warn("Drone audio error:", err);
      }
    }
  };

  // Stop ambient drone on unmount
  useEffect(() => {
    return () => {
      if (ambientOscillatorRef.current) {
        ambientOscillatorRef.current.stop();
        ambientOscillatorRef.current.disconnect();
      }
    };
  }, []);

  // Main countdown tick effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          const next = prev - 1;

          // Check interval chime (e.g. every 5 min)
          if (intervalChimeMinutes > 0) {
            const elapsed = initialSeconds - next;
            if (elapsed > 0 && elapsed % (intervalChimeMinutes * 60) === 0 && next > 0) {
              playSacredBell(660); // Mid-session gentle chime
              triggerToast("🔔", `Sanctuary Watch: ${Math.round(elapsed / 60)} minutes completed.`);
            }
          }

          if (next <= 0) {
            // Timer Finished!
            setIsRunning(false);
            setIsCompleted(true);
            playSacredBell(440); // Deep sacred bell
            setTimeout(() => playSacredBell(528), 800);
            setTimeout(() => playSacredBell(660), 1600);

            // Update stats
            const mins = Math.round(initialSeconds / 60);
            const newTotalMins = todayMinutesPrayed + mins;
            const newSessions = completedSessionsCount + 1;
            setTodayMinutesPrayed(newTotalMins);
            setCompletedSessionsCount(newSessions);
            localStorage.setItem("faithflow_timer_today_mins", newTotalMins.toString());
            localStorage.setItem("faithflow_timer_sessions_count", newSessions.toString());

            triggerToast("🕊️", `Hallelujah! Your ${mins}-minute prayer watch is sealed before the Lord.`);
            return 0;
          }
          return next;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining, initialSeconds, intervalChimeMinutes]);

  // Controls
  const handleStart = () => {
    getAudioContext(); // Warm up audio context on user gesture
    setIsCompleted(false);
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsCompleted(false);
    setSecondsRemaining(initialSeconds);
  };

  const handleSelectPreset = (seconds: number) => {
    setIsRunning(false);
    setIsCompleted(false);
    setInitialSeconds(seconds);
    setSecondsRemaining(seconds);
  };

  const handleAdjustTime = (deltaSeconds: number) => {
    const next = Math.max(60, secondsRemaining + deltaSeconds);
    setSecondsRemaining(next);
    if (!isRunning) {
      setInitialSeconds(next);
    }
  };

  // Format MM:SS
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Progress percentage (0 - 100)
  const progressPercent = initialSeconds > 0 ? ((initialSeconds - secondsRemaining) / initialSeconds) * 100 : 0;

  return (
    <div className="space-y-6 font-sans-raleway text-white animate-fade-in">
      
      {/* 1. TOP STATS & STREAK BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#050D1E]/95 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today's Prayer Time</p>
            <p className="text-xl font-bold font-serif-cinzel text-white mt-0.5">{todayMinutesPrayed} mins</p>
          </div>
          <Clock className="w-6 h-6 text-[#D4AF37]/40" />
        </div>

        <div className="bg-[#050D1E]/95 border border-[#D4AF37]/30 p-3.5 rounded-xl flex items-center justify-between gold-glow">
          <div>
            <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">Sessions Sealed</p>
            <p className="text-xl font-bold font-serif-cinzel text-[#D4AF37] mt-0.5">{completedSessionsCount}</p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-[#D4AF37]/60" />
        </div>

        <div className="bg-[#050D1E]/95 border border-purple-500/30 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Audible Chime</p>
            <p className="text-base font-bold text-white mt-0.5">
              {soundAlertEnabled ? "Cathedral Bell" : "Silent Watch"}
            </p>
          </div>
          <Bell className="w-6 h-6 text-purple-400/50" />
        </div>

        <div className="bg-[#050D1E]/95 border border-emerald-500/30 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Altar Atmosphere</p>
            <p className="text-base font-bold text-emerald-300 mt-0.5">
              {ambientDroneActive ? "432Hz Active" : "Ambient Ready"}
            </p>
          </div>
          <Music className="w-6 h-6 text-emerald-400/60" />
        </div>
      </div>

      {/* 2. MAIN TIMER DECK & CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* LEFT: Circular Countdown Timer Clock */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 bg-[#050D1E]/95 border border-[#D4AF37]/35 rounded-3xl shadow-2xl gold-glow space-y-6">
          
          {/* Circular Countdown Arc */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background Ring */}
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-slate-800/80"
                strokeWidth="4"
                fill="none"
              />
              {/* Active Golden Progress Ring */}
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="url(#goldGradient)"
                strokeWidth="5"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Content Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest font-bold">
                {isRunning ? "SANCTUARY WATCH ACTIVE" : isCompleted ? "WATCH COMPLETED" : "READY FOR PRAYER"}
              </span>

              {/* Large Digital Display */}
              <h1 className="text-5xl sm:text-6xl font-bold font-serif-cinzel tracking-tight text-white mt-1 drop-shadow-md">
                {formatTime(secondsRemaining)}
              </h1>

              {/* Target / Session Descriptor */}
              <span className="text-[11px] text-slate-400 mt-1">
                Target: {Math.round(initialSeconds / 60)} Minutes
              </span>

              {/* Adjustment +/- 1m buttons */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleAdjustTime(-60)}
                  className="p-1 bg-[#112055] hover:bg-[#1C3278] text-[#D4AF37] rounded-lg transition text-xs font-bold"
                  title="Minus 1 minute"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-[9px] text-slate-500 font-mono uppercase">ADJUST</span>
                <button
                  onClick={() => handleAdjustTime(60)}
                  className="p-1 bg-[#112055] hover:bg-[#1C3278] text-[#D4AF37] rounded-lg transition text-xs font-bold"
                  title="Plus 1 minute"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="p-3.5 rounded-2xl bg-[#0A0F1E] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {isRunning ? (
              <button
                onClick={handlePause}
                className="bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm py-4 px-8 rounded-2xl shadow-xl flex items-center gap-2.5 transition transform active:scale-95 cursor-pointer"
              >
                <Pause className="w-5 h-5 fill-white" /> Pause Watch
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="bg-[#D4AF37] hover:bg-[#F0C940] text-[#0A0F1E] font-extrabold text-sm py-4 px-9 rounded-2xl shadow-xl flex items-center gap-2.5 transition transform active:scale-95 cursor-pointer gold-glow"
              >
                <Play className="w-5 h-5 fill-[#0A0F1E]" /> Start Prayer Watch
              </button>
            )}

            <button
              onClick={() => playSacredBell(528)}
              className="p-3.5 rounded-2xl bg-[#0A0F1E] border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#112055] transition cursor-pointer"
              title="Test Cathedral Bell Chime"
            >
              <Bell className="w-5 h-5" />
            </button>
          </div>

          {/* Presets Row */}
          <div className="w-full pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block text-center mb-2">
              Select Prayer Watch Preset:
            </span>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_DURATIONS.map((preset) => (
                <button
                  key={preset.seconds}
                  onClick={() => handleSelectPreset(preset.seconds)}
                  className={`py-2 px-1 rounded-xl border text-center transition cursor-pointer ${
                    initialSeconds === preset.seconds
                      ? "bg-[#D4AF37] border-[#D4AF37] text-[#0A0F1E] font-extrabold shadow"
                      : "bg-[#0A0F1E] border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className="text-xs font-bold block">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Atmosphere, Periodic Chimes & Scripture Anchor */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Ambient Altar Atmosphere & Chimes Controls */}
          <div className="bg-[#050D1E]/95 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-lg">
            <h3 className="text-xs font-serif-cinzel font-bold text-[#D4AF37] tracking-wider uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Sanctuary Audio Environment
            </h3>

            {/* 432Hz Drone Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A0F1E] border border-white/5">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-[#D4AF37]" /> 432Hz Sacred Altar Drone
                </span>
                <p className="text-[10px] text-slate-400">Continuous soothing background harmonic for deep soaking</p>
              </div>
              <button
                onClick={toggleAmbientDrone}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                  ambientDroneActive
                    ? "bg-emerald-600 border-emerald-500 text-white shadow"
                    : "bg-[#112055] border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#1A2E6E]"
                }`}
              >
                {ambientDroneActive ? "Active (Playing)" : "Enable Tone"}
              </button>
            </div>

            {/* Periodic Interval Chimes */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#D4AF37]" /> Periodic Interval Chimes
                </span>
                <span className="text-[10px] text-[#D4AF37] font-mono">
                  {intervalChimeMinutes === 0 ? "Off (Completion only)" : `Every ${intervalChimeMinutes} Mins`}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: "Off", value: 0 },
                  { label: "5 Min", value: 5 },
                  { label: "10 Min", value: 10 },
                  { label: "15 Min", value: 15 }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setIntervalChimeMinutes(item.value)}
                    className={`text-[11px] py-1.5 rounded-lg border font-bold transition cursor-pointer ${
                      intervalChimeMinutes === item.value
                        ? "bg-[#D4AF37] text-[#0A0F1E] border-[#D4AF37]"
                        : "bg-[#0A0F1E] text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound Mute Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400 font-semibold">Audible Alerts:</span>
              <button
                onClick={() => setSoundAlertEnabled(!soundAlertEnabled)}
                className="flex items-center gap-1 text-[11px] font-bold text-[#D4AF37] hover:underline"
              >
                {soundAlertEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
                <span>{soundAlertEnabled ? "Audible Bell Enabled" : "Muted"}</span>
              </button>
            </div>
          </div>

          {/* Scripture Focus & Meditation Anchor Card */}
          <div className="bg-[#050D1E]/95 border border-[#D4AF37]/25 p-5 rounded-2xl space-y-3 shadow-lg">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-serif-cinzel font-bold text-[#D4AF37] tracking-wider uppercase flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#D4AF37]" /> Meditation Anchor
              </span>
              <button
                onClick={() => setAnchorIdx((prev) => (prev + 1) % MEDITATION_ANCHORS.length)}
                className="text-[10px] text-[#D4AF37] hover:underline cursor-pointer font-bold"
              >
                Cycle Scripture ↻
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[#D4AF37] font-bold uppercase">
                {MEDITATION_ANCHORS[anchorIdx].scripture}
              </span>
              <blockquote className="text-xs text-slate-200 italic leading-relaxed border-l-2 border-[#D4AF37] pl-3 py-0.5">
                "{MEDITATION_ANCHORS[anchorIdx].text}"
              </blockquote>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
