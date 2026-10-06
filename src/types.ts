export interface ChurchProfile {
  id: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  province: string;
  country: string;
  bibleVersion: string;
  visionStatement?: string;
  clergyLeadership?: string;
  additionalNotes?: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  demographic: "Children" | "Youth" | "Adult" | "Men" | "Women";
  status: "Active" | "Inactive";
  joinedAt: string;
  notes: string;
  avatarUrl?: string;
  avatarType?: "gravatar" | "identicon" | "dicebear" | "uploaded";
}

export interface NewComer {
  id: string;
  name: string;
  firstVisit: string;
  email: string;
  phone: string;
  assignedTo: string;
  status: "New" | "Contacted" | "Attending" | "Converted" | "Member";
  followUpNotes: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  serviceType: string;
  attendanceCount: number;
  newVisitors: number;
}

export interface ChurchProgram {
  id: string;
  name: string;
  schedule: string;
  location: string;
  leader: string;
  type: "Service" | "Study" | "Outreach" | "Concert" | "Retreat";
}

export interface SpecialEvent {
  id: string;
  name: string;
  type: "Crusade" | "Retreat" | "Conference" | "Seminar" | "Concert";
  date: string;
  venue: string;
  budget: number;
  expectedAttendance: number;
  flyerUrl?: string;
  notes: string;
  checklist: { task: string; done: boolean }[];
  salvations?: number; // Crusade results
}

export interface VideoLink {
  id: string;
  title: string;
  url: string;
  category: "Sermon" | "Worship" | "Outreach" | "Seminar";
  uploadedAt: string;
}

export interface AudioMessage {
  id: string;
  title: string;
  preacher: string;
  url: string;
  duration: string;
}

export interface SentEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
  status: "Sent" | "Scheduled" | "Draft";
}

export interface BibleDoctrine {
  id: string;
  name: string;
  type: "preset" | "uploaded";
  content: string;
  summary: string;
  uploadedAt?: string;
}

export interface DevotionalSession {
  id: string;
  userId: string;
  topic: string;
  styleLabel: string;
  scriptureReading: string;
  dailyMeditation: string;
  propheticDeclaration: string;
  prayerPoints: string[];
  createdAt: string;
}

export interface PrayerJournalEntry {
  id: string;
  userId: string;
  title: string;
  request: string;
  status: "Active" | "Answered";
  createdAt: string;
  answeredAt?: string;
  testimony?: string;
  category?: string;
  scriptureRef?: string;
}

export interface ReminderSetting {
  id: string;
  userId: string;
  hour: number;
  minute: number;
  enabled: boolean;
  updatedAt: string;
}

export interface FavoriteScripture {
  id: string;
  userId: string;
  reference: string;
  savedAt: string;
}

export interface DeepReasoningInsight {
  query: string;
  focusArea: string;
  thesis: string;
  complexitySummary: string;
  reasoningSteps: string[];
  originalLanguageExegesis: {
    term: string;
    transliteration: string;
    language: "Greek" | "Hebrew" | "Aramaic";
    grammaticalRole: string;
    theologicalNuance: string;
  }[];
  scriptureHarmonyChain: {
    reference: string;
    verseText: string;
    theologicalHarmony: string;
  }[];
  historicalConsensus: {
    traditionOrCreed: string;
    historicalView: string;
  }[];
  counterArgumentsAndRefutations: {
    objection: string;
    biblicalRefutation: string;
  }[];
  pastoralDeeperInsights: string[];
  covenantActionPoint: string;
  thinkingTrace?: string | null;
  modelUsed?: string;
  generatedAt?: string;
}

export interface SermonMainPoint {
  pointNumber: number;
  title: string;
  scriptureFocus: string;
  exegesis: string;
  subPoints: string[];
  illustration: string;
  pastoralApplication: string;
}

export interface StructuredSermonOutline {
  id?: string;
  title: string;
  passage: string;
  theme: string;
  proposition: string;
  historicalContext: string;
  introduction: {
    hook: string;
    biblicalContext: string;
    thesis: string;
  };
  mainPoints: [SermonMainPoint, SermonMainPoint, SermonMainPoint] | SermonMainPoint[];
  conclusion: {
    summary: string;
    pastoralCharge: string;
    altarCall: string;
  };
  thinkingTrace?: string;
  modelUsed?: string;
  generatedAt?: string;
}

export interface ChurchGrowthMonthData {
  month: string;
  year: number;
  label: string; // e.g. "May 2026"
  memberJoins: number;
  guestConversions: number;
  totalGuests: number;
  conversionRate: number; // percentage (0-100)
  netActiveMembers: number;
  notes?: string;
}

export interface VerseHighlight {
  id: string;
  userId: string;
  passage: string;
  book: string;
  chapter: number;
  verse: number;
  verseText: string;
  color: "gold" | "blue" | "green" | "purple" | "rose" | "amber" | string;
  colorHex: string;
  note?: string;
  version: string;
  createdAt: string;
}
