import React, { useState, useEffect, useMemo } from "react";
import { 
  Highlighter, Bookmark, BookmarkCheck, Palette, Copy, Trash2, 
  Edit3, Search, Filter, BookOpen, Sparkles, Check, ChevronRight, 
  Share2, ArrowLeft, Download, Plus, AlertCircle, Quote, Star, 
  Layers, ExternalLink, RefreshCw, X
} from "lucide-react";
import { 
  collection, doc, setDoc, deleteDoc, onSnapshot, query, where 
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { VerseHighlight } from "../types";

interface VerseHighlighterProps {
  user?: any;
  triggerToast: (icon: string, message: string) => void;
  preferredVersion?: string;
  onSelectVerseForStudy?: (ref: string, text: string) => void;
}

// 6 Sacred Liturgical Highlighting Color Presets
export const HIGHLIGHT_COLORS = [
  {
    id: "gold",
    label: "Liturgical Gold",
    meaning: "Glory, Covenant & Sovereignty",
    hex: "#D4AF37",
    bgClass: "bg-[#D4AF37]/25",
    borderClass: "border-[#D4AF37]",
    textClass: "text-[#D4AF37]",
    badgeClass: "bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/35"
  },
  {
    id: "blue",
    label: "Celestial Blue",
    meaning: "Grace, Peace & Living Water",
    hex: "#38BDF8",
    bgClass: "bg-sky-500/25",
    borderClass: "border-sky-400",
    textClass: "text-sky-300",
    badgeClass: "bg-sky-950/40 text-sky-300 border-sky-500/35"
  },
  {
    id: "green",
    label: "Emerald Green",
    meaning: "Spiritual Life, Growth & Healing",
    hex: "#34D399",
    bgClass: "bg-emerald-500/25",
    borderClass: "border-emerald-400",
    textClass: "text-emerald-300",
    badgeClass: "bg-emerald-950/40 text-emerald-300 border-emerald-500/35"
  },
  {
    id: "purple",
    label: "Royal Purple",
    meaning: "Kingship, Royalty & Majesty",
    hex: "#A78BFA",
    bgClass: "bg-purple-500/25",
    borderClass: "border-purple-400",
    textClass: "text-purple-300",
    badgeClass: "bg-purple-950/40 text-purple-300 border-purple-500/35"
  },
  {
    id: "rose",
    label: "Rose Ruby",
    meaning: "Atonement, Love & Sacrifice",
    hex: "#F43F5E",
    bgClass: "bg-rose-500/25",
    borderClass: "border-rose-400",
    textClass: "text-rose-300",
    badgeClass: "bg-rose-950/40 text-rose-300 border-rose-500/35"
  },
  {
    id: "amber",
    label: "Amber Flame",
    meaning: "Holy Fire, Wisdom & Exhortation",
    hex: "#F59E0B",
    bgClass: "bg-amber-500/25",
    borderClass: "border-amber-400",
    textClass: "text-amber-300",
    badgeClass: "bg-amber-950/40 text-amber-300 border-amber-500/35"
  }
];

// Rich Scripture Repository with Full Authentic Verses
interface ChapterData {
  book: string;
  chapter: number;
  testament: "OT" | "NT";
  title: string;
  theme: string;
  verses: { verse: number; text: string }[];
}

const SCRIPTURE_DATABASE: Record<string, ChapterData> = {
  "Romans 8": {
    book: "Romans",
    chapter: 8,
    testament: "NT",
    title: "Life in the Spirit and Everlasting Assurance",
    theme: "God's Sovereign Love and Unbreakable Covenant Assurance",
    verses: [
      { verse: 1, text: "There is therefore now no condemnation for those who are in Christ Jesus." },
      { verse: 2, text: "For the law of the Spirit of life has set you free in Christ Jesus from the law of sin and death." },
      { verse: 3, text: "For God has done what the law, weakened by the flesh, could not do. By sending his own Son in the likeness of sinful flesh and for sin, he condemned sin in the flesh," },
      { verse: 4, text: "in order that the righteous requirement of the law might be fulfilled in us, who walk not according to the flesh but according to the Spirit." },
      { verse: 5, text: "For those who live according to the flesh set their minds on the things of the flesh, but those who live according to the Spirit set their minds on the things of the Spirit." },
      { verse: 6, text: "For to set the mind on the flesh is death, but to set the mind on the Spirit is life and peace." },
      { verse: 7, text: "For the mind that is set on the flesh is hostile to God, for it does not submit to God's law; indeed, it cannot." },
      { verse: 8, text: "Those who are in the flesh cannot please God." },
      { verse: 9, text: "You, however, are not in the flesh but in the Spirit, if in fact the Spirit of God dwells in you. Anyone who does not have the Spirit of Christ does not belong to him." },
      { verse: 10, text: "But if Christ is in you, although the body is dead because of sin, the Spirit is life because of righteousness." },
      { verse: 11, text: "If the Spirit of him who raised Jesus from the dead dwells in you, he who raised Christ Jesus from the dead will also give life to your mortal bodies through his Spirit who dwells in you." },
      { verse: 12, text: "So then, brothers, we are debtors, not to the flesh, to live according to the flesh." },
      { verse: 13, text: "For if you live according to the flesh you will die, but if by the Spirit you put to death the deeds of the body, you will live." },
      { verse: 14, text: "For all who are led by the Spirit of God are sons of God." },
      { verse: 15, text: "For you did not receive the spirit of slavery to fall back into fear, but you have received the Spirit of adoption as sons, by whom we cry, 'Abba! Father!'" },
      { verse: 16, text: "The Spirit himself bears witness with our spirit that we are children of God," },
      { verse: 17, text: "and if children, then heirs—heirs of God and fellow heirs with Christ, provided we suffer with him in order that we may also be glorified with him." },
      { verse: 18, text: "For I consider that the sufferings of this present time are not worth comparing with the glory that is to be revealed to us." },
      { verse: 19, text: "For the creation waits with eager longing for the revealing of the sons of God." },
      { verse: 20, text: "For the creation was subjected to futility, not willingly, but because of him who subjected it, in hope" },
      { verse: 21, text: "that the creation itself will be set free from its bondage to corruption and obtain the freedom of the glory of the children of God." },
      { verse: 22, text: "For we know that the whole creation has been groaning together in the pains of childbirth until now." },
      { verse: 23, text: "And not only the creation, but we ourselves, who have the firstfruits of the Spirit, groan inwardly as we wait eagerly for adoption as sons, the redemption of our bodies." },
      { verse: 24, text: "For in this hope we were saved. Now hope that is seen is not hope. For who hopes for what he sees?" },
      { verse: 25, text: "But if we hope for what we do not see, we wait for it with patience." },
      { verse: 26, text: "Likewise the Spirit helps us in our weakness. For we do not know what to pray for as we ought, but the Spirit himself intercedes for us with groanings too deep for words." },
      { verse: 27, text: "And he who searches hearts knows what is the mind of the Spirit, because the Spirit intercedes for the saints according to the will of God." },
      { verse: 28, text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose." },
      { verse: 29, text: "For those whom he foreknew he also predestined to be conformed to the image of his Son, in order that he might be the firstborn among many brothers." },
      { verse: 30, text: "And those whom he predestined he also called, and those whom he called he also justified, and those whom he justified he also glorified." },
      { verse: 31, text: "What then shall we say to these things? If God is for us, who can be against us?" },
      { verse: 32, text: "He who did not spare his own Son but gave him up for us all, how will he not also with him graciously give us all things?" },
      { verse: 33, text: "Who shall bring any charge against God's elect? It is God who justifies." },
      { verse: 34, text: "Who is to condemn? Christ Jesus is the one who died—more than that, who was raised—who is at the right hand of God, who indeed is interceding for us." },
      { verse: 35, text: "Who shall separate us from the love of Christ? Shall tribulation, or distress, or persecution, or famine, or nakedness, or danger, or sword?" },
      { verse: 36, text: "As it is written, 'For your sake we are being killed all the day long; we are regarded as sheep to be slaughtered.'" },
      { verse: 37, text: "No, in all these things we are more than conquerors through him who loved us." },
      { verse: 38, text: "For I am sure that neither death nor life, nor angels nor rulers, nor things present nor things to come, nor powers," },
      { verse: 39, text: "nor height nor depth, nor anything else in all creation, will be able to separate us from the love of God in Christ Jesus our Lord." }
    ]
  },
  "John 15": {
    book: "John",
    chapter: 15,
    testament: "NT",
    title: "The True Vine and Fellowship with Christ",
    theme: "Abiding in Christ, Bearing Fruit, and Brotherly Love",
    verses: [
      { verse: 1, text: "I am the true vine, and my Father is the vinedresser." },
      { verse: 2, text: "Every branch in me that does not bear fruit he takes away, and every branch that does bear fruit he prunes, that it may bear more fruit." },
      { verse: 3, text: "Already you are clean because of the word that I have spoken to you." },
      { verse: 4, text: "Abide in me, and I in you. As the branch cannot bear fruit by itself, unless it abides in the vine, neither can you, unless you abide in me." },
      { verse: 5, text: "I am the vine; you are the branches. Whoever abides in me and I in him, he it is that bears much fruit, for apart from me you can do nothing." },
      { verse: 6, text: "If anyone does not abide in me he is thrown away like a branch and withers; and the branches are gathered, thrown into the fire, and burned." },
      { verse: 7, text: "If you abide in me, and my words abide in you, ask whatever you wish, and it will be done for you." },
      { verse: 8, text: "By this my Father is glorified, that you bear much fruit and so prove to be my disciples." },
      { verse: 9, text: "As the Father has loved me, so have I loved you. Abide in my love." },
      { verse: 10, text: "If you keep my commandments, you will abide in my love, just as I have kept my Father's commandments and abide in his love." },
      { verse: 11, text: "These things I have spoken to you, that my joy may be in you, and that your joy may be full." },
      { verse: 12, text: "This is my commandment, that you love one another as I have loved you." },
      { verse: 13, text: "Greater love has no one than this, that someone lay down his life for his friends." },
      { verse: 14, text: "You are my friends if you do what I command you." },
      { verse: 15, text: "No longer do I call you servants, for the servant does not know what his master is doing; but I have called you friends, for all that I have heard from my Father I have made known to you." },
      { verse: 16, text: "You did not choose me, but I chose you and appointed you that you should go and bear fruit and that your fruit should abide, so that whatever you ask the Father in my name, he may give it to you." },
      { verse: 17, text: "These things I command you, so that you will love one another." }
    ]
  },
  "Psalm 23": {
    book: "Psalms",
    chapter: 23,
    testament: "OT",
    title: "The Good Shepherd's Sovereign Care",
    theme: "Providence, Rest, and Eternal Security in Jehovah",
    verses: [
      { verse: 1, text: "The LORD is my shepherd; I shall not want." },
      { verse: 2, text: "He makes me lie down in green pastures. He leads me beside still waters." },
      { verse: 3, text: "He restores my soul. He leads me in paths of righteousness for his name's sake." },
      { verse: 4, text: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me." },
      { verse: 5, text: "You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows." },
      { verse: 6, text: "Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the LORD forever." }
    ]
  },
  "Ephesians 2": {
    book: "Ephesians",
    chapter: 2,
    testament: "NT",
    title: "Made Alive in Christ by Grace Alone",
    theme: "Sovereign Regeneration, Grace Through Faith, and Unity",
    verses: [
      { verse: 1, text: "And you were dead in the trespasses and sins" },
      { verse: 2, text: "in which you once walked, following the course of this world, following the prince of the power of the air, the spirit that is now at work in the sons of disobedience—" },
      { verse: 3, text: "among whom we all once lived in the passions of our flesh, carrying out the desires of the body and the mind, and were by nature children of wrath, like the rest of mankind." },
      { verse: 4, text: "But God, being rich in mercy, because of the great love with which he loved us," },
      { verse: 5, text: "even when we were dead in our trespasses, made us alive together with Christ—by grace you have been saved—" },
      { verse: 6, text: "and raised us up with him and seated us with him in the heavenly places in Christ Jesus," },
      { verse: 7, text: "so that in the coming ages he might show the immeasurable riches of his grace in kindness toward us in Christ Jesus." },
      { verse: 8, text: "For by grace you have been saved through faith. And this is not your own doing; it is the gift of God," },
      { verse: 9, text: "not a result of works, so that no one may boast." },
      { verse: 10, text: "For we are his workmanship, created in Christ Jesus for good works, which God prepared beforehand, that we should walk in them." }
    ]
  },
  "Philippians 4": {
    book: "Philippians",
    chapter: 4,
    testament: "NT",
    title: "Joy, Transcendent Peace, and Sufficiency in Christ",
    theme: "Prayer, Tranquility of Heart, and Christ's Strengthening Power",
    verses: [
      { verse: 4, text: "Rejoice in the Lord always; again I will say, rejoice." },
      { verse: 5, text: "Let your reasonableness be known to everyone. The Lord is at hand;" },
      { verse: 6, text: "do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God." },
      { verse: 7, text: "And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus." },
      { verse: 8, text: "Finally, brothers, whatever is true, whatever is honorable, whatever is just, whatever is pure, whatever is lovely, whatever is commendable, if there is any excellence, if there is anything worthy of praise, think about these things." },
      { verse: 9, text: "What you have learned and received and heard and seen in me—practice these things, and the God of peace will be with you." },
      { verse: 11, text: "Not that I am speaking of being in need, for I have learned in whatever situation I am to be content." },
      { verse: 12, text: "I know how to be brought low, and I know how to abound. In any and every circumstance, I have learned the secret of facing plenty and hunger, abundance and need." },
      { verse: 13, text: "I can do all things through him who strengthens me." },
      { verse: 19, text: "And my God will supply every need of yours according to his riches in glory in Christ Jesus." }
    ]
  },
  "Psalm 91": {
    book: "Psalms",
    chapter: 91,
    testament: "OT",
    title: "My Refuge and My Fortress",
    theme: "Divine Protection, Angelic Guard, and the Secret Place",
    verses: [
      { verse: 1, text: "He who dwells in the shelter of the Most High will abide in the shadow of the Almighty." },
      { verse: 2, text: "I will say to the LORD, 'My refuge and my fortress, my God, in whom I trust.'" },
      { verse: 3, text: "For he will deliver you from the snare of the fowler and from the deadly pestilence." },
      { verse: 4, text: "He will cover you with his pinions, and under his wings you will find refuge; his faithfulness is a shield and buckler." },
      { verse: 5, text: "You will not fear the terror of the night, nor the arrow that flies by day," },
      { verse: 6, text: "nor the pestilence that stalks in darkness, nor the destruction that wastes at noonday." },
      { verse: 7, text: "A thousand may fall at your side, ten thousand at your right hand, but it will not come near you." },
      { verse: 11, text: "For he will command his angels concerning you to guard you in all your ways." },
      { verse: 12, text: "On their hands they will bear you up, lest you strike your foot against a stone." },
      { verse: 14, text: "Because he holds fast to me in love, I will deliver him; I will protect him, because he knows my name." },
      { verse: 15, text: "When he calls to me, I will answer him; I will be with him in trouble; I will rescue him and honor him." },
      { verse: 16, text: "With long life I will satisfy him and show him my salvation." }
    ]
  },
  "Isaiah 40": {
    book: "Isaiah",
    chapter: 40,
    testament: "OT",
    title: "Comfort for God's People and Unfailing Strength",
    theme: "The Incomparable God who Renews the Weary",
    verses: [
      { verse: 28, text: "Have you not known? Have you not heard? The LORD is the everlasting God, the Creator of the ends of the earth. He does not faint or grow weary; his understanding is unsearchable." },
      { verse: 29, text: "He gives power to the faint, and to him who has no might he increases strength." },
      { verse: 30, text: "Even youths shall faint and be weary, and young men shall fall exhausted;" },
      { verse: 31, text: "but they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint." }
    ]
  },
  "Hebrews 11": {
    book: "Hebrews",
    chapter: 11,
    testament: "NT",
    title: "By Faith: The Hall of Patriarchs",
    theme: "Assurance of Things Hoped For and Conviction of Unseen Realities",
    verses: [
      { verse: 1, text: "Now faith is the assurance of things hoped for, the conviction of things not seen." },
      { verse: 2, text: "For by it the people of old received their commendation." },
      { verse: 3, text: "By faith we understand that the universe was created by the word of God, so that what is seen was not made out of things that have visible existence." },
      { verse: 6, text: "And without faith it is impossible to please him, for whoever would draw near to God must believe that he exists and that he rewards those who seek him." },
      { verse: 8, text: "By faith Abraham obeyed when he was called to go out to a place that he was to receive as an inheritance. And he went out, not knowing where he was going." },
      { verse: 10, text: "For he was looking forward to the city that has foundations, whose designer and builder is God." }
    ]
  }
};

const CHAPTER_KEYS = Object.keys(SCRIPTURE_DATABASE);

export default function VerseHighlighter({ 
  user, 
  triggerToast, 
  preferredVersion = "ESV",
  onSelectVerseForStudy
}: VerseHighlighterProps) {
  // Navigation & View Mode
  const [activeView, setActiveView] = useState<"reader" | "archive">("reader");

  // Selected Bible Chapter
  const [selectedChapterKey, setSelectedChapterKey] = useState<string>("Romans 8");
  const [searchQuery, setSearchQuery] = useState("");

  // Highlights state (synced with Firestore + Local Storage)
  const [highlights, setHighlights] = useState<VerseHighlight[]>([]);
  const [loading, setLoading] = useState(false);

  // Interactive Selection State
  // Set of verse numbers currently selected for highlighting
  const [selectedVerseNums, setSelectedVerseNums] = useState<number[]>([]);
  const [activeHighlightColor, setActiveHighlightColor] = useState<string>("gold");
  const [studyNoteInput, setStudyNoteInput] = useState<string>("");
  const [isSavingHighlight, setIsSavingHighlight] = useState(false);

  // Archive Filter States
  const [archiveColorFilter, setArchiveColorFilter] = useState<string>("all");
  const [archiveSearchTerm, setArchiveSearchTerm] = useState<string>("");
  const [editingHighlightNoteId, setEditingHighlightNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState<string>("");

  // 1. Initial Local Storage & Firestore Sync
  useEffect(() => {
    // Load local storage fallback immediately
    const offlineCached = localStorage.getItem("faithflow_verse_highlights");
    if (offlineCached) {
      try {
        setHighlights(JSON.parse(offlineCached));
      } catch (e) {
        console.error("Failed to parse cached highlights:", e);
      }
    }

    if (!user) {
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, "highlights"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: VerseHighlight[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as VerseHighlight);
        });
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setHighlights(items);
        localStorage.setItem("faithflow_verse_highlights", JSON.stringify(items));
        setLoading(false);
      },
      (error) => {
        console.warn("Firestore highlights sync error:", error);
        handleFirestoreError(error, OperationType.LIST, "highlights");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Current Chapter Data
  const currentChapter = useMemo(() => {
    return SCRIPTURE_DATABASE[selectedChapterKey] || SCRIPTURE_DATABASE["Romans 8"];
  }, [selectedChapterKey]);

  // Map of highlights for current chapter by verse number
  const currentChapterHighlights = useMemo(() => {
    const map = new Map<number, VerseHighlight>();
    highlights.forEach((hl) => {
      if (hl.book === currentChapter.book && hl.chapter === currentChapter.chapter) {
        map.set(hl.verse, hl);
      }
    });
    return map;
  }, [highlights, currentChapter]);

  // Handle clicking on a verse
  const handleToggleVerseSelection = (verseNum: number) => {
    if (selectedVerseNums.includes(verseNum)) {
      setSelectedVerseNums(prev => prev.filter(n => n !== verseNum));
      if (selectedVerseNums.length === 1) {
        setStudyNoteInput("");
      }
    } else {
      setSelectedVerseNums(prev => [...prev, verseNum]);
      // If this verse was already highlighted, preload its color and note
      const existing = currentChapterHighlights.get(verseNum);
      if (existing) {
        setActiveHighlightColor(existing.color);
        setStudyNoteInput(existing.note || "");
      }
    }
  };

  // Select all verses in current chapter
  const handleSelectAllVerses = () => {
    setSelectedVerseNums(currentChapter.verses.map(v => v.verse));
  };

  // Clear current verse selection
  const handleClearSelection = () => {
    setSelectedVerseNums([]);
    setStudyNoteInput("");
  };

  // Save highlight(s) to Firestore & Local Storage
  const handleApplyHighlight = async () => {
    if (selectedVerseNums.length === 0) return;

    setIsSavingHighlight(true);
    const colorObj = HIGHLIGHT_COLORS.find(c => c.id === activeHighlightColor) || HIGHLIGHT_COLORS[0];
    const newHighlights: VerseHighlight[] = [];

    for (const vNum of selectedVerseNums) {
      const verseObj = currentChapter.verses.find(v => v.verse === vNum);
      if (!verseObj) continue;

      const hlId = `hl_${user?.uid || "guest"}_${currentChapter.book}_${currentChapter.chapter}_${vNum}`.replace(/[^a-zA-Z0-9_]/g, "_");
      const record: VerseHighlight = {
        id: hlId,
        userId: user?.uid || "offline_guest",
        passage: `${currentChapter.book} ${currentChapter.chapter}:${vNum}`,
        book: currentChapter.book,
        chapter: currentChapter.chapter,
        verse: vNum,
        verseText: verseObj.text,
        color: activeHighlightColor,
        colorHex: colorObj.hex,
        note: studyNoteInput.trim() || undefined,
        version: preferredVersion,
        createdAt: new Date().toISOString()
      };

      newHighlights.push(record);

      // Write to Firestore if authenticated
      if (user) {
        try {
          await setDoc(doc(db, "highlights", hlId), record);
        } catch (err: any) {
          console.warn("Firestore highlight write failed:", err);
          handleFirestoreError(err, OperationType.WRITE, "highlights");
        }
      }
    }

    // Update local state and cache
    setHighlights(prev => {
      // Replace existing ones for these verses
      const filtered = prev.filter(h => 
        !(h.book === currentChapter.book && h.chapter === currentChapter.chapter && selectedVerseNums.includes(h.verse))
      );
      const updated = [...newHighlights, ...filtered];
      localStorage.setItem("faithflow_verse_highlights", JSON.stringify(updated));
      return updated;
    });

    setIsSavingHighlight(false);
    setSelectedVerseNums([]);
    setStudyNoteInput("");
    triggerToast("🎨", `Saved ${newHighlights.length} verse highlight(s) with ${colorObj.label}!`);
  };

  // Remove highlight from Firestore & local storage
  const handleRemoveHighlight = async (hl: VerseHighlight) => {
    if (user) {
      try {
        await deleteDoc(doc(db, "highlights", hl.id));
      } catch (err: any) {
        console.warn("Firestore highlight delete error:", err);
        handleFirestoreError(err, OperationType.DELETE, "highlights");
      }
    }

    setHighlights(prev => {
      const updated = prev.filter(h => h.id !== hl.id);
      localStorage.setItem("faithflow_verse_highlights", JSON.stringify(updated));
      return updated;
    });

    triggerToast("🗑️", `Removed highlight for ${hl.passage}`);
  };

  // Save edited note in Archive
  const handleSaveEditedNote = async (hlId: string) => {
    const target = highlights.find(h => h.id === hlId);
    if (!target) return;

    const updated: VerseHighlight = {
      ...target,
      note: editingNoteText.trim() || undefined
    };

    if (user) {
      try {
        await setDoc(doc(db, "highlights", hlId), updated);
      } catch (err: any) {
        console.warn("Firestore note update error:", err);
        handleFirestoreError(err, OperationType.WRITE, "highlights");
      }
    }

    setHighlights(prev => {
      const next = prev.map(h => h.id === hlId ? updated : h);
      localStorage.setItem("faithflow_verse_highlights", JSON.stringify(next));
      return next;
    });

    setEditingHighlightNoteId(null);
    setEditingNoteText("");
    triggerToast("💾", "Study note updated in Firestore!");
  };

  // Copy scripture highlight text with formatting
  const handleCopyHighlight = (hl: VerseHighlight) => {
    const formatted = `"${hl.verseText}"\n— ${hl.passage} (${hl.version || preferredVersion})${hl.note ? `\n\nStudy Note: ${hl.note}` : ""}`;
    navigator.clipboard.writeText(formatted);
    triggerToast("📋", `Copied ${hl.passage} to clipboard!`);
  };

  // Export highlights to markdown notebook
  const handleExportHighlights = () => {
    if (highlights.length === 0) {
      triggerToast("⚠️", "No highlights to export yet.");
      return;
    }

    let md = `# FaithFlow Holy Scripture Highlights & Study Notebook\n`;
    md += `Exported on: ${new Date().toLocaleDateString()} &bull; Total Highlights: ${highlights.length}\n\n`;

    HIGHLIGHT_COLORS.forEach(c => {
      const matching = highlights.filter(h => h.color === c.id);
      if (matching.length > 0) {
        md += `## 🎨 ${c.label} (${c.meaning}) — ${matching.length} verses\n\n`;
        matching.forEach(h => {
          md += `### ${h.passage} (${h.version || preferredVersion})\n`;
          md += `> "${h.verseText}"\n\n`;
          if (h.note) {
            md += `*Study Reflection:* ${h.note}\n\n`;
          }
          md += `---\n\n`;
        });
      }
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `FaithFlow_Scripture_Highlights_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
    triggerToast("📥", "Exported highlights study notebook!");
  };

  // Filtered Highlights in Archive View
  const filteredArchiveHighlights = useMemo(() => {
    return highlights.filter(hl => {
      const matchesColor = archiveColorFilter === "all" || hl.color === archiveColorFilter;
      const q = archiveSearchTerm.toLowerCase();
      const matchesSearch = !q || 
        hl.passage.toLowerCase().includes(q) || 
        hl.verseText.toLowerCase().includes(q) || 
        (hl.note && hl.note.toLowerCase().includes(q));
      return matchesColor && matchesSearch;
    });
  }, [highlights, archiveColorFilter, archiveSearchTerm]);

  return (
    <div className="space-y-5 font-sans-raleway text-white animate-fade-in">
      {/* 1. TOP CONTROL & NAVIGATION BANNER */}
      <div className="border border-[#D4AF37]/35 bg-[#0D1B3E] p-4 rounded-2xl gold-glow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/35 rounded-xl">
              <Highlighter className="w-4 h-4 text-[#D4AF37]" />
            </span>
            <h3 className="font-serif-cinzel font-bold text-white text-base">
              Scripture Verse Highlighter & Study Notebook
            </h3>
            <span className="text-[10px] font-mono bg-[#112055] text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded-full uppercase font-bold flex items-center gap-1">
              <BookmarkCheck className="w-3 h-3 text-[#D4AF37]" /> {highlights.length} Saved
            </span>
          </div>
          <p className="text-xs text-[#B0C4DE] mt-1">
            Highlight sacred passages in multiple liturgical colors, annotate divine insights, and preserve them in Firestore for future contemplation and sermon preparation.
          </p>
        </div>

        {/* View Mode Toggle & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-[#0A0F1E] border border-white/10 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setActiveView("reader")}
              className={`flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg font-semibold transition cursor-pointer ${
                activeView === "reader"
                  ? "bg-[#D4AF37] text-black font-bold shadow-md"
                  : "text-[#B0C4DE] hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Scripture Reader
            </button>
            <button
              onClick={() => setActiveView("archive")}
              className={`flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-lg font-semibold transition cursor-pointer ${
                activeView === "archive"
                  ? "bg-[#D4AF37] text-black font-bold shadow-md"
                  : "text-[#B0C4DE] hover:text-white"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" /> Study Archive ({highlights.length})
            </button>
          </div>

          <button
            onClick={handleExportHighlights}
            disabled={highlights.length === 0}
            className="bg-[#112055] hover:bg-[#112055]/80 disabled:opacity-40 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold py-1.5 px-3 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            title="Export Highlights to Markdown Notebook"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: SCRIPTURE READER & SELECTION HIGHLIGHTER */}
      {/* ========================================================================= */}
      {activeView === "reader" && (
        <div className="space-y-4">
          {/* Chapter Quick Picker & Search */}
          <div className="bg-[#0A0F1E] border border-white/10 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider font-mono mr-1">
                Passage:
              </span>
              {CHAPTER_KEYS.map((k) => {
                const isSelected = selectedChapterKey === k;
                const chapterCount = highlights.filter(h => h.book === SCRIPTURE_DATABASE[k].book && h.chapter === SCRIPTURE_DATABASE[k].chapter).length;
                return (
                  <button
                    key={k}
                    onClick={() => {
                      setSelectedChapterKey(k);
                      setSelectedVerseNums([]);
                      setStudyNoteInput("");
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#D4AF37] border-[#D4AF37] text-black font-bold shadow-sm"
                        : "bg-[#050D1E] border-white/10 text-slate-300 hover:border-[#D4AF37]/40 hover:text-white"
                    }`}
                  >
                    <span>{k}</span>
                    {chapterCount > 0 && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isSelected ? "bg-black/20 text-black" : "bg-[#D4AF37]/20 text-[#D4AF37]"
                      }`}>
                        {chapterCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">
                Version: <span className="text-[#D4AF37] font-bold">{preferredVersion}</span>
              </span>
              <button
                onClick={handleSelectAllVerses}
                className="text-[10px] text-slate-400 hover:text-[#D4AF37] underline cursor-pointer"
              >
                Select Chapter
              </button>
            </div>
          </div>

          {/* Chapter Meta Header */}
          <div className="bg-[#0D1B3E]/90 border border-[#D4AF37]/25 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase tracking-widest">
                  {currentChapter.testament === "OT" ? "Old Testament" : "New Testament"} &bull; {currentChapter.book} Chapter {currentChapter.chapter}
                </span>
                <span className="text-[10px] bg-white/5 border border-white/10 text-slate-400 px-2 py-0.5 rounded">
                  {currentChapter.verses.length} Verses
                </span>
              </div>
              <h2 className="text-lg font-serif-cinzel font-bold text-white mt-0.5">
                {currentChapter.title}
              </h2>
              <p className="text-xs text-slate-300 italic mt-0.5">
                Theological Theme: "{currentChapter.theme}"
              </p>
            </div>

            {/* Selection Status Badge */}
            {selectedVerseNums.length > 0 && (
              <div className="flex items-center gap-2 bg-[#112055] border border-[#D4AF37]/40 px-3 py-1.5 rounded-xl text-xs">
                <span className="text-amber-300 font-bold">
                  {selectedVerseNums.length} {selectedVerseNums.length === 1 ? "Verse" : "Verses"} Selected
                </span>
                <button
                  onClick={handleClearSelection}
                  className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                  title="Clear Selection"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* FLOATING / STICKY HIGHLIGHTING CONTROLS PALETTE BAR */}
          {/* ========================================================================= */}
          {selectedVerseNums.length > 0 && (
            <div className="sticky top-2 z-20 bg-[#070E20]/95 backdrop-blur-md border border-[#D4AF37] p-3.5 rounded-2xl shadow-2xl gold-glow animate-scale-up space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Apply Color Highlight to {selectedVerseNums.length === 1 ? `Verse ${selectedVerseNums[0]}` : `${selectedVerseNums.length} Selected Verses`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">
                    Target: {currentChapter.book} {currentChapter.chapter}:{selectedVerseNums.sort((a,b)=>a-b).join(", ")}
                  </span>
                </div>
              </div>

              {/* Color Swatch Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {HIGHLIGHT_COLORS.map(c => {
                  const isColorActive = activeHighlightColor === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveHighlightColor(c.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer text-center relative ${
                        isColorActive
                          ? "bg-[#112055] border-[#D4AF37] shadow-lg ring-1 ring-[#D4AF37]"
                          : "bg-[#0A0F1E] border-white/10 hover:border-white/30"
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center border border-white/30" style={{ backgroundColor: c.hex }}>
                        {isColorActive && <Check className="w-3 h-3 text-black stroke-[3]" />}
                      </div>
                      <span className="text-[10px] font-bold text-white truncate max-w-full block">
                        {c.label.split(" ")[0]}
                      </span>
                      <span className="text-[8px] text-slate-400 leading-tight truncate max-w-full block">
                        {c.meaning.split(",")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Optional Personal Study Note & Save Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <input
                  type="text"
                  value={studyNoteInput}
                  onChange={e => setStudyNoteInput(e.target.value)}
                  placeholder="Add optional study reflection, cross-reference, or personal prayer note..."
                  className="flex-1 bg-[#0A0F1E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyHighlight}
                    disabled={isSavingHighlight}
                    className="bg-[#D4AF37] hover:bg-[#F0C940] disabled:opacity-50 text-black font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isSavingHighlight ? "Saving to Firestore..." : "Save Highlight to Firestore"}
                  </button>

                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 px-3 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* INTERACTIVE SCRIPTURE VERSES LIST */}
          {/* ========================================================================= */}
          <div className="bg-[#0A0F1E] border border-white/10 rounded-2xl p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[11px] font-mono text-slate-400">
                Click any verse to highlight or add study annotations:
              </span>
              <span className="text-[10px] text-[#D4AF37]">
                Tip: Multiple verses can be selected simultaneously.
              </span>
            </div>

            <div className="space-y-2 pt-1 font-serif text-slate-100 text-sm sm:text-base leading-relaxed">
              {currentChapter.verses.map((v) => {
                const isSelected = selectedVerseNums.includes(v.verse);
                const existingHl = currentChapterHighlights.get(v.verse);
                const hlColorObj = existingHl ? HIGHLIGHT_COLORS.find(c => c.id === existingHl.color) : null;

                let verseBg = "hover:bg-white/[0.03]";
                let verseBorder = "border-transparent";

                if (existingHl && hlColorObj) {
                  verseBg = hlColorObj.bgClass;
                  verseBorder = `border-l-4 ${hlColorObj.borderClass}`;
                }

                if (isSelected) {
                  verseBorder = "border-2 border-[#D4AF37] shadow-md";
                }

                return (
                  <div
                    key={v.verse}
                    onClick={() => handleToggleVerseSelection(v.verse)}
                    className={`group relative p-2.5 rounded-xl border transition-all duration-150 cursor-pointer ${verseBg} ${verseBorder}`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Verse Number Indicator */}
                      <span className={`select-none font-sans font-bold text-xs shrink-0 mt-0.5 px-1.5 py-0.5 rounded font-mono ${
                        isSelected 
                          ? "bg-[#D4AF37] text-black" 
                          : existingHl 
                            ? "bg-black/40 text-amber-300" 
                            : "text-slate-500 group-hover:text-slate-300"
                      }`}>
                        {v.verse}
                      </span>

                      {/* Verse Text Content */}
                      <div className="flex-1">
                        <p className={`select-text ${existingHl ? "text-white font-medium" : "text-slate-200"}`}>
                          {v.text}
                        </p>

                        {/* Attached Study Note Display */}
                        {existingHl?.note && (
                          <div className="mt-2 bg-[#050D1E]/90 border border-white/10 rounded-lg p-2 text-xs font-sans text-amber-200 flex items-start gap-1.5">
                            <Quote className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                            <span className="italic">{existingHl.note}</span>
                          </div>
                        )}
                      </div>

                      {/* Right Action Trigger Icons */}
                      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        {existingHl && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveHighlight(existingHl);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
                            title="Remove Highlight"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyHighlight({
                              id: `copy_${v.verse}`,
                              userId: user?.uid || "guest",
                              passage: `${currentChapter.book} ${currentChapter.chapter}:${v.verse}`,
                              book: currentChapter.book,
                              chapter: currentChapter.chapter,
                              verse: v.verse,
                              verseText: v.text,
                              color: existingHl?.color || "gold",
                              colorHex: existingHl?.colorHex || "#D4AF37",
                              note: existingHl?.note,
                              version: preferredVersion,
                              createdAt: new Date().toISOString()
                            });
                          }}
                          className="p-1 text-slate-400 hover:text-[#D4AF37] rounded transition"
                          title="Copy Verse Text"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Color Tag Indicator Pill (if highlighted) */}
                    {existingHl && hlColorObj && (
                      <div className="mt-1 flex items-center gap-1.5 pl-6">
                        <span className={`text-[9px] font-sans font-bold px-2 py-0.2 rounded-full border uppercase tracking-wider flex items-center gap-1 ${hlColorObj.badgeClass}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hlColorObj.hex }} />
                          {hlColorObj.label}
                        </span>
                        <span className="text-[9px] text-slate-400 font-sans">
                          &bull; Saved in Firestore
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: SAVED HIGHLIGHTS ARCHIVE (Future Study Notebook) */}
      {/* ========================================================================= */}
      {activeView === "archive" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-[#0A0F1E] border border-white/10 p-4 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={archiveSearchTerm}
                  onChange={e => setArchiveSearchTerm(e.target.value)}
                  placeholder="Search highlighted verses, references, or personal study notes..."
                  className="w-full bg-[#050D1E] border border-white/10 text-white rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">
                  Showing: <span className="text-[#D4AF37] font-bold">{filteredArchiveHighlights.length}</span> of {highlights.length}
                </span>
              </div>
            </div>

            {/* Color Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-white/5">
              <span className="text-[10px] text-slate-400 font-mono mr-1">Color Filter:</span>
              <button
                onClick={() => setArchiveColorFilter("all")}
                className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition cursor-pointer ${
                  archiveColorFilter === "all"
                    ? "bg-[#D4AF37] text-black border-[#D4AF37] font-bold"
                    : "bg-[#050D1E] text-slate-300 border-white/10 hover:border-white/30"
                }`}
              >
                All Colors ({highlights.length})
              </button>

              {HIGHLIGHT_COLORS.map(c => {
                const count = highlights.filter(h => h.color === c.id).length;
                const isActive = archiveColorFilter === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setArchiveColorFilter(c.id)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#112055] text-white border-[#D4AF37] shadow-sm"
                        : "bg-[#050D1E] text-slate-300 border-white/10 hover:border-white/30"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.hex }} />
                    <span>{c.label.split(" ")[0]} ({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Highlights List */}
          {filteredArchiveHighlights.length === 0 ? (
            <div className="bg-[#0A0F1E] border border-white/10 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mx-auto text-[#D4AF37]">
                <Highlighter className="w-6 h-6" />
              </div>
              <h4 className="text-base font-serif-cinzel font-bold text-white">
                {highlights.length === 0 ? "No Verses Highlighted Yet" : "No Highlights Match Filter"}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {highlights.length === 0
                  ? "Open the Scripture Reader view, click on any verse in Romans 8, John 15, or Psalm 23, and choose your favorite liturgical highlight color to save it to Firestore for future study."
                  : "Try clearing your search term or switching to 'All Colors' to view all preserved study highlights."}
              </p>
              {highlights.length === 0 && (
                <button
                  onClick={() => setActiveView("reader")}
                  className="bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-xs py-2 px-4 rounded-xl transition cursor-pointer"
                >
                  Go to Scripture Reader
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredArchiveHighlights.map((hl) => {
                const colorObj = HIGHLIGHT_COLORS.find(c => c.id === hl.color) || HIGHLIGHT_COLORS[0];
                const isEditingThisNote = editingHighlightNoteId === hl.id;

                return (
                  <div
                    key={hl.id}
                    className={`bg-[#0A0F1E] border rounded-2xl p-4 space-y-3 relative overflow-hidden transition-all hover:border-[#D4AF37]/50 ${colorObj.borderClass} border-l-4`}
                  >
                    {/* Top Reference & Actions */}
                    <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${colorObj.badgeClass}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorObj.hex }} />
                          {hl.passage} ({hl.version || preferredVersion})
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            // Jump to chapter in reader
                            const key = `${hl.book} ${hl.chapter}`;
                            if (SCRIPTURE_DATABASE[key]) {
                              setSelectedChapterKey(key);
                            }
                            setActiveView("reader");
                            setSelectedVerseNums([hl.verse]);
                          }}
                          className="p-1 text-slate-400 hover:text-[#D4AF37] rounded transition cursor-pointer"
                          title="Read in Full Context"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCopyHighlight(hl)}
                          className="p-1 text-slate-400 hover:text-[#D4AF37] rounded transition cursor-pointer"
                          title="Copy Verse & Note"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveHighlight(hl)}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded transition cursor-pointer"
                          title="Delete Highlight"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Highlighted Scripture Text */}
                    <div className={`p-3 rounded-xl font-serif text-sm leading-relaxed text-white ${colorObj.bgClass}`}>
                      "{hl.verseText}"
                    </div>

                    {/* Personal Study Reflection / Note */}
                    <div className="bg-[#050D1E] border border-white/5 rounded-xl p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider font-bold flex items-center gap-1">
                          <Edit3 className="w-3 h-3 text-[#D4AF37]" /> Personal Study Note
                        </span>
                        {!isEditingThisNote && (
                          <button
                            onClick={() => {
                              setEditingHighlightNoteId(hl.id);
                              setEditingNoteText(hl.note || "");
                            }}
                            className="text-[10px] text-slate-400 hover:text-[#D4AF37] cursor-pointer"
                          >
                            {hl.note ? "Edit" : "+ Add Note"}
                          </button>
                        )}
                      </div>

                      {isEditingThisNote ? (
                        <div className="space-y-1.5 pt-1">
                          <textarea
                            value={editingNoteText}
                            onChange={e => setEditingNoteText(e.target.value)}
                            placeholder="Write your study insights, sermon application, or Greek/Hebrew nuance..."
                            className="w-full bg-[#0A0F1E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37]"
                            rows={2}
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setEditingHighlightNoteId(null)}
                              className="text-[10px] px-2 py-1 bg-slate-800 text-slate-300 rounded cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEditedNote(hl.id)}
                              className="text-[10px] px-2.5 py-1 bg-[#D4AF37] text-black font-bold rounded cursor-pointer"
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-300 italic">
                          {hl.note || "No study reflection attached yet."}
                        </p>
                      )}
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono pt-1">
                      <span>Saved: {new Date(hl.createdAt).toLocaleDateString()}</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Firestore Synced
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
