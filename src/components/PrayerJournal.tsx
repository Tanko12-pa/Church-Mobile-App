import React, { useState, useEffect } from "react";
import { 
  Plus, CheckCircle2, Star, Trash2, Calendar, Search, Download, 
  RotateCw, Sparkles, BookOpen, Heart, Flame, FlameKindling, Check, Share2, 
  MessageSquare, Edit3, X, Filter, AlertCircle, Quote, Archive, Undo2, 
  Award, Zap, Tag, ArrowUpRight, ArrowLeft
} from "lucide-react";
import { 
  collection, doc, setDoc, deleteDoc, onSnapshot, query, where 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { PrayerJournalEntry } from "../types";

interface PrayerJournalProps {
  user?: any;
  triggerToast: (icon: string, message: string) => void;
  preferredVersion?: string;
}

// Category Tag System
const PRAYER_CATEGORIES = [
  "Health & Healing",
  "Family & Children",
  "Ministry & Church",
  "Financial Provision",
  "Spiritual Growth",
  "Salvation & Outreach",
  "Career & Calling",
  "Guidance & Wisdom",
  "Peace & Deliverance",
  "Thanksgiving"
];

// Short category slugs for rapid filtering
const CATEGORY_TAGS = [
  { id: "All", label: "All Categories" },
  { id: "Health & Healing", label: "Health" },
  { id: "Family & Children", label: "Family" },
  { id: "Ministry & Church", label: "Ministry" },
  { id: "Financial Provision", label: "Finance" },
  { id: "Spiritual Growth", label: "Spiritual" },
  { id: "Salvation & Outreach", label: "Salvation" },
  { id: "Career & Calling", label: "Career" },
  { id: "Thanksgiving", label: "Thanksgiving" }
];

const PROMISE_SUGGESTIONS = [
  { ref: "Philippians 4:6-7", text: "Do not be anxious about anything, but in prayer present your requests to God..." },
  { ref: "Jeremiah 29:11", text: "'For I know the plans I have for you,' declares the Lord, 'plans to give you hope and a future.'" },
  { ref: "James 5:16", text: "The effective, fervent prayer of a righteous man avails much." },
  { ref: "Isaiah 53:5", text: "By His stripes we are healed." },
  { ref: "Matthew 7:7", text: "Ask, and it will be given to you; seek, and you will find; knock, and it will be opened." },
  { ref: "Psalm 91:1-2", text: "He who dwells in the shelter of the Most High will abide in the shadow of the Almighty." }
];

export default function PrayerJournal({ user, triggerToast, preferredVersion = "ESV" }: PrayerJournalProps) {
  // Entries State
  const [entries, setEntries] = useState<PrayerJournalEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [request, setRequest] = useState("");
  const [category, setCategory] = useState("Spiritual Growth");
  const [scriptureRef, setScriptureRef] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feed View Navigation: "active" | "archive" | "all"
  const [viewMode, setViewMode] = useState<"active" | "archive" | "all">("active");

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Answered Testimony Modal State
  const [answeringEntry, setAnsweringEntry] = useState<PrayerJournalEntry | null>(null);
  const [testimonyText, setTestimonyText] = useState("");

  // Editing Entry State
  const [editingEntry, setEditingEntry] = useState<PrayerJournalEntry | null>(null);

  // Daily Habits Tracker
  const [dailyGoals, setDailyGoals] = useState({
    bibleReading: false,
    meditationTime: false,
    journaling: false
  });
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 1. Load Local Daily Habits
  useEffect(() => {
    const stored = localStorage.getItem("faithflow_daily_spiritual_goals");
    if (stored) {
      try {
        setDailyGoals(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse daily goals:", e);
      }
    }
  }, []);

  const saveDailyGoals = (newGoals: typeof dailyGoals) => {
    setDailyGoals(newGoals);
    localStorage.setItem("faithflow_daily_spiritual_goals", JSON.stringify(newGoals));
  };

  const toggleDailyGoal = (key: keyof typeof dailyGoals) => {
    const updated = { ...dailyGoals, [key]: !dailyGoals[key] };
    saveDailyGoals(updated);
    if (updated[key]) {
      triggerToast("✨", `Spiritual habit achieved: ${key.replace(/([A-Z])/g, " $1")}!`);
    }
  };

  // 2. Real-time Firestore Sync + Local Storage Fallback
  useEffect(() => {
    if (!user) {
      const offline = localStorage.getItem("faithflow_prayer_journal") || "[]";
      try {
        setEntries(JSON.parse(offline));
      } catch (e) {
        console.error("Failed to parse offline journal:", e);
      }
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "journal"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: PrayerJournalEntry[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as PrayerJournalEntry);
        });
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setEntries(items);
        localStorage.setItem("faithflow_prayer_journal", JSON.stringify(items));
        setLoading(false);
      },
      (error) => {
        console.warn("Firestore journal sync error:", error);
        handleFirestoreError(error, OperationType.LIST, "journal");
        const offline = localStorage.getItem("faithflow_prayer_journal") || "[]";
        try {
          setEntries(JSON.parse(offline));
        } catch {}
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 3. PRAYER STREAK CALCULATION
  const calculateStreak = () => {
    const datesSet = new Set<string>();
    entries.forEach((e) => {
      try {
        const d = new Date(e.createdAt).toISOString().split("T")[0];
        datesSet.add(d);
      } catch {}
    });

    const todayStr = new Date().toISOString().split("T")[0];
    if (dailyGoals.journaling) {
      datesSet.add(todayStr);
    }

    const today = new Date();
    let currentStreak = 0;
    let checkDate = new Date(today);

    // If today is not in set yet, check if yesterday was logged (keep active)
    const checkTodayStr = checkDate.toISOString().split("T")[0];
    if (!datesSet.has(checkTodayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dStr = checkDate.toISOString().split("T")[0];
      if (datesSet.has(dStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Default to at least 1 day if they have any entries
    if (currentStreak === 0 && entries.length > 0) {
      currentStreak = 1;
    }

    const storedLongest = parseInt(localStorage.getItem("faithflow_longest_streak") || "5", 10);
    const longestStreak = Math.max(currentStreak, storedLongest);
    if (currentStreak > storedLongest) {
      localStorage.setItem("faithflow_longest_streak", currentStreak.toString());
    }

    // 7-Day Consistency Week Heatmap (Last 7 days ending today)
    const weekDays: { label: string; date: string; active: boolean }[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      weekDays.push({
        label: dayNames[d.getDay()],
        date: ds,
        active: datesSet.has(ds) || (i === 0 && dailyGoals.journaling)
      });
    }

    // Milestone Badge Determination
    let milestone = "1-Day Altar Ignition";
    if (currentStreak >= 30) milestone = "30-Day Upper Room Devotion";
    else if (currentStreak >= 14) milestone = "14-Day Intercessory Pillar";
    else if (currentStreak >= 7) milestone = "7-Day Covenant Altar";
    else if (currentStreak >= 3) milestone = "3-Day Spiritual Momentum";

    return {
      current: currentStreak,
      longest: longestStreak,
      totalDays: Math.max(datesSet.size, 1),
      weekDays,
      milestone
    };
  };

  const streak = calculateStreak();

  // Save new prayer petition
  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !request.trim()) {
      triggerToast("⚠️", "Please provide a subject title and prayer petition details.");
      return;
    }

    setIsSubmitting(true);
    const newId = `prayer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newEntry: PrayerJournalEntry = {
      id: newId,
      userId: user?.uid || "guest-devotee",
      title: title.trim(),
      request: request.trim(),
      status: "Active",
      createdAt: new Date().toISOString(),
      category: category,
      scriptureRef: scriptureRef.trim() || undefined
    };

    const updatedList = [newEntry, ...entries];
    setEntries(updatedList);
    localStorage.setItem("faithflow_prayer_journal", JSON.stringify(updatedList));

    if (!dailyGoals.journaling) {
      saveDailyGoals({ ...dailyGoals, journaling: true });
    }

    setTitle("");
    setRequest("");
    setScriptureRef("");
    setIsSubmitting(false);

    triggerToast("✍️", "Prayer petition sealed in your personal prayer journal!");

    if (user && db) {
      try {
        await setDoc(doc(db, "journal", newId), newEntry);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "journal");
      }
    }
  };

  // Toggle Answered Status or Open Testimony Dialog
  const handleInitiateAnswerToggle = (entry: PrayerJournalEntry) => {
    if (entry.status === "Answered") {
      handleMoveBackToActive(entry);
    } else {
      setAnsweringEntry(entry);
      setTestimonyText(entry.testimony || "");
    }
  };

  // Confirm Answered with Testimony
  const handleConfirmAnswered = async () => {
    if (!answeringEntry) return;

    await handleUpdateStatus(
      answeringEntry, 
      "Answered", 
      new Date().toISOString(), 
      testimonyText.trim() || "Praise the Lord! Prayer answered according to His faithful promises."
    );

    triggerToast("🎉", `Praise report sealed! Answered prayer testimony archived for "${answeringEntry.title}"!`);
    setAnsweringEntry(null);
    setTestimonyText("");
  };

  // MOVE BACK TO ACTIVE STATUS (Required Feature)
  const handleMoveBackToActive = async (entry: PrayerJournalEntry) => {
    await handleUpdateStatus(entry, "Active", undefined, entry.testimony);
    triggerToast("🔄", `Restored "${entry.title}" back to Active prayer queue.`);
  };

  // Helper to update status in local state and Firestore
  const handleUpdateStatus = async (
    entry: PrayerJournalEntry, 
    newStatus: "Active" | "Answered", 
    answeredAt?: string, 
    testimony?: string
  ) => {
    const updated: PrayerJournalEntry = {
      ...entry,
      status: newStatus,
      answeredAt: answeredAt ?? (newStatus === "Answered" ? new Date().toISOString() : undefined),
      testimony: testimony ?? (newStatus === "Active" ? undefined : entry.testimony)
    };

    const nextList = entries.map((item) => (item.id === entry.id ? updated : item));
    setEntries(nextList);
    localStorage.setItem("faithflow_prayer_journal", JSON.stringify(nextList));

    if (user && db) {
      try {
        await setDoc(doc(db, "journal", entry.id), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "journal");
      }
    }
  };

  // Delete an entry
  const handleDeleteEntry = async (id: string, entryTitle: string) => {
    if (!confirm(`Are you sure you want to remove this prayer request: "${entryTitle}"?`)) {
      return;
    }

    const nextList = entries.filter((item) => item.id !== id);
    setEntries(nextList);
    localStorage.setItem("faithflow_prayer_journal", JSON.stringify(nextList));
    triggerToast("🗑️", "Prayer petition entry removed.");

    if (user && db) {
      try {
        await deleteDoc(doc(db, "journal", id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, "journal");
      }
    }
  };

  // Save edits to existing entry
  const handleSaveEdit = async () => {
    if (!editingEntry) return;

    const nextList = entries.map((item) => (item.id === editingEntry.id ? editingEntry : item));
    setEntries(nextList);
    localStorage.setItem("faithflow_prayer_journal", JSON.stringify(nextList));
    triggerToast("💾", "Prayer petition updated successfully.");

    if (user && db) {
      try {
        await setDoc(doc(db, "journal", editingEntry.id), editingEntry);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "journal");
      }
    }
    setEditingEntry(null);
  };

  // Export entries to CSV
  const handleExportCSV = () => {
    if (entries.length === 0) {
      triggerToast("⚠️", "There are no prayer entries to export!");
      return;
    }

    const headers = ["ID", "Title", "Category", "Scripture Anchor", "Status", "Request Details", "Testimony", "Created Date", "Answered Date"];
    const rows = entries.map((e) => [
      `"${e.id}"`,
      `"${(e.title || "").replace(/"/g, '""')}"`,
      `"${(e.category || "General").replace(/"/g, '""')}"`,
      `"${(e.scriptureRef || "").replace(/"/g, '""')}"`,
      `"${e.status}"`,
      `"${(e.request || "").replace(/"/g, '""')}"`,
      `"${(e.testimony || "").replace(/"/g, '""')}"`,
      `"${e.createdAt}"`,
      `"${e.answeredAt || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FaithFlow_Prayer_Journal_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast("📥", "Exported prayer journal records to CSV!");
  };

  // Filtered entries according to viewMode, category tag, and search query
  const filteredEntries = entries.filter((e) => {
    // 1. View mode filter
    let matchesView = true;
    if (viewMode === "active") matchesView = e.status === "Active";
    else if (viewMode === "archive") matchesView = e.status === "Answered";

    // 2. Category tag filter
    const matchesCategory = selectedCategory === "All" || e.category === selectedCategory || (e.category && e.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    // 3. Real-time Search query across all fields
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      (e.title && e.title.toLowerCase().includes(q)) ||
      (e.request && e.request.toLowerCase().includes(q)) ||
      (e.category && e.category.toLowerCase().includes(q)) ||
      (e.status && e.status.toLowerCase().includes(q)) ||
      (e.testimony && e.testimony.toLowerCase().includes(q)) ||
      (e.scriptureRef && e.scriptureRef.toLowerCase().includes(q));

    return matchesView && matchesCategory && matchesSearch;
  });

  // Metrics
  const totalCount = entries.length;
  const activeCount = entries.filter((e) => e.status === "Active").length;
  const answeredCount = entries.filter((e) => e.status === "Answered").length;
  const faithfulnessRatio = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 font-sans-raleway text-white animate-fade-in">
      
      {/* 1. PRAYER STREAK TRACKER & METRICS BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* PRAYER STREAK CARD (Required Feature) */}
        <div className="lg:col-span-6 bg-gradient-to-br from-[#0D1B3E] via-[#050D1E] to-[#112055] border-2 border-[#D4AF37]/40 rounded-2xl p-4.5 shadow-xl gold-glow flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Flame className="w-7 h-7 text-white fill-white animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest font-mono">
                  CONSISTENCY ALTAR ENGINE
                </span>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-extrabold font-serif-cinzel text-white">
                    {streak.current} {streak.current === 1 ? "Day" : "Days"}
                  </h2>
                  <span className="text-xs font-bold text-amber-300">Daily Prayer Streak</span>
                </div>
              </div>
            </div>

            <span className="bg-[#112055] border border-[#D4AF37]/35 text-[#D4AF37] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3 text-[#D4AF37]" /> {streak.milestone}
            </span>
          </div>

          {/* 7-Day Consistency Week Heatmap */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10.5px] text-slate-400 font-semibold">Weekly Rhythm:</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {streak.weekDays.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] text-slate-400 font-mono">{day.label}</span>
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      day.active
                        ? "bg-[#D4AF37] text-[#0A0F1E] font-extrabold shadow-sm shadow-[#D4AF37]/50"
                        : "bg-[#0A0F1E] border border-slate-800 text-slate-600"
                    }`}
                    title={day.date}
                  >
                    {day.active ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "·"}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-right pl-2">
              <span className="text-[9px] text-slate-400 block font-mono">LONGEST STREAK</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">{streak.longest} Days 🔥</span>
            </div>
          </div>
        </div>

        {/* TOP STATS CARDS */}
        <div className="lg:col-span-6 grid grid-cols-3 gap-3">
          <div 
            onClick={() => setViewMode("active")}
            className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
              viewMode === "active"
                ? "bg-amber-950/20 border-amber-500/50 shadow-md"
                : "bg-[#050D1E]/95 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-amber-400 font-bold uppercase">Active Cries</span>
              <FlameKindling className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold font-serif-cinzel text-white mt-1">{activeCount}</p>
            <span className="text-[9.5px] text-amber-300 font-semibold">In Intercession</span>
          </div>

          <div 
            onClick={() => setViewMode("archive")}
            className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
              viewMode === "archive"
                ? "bg-emerald-950/30 border-emerald-500/50 shadow-md"
                : "bg-[#050D1E]/95 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-emerald-400 font-bold uppercase">Answered Praises</span>
              <Archive className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold font-serif-cinzel text-emerald-300 mt-1">{answeredCount}</p>
            <span className="text-[9.5px] text-emerald-400 font-semibold">Testimonies Sealed</span>
          </div>

          <div 
            onClick={() => setViewMode("all")}
            className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
              viewMode === "all"
                ? "bg-[#112055] border-[#D4AF37]/50 shadow-md"
                : "bg-[#050D1E]/95 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#D4AF37] font-bold uppercase">God's Faithfulness</span>
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <p className="text-2xl font-bold font-serif-cinzel text-[#D4AF37] mt-1">{faithfulnessRatio}%</p>
            <span className="text-[9.5px] text-slate-400 font-semibold">{totalCount} Petitions</span>
          </div>
        </div>

      </div>

      {/* 2. MAIN WORKSPACE: RECORD FORM (LEFT) + PRAYER PETITIONS & ARCHIVE (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Record Form & Spiritual Habits Tracker */}
        <div className="lg:col-span-5 space-y-5">
          {/* Record Daily Prayer Petition Card */}
          <div className="bg-[#050D1E]/95 border border-[#D4AF37]/30 p-5 rounded-2xl shadow-xl gold-glow space-y-4">
            <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-serif-cinzel font-bold text-[#D4AF37] tracking-wider flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#D4AF37]" /> Record Daily Prayer Request
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Deposit your burdens and intercessions before the Mercy Seat.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#112055] text-[#D4AF37] border border-[#D4AF37]/20">
                {user ? "Cloud Sync Active" : "Local Storage"}
              </span>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-3.5">
              {/* Burden Subject */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">Burden Subject / Petition Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Healing for Grace's Father"
                  className="w-full text-xs bg-[#030611] border border-slate-800 focus:border-[#D4AF37] rounded-lg p-2.5 outline-none text-white transition placeholder-slate-500"
                />
              </div>

              {/* Category & Anchor Verse */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Category Tag</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs bg-[#030611] border border-slate-800 focus:border-[#D4AF37] rounded-lg p-2.5 outline-none text-white cursor-pointer"
                  >
                    {PRAYER_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300 block">Scripture Anchor</label>
                  <input
                    type="text"
                    value={scriptureRef}
                    onChange={(e) => setScriptureRef(e.target.value)}
                    placeholder="e.g., Philippians 4:6"
                    className="w-full text-xs bg-[#030611] border border-slate-800 focus:border-[#D4AF37] rounded-lg p-2.5 outline-none text-white transition placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Quick Scripture Suggestion Chips */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block font-semibold">Claim a Biblical Promise:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PROMISE_SUGGESTIONS.map((item) => (
                    <button
                      key={item.ref}
                      type="button"
                      onClick={() => setScriptureRef(item.ref)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#112055]/60 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/25 text-[#D4AF37] transition cursor-pointer"
                      title={item.text}
                    >
                      {item.ref}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific Petition Details */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 block">Specific Petition / Prayers</label>
                <textarea
                  required
                  rows={4}
                  value={request}
                  onChange={(e) => setRequest(e.target.value)}
                  placeholder="Record specific prayer points, target breakthrough dates, and covenant commitments..."
                  className="w-full text-xs bg-[#030611] border border-slate-800 focus:border-[#D4AF37] rounded-lg p-2.5 outline-none text-white transition resize-none placeholder-slate-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-[#0A0F1E] font-bold text-xs py-3 rounded-lg shadow-md cursor-pointer transition flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Plus className="w-4 h-4 text-[#0A0F1E]" /> Seal in Prayer Journal
              </button>
            </form>
          </div>

          {/* Daily Spiritual Habits Tracker Card */}
          <div className="bg-[#050D1E]/95 border border-slate-800 p-4.5 rounded-2xl space-y-3.5 shadow-lg">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <FlameKindling className="w-4 h-4 text-[#D4AF37]" />
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                  Daily Spiritual Habits
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-[10px] text-slate-400 hover:text-rose-400 font-semibold border border-slate-800 px-2 py-0.5 rounded transition cursor-pointer"
              >
                Reset
              </button>
            </div>

            {showResetConfirm && (
              <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-lg text-xs space-y-2">
                <p className="text-[11px] text-rose-200">Reset daily spiritual habits tracker for a fresh start?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      saveDailyGoals({ bibleReading: false, meditationTime: false, journaling: false });
                      setShowResetConfirm(false);
                      triggerToast("🔄", "Daily habits reset for today.");
                    }}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-[10px] px-2.5 py-1 rounded font-bold cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="text-slate-400 hover:text-white text-[10px] px-2 py-1 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {[
                { key: "bibleReading", label: `Daily Scripture Reading (${preferredVersion})`, icon: BookOpen },
                { key: "meditationTime", label: "Quiet Contemplation & Meditation (15 min)", icon: Heart },
                { key: "journaling", label: "Prayer Diary Logged & Sealed", icon: MessageSquare }
              ].map(({ key, label, icon: Icon }) => {
                const isDone = dailyGoals[key as keyof typeof dailyGoals];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleDailyGoal(key as keyof typeof dailyGoals)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                      isDone
                        ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                        : "bg-[#030611] border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${isDone ? "text-emerald-400" : "text-slate-500"}`} />
                      <span>{label}</span>
                    </div>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div>
              {(() => {
                const count = (dailyGoals.bibleReading ? 1 : 0) + (dailyGoals.meditationTime ? 1 : 0) + (dailyGoals.journaling ? 1 : 0);
                const pct = Math.round((count / 3) * 100);
                return (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-400">Daily Alignment Progress</span>
                      <span className={pct === 100 ? "text-emerald-400 font-extrabold" : "text-[#D4AF37]"}>
                        {pct}% Completed
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D4AF37] to-emerald-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PRAYER PETITIONS FEED & ANSWERED ARCHIVE */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* SEARCH, CATEGORY TAGS & ARCHIVE NAVIGATION */}
          <div className="bg-[#050D1E]/95 border border-slate-800 p-4 rounded-2xl space-y-3.5 shadow-lg">
            
            {/* View Mode Switcher: Active | Answered Archive | All */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1.5 bg-[#030611] p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode("active")}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "active"
                      ? "bg-[#D4AF37] text-[#0A0F1E] shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Active Petitions ({activeCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("archive")}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "archive"
                      ? "bg-emerald-600 text-white shadow"
                      : "text-slate-400 hover:text-emerald-300"
                  }`}
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Answered Archive ({answeredCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("all")}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    viewMode === "all"
                      ? "bg-[#112055] text-[#D4AF37] border border-[#D4AF37]/35"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  All ({totalCount})
                </button>
              </div>

              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 text-xs font-bold bg-[#112055] hover:bg-[#D4AF37] hover:text-[#0A0F1E] border border-[#D4AF37]/35 text-[#D4AF37] py-1.5 px-3 rounded-lg cursor-pointer transition shrink-0"
                title="Download CSV Prayer Log"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>

            {/* Search Bar (Required Feature: Filter by status, category, or search query) */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search prayer requests by title, category, scripture, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#030611] text-xs text-white pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 focus:border-[#D4AF37] outline-none transition placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Tag System (Required Feature: 'Health', 'Family', 'Ministry', etc.) */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <Tag className="w-3 h-3 text-[#D4AF37]" /> Filter by Category Tag:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_TAGS.map((tag) => {
                  const isSelected = selectedCategory === tag.id;
                  const matchingCount = tag.id === "All" 
                    ? entries.length 
                    : entries.filter(e => e.category && e.category.toLowerCase().includes(tag.label.toLowerCase())).length;

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => setSelectedCategory(tag.id)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? "bg-[#D4AF37] text-[#0A0F1E] border-[#D4AF37] font-extrabold shadow"
                          : "bg-[#030611] text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <span>{tag.label}</span>
                      <span className={`text-[8.5px] px-1 rounded-full ${isSelected ? "bg-black/20 text-[#0A0F1E]" : "bg-white/10 text-slate-400"}`}>
                        {matchingCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ARCHIVE TITLE BANNER IF IN ARCHIVE MODE */}
          {viewMode === "archive" && (
            <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Archive className="w-4 h-4 text-emerald-400" /> Answered Prayers Archive
                </h4>
                <p className="text-[10.5px] text-slate-400 mt-0.5">
                  Displaying completed petitions with their original dates. You can move any prayer back to active status at any time.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/40">
                {answeredCount} Testimonies
              </span>
            </div>
          )}

          {/* Entries Feed */}
          {loading ? (
            <div className="flex items-center justify-center py-16 bg-[#050D1E]/60 border border-slate-800 rounded-2xl">
              <RotateCw className="w-7 h-7 text-[#D4AF37] animate-spin" />
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="text-center py-16 bg-[#050D1E]/60 border border-dashed border-slate-800 rounded-2xl space-y-3">
              <FlameKindling className="w-10 h-10 text-[#D4AF37]/40 mx-auto" />
              <h4 className="text-sm font-serif-cinzel font-bold text-white">
                {viewMode === "archive" ? "No Answered Prayers in Archive Yet" : "No Prayer Entries Found"}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {viewMode === "archive"
                  ? "When your petitions are fulfilled, celebrate and archive them here to memorialize God's mighty acts."
                  : "Begin your prayer journey today by recording your first petition in the form on the left."}
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
              {filteredEntries.map((entry) => {
                const isAnswered = entry.status === "Answered";
                const createdDate = new Date(entry.createdAt);
                const answeredDate = entry.answeredAt ? new Date(entry.answeredAt) : null;
                const daysInPrayer = answeredDate 
                  ? Math.max(1, Math.round((answeredDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)))
                  : Math.max(1, Math.round((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));

                return (
                  <div
                    key={entry.id}
                    className={`p-4.5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between gap-3 ${
                      isAnswered
                        ? "bg-gradient-to-br from-emerald-950/30 via-[#050D1E] to-[#0A1526] border-emerald-500/40 shadow-lg shadow-emerald-950/20"
                        : "bg-[#050D1E]/95 border-slate-800 hover:border-slate-700 shadow-md"
                    }`}
                  >
                    {/* Golden Star for Answered Prayer */}
                    {isAnswered && (
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none flex items-center justify-center">
                        <Star className="w-6 h-6 text-emerald-400/25 fill-emerald-400/20 rotate-12" />
                      </div>
                    )}

                    {/* Card Header */}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                isAnswered ? "bg-emerald-400 shadow-sm shadow-emerald-400/80" : "bg-amber-400 animate-pulse"
                              }`}
                            />
                            <h4 className={`text-sm font-bold tracking-tight ${isAnswered ? "text-emerald-300" : "text-white"}`}>
                              {entry.title}
                            </h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                            {entry.category && (
                              <span className="bg-[#112055] text-[#D4AF37] px-2 py-0.5 rounded border border-[#D4AF37]/20 font-semibold">
                                {entry.category}
                              </span>
                            )}
                            {entry.scriptureRef && (
                              <span className="bg-purple-950/40 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20 font-mono">
                                📖 {entry.scriptureRef}
                              </span>
                            )}
                            
                            {/* Original Recorded Date */}
                            <span className="font-mono text-slate-400">
                              Logged: {createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>

                            {/* Days in Prayer */}
                            <span className="font-mono text-amber-400/80 bg-amber-950/30 px-1.5 py-0.2 rounded">
                              {daysInPrayer}d in Prayer
                            </span>
                          </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 z-10">
                          
                          {/* MOVE BACK TO ACTIVE STATUS BUTTON (Required Feature) */}
                          {isAnswered ? (
                            <button
                              type="button"
                              onClick={() => handleMoveBackToActive(entry)}
                              className="flex items-center gap-1 text-[10.5px] font-bold py-1 px-2.5 rounded-lg border bg-[#112055] border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F1E] cursor-pointer transition"
                              title="Move prayer request back to active status for continued intercession"
                            >
                              <Undo2 className="w-3.5 h-3.5" />
                              <span>Move to Active</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleInitiateAnswerToggle(entry)}
                              className="flex items-center gap-1 text-[10.5px] font-bold py-1 px-2.5 rounded-lg border bg-[#112055] border-amber-500/40 text-amber-300 hover:bg-emerald-600 hover:text-white cursor-pointer transition"
                              title="Celebrate as Answered Prayer & Record Testimony"
                            >
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                              <span>Mark Answered</span>
                            </button>
                          )}

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => setEditingEntry(entry)}
                            className="p-1.5 text-slate-400 hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition cursor-pointer"
                            title="Edit Prayer Request"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteEntry(entry.id, entry.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition cursor-pointer"
                            title="Remove Entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Prayer Petition Details */}
                      <p className={`text-xs mt-3 leading-relaxed whitespace-pre-wrap ${isAnswered ? "text-slate-300" : "text-slate-200"}`}>
                        {entry.request}
                      </p>
                    </div>

                    {/* Answered Testimony Banner with Original Date vs Answered Date */}
                    {isAnswered && (
                      <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl space-y-1.5 mt-1 text-xs">
                        <div className="flex flex-wrap justify-between items-center gap-1 text-[10.5px]">
                          <span className="font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                            <Quote className="w-3 h-3 text-emerald-400" /> Praise Report & Answered Testimony
                          </span>
                          {entry.answeredAt && (
                            <span className="text-emerald-300/80 font-mono text-[9.5px]">
                              Fulfilled on {new Date(entry.answeredAt).toLocaleDateString()} ({daysInPrayer} days of waiting)
                            </span>
                          )}
                        </div>
                        <p className="text-emerald-100 text-xs italic leading-relaxed">
                          "{entry.testimony || "God answered according to His rich covenant grace!"}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. ANSWERED TESTIMONY CELEBRATION MODAL */}
      {answeringEntry && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0D1B3E] border border-emerald-500/50 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl gold-glow">
            <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                <h3 className="text-sm font-serif-cinzel font-bold text-emerald-300 tracking-wider">
                  Celebrate God's Faithfulness!
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAnsweringEntry(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-300">
                You are archiving <span className="font-bold text-white">"{answeringEntry.title}"</span> as an answered prayer testimony!
              </p>
              <label className="text-[11px] font-bold text-[#D4AF37] block">
                Record your Praise Report / Testimony:
              </label>
              <textarea
                rows={4}
                value={testimonyText}
                onChange={(e) => setTestimonyText(e.target.value)}
                placeholder="Excribe how God answered, what scriptures were fulfilled, and dates of breakthrough to encourage your faith..."
                className="w-full text-xs bg-[#030611] border border-emerald-500/30 focus:border-emerald-400 rounded-lg p-3 outline-none text-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1 border-t border-white/10">
              <button
                type="button"
                onClick={() => setAnsweringEntry(null)}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAnswered}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md cursor-pointer transition"
              >
                <CheckCircle2 className="w-4 h-4" /> Archive to Answered Prayers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. EDIT PRAYER ENTRY MODAL */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0D1B3E] border border-[#D4AF37]/50 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl gold-glow">
            <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
              <h3 className="text-sm font-serif-cinzel font-bold text-[#D4AF37] tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-[#D4AF37]" /> Edit Prayer Petition
              </h3>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Subject Title</label>
                <input
                  type="text"
                  value={editingEntry.title}
                  onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                  className="w-full text-xs bg-[#030611] border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Category</label>
                  <select
                    value={editingEntry.category || "Spiritual Growth"}
                    onChange={(e) => setEditingEntry({ ...editingEntry, category: e.target.value })}
                    className="w-full text-xs bg-[#030611] border border-slate-800 rounded-lg p-2 text-white outline-none"
                  >
                    {PRAYER_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Scripture Anchor</label>
                  <input
                    type="text"
                    value={editingEntry.scriptureRef || ""}
                    onChange={(e) => setEditingEntry({ ...editingEntry, scriptureRef: e.target.value })}
                    className="w-full text-xs bg-[#030611] border border-slate-800 rounded-lg p-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Petition Details</label>
                <textarea
                  rows={4}
                  value={editingEntry.request}
                  onChange={(e) => setEditingEntry({ ...editingEntry, request: e.target.value })}
                  className="w-full text-xs bg-[#030611] border border-slate-800 rounded-lg p-2.5 text-white outline-none focus:border-[#D4AF37] resize-none"
                />
              </div>

              {editingEntry.status === "Answered" && (
                <div>
                  <label className="text-[11px] font-bold text-emerald-400 block mb-1">Testimony / Praise Report</label>
                  <textarea
                    rows={3}
                    value={editingEntry.testimony || ""}
                    onChange={(e) => setEditingEntry({ ...editingEntry, testimony: e.target.value })}
                    className="w-full text-xs bg-[#030611] border border-emerald-500/30 rounded-lg p-2.5 text-emerald-100 outline-none resize-none"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="bg-[#D4AF37] hover:bg-[#F0C940] text-[#0A0F1E] font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
