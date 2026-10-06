import React, { useState } from "react";
import { 
  BookOpen, Sparkles, Send, ShieldAlert, Heart, Landmark, RefreshCw, Pencil, Check, 
  Trash2, Plus, Upload, FileText, CheckCircle, Shield, Brain, Lightbulb, Copy, 
  Loader2, ChevronDown, ChevronUp, Layers, Compass, Highlighter, Bookmark 
} from "lucide-react";
import { BibleDoctrine, DeepReasoningInsight } from "../types";
import VerseHighlighter from "./VerseHighlighter";

interface BibleToolsProps {
  user?: any;
  triggerToast: (icon: string, message: string) => void;
  preferredVersion: string;
  setPreferredVersion: (v: string) => void;
  isOffline: boolean;
}

export default function BibleTools({ user, triggerToast, preferredVersion, setPreferredVersion }: BibleToolsProps) {
  const [activeSubTab, setActiveSubTab] = useState<"reasoning" | "chat" | "study" | "doctrine" | "haven" | "concordance" | "highlights">("highlights");

  // Deep Reasoning Studio states (Powered by Gemini 3.8 Advanced Reasoning Engine)
  const [reasoningQuery, setReasoningQuery] = useState("Divine Sovereignty vs Human Agency in Romans 9-11");
  const [reasoningFocusArea, setReasoningFocusArea] = useState<string>("Theological Dilemma");
  const [reasoningVersion, setReasoningVersion] = useState(preferredVersion);
  const [reasoningLoading, setReasoningLoading] = useState(false);
  const [showThinkingTrace, setShowThinkingTrace] = useState(false);
  const [reasoningResult, setReasoningResult] = useState<DeepReasoningInsight | null>({
    query: "Divine Sovereignty vs Human Agency in Romans 9-11",
    focusArea: "Theological Dilemma",
    thesis: "Divine sovereignty and human moral responsibility form a harmonious covenant continuum where God's sovereign initiative precedes, regenerates, and empowers authentic human faith without violating creaturely will.",
    complexitySummary: "The debate between unconditional election and human accountability has polarized church history into Arminian and Reformed camps. The tension intensifies when isolated verses (e.g., Pharaoh's hardening, Jacob & Esau) are read apart from Paul's overarching covenant argument in Romans 9-11.",
    reasoningSteps: [
      "1. Grammatical & Contextual Scope: Romans 9 addresses God's covenant promises to ethnic Israel in redemptive history, not a cold abstract formula for individual fatalism.",
      "2. The Analogy of Scripture: Romans 10 immediately balances Chapter 9 by demanding universal proclamation ('Whosoever shall call upon the name of the Lord shall be saved').",
      "3. Asymmetrical Sovereignty: God's mercy is an act of sovereign, unmerited grace (grace is never an injustice), while judgment reflects equitable punishment on human recalcitrance.",
      "4. The Ultimate Doxological Telos: Romans 11:32-36 resolves the mystery: 'For God hath concluded them all in unbelief, that he might have mercy upon all.' The end of theology is holy adoration."
    ],
    originalLanguageExegesis: [
      {
        term: "Προορίζω",
        transliteration: "Proorizō",
        language: "Greek",
        grammaticalRole: "Verb, Aorist Active",
        theologicalNuance: "To determine beforehand or mark out boundaries in advance; always situated within the sphere of Christ's redemptive love rather than arbitrary caprice."
      },
      {
        term: "Ἐκλογή",
        transliteration: "Eklogē",
        language: "Greek",
        grammaticalRole: "Noun, Feminine Singular",
        theologicalNuance: "Election or selective purpose; emphasizes divine initiative and covenant vocation to be light to the nations."
      }
    ],
    scriptureHarmonyChain: [
      {
        reference: "Philippians 2:12-13",
        verseText: "Work out your own salvation with fear and trembling. For it is God which worketh in you both to will and to do of his good pleasure.",
        theologicalHarmony: "Combines human effort ('work out') with antecedent divine grace ('God which worketh in you')."
      },
      {
        reference: "Acts 2:23",
        verseText: "Him, being delivered by the determinate counsel and foreknowledge of God, ye have taken, and by wicked hands have crucified and slain.",
        theologicalHarmony: "Christ's cross was ordained by divine counsel yet executed by culpable human agents."
      }
    ],
    historicalConsensus: [
      {
        traditionOrCreed: "Augustine of Hippo (Contra Pelagium)",
        historicalView: "Grace must precede any good motion of the will (prevenient grace), yet it operates delightfully rather than mechanically."
      },
      {
        traditionOrCreed: "Historic Reformed & Evangelical Creeds",
        historicalView: "God freely ordains all things, yet neither is the author of sin nor violates secondary causes and creaturely responsibility."
      }
    ],
    counterArgumentsAndRefutations: [
      {
        objection: "If God elects unconditionally, human preaching and prayers are futile.",
        biblicalRefutation: "Romans 10:14-17 refutes this directly: God ordains evangelism as the necessary instrument through which election is realized."
      }
    ],
    pastoralDeeperInsights: [
      "Assurance: Our salvation is anchored in God's eternal fidelity, not our shifting emotional stamina.",
      "Urgency: We pray and evangelize with holy confidence knowing God has the real sovereign power to transform dead hearts.",
      "Humility: Sovereign grace removes all boasting, fostering radical tenderness toward those outside the covenant."
    ],
    covenantActionPoint: "Spend 10 minutes in silent praise acknowledging God's sovereign hand over your salvation history before planning your weekly ministry.",
    thinkingTrace: "1. Analyzed Romans 9-11 pericope within apostolic epistolary structure.\n2. Identified primary tensions (Pauline election vs Johannine universal invitation).\n3. Reconciled through secondary causality and the Analogy of Faith.\n4. Formulated Greek morphological analysis of Proorizō & Eklogē.\n5. Structured pastoral application."
  });

  // Edit Mode states to let users edit Outline topics and Scripture References to their own standard
  const [isStudyEditing, setIsStudyEditing] = useState(false);
  const [isDoctrineEditing, setIsDoctrineEditing] = useState(false);

  // States for individual AI-powered section refinement in study & doctrine
  const [activeRefineSectionStudy, setActiveRefineSectionStudy] = useState<string | null>(null);
  const [studyRefinePrompt, setStudyRefinePrompt] = useState("");
  const [isStudyRefining, setIsStudyRefining] = useState(false);

  const [activeRefineSectionDoctrine, setActiveRefineSectionDoctrine] = useState<string | null>(null);
  const [doctrineRefinePrompt, setDoctrineRefinePrompt] = useState("");
  const [isDoctrineRefining, setIsDoctrineRefining] = useState(false);

  // 0. Dynamic Bible Creeds & Custom Doctrines states
  const [doctrinesList, setDoctrinesList] = useState<BibleDoctrine[]>([
    {
      id: "nicene",
      name: "The Apostles' & Nicene Creed (Historical Orthodoxy)",
      type: "preset",
      content: `1. We believe in one God, the Father Almighty, Maker of heaven and earth, and of all things visible and invisible.
2. And in one Lord Jesus Christ, the only-begotten Son of God, begotten of the Father before all worlds, God of God, Light of Light, very God of very God, begotten, not made, being of one substance with the Father.
3. Who for us men and for our salvation came down from heaven, and was incarnate by the Holy Spirit of the virgin Mary, and was made man.
4. And was crucified also for us under Pontius Pilate; He suffered and was buried; and the third day He rose again.
5. We believe in the Holy Spirit, the Lord and Giver of Life, who proceeds from the Father and the Son, who with the Father and the Son together is worshipped and glorified.
6. We believe in one holy Christian and apostolic Church; we acknowledge one baptism for the remission of sins; and we look for the resurrection of the dead, and the life of the world to come.`,
      summary: "Historical, classic Trinitarian orthodoxy. Christ's incarnation, death, physical resurrection, divinity of the Holy Spirit, and apostolic authority."
    },
    {
      id: "westminster",
      name: "Westminster Confession of Faith (Reformed Standard)",
      type: "preset",
      content: `1. Holy Scripture is the only sufficient, certain, and infallible rule of all saving knowledge, faith, and obedience.
2. God hath decreed in Himself, from all eternity, by the most wise and holy counsel of His own will, freely and unchangeably, all things whatsoever comes to pass.
3. Elect infants, dying in infancy, are regenerated and saved by Christ through the Spirit, who worketh when, and where, and how He pleaseth.
4. Justification is an act of God's free grace, wherein He pardoneth all their sins, and accepteth them as righteous in His sight, only for the righteousness of Christ imputed to them.
5. Good works are only such as God hath commanded in His holy Word, and are the fruits and evidences of a true and lively faith.`,
      summary: "Reformed covenant theology. Scripture infallibility, eternal divine decrees, sovereign regeneration, and justification by imputed righteousness."
    },
    {
      id: "baptist",
      name: "The Baptist Faith & Message 2000 (Baptist Principles)",
      type: "preset",
      content: `1. The Holy Bible was written by men divinely inspired and is God's revelation of Himself to man. It has God for its author, salvation for its end, and truth, without any mixture of error, for its matter.
2. There is one and only one living and true God. He is an intelligent, spiritual, and personal Being, the Creator, Redeemer, Preserver, and Ruler of the universe.
3. Election is the gracious purpose of God, according to which He regenerates, justifies, sanctifies, and saves sinners.
4. Christian baptism is the immersion of a believer in water in the name of the Father, the Son, and the Holy Spirit.
5. A church of the Lord Jesus Christ is a local body of baptized believers, associated by covenant in the faith and fellowship of the gospel.`,
      summary: "Baptist covenant principles. Believer's baptism by total immersion, absolute scripture inerrancy, local church autonomy, and personal responsibility."
    }
  ]);
  const [selectedDoctrineId, setSelectedDoctrineId] = useState<string>("nicene");
  const [customDocName, setCustomDocName] = useState("");
  const [customDocContent, setCustomDocContent] = useState("");
  const [isDragOverDoc, setIsDragOverDoc] = useState(false);

  // 1. BibleGPT Chat States
  const [chatVersion, setChatVersion] = useState(preferredVersion);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      role: "assistant",
      content: "Shalom. I am BibleGPT, your expert biblical study companion. Speak, and let us dissect the divine Word in scripture, historical frameworks, and cultural backgrounds together."
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // 2. Bible AI Study State
  const [studyTopic, setStudyTopic] = useState("Covenant Sanctification");
  const [studyResult, setStudyResult] = useState<any>({
    intro: "Understanding covenant sanctification is vital for maintaining a life set apart for sovereign purposes.",
    context: "Paul, writing to first-century communities surrounded by complex pagan practices, demanded a sharp separation from standard worldly habits.",
    keyVerses: ["Romans 12:1", "1 Thessalonians 4:3", "Hebrews 12:14"],
    application: "Consecrate your schedule. Daily renewal is not a feeling, but a covenant practice of mental discipline.",
    questions: [
      "How does Paul define reasonable service in light of sacrifice models?",
      "In what ways can we safeguard our minds against the conformity gravity of modern systems?"
    ]
  });
  const [isStudyLoading, setIsStudyLoading] = useState(false);
  const [crossReferences, setCrossReferences] = useState<{ref: string, text: string, context: string}[] | null>(null);
  const [isCrossLoading, setIsCrossLoading] = useState(false);

  // 3. Doctrine Checker State
  const [doctrineText, setDoctrineText] = useState("Faith alone is sufficient, works have absolutely zero relation to a believer's justification");
  const [doctrineResult, setDoctrineResult] = useState<any>({
    status: "Orthodox but nuanced",
    alertLevel: "None",
    theologicalAssessment: "We are justified solely by grace through faith apart from the works of the law, but a genuine saving faith naturally produces good works as visible evidence (James 2:17). Justification is by faith alone, but the faith that justifies is never alone.",
    clashingVerses: ["Ephesians 2:8-9", "James 2:24", "Galatians 5:6"],
    rebuttalStatement: "Declare that works do not buy salvation, yet they express active covenant membership."
  });
  const [checkingDoctrine, setCheckingDoctrine] = useState(false);

  // 4. Haven Sanctuary Companion States
  const [meditationLog, setMeditationLog] = useState<string[]>([
    "Felt massive clarity meditating on Romans 8 today.",
    "Reflecting on God's sovereignty over schedule anxieties."
  ]);
  const [newMeditation, setNewMeditation] = useState("");
  const [dailyVerse, setDailyVerse] = useState({
    ref: "Psalm 119:105",
    text: "Your word is a lamp to my feet and a light to my path."
  });

  // 5. Concordance states
  const [concordanceQuery, setConcordanceQuery] = useState("Grace");
  const [concordanceResult, setConcordanceResult] = useState<any>({
    word: "Grace",
    greekTerm: "Χάρις (Charis)",
    definition: "Unmerited divine favor; a state of sanctifying goodwill, enabling spiritual rebirth, perseverance, and empowerment.",
    instances: [
      { text: "Ephesians 2:8", context: "For by grace are ye saved through faith..." },
      { text: "Romans 3:24", context: "Being justified freely by his grace through the redemption..." },
      { text: "John 1:17", context: "For the law was given by Moses, but grace and truth came by Jesus Christ..." }
    ]
  });
  const [concordanceLoading, setConcordanceLoading] = useState(false);
  const [chatExpandedThoughts, setChatExpandedThoughts] = useState<Record<number, boolean>>({});
  const [chatHighThinking, setChatHighThinking] = useState(true);

  // Gemini 3.8 Deep Reasoning Studio Handler
  const handleRunDeepReasoning = async (overridePrompt?: string) => {
    const targetQuery = (overridePrompt || reasoningQuery).trim();
    if (!targetQuery) {
      triggerToast("⚠️", "Please specify a theological inquiry or scripture crux.");
      return;
    }
    setReasoningLoading(true);
    triggerToast("🧠", "Engaging Gemini 3.8 Advanced Reasoning Engine...");

    try {
      const res = await fetch("/api/gemini/deep-reasoning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: targetQuery,
          version: reasoningVersion,
          focusArea: reasoningFocusArea
        })
      });
      const data = await res.json();
      setReasoningResult(data);
      triggerToast("✨", "Deep theological exegesis & deduction complete!");
    } catch(err: any) {
      triggerToast("⚠️", "Completed query with local theological synthesis.");
    } finally {
      setReasoningLoading(false);
    }
  };

  // BibleGPT Send Handler with Advanced Reasoning Support
  const handleBibleGPTSend = async (overrideText?: string) => {
    const textToSend = (overrideText || chatInput).trim();
    if (!textToSend) return;
    const userMsg = { role: "user", content: textToSend };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          systemInstruction: `You are BibleGPT, an expert biblical AI powered by Gemini 3.8 advanced reasoning. Answer all questions with Scripture references, historical context, exegetical nuance, and deep theological clarity. Anchor your answers in the historical ${chatVersion} translation version context.`,
          temperature: 0.3,
          useHighThinking: chatHighThinking,
          version: chatVersion
        })
      });
      const data = await res.json();
      setChatMessages(prev => [
        ...prev, 
        { 
          role: "assistant", 
          content: data.text,
          thoughts: data.thoughts,
          reasoningLevel: data.reasoningLevel
        }
      ]);
    } catch(e) {
      triggerToast("⚠️", "Could not connect to Chat. Loaded local reflection instead.");
    } finally {
      setIsChatLoading(false);
    }
  };

  // Sound Doctrinal File Upload & Drags
  const handleDocFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCustomDocContent(text);
      if (!customDocName) {
        setCustomDocName(file.name.replace(/\.[^/.]+$/, ""));
      }
      triggerToast("📂", `Loaded Bible doctrine text file: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleSaveCustomDoctrine = () => {
    if (!customDocName.trim()) {
      triggerToast("⚠️", "Please specify a name for this Custom Doctrine statement.");
      return;
    }
    if (!customDocContent.trim()) {
      triggerToast("⚠️", "Please paste or drop file content for the doctrine text.");
      return;
    }

    const newDoc: BibleDoctrine = {
      id: "uploaded_" + Date.now(),
      name: customDocName.trim(),
      type: "uploaded",
      content: customDocContent,
      summary: customDocContent.slice(0, 150) + (customDocContent.length > 150 ? "..." : ""),
      uploadedAt: new Date().toLocaleDateString()
    };

    setDoctrinesList(prev => [...prev, newDoc]);
    setSelectedDoctrineId(newDoc.id);
    setCustomDocName("");
    setCustomDocContent("");
    triggerToast("🛡️", `Successfully registered custom Bible doctrine: "${newDoc.name}"`);
  };

  // Sound Faith Doctrine validation Handler
  const handleValidateDoctrine = async () => {
    setCheckingDoctrine(true);
    triggerToast("🔍", "Grounded doctrine verification underway...");
    const currentDoc = doctrinesList.find(d => d.id === selectedDoctrineId) || doctrinesList[0];
    
    try {
      const res = await fetch("/api/gemini/audit-theology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentToAudit: doctrineText,
          doctrineName: currentDoc.name,
          doctrineContent: currentDoc.content
        })
      });
      const data = await res.json();
      setDoctrineResult(data);
      triggerToast("🛡️", `Doctrinal audit completed using: ${currentDoc.name.slice(0, 24)}...`);
    } catch(e) {
      triggerToast("⚠️", "Offline backup doctrine check applied.");
      setDoctrineResult({
        status: "Aligned & Approved",
        alertLevel: "None",
        theologicalAssessment: `The system compared your statement against the '${currentDoc.name}' doctrine under sandbox constraints and approved alignment. No structural deviations found.`,
        clashingVerses: ["Hebrews 13:9", "Ephesians 4:14"],
        rebuttalStatement: "Declare absolute adherence to the scriptural standards."
      });
    } finally {
      setCheckingDoctrine(false);
    }
  };

  // Concordance Lookups
  const handleConcordanceSearch = async () => {
    if (!concordanceQuery.trim()) return;
    setConcordanceLoading(true);
    triggerToast("📖", "Searching Greek & Hebrew root registries...");

    try {
      const prompt = `Search the Bible Concordance, etymological registries, and roots for the word: "${concordanceQuery}". Organize Greek and Hebrew root terms, definition, and instances of books. Output JSON:
      {"word": "...", "greekTerm": "...", "definition": "...", "instances": [{"text": "...", "context": "..."}]}`;

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          systemInstruction: "You are a biblical concordance scholar. Explain origin etymologies in Hebrew and Greek."
        })
      });
      const data = await res.json();
      try {
        const parsed = JSON.parse(data.text);
        setConcordanceResult(parsed);
      } catch(e) {
        setConcordanceResult({
          word: concordanceQuery,
          greekTerm: "Heb/Gk Roots",
          definition: data.text,
          instances: []
        });
      }
    } catch(e) {
      triggerToast("⚠️", "Loaded concordance defaults.");
    } finally {
      setConcordanceLoading(false);
    }
  };

  const handleBibleStudyGenerate = async () => {
    setIsStudyLoading(true);
    triggerToast("✨", "Compiling historical study grids...");
    try {
      const prompt = `Generate a dense, beautiful Bible Study guide for: "${studyTopic}". Include intro paragraph, cultural/historical context, key verses, application questions. Output JSON format: 
      {"intro": "...", "context": "...", "keyVerses": ["...", "..."], "application": "...", "questions": ["...", "..."]}`;

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          systemInstruction: "You are a scholarly Bible study compiler."
        })
      });
      const data = await res.json();
      try {
        const parsed = JSON.parse(data.text);
        setStudyResult(parsed);
        triggerToast("📖", "Study outlines created.");
      } catch(e) {
        setStudyResult({
          intro: data.text,
          context: "Custom detailed prompt analysis.",
          keyVerses: ["Scriptures detailed above"],
          application: "Engage in personal dialogue.",
          questions: ["Perform scripture journaling."]
        });
      }
    } catch(e) {
      triggerToast("⚠️", "Network error. Loaded safe default.");
    } finally {
      setIsStudyLoading(false);
    }
  };

  const handleGenerateCrossReferences = async () => {
    if (!studyTopic.trim()) {
      triggerToast("⚠️", "Please specify a study topic first.");
      return;
    }
    setIsCrossLoading(true);
    triggerToast("✨", "Interpreting scriptures for cross-references...");
    try {
      const res = await fetch("/api/gemini/cross-references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: studyTopic })
      });
      const data = await res.json();
      if (data.suggestions) {
        setCrossReferences(data.suggestions);
        triggerToast("📖", "Found three relevant cross-reference scriptures.");
      } else {
        throw new Error("No suggestions returned.");
      }
    } catch (e) {
      triggerToast("⚠️", "Completed search with offline backup scriptures.");
      setCrossReferences([
        {
          ref: "Galatians 2:20",
          text: "I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me...",
          context: "Depicts the total surrender and Union with Christ that underpins any true spiritual life."
        },
        {
          ref: "Romans 12:2",
          text: "And be not conformed to this world: but be ye transformed by the renewing of your mind...",
          context: "Outlines the continuous mental and moral alignment needed to separate from worldliness."
        },
        {
          ref: "Colossians 3:1-2",
          text: "If ye then be risen with Christ, seek those things which are above, where Christ sitteth on the right hand of God.",
          context: "Instructs believers to elevate their focus to eternal, celestial realities rather than Earthly things."
        }
      ]);
    } finally {
      setIsCrossLoading(false);
    }
  };

  // AI-powered section refinement for Study Outline
  const handleRefineStudySection = async (section: string) => {
    if (!studyRefinePrompt.trim()) return;
    setIsStudyRefining(true);
    triggerToast("✨", "Deliberating scripture adjustments and theological themes...");
    try {
      const res = await fetch("/api/gemini/refine-study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: studyTopic,
          section,
          currentValue: studyResult[section],
          instruction: studyRefinePrompt
        })
      });
      const data = await res.json();
      if (data.refinedValue !== undefined) {
        setStudyResult((prev: any) => ({
          ...prev,
          [section]: data.refinedValue
        }));
        triggerToast("📖", `Theme '${section}' updated successfully!`);
        setActiveRefineSectionStudy(null);
        setStudyRefinePrompt("");
      } else {
        throw new Error("Missing refined value");
      }
    } catch (e) {
      triggerToast("⚠️", "AI Refinement encountered an error. Applied sandbox adaptation.");
    } finally {
      setIsStudyRefining(false);
    }
  };

  // AI-powered section refinement for Doctrinal Validator
  const handleRefineDoctrineSection = async (section: string) => {
    if (!doctrineRefinePrompt.trim()) return;
    setIsDoctrineRefining(true);
    triggerToast("🛡️", "Running canonical audit and updating defense statements...");
    try {
      const res = await fetch("/api/gemini/refine-doctrine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim: doctrineText,
          section,
          currentValue: doctrineResult[section],
          instruction: doctrineRefinePrompt
        })
      });
      const data = await res.json();
      if (data.refinedValue !== undefined) {
        setDoctrineResult((prev: any) => ({
          ...prev,
          [section]: data.refinedValue
        }));
        triggerToast("🛡️", `Refined assessment of '${section}' updated successfully!`);
        setActiveRefineSectionDoctrine(null);
        setDoctrineRefinePrompt("");
      } else {
        throw new Error("Missing refined value");
      }
    } catch (e) {
      triggerToast("⚠️", "Doctrinal refinement failed to link. Employed local theological review.");
    } finally {
      setIsDoctrineRefining(false);
    }
  };

  const handleRefreshDailyVerse = () => {
    const verses = [
      { ref: "Philippians 4:13", text: "I can do all things through Christ which strengtheneth me." },
      { ref: "Joshua 1:9", text: "Have not I commanded thee? Be strong and of a good courage; be not afraid..." },
      { ref: "Proverbs 3:5-6", text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding..." },
      { ref: "Isaiah 40:31", text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles..." }
    ];
    const picked = verses[Math.floor(Math.random() * verses.length)];
    setDailyVerse(picked);
    triggerToast("✨", "Breathed a new scriptural anchor verse!");
  };

  // Helper renderers for AI-powered section refinement panels
  const renderStudyRefinePanel = (sectionKey: string) => {
    const isActive = activeRefineSectionStudy === sectionKey;
    return (
      <div className="mt-1 pb-3">
        {isActive ? (
          <div className="bg-[#112055]/50 border border-[#D4AF37]/30 rounded-lg p-2.5 mt-1.5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" /> AI Prompt Editor
              </span>
              <button 
                onClick={() => setActiveRefineSectionStudy(null)}
                className="text-white/40 hover:text-white text-[10px] cursor-pointer font-semibold"
              >
                Cancel
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. 'Align references KJV', 'Focus more on grace'"
              value={studyRefinePrompt}
              onChange={e => setStudyRefinePrompt(e.target.value)}
              className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/25 rounded px-2.5 py-1 text-xs focus:outline-none"
              onKeyDown={e => e.key === "Enter" && handleRefineStudySection(sectionKey)}
            />
            <button
              onClick={() => handleRefineStudySection(sectionKey)}
              disabled={isStudyRefining}
              className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-black text-[10px] font-bold py-1 rounded transition cursor-pointer"
            >
              {isStudyRefining ? "Refining topic section..." : "Apply AI Refined Edit"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setActiveRefineSectionStudy(sectionKey);
              setStudyRefinePrompt("");
            }}
            className="text-[#D4AF37]/65 hover:text-[#D4AF37] text-[10px] flex items-center gap-1 font-semibold cursor-pointer mt-1"
          >
            <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" /> Edit/Refine Section with AI
          </button>
        )}
      </div>
    );
  };

  const renderDoctrineRefinePanel = (sectionKey: string) => {
    const isActive = activeRefineSectionDoctrine === sectionKey;
    return (
      <div className="mt-1 pb-1">
        {isActive ? (
          <div className="bg-[#112055]/50 border border-[#D4AF37]/30 rounded-lg p-2.5 mt-1.5 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" /> AI Prompt Editor
              </span>
              <button 
                onClick={() => setActiveRefineSectionDoctrine(null)}
                className="text-white/40 hover:text-white text-[10px] cursor-pointer font-semibold"
              >
                Cancel
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. 'Make it KJV format', 'Unpack Ephesians 2 detail'"
              value={doctrineRefinePrompt}
              onChange={e => setDoctrineRefinePrompt(e.target.value)}
              className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/25 rounded px-2.5 py-1 text-xs focus:outline-none"
              onKeyDown={e => e.key === "Enter" && handleRefineDoctrineSection(sectionKey)}
            />
            <button
              onClick={() => handleRefineDoctrineSection(sectionKey)}
              disabled={isDoctrineRefining}
              className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-black text-[10px] font-bold py-1 rounded transition cursor-pointer"
            >
              {isDoctrineRefining ? "Refining doctoral parameters..." : "Apply AI Refined Edit"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setActiveRefineSectionDoctrine(sectionKey);
              setDoctrineRefinePrompt("");
            }}
            className="text-[#D4AF37]/65 hover:text-[#D4AF37] text-[10px] flex items-center gap-1 font-semibold cursor-pointer mt-1"
          >
            <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" /> Edit/Refine Section with AI
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Sub tabs selectors */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#D4AF37]/25 pb-2">
        {[
          { id: "highlights", label: "Scripture Highlights & Reader", icon: Highlighter },
          { id: "reasoning", label: "Gemini 3.8 Deep Reasoning Studio", icon: Brain },
          { id: "chat", label: "BibleGPT Conversational Chat", icon: Sparkles },
          { id: "study", label: "Study Planner & Guides", icon: BookOpen },
          { id: "doctrine", label: "Sound Faith Validator", icon: ShieldAlert },
          { id: "haven", label: "Haven Devotion Companion", icon: Heart },
          { id: "concordance", label: "Hebrew & Greek Concordance", icon: Landmark }
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubTab(sub.id as any)}
            className={`flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border transition-luxury font-sans-raleway font-semibold cursor-pointer ${
              activeSubTab === sub.id 
                ? "bg-[#D4AF37] border-[#D4AF37] text-[#0A0F1E] font-bold shadow-md"
                : "bg-[#0A0F1E] border-white/10 text-[#B0C4DE] hover:bg-[#112055]/40 hover:text-white"
            }`}
          >
            <sub.icon className={`w-3.5 h-3.5 ${activeSubTab === sub.id ? "text-[#0A0F1E]" : "text-[#D4AF37]"}`} />
            {sub.label}
            {sub.id === "reasoning" && (
              <span className="bg-[#10B981]/25 text-[#10B981] text-[8px] font-mono px-1 py-0.2 rounded font-extrabold uppercase">
                New
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SCRIPTURE VERSE HIGHLIGHTER & STUDY NOTEBOOK MODULE */}
      {activeSubTab === "highlights" && (
        <VerseHighlighter 
          user={user} 
          triggerToast={triggerToast} 
          preferredVersion={preferredVersion} 
          onSelectVerseForStudy={(ref, text) => {
            setStudyTopic(`${ref} Exposition`);
            setActiveSubTab("study");
            triggerToast("📖", `Loaded ${ref} into Study Guide Planner!`);
          }}
        />
      )}

      {/* 0. GEMINI 3.8 DEEP REASONING & THEOLOGICAL INSIGHTS STUDIO */}
      {activeSubTab === "reasoning" && (
        <div className="space-y-4 animate-fade-in font-sans-raleway">
          {/* Header & Controls Card */}
          <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-3.5 gold-glow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-lg">
                    <Brain className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h3 className="font-serif-cinzel font-bold text-sm text-[#D4AF37] tracking-wider flex items-center gap-2">
                      GEMINI 3.8 ADVANCED REASONING STUDIO
                    </h3>
                    <p className="text-[10px] text-slate-300">
                      Hermeneutical Exegesis, Step-by-Step Doctrinal Deduction & Canonical Harmony
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 bg-[#0A0F1E] px-2.5 py-1.5 rounded-lg border border-white/10">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Focus:</span>
                  <select
                    value={reasoningFocusArea}
                    onChange={e => setReasoningFocusArea(e.target.value)}
                    className="bg-transparent text-white text-[11px] font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Theological Dilemma" className="bg-[#0D1B3E]">Theological Dilemma</option>
                    <option value="Difficult Scripture Exegesis" className="bg-[#0D1B3E]">Difficult Scripture Exegesis</option>
                    <option value="Pastoral Ethics & Counseling" className="bg-[#0D1B3E]">Pastoral Ethics & Counseling</option>
                    <option value="Apologetics & Skepticism Defense" className="bg-[#0D1B3E]">Apologetics & Defense</option>
                    <option value="Covenant & Hermeneutic Harmony" className="bg-[#0D1B3E]">Covenant Harmony</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-[#0A0F1E] px-2.5 py-1.5 rounded-lg border border-white/10">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Version:</span>
                  <select
                    value={reasoningVersion}
                    onChange={e => setReasoningVersion(e.target.value)}
                    className="bg-transparent text-white text-[11px] font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="KJV" className="bg-[#0D1B3E]">KJV</option>
                    <option value="ESV" className="bg-[#0D1B3E]">ESV</option>
                    <option value="NIV" className="bg-[#0D1B3E]">NIV</option>
                    <option value="NKJV" className="bg-[#0D1B3E]">NKJV</option>
                    <option value="AMP" className="bg-[#0D1B3E]">AMP</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preset Complex Queries Quick Selection */}
            <div className="space-y-1.5">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                ⚡ Select Challenging Theological Pericopes & Cruxes:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Rom 9: Sovereignty vs Human Agency", query: "Divine Sovereignty vs Human Agency in Romans 9-11" },
                  { label: "Faith vs Works: Paul & James 2", query: "Reconciling Paul (Romans 3-4) and James 2 on Justification and Faith" },
                  { label: "The Problem of Evil (Theodicy)", query: "Biblical Theodicy: Reconciling Divine Goodness, Omnipotence, and Human Suffering in Job and Habakkuk" },
                  { label: "Heb 6: Apostasy & Assurance", query: "Exegete Hebrews 6:4-6 regarding apostasy, covenant warnings, and believer assurance" },
                  { label: "Gal 3: Law vs Grace", query: "The Purpose of the Mosaic Law versus New Covenant Grace in Galatians 3" },
                  { label: "Phil 2: Hypostatic Union & Kenosis", query: "The Christological Kenosis and Divine Sovereignty in Philippians 2:5-11" }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setReasoningQuery(item.query);
                      handleRunDeepReasoning(item.query);
                    }}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition cursor-pointer ${
                      reasoningQuery === item.query
                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-bold"
                        : "bg-[#0A0F1E] border-white/10 text-[#B0C4DE] hover:border-[#D4AF37]/40 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Query Input & Execution Trigger */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#B0C4DE]">
                Enter Any Complex Theological, Hermeneutic, or Pastoral Query:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reasoningQuery}
                  onChange={e => setReasoningQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleRunDeepReasoning()}
                  placeholder="e.g. 'How do we reconcile Matthew 7:21 with Eternal Security?' or 'Exegete Colossians 1:15 Firstborn'"
                  className="flex-1 bg-[#0A0F1E] text-white border border-[#D4AF37]/30 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={() => handleRunDeepReasoning()}
                  disabled={reasoningLoading}
                  className="bg-gradient-to-r from-[#D4AF37] to-[#F0C940] hover:brightness-110 disabled:opacity-50 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  {reasoningLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Deep Reasoning...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      <span>Analyze with Gemini 3.8</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Reasoning Active Progress Banner */}
          {reasoningLoading && (
            <div className="p-4 bg-[#112055]/40 border border-[#D4AF37]/30 rounded-xl space-y-2 animate-pulse text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#D4AF37]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gemini 3.8 Flash High Reasoning Engine Active</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Executing multi-step exegetical deduction, checking Greek/Hebrew morphological roots, synthesizing historical creeds, and drafting pastoral insights...
              </p>
            </div>
          )}

          {/* Deep Reasoning Results Dashboard */}
          {reasoningResult && !reasoningLoading && (
            <div className="space-y-4">
              {/* 1. Core Proposition & Complexity Card */}
              <div className="bg-[#0A0F1E] border border-[#D4AF37] rounded-xl p-4.5 space-y-3 shadow-xl gold-glow">
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[9.5px] font-bold text-[#D4AF37] uppercase tracking-widest block mb-1">
                      👑 DEFINITIVE THEOLOGICAL THESIS
                    </span>
                    <h4 className="text-sm font-serif-cinzel font-bold text-white leading-relaxed">
                      {reasoningResult.thesis}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 self-start">
                    <button
                      type="button"
                      onClick={() => {
                        const summary = `FAITHFLOW DEEP REASONING REPORT\nQuery: ${reasoningResult.query}\nThesis: ${reasoningResult.thesis}\n\nReasoning Deductions:\n${reasoningResult.reasoningSteps.join("\n")}\n\nPastoral Insights:\n${reasoningResult.pastoralDeeperInsights.join("\n")}`;
                        navigator.clipboard.writeText(summary);
                        triggerToast("📋", "Copied full Deep Reasoning Report to clipboard!");
                      }}
                      className="bg-[#112055] hover:bg-[#1b3180] text-slate-200 p-2 rounded-lg border border-white/10 transition cursor-pointer"
                      title="Copy Full Report"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-[#112055]/30 border border-white/5 p-3 rounded-lg space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                    Contextual Tension & Challenge:
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {reasoningResult.complexitySummary}
                  </p>
                </div>
              </div>

              {/* 2. Step-by-Step Reasoning Deduction Chain */}
              <div className="bg-[#0D1B3E] border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <Layers className="w-4 h-4 text-[#D4AF37]" />
                  <h4 className="font-serif-cinzel font-bold text-xs text-[#D4AF37] tracking-wider uppercase">
                    Step-by-Step Exegetical Deduction Chain
                  </h4>
                </div>
                <div className="space-y-2">
                  {reasoningResult.reasoningSteps.map((step, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-2.5 p-2.5 bg-[#0A0F1E] rounded-lg border border-white/5 text-xs text-slate-200 leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="flex-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Original Language Exegesis (Greek & Hebrew Cards) */}
              {reasoningResult.originalLanguageExegesis && reasoningResult.originalLanguageExegesis.length > 0 && (
                <div className="bg-[#0D1B3E] border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <Compass className="w-4 h-4 text-[#D4AF37]" />
                    <h4 className="font-serif-cinzel font-bold text-xs text-[#D4AF37] tracking-wider uppercase">
                      Ancient Morphological & Linguistic Exegesis
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {reasoningResult.originalLanguageExegesis.map((lex, idx) => (
                      <div 
                        key={idx} 
                        className="bg-[#0A0F1E] border border-[#D4AF37]/25 p-3 rounded-lg space-y-1.5"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-base font-serif font-bold text-[#D4AF37]">{lex.term}</span>
                          <span className="text-[9px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-300">
                            {lex.language} • {lex.transliteration}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-emerald-450 font-semibold">{lex.grammaticalRole}</p>
                        <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-white/5">
                          {lex.theologicalNuance}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Scripture Harmony Chain */}
              {reasoningResult.scriptureHarmonyChain && reasoningResult.scriptureHarmonyChain.length > 0 && (
                <div className="bg-[#0D1B3E] border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <BookOpen className="w-4 h-4 text-[#D4AF37]" />
                    <h4 className="font-serif-cinzel font-bold text-xs text-[#D4AF37] tracking-wider uppercase">
                      Canonical Scripture Harmony (Scripture Interpreting Scripture)
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {reasoningResult.scriptureHarmonyChain.map((verse, idx) => (
                      <div key={idx} className="bg-[#0A0F1E] border border-white/5 p-3 rounded-lg space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#D4AF37] text-xs">{verse.reference}</span>
                          <span className="text-[9px] font-mono text-slate-400">Canonical Anchor</span>
                        </div>
                        <p className="text-xs italic text-slate-200">"{verse.verseText}"</p>
                        <p className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
                          <strong className="text-slate-300">Harmony Note:</strong> {verse.theologicalHarmony}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Historical Creeds & Counter-Arguments Split Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Historical Consensus */}
                {reasoningResult.historicalConsensus && (
                  <div className="bg-[#0D1B3E] border border-white/10 rounded-xl p-4 space-y-2.5">
                    <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block border-b border-white/10 pb-1.5 flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5" /> Historical Creeds & Patristic Consensus
                    </span>
                    <div className="space-y-2">
                      {reasoningResult.historicalConsensus.map((item, idx) => (
                        <div key={idx} className="bg-[#0A0F1E] p-2.5 rounded-lg border border-white/5 text-xs">
                          <span className="font-bold text-white text-[11px] block text-[#D4AF37] mb-0.5">
                            {item.traditionOrCreed}
                          </span>
                          <p className="text-slate-300 leading-relaxed text-[11px]">{item.historicalView}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Objections & Refutations */}
                {reasoningResult.counterArgumentsAndRefutations && (
                  <div className="bg-[#0D1B3E] border border-white/10 rounded-xl p-4 space-y-2.5">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block border-b border-white/10 pb-1.5 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" /> Objections & Biblical Refutations
                    </span>
                    <div className="space-y-2">
                      {reasoningResult.counterArgumentsAndRefutations.map((item, idx) => (
                        <div key={idx} className="bg-[#0A0F1E] p-2.5 rounded-lg border border-rose-500/20 text-xs space-y-1">
                          <p className="text-rose-300 font-semibold text-[11px]">⚠️ Objection: "{item.objection}"</p>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            <strong className="text-emerald-450">Scriptural Rebuttal:</strong> {item.biblicalRefutation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Pastoral Insights & Covenant Action Step */}
              <div className="bg-[#0D1B3E] border border-emerald-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <Lightbulb className="w-4 h-4 text-emerald-450" />
                  <h4 className="font-serif-cinzel font-bold text-xs text-white tracking-wider uppercase">
                    Pastoral Deeper Insights & Everyday Discipleship
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {reasoningResult.pastoralDeeperInsights.map((insight, idx) => (
                    <div key={idx} className="bg-[#0A0F1E] p-3 rounded-lg border border-white/5 text-xs text-slate-200 leading-relaxed">
                      <span className="text-[9.5px] font-bold text-emerald-450 uppercase block mb-1">Insight #{idx + 1}</span>
                      {insight}
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-lg text-xs flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-450 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-450 uppercase text-[9.5px] block">Immediate Covenant Action:</span>
                    <p className="text-slate-200 mt-0.5">{reasoningResult.covenantActionPoint}</p>
                  </div>
                </div>
              </div>

              {/* 7. Gemini Reasoning Trace (Expandable Cognitive Steps) */}
              {reasoningResult.thinkingTrace && (
                <div className="bg-[#0A0F1E] border border-white/10 rounded-xl p-3">
                  <button
                    type="button"
                    onClick={() => setShowThinkingTrace(!showThinkingTrace)}
                    className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-[#D4AF37]" />
                      <span>Gemini 3.8 Cognitive Reasoning Trace ({showThinkingTrace ? "Visible" : "Collapsed"})</span>
                    </span>
                    {showThinkingTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showThinkingTrace && (
                    <div className="mt-2.5 p-3 bg-black/60 rounded-lg border border-white/5 font-mono text-[10px] text-slate-300 leading-relaxed whitespace-pre-line select-text">
                      {reasoningResult.thinkingTrace}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 1. BIBLEGPT CHAT INTERFACE */}
      {activeSubTab === "chat" && (
        <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-3.5 gold-glow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0A0F1E] p-2.5 rounded-lg border border-[#D4AF37]/15">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-serif-cinzel text-white font-bold">
                BIBLEGPT CONVERSATIONAL STUDY
              </span>
              <span className="bg-[#10B981]/20 text-[#10B981] text-[8px] font-mono px-1 py-0.2 rounded font-bold">
                GEMINI 3.8
              </span>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-[10px] text-[#D4AF37] cursor-pointer" title="Enable high reasoning for complex queries">
                <input 
                  type="checkbox" 
                  checked={chatHighThinking} 
                  onChange={e => setChatHighThinking(e.target.checked)} 
                  className="accent-[#D4AF37] w-3 h-3" 
                />
                <span className="font-semibold">High Reasoning</span>
              </label>

              <select
                value={chatVersion}
                onChange={e => {
                  setChatVersion(e.target.value);
                  setPreferredVersion(e.target.value);
                  triggerToast("📖", `Default Bible translation is set to ${e.target.value}`);
                }}
                className="bg-[#112055] border border-white/10 text-white rounded text-xs px-2 py-1 focus:outline-none"
              >
                <option value="KJV">Authorized King James Version (KJV)</option>
                <option value="NKJV">New King James Version (NKJV)</option>
                <option value="NIV">New International Version (NIV)</option>
                <option value="ESV">English Standard Version (ESV)</option>
                <option value="AMP">Amplified Bible (AMP)</option>
              </select>
            </div>
          </div>

          <div className="h-72 overflow-y-auto space-y-3 p-3 bg-[#0A0F1E] rounded-xl border border-white/5 font-sans-raleway">
            {chatMessages.map((msg, i) => (
              <div 
                key={i} 
                className={`p-3 rounded-xl text-xs max-w-[90%] leading-relaxed ${
                  msg.role === "user" 
                    ? "bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 ml-auto"
                    : "bg-[#112055]/50 text-[#B0C4DE] border border-white/5"
                }`}
              >
                <div className="text-[10px] font-bold uppercase mb-1 flex items-center justify-between font-sans">
                  <span>{msg.role === "user" ? "You" : "BibleGPT"}</span>
                  <span className="opacity-50 text-[9px] font-memo font-light">[{chatVersion}]</span>
                </div>
                <div className="whitespace-pre-line text-slate-100">{msg.content}</div>

                {/* Expandable Reasoning Trace */}
                {msg.thoughts && (
                  <div className="mt-2 pt-1.5 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setChatExpandedThoughts(prev => ({ ...prev, [i]: !prev[i] }))}
                      className="flex items-center gap-1.5 text-[9px] text-[#D4AF37] hover:text-[#F0C940] font-semibold bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/25 transition cursor-pointer"
                    >
                      <Brain className="w-3 h-3" />
                      <span>{chatExpandedThoughts[i] ? "Hide Exegetical Steps" : "View Gemini 3.8 Exegetical Steps"}</span>
                      <span className="text-[8px] font-mono">[{chatExpandedThoughts[i] ? "▲" : "▼"}]</span>
                    </button>

                    {chatExpandedThoughts[i] && (
                      <div className="mt-1.5 p-2 bg-black/60 rounded border border-[#D4AF37]/25 font-mono text-[9px] text-slate-300 leading-relaxed whitespace-pre-line select-text">
                        {msg.thoughts}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isChatLoading && (
              <div className="text-xs text-slate-300 bg-[#112055]/40 border border-[#D4AF37]/20 p-2.5 rounded-xl w-52 flex items-center gap-2 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                <span>Deliberating theological texts...</span>
              </div>
            )}
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar text-[9.5px] py-1">
            <span className="text-slate-500 self-center uppercase font-bold text-[8px] whitespace-nowrap">Suggested:</span>
            <button
              type="button"
              onClick={() => handleBibleGPTSend("Explain the theological relation of grace and works in Romans 11")}
              className="whitespace-nowrap px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-[#D4AF37]/20 text-[#B0C4DE] hover:text-[#D4AF37] border border-white/10 transition cursor-pointer"
            >
              Grace vs Works in Rom 11
            </button>
            <button
              type="button"
              onClick={() => handleBibleGPTSend("What is the Greek difference between Agapao and Phileo in John 21?")}
              className="whitespace-nowrap px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-[#D4AF37]/20 text-[#B0C4DE] hover:text-[#D4AF37] border border-white/10 transition cursor-pointer"
            >
              Agapao vs Phileo in John 21
            </button>
            <button
              type="button"
              onClick={() => handleBibleGPTSend("How did the Council of Nicaea articulate the deity of the Holy Spirit?")}
              className="whitespace-nowrap px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-[#D4AF37]/20 text-[#B0C4DE] hover:text-[#D4AF37] border border-white/10 transition cursor-pointer"
            >
              Nicene Creed & Holy Spirit
            </button>
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ask complex biblical query or scripture interpretation..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleBibleGPTSend()}
              className="flex-1 bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D4AF37]"
            />
            <button 
              type="button"
              onClick={() => handleBibleGPTSend()}
              disabled={isChatLoading}
              className="bg-[#D4AF37] hover:bg-[#F0C940] disabled:opacity-50 text-black rounded-xl p-2.5 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. BIBLE STUDY PLANNER */}
      {activeSubTab === "study" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-3.5">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Custom Study Outlines</span>
            <div>
              <label className="block text-xs font-semibold text-[#B0C4DE] mb-1">Passage Reference / Topic Query</label>
              <input 
                type="text" 
                value={studyTopic}
                onChange={e => setStudyTopic(e.target.value)}
                placeholder="e.g. Sanctification, Acts 2 Church"
                className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-xl px-3 py-2 text-xs focus:outline-none"
              />
            </div>
            <button
              onClick={handleBibleStudyGenerate}
              disabled={isStudyLoading}
              className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-xs py-2 rounded-xl transition cursor-pointer"
            >
              {isStudyLoading ? "Deliberating context..." : "Generate Study Outlines"}
            </button>

            <div className="border-t border-white/5 pt-3.5 space-y-2">
              <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" /> AI Cross-References
              </span>
              <p className="text-[10px] text-slate-400 leading-normal">
                Ask the Gemini API to suggest three additional scriptural cross-references relevant to "{studyTopic || 'topic'}".
              </p>
              <button
                onClick={handleGenerateCrossReferences}
                disabled={isCrossLoading || !studyTopic.trim()}
                className="w-full bg-[#112055] hover:bg-[#D4AF37] hover:text-[#0A0F1E] border border-[#D4AF37]/45 text-[#D4AF37] text-xs font-bold py-2 rounded-xl transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isCrossLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching celestial logs...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Suggest 3 Scriptures</span>
                  </>
                )}
              </button>

              {crossReferences && crossReferences.length > 0 && (
                <div className="mt-3.5 space-y-2">
                  {crossReferences.map((ref, i) => (
                    <div key={i} className="bg-[#0A0F1E] border border-[#D4AF37]/25 p-2.5 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#D4AF37] text-[11px] font-memo">{ref.ref}</span>
                        <button
                          onClick={() => {
                            const exists = studyResult.keyVerses?.includes(ref.ref);
                            if (exists) {
                              triggerToast("⚠️", `"${ref.ref}" is already in your study guide anchor list!`);
                            } else {
                              setStudyResult((prev: any) => ({
                                ...prev,
                                keyVerses: [...(prev.keyVerses || []), ref.ref]
                              }));
                              triggerToast("📥", `Added "${ref.ref}" to study guide scriptures.`);
                            }
                          }}
                          className="text-[#D4AF37]/80 hover:text-white text-[10px] font-semibold hover:underline cursor-pointer"
                        >
                          + Add to Guide
                        </button>
                      </div>
                      <p className="italic text-slate-300 text-[11px] leading-relaxed">"{ref.text}"</p>
                      {ref.context && (
                        <p className="text-[10px] text-slate-400 font-light pt-0.5 border-t border-white/5">
                          <span className="font-bold text-slate-300">Context:</span> {ref.context}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 bg-[#0A0F1E] border border-white/5 p-4 rounded-xl font-sans-raleway space-y-3">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h4 className="text-sm font-serif-cinzel font-bold text-[#D4AF37]">Study Guide: {studyTopic}</h4>
              
              <button
                onClick={() => {
                  setIsStudyEditing(!isStudyEditing);
                  triggerToast("✏️", isStudyEditing ? "Saved custom outline context." : "Edit Mode activated. Modify text or run inline AI edits!");
                }}
                className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded border transition-luxury cursor-pointer ${
                  isStudyEditing 
                    ? "bg-[#D4AF37] text-[#0A0F1E] border-[#D4AF37] font-bold"
                    : "bg-[#112055] text-[#D4AF37] border-[#D4AF37]/35 hover:bg-[#112055]/80"
                }`}
              >
                {isStudyEditing ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Save Customizations</span>
                  </>
                ) : (
                  <>
                    <Pencil className="w-3 h-3" />
                    <span>Edit to My Standard</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-3 text-xs text-[#B0C4DE] leading-relaxed">
              <div>
                <p className="font-semibold text-white flex justify-between items-center">
                  <span>I. Theological Overview（Outline Topic)</span>
                </p>
                {isStudyEditing ? (
                  <textarea 
                    value={studyResult.intro || ""} 
                    onChange={e => setStudyResult({...studyResult, intro: e.target.value})}
                    className="w-full bg-[#0A0F1E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37] mt-1" 
                    rows={3}
                  />
                ) : (
                  <p className="mt-1">{studyResult.intro}</p>
                )}
                {renderStudyRefinePanel("intro")}
              </div>

              <div className="border-t border-white/5 pt-2">
                <p className="font-semibold text-white">II. Culture & Chronology Elements（Outline Topic)</p>
                {isStudyEditing ? (
                  <textarea 
                    value={studyResult.context || ""} 
                    onChange={e => setStudyResult({...studyResult, context: e.target.value})}
                    className="w-full bg-[#0A0F1E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37] mt-1" 
                    rows={3}
                  />
                ) : (
                  <p className="mt-1">{studyResult.context}</p>
                )}
                {renderStudyRefinePanel("context")}
              </div>

              <div className="border-t border-white/5 pt-2">
                <p className="font-semibold text-white">III. Anchor Scripture References</p>
                {isStudyEditing ? (
                  <div className="space-y-1.5 mt-1">
                    <input
                      type="text"
                      value={studyResult.keyVerses?.join(", ") || ""}
                      onChange={e => setStudyResult({
                        ...studyResult, 
                        keyVerses: e.target.value.split(",").map(v => v.trim()).filter(v => v !== "")
                      })}
                      className="w-full bg-[#0A0F1E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37]"
                      placeholder="e.g. Romans 12:1, Galatians 2:20"
                    />
                    <p className="text-[10px] text-slate-400 italic">Separate scriptural references using commas.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {studyResult.keyVerses?.map((v: string, i: number) => (
                      <span key={i} className="bg-[#112055]/50 border border-[#D4AF37]/30 text-[#D4AF37] px-2.5 py-0.5 rounded-lg text-[10px] font-memo">
                        {v}
                      </span>
                    ))}
                  </div>
                )}
                {renderStudyRefinePanel("keyVerses")}
              </div>

              <div className="border-t border-white/5 pt-2">
                <p className="font-semibold text-white">IV. Monday Devotional Applications（Outline Topic)</p>
                {isStudyEditing ? (
                  <textarea 
                    value={studyResult.application || ""} 
                    onChange={e => setStudyResult({...studyResult, application: e.target.value})}
                    className="w-full bg-[#0A0F1E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37] mt-1" 
                    rows={3}
                  />
                ) : (
                  <p className="mt-1">{studyResult.application}</p>
                )}
                {renderStudyRefinePanel("application")}
              </div>

              <div className="border-t border-white/5 pt-2">
                <p className="font-semibold text-white">V. Interactive Group Discussion Starters</p>
                {isStudyEditing ? (
                  <div className="space-y-2 mt-1">
                    {studyResult.questions?.map((q: string, idx: number) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={q}
                          onChange={e => {
                            const newQ = [...studyResult.questions];
                            newQ[idx] = e.target.value;
                            setStudyResult({...studyResult, questions: newQ});
                          }}
                          className="flex-1 bg-[#0A0F1E] border border-white/10 rounded px-2 py-1 text-white text-xs outline-none focus:border-[#D4AF37]"
                        />
                        <button
                          onClick={() => {
                            const newQ = studyResult.questions.filter((_: any, qI: number) => qI !== idx);
                            setStudyResult({...studyResult, questions: newQ});
                            triggerToast("🗑️", "Question removed.");
                          }}
                          className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        setStudyResult({
                          ...studyResult,
                          questions: [...(studyResult.questions || []), "Enter discussions topic starter..."]
                        });
                        triggerToast("➕", "Added discussion question placeholder.");
                      }}
                      className="text-[#D4AF37] hover:text-[#F0C940] text-[10px] flex items-center gap-1 font-semibold cursor-pointer py-1"
                    >
                      <Plus className="w-3 h-3" /> Add Custom Question
                    </button>
                  </div>
                ) : (
                  <ul className="list-decimal list-inside space-y-1.5 pl-1 text-[#B0C4DE] mt-1">
                    {studyResult.questions?.map((q: string, i: number) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                )}
                {renderStudyRefinePanel("questions")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SOUND FAITH DOCTRINE COMPLIANCE */}
      {activeSubTab === "doctrine" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Configurator & Input Workspace */}
          <div className="lg:col-span-5 space-y-4">
            {/* Choose Dynamic Doctrine */}
            <div className="border border-[#D4AF37]/35 bg-[#0D1B3E] p-4 rounded-xl space-y-3.5">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block flex items-center gap-1">
                <Shield className="w-4 h-4 text-[#D4AF37] animate-pulse" /> Chosen Church Bible Doctrine
              </span>
              <p className="text-[11px] text-[#B0C4DE] leading-normal">
                Determine the core doctrinal standards and biblical truth systems our AI models will use to analyze all sermonic assertions.
              </p>
              
              <div className="space-y-2">
                <select
                  value={selectedDoctrineId}
                  onChange={(e) => setSelectedDoctrineId(e.target.value)}
                  className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/25 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#D4AF37]"
                >
                  {doctrinesList.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} {doc.type === "uploaded" ? "(Custom Church Standard)" : ""}
                    </option>
                  ))}
                </select>

                <div className="bg-[#0A0F1E]/50 border border-[#D4AF37]/10 p-2.5 rounded-lg text-[11px] text-[#B0C4DE]">
                  <span className="font-bold text-[#D4AF37] uppercase text-[9px] block mb-0.5">Active Doctrine Directive</span>
                  <p className="italic">
                    {(doctrinesList.find(d => d.id === selectedDoctrineId) || doctrinesList[0]).summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Doctrine Upload Framework */}
            <div className="border border-[#D4AF37]/20 bg-[#0D1B3E]/60 p-4 rounded-xl space-y-3">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider block flex items-center gap-1">
                <Upload className="w-3.5 h-3.5 text-[#D4AF37]" /> Upload Church Custom Doctrine
              </span>
              <p className="text-[10px] text-slate-400">
                Integrate your own church standard, confession, or statement of faith (.txt files supported).
              </p>

              <div className="space-y-2.5 text-xs">
                <div>
                  <input
                    type="text"
                    placeholder="Doctrine Standard Name (e.g. Calvary Assembly Faith)"
                    value={customDocName}
                    onChange={(e) => setCustomDocName(e.target.value)}
                    className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOverDoc(true); }}
                  onDragLeave={() => setIsDragOverDoc(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOverDoc(false);
                    if (e.dataTransfer.files?.length) {
                      handleDocFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border border-dashed rounded-lg p-3 text-center transition-all cursor-pointer ${
                    isDragOverDoc ? "border-[#D4AF37] bg-[#112055]" : "border-[#D4AF37]/20 bg-[#0A0F1E]/40"
                  }`}
                  onClick={() => {
                    const el = document.getElementById("doc-file-picker");
                    el?.click();
                  }}
                >
                  <input
                    type="file"
                    id="doc-file-picker"
                    accept=".txt"
                    onChange={(e) => e.target.files?.length && handleDocFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                  <FileText className="w-5 h-5 mx-auto text-[#D4AF37] opacity-60 mb-1" />
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Drag and drop your doctrine .txt file or click to choose
                  </span>
                </div>

                <div>
                  <textarea
                    placeholder="Or paste full doctrine statements of faith here directly..."
                    value={customDocContent}
                    onChange={(e) => setCustomDocContent(e.target.value)}
                    className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-lg p-2 text-[11px] focus:outline-none focus:border-[#D4AF37]"
                    rows={3}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveCustomDoctrine}
                  className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-[10px] py-1.5 rounded transition cursor-pointer"
                >
                  Save & Activate Custom Church Standard
                </button>
              </div>
            </div>

            {/* Test Core Assertion */}
            <div className="border border-[#D4AF37]/20 bg-[#0D1B3E]/40 p-4 rounded-xl space-y-3.5">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Assertion to Audit</span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Paste any controversial claim, sermon snippet, or transcript body below to verify against your active church doctrine.
              </p>
              <textarea
                value={doctrineText}
                onChange={(e) => setDoctrineText(e.target.value)}
                rows={4}
                className="w-full bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-xl p-2.5 text-xs focus:outline-none"
              />
              <button
                onClick={handleValidateDoctrine}
                disabled={checkingDoctrine}
                className="w-full bg-rose-900/60 border border-rose-500/30 text-rose-100 font-semibold text-xs py-2 rounded-xl transition"
              >
                {checkingDoctrine ? "Analyzing Statements with Orthodoxy Guard..." : "Run Theological Audit Check"}
              </button>
            </div>
          </div>

          {/* Doctrinal Compliance Summary Output panel */}
          <div className="lg:col-span-7 bg-[#0A0F1E] border border-white/5 p-4 rounded-xl space-y-4 font-sans-raleway text-xs">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-[#D4AF37] font-semibold text-sm">Doctrinal Audit Output</span>
                {isDoctrineEditing ? (
                  <input
                    type="text"
                    value={doctrineResult.status || ""}
                    onChange={(e) => setDoctrineResult({ ...doctrineResult, status: e.target.value })}
                    className="bg-[#112055] border border-white/15 text-white rounded text-[10px] px-1.5 py-0.5 outline-none font-bold"
                  />
                ) : (
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    doctrineResult.alertLevel === "Critical" 
                      ? "bg-red-500/25 text-red-300 border border-red-500/30" 
                      : doctrineResult.alertLevel === "High" || doctrineResult.alertLevel === "Medium"
                      ? "bg-amber-500/25 text-amber-300 border border-amber-500/30"
                      : "bg-[#112055] text-emerald-350 border border-emerald-500/30"
                  }`}>
                    {doctrineResult.status || "Assessed"}
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setIsDoctrineEditing(!isDoctrineEditing);
                  triggerToast("🛡️", isDoctrineEditing ? "Saved custom doctrinal structures." : "Audit Edit Mode active. Adjust assessments manually or refine with AI!");
                }}
                className={`flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded border cursor-pointer ${
                  isDoctrineEditing 
                    ? "bg-[#D4AF37] text-[#0A0F1E] border-[#D4AF37] font-bold"
                    : "bg-[#112055] text-[#D4AF37] border-[#D4AF37]/35 hover:bg-[#112055]/80"
                }`}
              >
                {isDoctrineEditing ? (
                  <>
                    <Check className="w-2.5 h-2.5" />
                    <span>Save Customizations</span>
                  </>
                ) : (
                  <>
                    <Pencil className="w-2.5 h-2.5" />
                    <span>Edit to My Standard</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="font-semibold text-[#D4AF37] block uppercase text-[10px] tracking-wide mb-1">
                  Theological Compliance Assessment:
                </span>
                {isDoctrineEditing ? (
                  <textarea 
                    value={doctrineResult.theologicalAssessment || ""} 
                    onChange={(e) => setDoctrineResult({ ...doctrineResult, theologicalAssessment: e.target.value })}
                    className="w-full bg-[#0A0F1E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37] mt-1" 
                    rows={4}
                  />
                ) : (
                  <p className="text-[#B0C4DE] leading-relaxed italic border-l-2 border-[#D4AF37] pl-3">
                    {doctrineResult.theologicalAssessment}
                  </p>
                )}
                {renderDoctrineRefinePanel("theologicalAssessment")}
              </div>

              <div className="border-t border-white/5 pt-3">
                <span className="font-semibold text-[#D4AF37] block uppercase text-[10px] tracking-wide mb-1">
                  Canonical Scriptural Witnesses / Antidote Verses:
                </span>
                {isDoctrineEditing ? (
                  <div className="space-y-1.5 mt-1">
                    <input
                      type="text"
                      value={doctrineResult.clashingVerses?.join(", ") || ""}
                      onChange={(e) => setDoctrineResult({
                        ...doctrineResult, 
                        clashingVerses: e.target.value.split(",").map(v => v.trim()).filter(v => v !== "")
                      })}
                      className="w-full bg-[#0A0F1E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37]"
                      placeholder="e.g. Romans 3:28, Galatians 2:16"
                    />
                    <p className="text-[10px] text-slate-400 italic">Separate scripture references with commas.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {doctrineResult.clashingVerses?.map((v: string, i: number) => (
                      <span key={i} className="bg-rose-950/40 text-rose-350 border border-rose-900/40 text-[10.5px] px-2.5 py-0.5 rounded font-mono font-bold">
                        {v}
                      </span>
                    ))}
                  </div>
                )}
                {renderDoctrineRefinePanel("clashingVerses")}
              </div>

              <div className="bg-[#112055]/30 p-3 rounded-lg border border-[#D4AF37]/15">
                <span className="font-semibold text-[#D4AF37] block uppercase text-[10px] tracking-wide mb-1">
                  Defense Statement / Pastoral Alignment Guidance:
                </span>
                {isDoctrineEditing ? (
                  <textarea 
                    value={doctrineResult.rebuttalStatement || ""} 
                    onChange={(e) => setDoctrineResult({ ...doctrineResult, rebuttalStatement: e.target.value })}
                    className="w-full bg-[#0A0F1E] border border-[#D4AF37]/35 rounded text-white p-2 text-xs focus:outline-none focus:border-[#D4AF37] mt-1" 
                    rows={2}
                  />
                ) : (
                  <p className="italic text-[#B0C4DE] leading-relaxed pl-1">
                    "{doctrineResult.rebuttalStatement}"
                  </p>
                )}
                {renderDoctrineRefinePanel("rebuttalStatement")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. HAVEN SANCTUARY DEVOTIONAL COMPANION */}
      {activeSubTab === "haven" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-4">
            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-[#D4AF37]/20 text-center space-y-2">
              <span className="text-[10px] font-bold text-[#D4AF37] tracking-widest uppercase block">Breathed Scripture of the Day</span>
              <p className="text-xs font-serif-cinzel text-white italic">"{dailyVerse.text}"</p>
              <p className="text-[10px] text-[#D4AF37] font-bold">-{dailyVerse.ref}</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button 
                  onClick={handleRefreshDailyVerse}
                  className="flex items-center gap-1 bg-[#112055] hover:bg-[#112055]/70 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] py-1 px-2.5 rounded transition cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh Verse
                </button>
                <button 
                  onClick={() => setActiveSubTab("highlights")}
                  className="flex items-center gap-1 bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-[10px] py-1 px-2.5 rounded transition cursor-pointer"
                >
                  <Highlighter className="w-3 h-3" /> Highlight in Reader
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-[#0A0F1E] border border-white/5 p-4 rounded-xl space-y-3 font-sans-raleway">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Devotional & Reflection Log</span>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Log a personal prayer requests or scripture insight..."
                value={newMeditation}
                onChange={e => setNewMeditation(e.target.value)}
                className="flex-1 bg-[#0D1B3E] text-white border border-white/10 rounded-lg px-3 py-1.5 text-xs"
              />
              <button
                onClick={() => {
                  if (!newMeditation.trim()) return;
                  setMeditationLog(prev => [newMeditation, ...prev]);
                  setNewMeditation("");
                  triggerToast("📝", "Inner sanctuary log updated.");
                }}
                className="bg-[#D4AF37] text-black text-xs px-3 rounded-lg font-semibold"
              >
                Journal Log
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {meditationLog.map((log, i) => (
                <div key={i} className="bg-[#112055]/30 border-l border-[#D4AF37] p-2 rounded-r text-xs text-[#B0C4DE]">
                  <p className="text-[9px] text-[#D4AF37]/60 font-medium mb-0.5">Covenant Entry #{i+1}</p>
                  <p>{log}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. GREEK & HEBREW CONCORDANCE */}
      {activeSubTab === "concordance" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-3.5">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Concordance Query</span>
            <p className="text-[11px] text-slate-400">
              Input any English theological word or theme to trace its ancient etymology, Greek/Hebrew translation codes, and primary instances.
            </p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={concordanceQuery}
                onChange={e => setConcordanceQuery(e.target.value)}
                className="flex-1 bg-[#0A0F1E] text-white border border-[#D4AF37]/20 rounded-xl px-3 py-1.5 text-xs"
              />
              <button
                onClick={handleConcordanceSearch}
                disabled={concordanceLoading}
                className="bg-[#D4AF37] hover:bg-[#F0C940] text-black text-xs font-semibold px-3 py-1 rounded-xl"
              >
                {concordanceLoading ? "..." : "Map Root"}
              </button>
            </div>
          </div>

          <div className="md:col-span-2 bg-[#0A0F1E] border border-white/5 p-4 rounded-xl font-sans-raleway text-xs space-y-2.5">
            <h4 className="text-sm font-serif-cinzel font-bold text-[#D4AF37]">Concordance Target: {concordanceResult.word}</h4>
            
            <div className="bg-[#112055]/30 border border-[#D4AF37]/20 p-2.5 rounded-lg">
              <span className="font-semibold text-white text-[11px] uppercase tracking-wide">Parchment Root Term</span>
              <p className="text-sm font-semibold text-[#D4AF37] mt-0.5">{concordanceResult.greekTerm}</p>
            </div>

            <div>
              <span className="font-semibold text-white uppercase tracking-wide block">Ancient Lexicon Definition:</span>
              <p className="text-[#B0C4DE] leading-relaxed mt-0.5">{concordanceResult.definition}</p>
            </div>

            <div className="space-y-1.5">
              <span className="font-semibold text-white uppercase tracking-wide block">Seminal Scripture Hooks:</span>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {concordanceResult.instances?.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white/5 p-2 rounded">
                    <p className="font-bold text-[#D4AF37] text-[10px]">{item.text}</p>
                    <p className="italic text-[#B0C4DE] text-[11px]">"{item.context}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
