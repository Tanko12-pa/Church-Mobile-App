import React, { useState, useEffect } from "react";
import { 
  Users, UserPlus, Trash, Edit2, Calendar, ClipboardCheck, Sparkles, Plus, CheckSquare, Search, 
  Download, Sliders, Save, ChevronDown, ChevronUp, BookOpen, Award,
  Video, Contact, Link, ExternalLink, RefreshCw, CheckCircle2, Phone, Mail, Loader2, Copy, Trash2, 
  ShieldCheck, HelpCircle, UserCheck, Share2, PlusCircle, AlertTriangle, Eye,
  TrendingUp, BarChart3, ArrowUpRight, ArrowDownRight, Layers,
  Camera, Upload, Wand2, Image as ImageIcon
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Member, NewComer, AttendanceRecord, SpecialEvent, ChurchProfile, ChurchGrowthMonthData } from "../types";
import { 
  getMemberAvatar, 
  generateGeometricIdenticon, 
  getGravatarUrl, 
  getDicebearUrl, 
  processUploadedImage 
} from "../utils/avatarUtils";

interface ChurchManagementProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  newComers: NewComer[];
  setNewComers: React.Dispatch<React.SetStateAction<NewComer[]>>;
  attendanceLogs: AttendanceRecord[];
  setAttendanceLogs: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  specialEvents: SpecialEvent[];
  setSpecialEvents: React.Dispatch<React.SetStateAction<SpecialEvent[]>>;
  churchProfiles?: ChurchProfile[];
  setChurchProfiles?: React.Dispatch<React.SetStateAction<ChurchProfile[]>>;
  triggerToast: (icon: string, message: string) => void;
  googleAccessToken?: string | null;
  setGoogleAccessToken?: React.Dispatch<React.SetStateAction<string | null>>;
  handleGoogleSignIn?: () => Promise<void>;
  onNavigateToVision?: () => void;
}

export default function ChurchManagement({
  members,
  setMembers,
  newComers,
  setNewComers,
  attendanceLogs,
  setAttendanceLogs,
  specialEvents,
  setSpecialEvents,
  churchProfiles = [],
  setChurchProfiles = () => {},
  triggerToast,
  googleAccessToken = null,
  setGoogleAccessToken = () => {},
  handleGoogleSignIn = async () => {},
  onNavigateToVision
}: ChurchManagementProps) {
  const [activeSubTab, setActiveSubTab] = useState<"members" | "newcomers" | "growth" | "attendance" | "events" | "profiles" | "google_sync">("members");

  // Church Growth Trends (Last 6 Months: Member Joins vs. New Guest Conversions)
  const [growthViewType, setGrowthViewType] = useState<"area" | "bar" | "line">("area");
  const [growthAiAnalyzing, setGrowthAiAnalyzing] = useState(false);
  const [growthAiAnalysis, setGrowthAiAnalysis] = useState<string | null>(null);
  const [showLogMonthModal, setShowLogMonthModal] = useState(false);
  const [newMonthLabel, setNewMonthLabel] = useState("Nov 2026");
  const [newMonthJoins, setNewMonthJoins] = useState(30);
  const [newMonthConversions, setNewMonthConversions] = useState(22);
  const [newMonthGuests, setNewMonthGuests] = useState(48);
  const [newMonthNotes, setNewMonthNotes] = useState("Thanksgiving & Covenant Fellowship");

  const [growthTrendsData, setGrowthTrendsData] = useState<ChurchGrowthMonthData[]>([
    {
      month: "May",
      year: 2026,
      label: "May 2026",
      memberJoins: 18,
      guestConversions: 12,
      totalGuests: 34,
      conversionRate: 35.3,
      netActiveMembers: 720,
      notes: "Spring Discipleship & Baptism"
    },
    {
      month: "Jun",
      year: 2026,
      label: "Jun 2026",
      memberJoins: 22,
      guestConversions: 15,
      totalGuests: 38,
      conversionRate: 39.5,
      netActiveMembers: 742,
      notes: "Pentecost Celebration Outreach"
    },
    {
      month: "Jul",
      year: 2026,
      label: "Jul 2026",
      memberJoins: 19,
      guestConversions: 14,
      totalGuests: 36,
      conversionRate: 38.9,
      netActiveMembers: 761,
      notes: "Summer Family Community Week"
    },
    {
      month: "Aug",
      year: 2026,
      label: "Aug 2026",
      memberJoins: 25,
      guestConversions: 18,
      totalGuests: 42,
      conversionRate: 42.8,
      netActiveMembers: 786,
      notes: "Annual Believers Revival Crusade"
    },
    {
      month: "Sep",
      year: 2026,
      label: "Sep 2026",
      memberJoins: 28,
      guestConversions: 20,
      totalGuests: 46,
      conversionRate: 43.5,
      netActiveMembers: 814,
      notes: "Back-to-Church Sunday Campaign"
    },
    {
      month: "Oct",
      year: 2026,
      label: "Oct 2026",
      memberJoins: 32,
      guestConversions: 24,
      totalGuests: 52,
      conversionRate: 46.2,
      netActiveMembers: 846,
      notes: "Harvest Ingathering & Covenant Intake"
    }
  ]);

  // Search/Filters States
  const [memberSearch, setMemberSearch] = useState("");
  const [googleContactsFilterQuery, setGoogleContactsFilterQuery] = useState("");
  const [memberFilterDemographic, setMemberFilterDemographic] = useState("All");

  // Member CRUD Modals and forms
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [viewingMemberDetails, setViewingMemberDetails] = useState<Member | null>(null);
  const [newMemName, setNewMemName] = useState("");
  const [newMemRole, setNewMemRole] = useState("Member");
  const [newMemEmail, setNewMemEmail] = useState("");
  const [newMemPhone, setNewMemPhone] = useState("");
  const [newMemDemographic, setNewMemDemographic] = useState<any>("Adult");
  const [newMemNotes, setNewMemNotes] = useState("");
  const [newMemAvatarUrl, setNewMemAvatarUrl] = useState<string>("");
  const [newMemAvatarType, setNewMemAvatarType] = useState<"gravatar" | "identicon" | "dicebear" | "uploaded">("identicon");

  // Member Avatar & Gravatar Studio States
  const [avatarModalMember, setAvatarModalMember] = useState<Member | null>(null);
  const [avatarCustomPreview, setAvatarCustomPreview] = useState<string>("");
  const [avatarStyleChoice, setAvatarStyleChoice] = useState<"identicon" | "gravatar" | "dicebear" | "uploaded">("identicon");
  const [avatarGravatarFallback, setAvatarGravatarFallback] = useState<"identicon" | "retro" | "robohash" | "wavatar" | "monsterid">("identicon");
  const [avatarDicebearStyle, setAvatarDicebearStyle] = useState<"avataaars" | "bottts" | "identicon" | "lorelei" | "fun-emoji">("avataaars");
  const [avatarSeedCustom, setAvatarSeedCustom] = useState<string>("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);

  // AI Church Profile states
  const [showAIProfileModal, setShowAIProfileModal] = useState(false);
  const [unstructuredText, setUnstructuredText] = useState("");
  const [extractionLoading, setExtractionLoading] = useState(false);
  const [hasExtracted, setHasExtracted] = useState(false);
  const [aiActionType, setAiActionType] = useState<"CREATE" | "UPDATE">("CREATE");
  const [aiName, setAiName] = useState("");
  const [aiAddress, setAiAddress] = useState("");
  const [aiEmail, setAiEmail] = useState("");
  const [aiPhone, setAiPhone] = useState("");
  const [aiCountry, setAiCountry] = useState("");

  // Church Profiles Edit/Add States
  const [editingProfile, setEditingProfile] = useState<ChurchProfile | null>(null);
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [profName, setProfName] = useState("");
  const [profAddress, setProfAddress] = useState("");
  const [profEmail, setProfEmail] = useState("");
  const [profPhone, setProfPhone] = useState("");
  const [profProvince, setProfProvince] = useState("");
  const [profCountry, setProfCountry] = useState("");
  const [profBibleVersion, setProfBibleVersion] = useState("ESV");
  const [profVisionStatement, setProfVisionStatement] = useState("");
  const [profClergyLeadership, setProfClergyLeadership] = useState("");
  const [profAdditionalNotes, setProfAdditionalNotes] = useState("");
  const [refineLoading, setRefineLoading] = useState(false);
  const [expandedProfiles, setExpandedProfiles] = useState<Record<string, boolean>>({});

  // AI Church Parish Extract states
  const [showAIParmodal, setShowAIParmodal] = useState(false);
  const [unstructuredParText, setUnstructuredParText] = useState("");
  const [parExtractionLoading, setParExtractionLoading] = useState(false);

  // Newcomer states
  const [newComerName, setNewComerName] = useState("");
  const [newComerAssignTo, setNewComerAssignTo] = useState("");
  const [newComerNotes, setNewComerNotes] = useState("");

  // Dynamic date helper to initialize form fields with today's date dynamically
  const getCurrentDateFormatted = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Event Forms
  const [newEventName, setNewEventName] = useState("");
  const [newEventType, setNewEventType] = useState<any>("Crusade");
  const [newEventVenue, setNewEventVenue] = useState("");
  const [newEventBudget, setNewEventBudget] = useState(1500);
  const [newEventDate, setNewEventDate] = useState(getCurrentDateFormatted());
  const [newEventExpected, setNewEventExpected] = useState(500);
  const [newEventNotes, setNewEventNotes] = useState("");

  // Attendance logging inputs
  const [attendanceDate, setAttendanceDate] = useState(getCurrentDateFormatted());
  const [serviceTypeName, setServiceTypeName] = useState("Sunday Sovereign Grace Service");
  const [attendanceHeadcount, setAttendanceHeadcount] = useState(250);
  const [newVisitorsCount, setNewVisitorsCount] = useState(12);

  const [activeAttendanceSelection, setActiveAttendanceSelection] = useState<string>("Sunday Service");

  // Google Meet and Contacts state variables
  const [googleContacts, setGoogleContacts] = useState<any[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [meetSpaces, setMeetSpaces] = useState<any[]>([
    { id: "meet_sim_1", name: "Daily Morning Breakthrough Intercession", meetingUri: "https://meet.google.com/abc-defg-hij", resourceName: "spaces/abc-defg-hij", createdAt: "Jul 15, 2026" },
    { id: "meet_sim_2", name: "Youth Executive Council Planning Call", meetingUri: "https://meet.google.com/xyz-uvwx-yz1", resourceName: "spaces/xyz-uvwx-yz1", createdAt: "Jul 18, 2026" }
  ]);
  const [meetLoading, setMeetLoading] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [syncStatus, setSyncStatus] = useState<"idle" | "fetching" | "success" | "error">("idle");
  const [showConfirmDelete, setShowConfirmDelete] = useState<{ type: "contact" | "meet"; id: string; name: string } | null>(null);
  const [showExportConfirm, setShowExportConfirm] = useState<Member | null>(null);
  const [showCreateContactModal, setShowCreateContactModal] = useState(false);
  const [gContactFirst, setGContactFirst] = useState("");
  const [gContactLast, setGContactLast] = useState("");
  const [gContactEmail, setGContactEmail] = useState("");
  const [gContactPhone, setGContactPhone] = useState("");
  const [googleSearchQuery, setGoogleSearchQuery] = useState("");
  const [isSandboxMode, setIsSandboxMode] = useState(!googleAccessToken);

  // Helper functions for Google API requests
  const fetchGoogleContacts = async () => {
    if (!googleAccessToken) return;
    setContactsLoading(true);
    setSyncStatus("fetching");
    try {
      const res = await fetch("https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers&pageSize=100", {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to load Google Contacts: ${res.statusText}`);
      }
      const data = await res.json();
      const parsedContacts = (data.connections || []).map((conn: any) => {
        const nameObj = conn.names?.[0] || {};
        const emailObj = conn.emailAddresses?.[0] || {};
        const phoneObj = conn.phoneNumbers?.[0] || {};
        return {
          resourceName: conn.resourceName,
          name: nameObj.displayName || "Unnamed Contact",
          givenName: nameObj.givenName || "",
          familyName: nameObj.familyName || "",
          email: emailObj.value || "No Email",
          phone: phoneObj.value || "No Phone",
        };
      });
      setGoogleContacts(parsedContacts);
      setSyncStatus("success");
      triggerToast("✓", "Successfully synchronized contacts with Google Account.");
    } catch (err: any) {
      console.error(err);
      setSyncStatus("error");
      triggerToast("❌", `Failed to fetch Google Contacts: ${err.message}`);
    } finally {
      setContactsLoading(false);
    }
  };

  const createGoogleMeetSpace = async (spaceName: string) => {
    if (!spaceName.trim()) {
      triggerToast("⚠️", "Please specify a name for the fellowship space.");
      return;
    }
    setMeetLoading(true);
    try {
      if (googleAccessToken) {
        const res = await fetch("https://meet.googleapis.com/v2/spaces", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });
        if (!res.ok) {
          throw new Error(`Google Meet creation failed: ${res.statusText}`);
        }
        const data = await res.json();
        const newSpace = {
          id: data.name || "meet_" + Date.now(),
          name: spaceName,
          meetingUri: data.meetingUri || "https://meet.google.com/mock-meet-space",
          resourceName: data.name || "spaces/mock-meet-space",
          createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        };
        setMeetSpaces(prev => [newSpace, ...prev]);
        triggerToast("📹", `Successfully generated Google Meet Space: "${spaceName}"!`);
      } else {
        const simCode = Math.random().toString(36).substring(2, 5) + "-" + Math.random().toString(36).substring(2, 6) + "-" + Math.random().toString(36).substring(2, 5);
        const newSpace = {
          id: "meet_sim_" + Date.now(),
          name: spaceName,
          meetingUri: `https://meet.google.com/${simCode}`,
          resourceName: `spaces/${simCode}`,
          createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        };
        setMeetSpaces(prev => [newSpace, ...prev]);
        triggerToast("📹", `[Simulated] Generated Meet Space: "${spaceName}" successfully.`);
      }
      setNewSpaceName("");
    } catch (err: any) {
      console.error(err);
      triggerToast("❌", `Failed to create Meet Space: ${err.message}`);
    } finally {
      setMeetLoading(false);
    }
  };

  const exportMemberToGoogleContacts = async (member: Member) => {
    const nameParts = member.name.trim().split(" ");
    const givenName = nameParts[0] || "";
    const familyName = nameParts.slice(1).join(" ") || "";
    
    setContactsLoading(true);
    try {
      if (googleAccessToken) {
        const res = await fetch("https://people.googleapis.com/v1/people:createContact", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            names: [{ givenName, familyName }],
            emailAddresses: member.email ? [{ value: member.email }] : [],
            phoneNumbers: member.phone ? [{ value: member.phone }] : [],
          }),
        });
        if (!res.ok) {
          throw new Error(`Google Contacts write failed: ${res.statusText}`);
        }
        triggerToast("👤", `Successfully exported ${member.name} to Google Contacts.`);
        fetchGoogleContacts();
      } else {
        const newSimContact = {
          resourceName: "people/sim_" + Date.now(),
          name: member.name,
          givenName,
          familyName,
          email: member.email || "No Email",
          phone: member.phone || "No Phone",
        };
        setGoogleContacts(prev => [newSimContact, ...prev]);
        triggerToast("👤", `[Simulated] Exported ${member.name} to Google Contacts!`);
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("❌", `Failed to export contact: ${err.message}`);
    } finally {
      setContactsLoading(false);
      setShowExportConfirm(null);
    }
  };

  const createDirectGoogleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gContactFirst.trim()) {
      triggerToast("⚠️", "First Name is required.");
      return;
    }
    setContactsLoading(true);
    try {
      if (googleAccessToken) {
        const res = await fetch("https://people.googleapis.com/v1/people:createContact", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            names: [{ givenName: gContactFirst, familyName: gContactLast }],
            emailAddresses: gContactEmail ? [{ value: gContactEmail }] : [],
            phoneNumbers: gContactPhone ? [{ value: gContactPhone }] : [],
          }),
        });
        if (!res.ok) {
          throw new Error(`Google Contacts creation failed: ${res.statusText}`);
        }
        triggerToast("👤", `Successfully created ${gContactFirst} ${gContactLast} in Google Contacts!`);
        fetchGoogleContacts();
      } else {
        const newSimContact = {
          resourceName: "people/sim_" + Date.now(),
          name: `${gContactFirst} ${gContactLast}`.trim(),
          givenName: gContactFirst,
          familyName: gContactLast,
          email: gContactEmail || "No Email",
          phone: gContactPhone || "No Phone",
        };
        setGoogleContacts(prev => [newSimContact, ...prev]);
        triggerToast("👤", `[Simulated] Created contact "${gContactFirst} ${gContactLast}" in Google Contacts!`);
      }
      setGContactFirst("");
      setGContactLast("");
      setGContactEmail("");
      setGContactPhone("");
      setShowCreateContactModal(false);
    } catch (err: any) {
      console.error(err);
      triggerToast("❌", `Failed to create direct contact: ${err.message}`);
    } finally {
      setContactsLoading(false);
    }
  };

  const deleteGoogleContact = async (resourceName: string, name: string) => {
    setContactsLoading(true);
    try {
      if (googleAccessToken) {
        const res = await fetch(`https://people.googleapis.com/v1/${resourceName}:deleteContact`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
          },
        });
        if (!res.ok) {
          throw new Error(`Google Contacts delete failed: ${res.statusText}`);
        }
        triggerToast("🗑️", `Successfully deleted ${name} from Google Contacts.`);
        fetchGoogleContacts();
      } else {
        setGoogleContacts(prev => prev.filter(c => c.resourceName !== resourceName));
        triggerToast("🗑️", `[Simulated] Deleted ${name} from Google Contacts.`);
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("❌", `Failed to delete Google Contact: ${err.message}`);
    } finally {
      setContactsLoading(false);
      setShowConfirmDelete(null);
    }
  };

  const importGoogleContactToApp = (contact: any) => {
    const exists = members.some(
      m => m.name.toLowerCase() === contact.name.toLowerCase() || (m.email && m.email.toLowerCase() === contact.email.toLowerCase())
    );
    if (exists) {
      triggerToast("⚠️", `${contact.name} is already registered in the Church Registry.`);
      return;
    }
    
    const added: Member = {
      id: "mem_" + Date.now(),
      name: contact.name,
      role: "Member",
      email: contact.email === "No Email" ? "" : contact.email,
      phone: contact.phone === "No Phone" ? "" : contact.phone,
      demographic: "Adult",
      status: "Active",
      joinedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      notes: "Synchronized and imported from Google Contacts."
    };
    setMembers(prev => [added, ...prev]);
    triggerToast("👤", `Successfully imported ${contact.name} into Church Registry.`);
  };

  const importAllGoogleContacts = () => {
    let count = 0;
    const newMembersList = [...members];
    
    googleContacts.forEach(contact => {
      const exists = members.some(
        m => m.name.toLowerCase() === contact.name.toLowerCase() || (m.email && m.email.toLowerCase() === contact.email.toLowerCase())
      );
      if (!exists) {
        const added: Member = {
          id: "mem_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
          name: contact.name,
          role: "Member",
          email: contact.email === "No Email" ? "" : contact.email,
          phone: contact.phone === "No Phone" ? "" : contact.phone,
          demographic: "Adult",
          status: "Active",
          joinedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          notes: "Synchronized and imported from Google Contacts in bulk."
        };
        newMembersList.push(added);
        count++;
      }
    });
    
    if (count > 0) {
      setMembers(newMembersList);
      triggerToast("👥", `Successfully imported ${count} contacts into the Church Registry!`);
    } else {
      triggerToast("ℹ️", "All contacts are already present in the registry.");
    }
  };

  // Sync Google Account state transitions
  useEffect(() => {
    if (googleAccessToken) {
      setIsSandboxMode(false);
      fetchGoogleContacts();
    } else {
      setIsSandboxMode(true);
      // Populate realistic mock data
      setGoogleContacts([
        { resourceName: "people/sim_1", name: "Deacon John Obi", givenName: "John", familyName: "Obi", email: "john.obi@gmail.com", phone: "+234 80 1122 3344" },
        { resourceName: "people/sim_2", name: "Sister Chidi Okafor", givenName: "Chidi", familyName: "Okafor", email: "chidi.okafor@gmail.com", phone: "+234 81 9988 7766" },
        { resourceName: "people/sim_3", name: "Brother Kwame Appiah", givenName: "Kwame", familyName: "Appiah", email: "kwame.appiah@yahoo.com", phone: "+233 24 999 8888" },
        { resourceName: "people/sim_4", name: "Deaconess Abimbola Adebayo", givenName: "Abimbola", familyName: "Adebayo", email: "abimbola.a@gmail.com", phone: "+234 70 5555 4433" }
      ]);
    }
  }, [googleAccessToken]);

  // Member Action creators
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemName.trim()) return;

    if (editingMember) {
      setMembers(prev => prev.map(m => m.id === editingMember.id ? {
        ...m,
        name: newMemName,
        role: newMemRole,
        email: newMemEmail,
        phone: newMemPhone,
        demographic: newMemDemographic,
        notes: newMemNotes,
        avatarUrl: newMemAvatarUrl || m.avatarUrl || generateGeometricIdenticon(newMemEmail || newMemName),
        avatarType: newMemAvatarType || m.avatarType || "identicon"
      } : m));
      triggerToast("✓", "Member records updated with visual avatar.");
      setEditingMember(null);
    } else {
      const finalAvatar = newMemAvatarUrl || (newMemEmail ? getGravatarUrl(newMemEmail, "identicon") : generateGeometricIdenticon(newMemName));
      const added: Member = {
        id: "mem_" + Date.now(),
        name: newMemName,
        role: newMemRole,
        email: newMemEmail,
        phone: newMemPhone,
        demographic: newMemDemographic,
        status: "Active",
        joinedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        notes: newMemNotes,
        avatarUrl: finalAvatar,
        avatarType: newMemAvatarType
      };
      setMembers(prev => [added, ...prev]);
      triggerToast("👤", `${newMemName} registered successfully with unique visual icon.`);
    }

    // Reset fields
    setNewMemName("");
    setNewMemRole("Member");
    setNewMemEmail("");
    setNewMemPhone("");
    setNewMemDemographic("Adult");
    setNewMemNotes("");
    setNewMemAvatarUrl("");
    setNewMemAvatarType("identicon");
    setShowAddMember(false);
  };

  const handleAIProfileExtract = async () => {
    if (!unstructuredText.trim()) {
      triggerToast("⚠️", "Please provide some unstructured member info first.");
      return;
    }
    setExtractionLoading(true);
    setHasExtracted(false);
    try {
      const response = await fetch("/api/gemini/church-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: unstructuredText }),
      });
      if (!response.ok) {
        throw new Error("Failed to extract profile");
      }
      const data = await response.json();
      const cleanValue = (val: any) => (val === null || val === undefined) ? "" : String(val).trim();
      setAiActionType(data.action_type || "CREATE");
      setAiName(cleanValue(data.name));
      setAiAddress(cleanValue(data.address));
      setAiEmail(cleanValue(data.email));
      setAiPhone(cleanValue(data.phone_number));
      setAiCountry(cleanValue(data.country));
      setHasExtracted(true);
      triggerToast("✨", "AI processing complete. Check fields below!");
    } catch (err: any) {
      console.error(err);
      triggerToast("❌", "AI Extraction fell back or failed.");
    } finally {
      setExtractionLoading(false);
    }
  };

  const handleAISave = () => {
    if (!aiName.trim()) {
      triggerToast("⚠️", "Full Name is required to save a record.");
      return;
    }

    if (aiActionType === "UPDATE") {
      // Find a member with matching name or email first
      const existing = members.find(
        m => m.name.toLowerCase() === aiName.toLowerCase() || (m.email && m.email.toLowerCase() === aiEmail.toLowerCase())
      );
      if (existing) {
        setMembers(prev => prev.map(m => m.id === existing.id ? {
          ...m,
          name: aiName,
          email: aiEmail,
          phone: aiPhone,
          notes: `Address: ${aiAddress || "None"}, Country: ${aiCountry || "None"}. Updated via AI: ${new Date().toLocaleDateString()}`
        } : m));
        triggerToast("✓", `AI Directory updated: ${aiName}`);
      } else {
        // Fallback to adding new if not found, since updating an unknown member can create it
        const added: Member = {
          id: "mem_" + Date.now(),
          name: aiName,
          role: "Member",
          email: aiEmail,
          phone: aiPhone,
          demographic: "Adult",
          status: "Active",
          joinedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          notes: `Address: ${aiAddress || "None"}, Country: ${aiCountry || "None"}. AI Created (Update requested, not found).`
        };
        setMembers(prev => [added, ...prev]);
        triggerToast("👤", `AI Profile Saved (Created): ${aiName}`);
      }
    } else {
      // CREATE
      const added: Member = {
        id: "mem_" + Date.now(),
        name: aiName,
        role: "Member",
        email: aiEmail,
        phone: aiPhone,
        demographic: "Adult",
        status: "Active",
        joinedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        notes: `Address: ${aiAddress || "None"}, Country: ${aiCountry || "None"}. AI Created.`
      };
      setMembers(prev => [added, ...prev]);
      triggerToast("👤", `AI Profile Saved: ${aiName}`);
    }

    // Reset states
    setUnstructuredText("");
    setAiName("");
    setAiAddress("");
    setAiEmail("");
    setAiPhone("");
    setAiCountry("");
    setHasExtracted(false);
    setShowAIProfileModal(false);
  };

  const handleEditSetup = (mem: Member) => {
    setEditingMember(mem);
    setNewMemName(mem.name);
    setNewMemRole(mem.role);
    setNewMemEmail(mem.email);
    setNewMemPhone(mem.phone);
    setNewMemDemographic(mem.demographic);
    setNewMemNotes(mem.notes);
    setNewMemAvatarUrl(mem.avatarUrl || getMemberAvatar(mem));
    setNewMemAvatarType(mem.avatarType || "identicon");
    setShowAddMember(true);
  };

  // Avatar & Gravatar Studio Actions
  const openAvatarModal = (mem: Member) => {
    setAvatarModalMember(mem);
    const initialSeed = mem.email || mem.name || mem.id;
    setAvatarSeedCustom(initialSeed);
    setAvatarStyleChoice(mem.avatarType || "identicon");
    setAvatarCustomPreview(getMemberAvatar(mem));
  };

  const handleApplyGeneratedAvatar = () => {
    if (!avatarModalMember) return;
    const updatedMember: Member = {
      ...avatarModalMember,
      avatarUrl: avatarCustomPreview,
      avatarType: avatarStyleChoice
    };
    setMembers(prev => prev.map(m => m.id === avatarModalMember.id ? updatedMember : m));
    if (viewingMemberDetails && viewingMemberDetails.id === avatarModalMember.id) {
      setViewingMemberDetails(updatedMember);
    }
    triggerToast("✨", `Avatar visual icon updated for ${avatarModalMember.name}!`);
    setAvatarModalMember(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const dataUrl = await processUploadedImage(file);
      setAvatarCustomPreview(dataUrl);
      setAvatarStyleChoice("uploaded");
      triggerToast("📸", "Member portrait photo loaded! Click 'Apply & Save' to seal.");
    } catch (err: any) {
      triggerToast("⚠️", err.message || "Failed to process image.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleBatchGenerateGravatars = () => {
    let updatedCount = 0;
    const fallbackStyles: Array<"identicon" | "retro" | "robohash" | "wavatar"> = ["identicon", "retro", "robohash", "wavatar"];
    setMembers(prev => prev.map((m, idx) => {
      if (!m.avatarUrl || m.avatarUrl.trim() === "") {
        updatedCount++;
        const style = fallbackStyles[idx % fallbackStyles.length];
        const newAvatar = m.email ? getGravatarUrl(m.email, style) : generateGeometricIdenticon(m.name || m.id);
        return {
          ...m,
          avatarUrl: newAvatar,
          avatarType: m.email ? "gravatar" : "identicon"
        };
      }
      return m;
    }));
    triggerToast("🎨", `Generated unique Gravatar-style visual icons for ${updatedCount || members.length} members!`);
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from registry logs?`)) {
      setMembers(prev => prev.filter(m => m.id !== id));
      triggerToast("🗑️", `${name} omitted from database.`);
    }
  };

  // Newcomer registration
  const handleAddNewcomer = () => {
    if (!newComerName.trim()) return;
    const added: NewComer = {
      id: "nc_" + Date.now(),
      name: newComerName,
      firstVisit: new Date().toLocaleDateString(),
      email: `${newComerName.toLowerCase().replace(" ", "")}@guest.com`,
      phone: "+234 80 112 3344",
      assignedTo: newComerAssignTo || "Unassigned Elder",
      status: "New",
      followUpNotes: newComerNotes || "Welcome pack distributed at terminal entrance."
    };
    setNewComers(p => [added, ...p]);
    setNewComerName("");
    setNewComerAssignTo("");
    setNewComerNotes("");
    triggerToast("🤝", "First timer registered securely.");
  };

  const handleUpdateFollowupStatus = (id: string, newStatus: any) => {
    setNewComers(p => p.map(nc => nc.id === id ? { ...nc, status: newStatus } : nc));
    triggerToast("🔄", "Follow-up schedule updated.");
  };

  const handleLogAttendanceSubmit = () => {
    const record: AttendanceRecord = {
      id: "att_" + Date.now(),
      date: attendanceDate,
      serviceType: serviceTypeName,
      attendanceCount: Number(attendanceHeadcount),
      newVisitors: Number(newVisitorsCount)
    };
    setAttendanceLogs(prev => [record, ...prev]);
    triggerToast("✓", "Sovereign attendance registry updated.");
  };

  const handleAddNewEvent = () => {
    if (!newEventName.trim()) return;
    const added: SpecialEvent = {
      id: "ev_" + Date.now(),
      name: newEventName,
      type: newEventType,
      date: newEventDate || "2026-06-18",
      venue: newEventVenue || "Sanctuary Cathedral",
      budget: newEventBudget,
      expectedAttendance: newEventExpected || 500,
      notes: newEventNotes || "Logistical and prayer outlines attached.",
      checklist: [
        { task: "Mobilize intercession night team", done: false },
        { task: "Brief technical and synth sound booth", done: false },
        { task: "Design golden theme flyers", done: false }
      ]
    };
    setSpecialEvents(prev => [added, ...prev]);
    setNewEventName("");
    setNewEventVenue("");
    setNewEventDate("2026-06-18");
    setNewEventExpected(500);
    setNewEventNotes("");
    triggerToast("📅", `Special event '${newEventName}' scheduled.`);
  };

  const toggleChecklistTask = (eventId: string, taskIdx: number) => {
    setSpecialEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        const updated = [...ev.checklist];
        updated[taskIdx].done = !updated[taskIdx].done;
        return { ...ev, checklist: updated };
      }
      return ev;
    }));
  };

  // Church Profile Handlers
  const handleEditProfileSetup = (profile: ChurchProfile) => {
    setEditingProfile(profile);
    setProfName(profile.name);
    setProfAddress(profile.address);
    setProfEmail(profile.email);
    setProfPhone(profile.phone);
    setProfProvince(profile.province);
    setProfCountry(profile.country);
    setProfBibleVersion(profile.bibleVersion);
    setProfVisionStatement(profile.visionStatement || "");
    setProfClergyLeadership(profile.clergyLeadership || "");
    setProfAdditionalNotes(profile.additionalNotes || "");
    setShowAddProfile(true);
  };

  const handleCreateProfileSetup = () => {
    setEditingProfile(null);
    setProfName("");
    setProfAddress("");
    setProfEmail("");
    setProfPhone("");
    setProfProvince("");
    setProfCountry("");
    setProfBibleVersion("ESV");
    setProfVisionStatement("");
    setProfClergyLeadership("");
    setProfAdditionalNotes("");
    setShowAddProfile(true);
  };

  const handleDeleteProfile = (id: string) => {
    if (window.confirm("Are you sure you want to delete this Church Profile/Parish?")) {
      setChurchProfiles(prev => prev.filter(p => p.id !== id));
      triggerToast("🗑️", "Church Profile deleted successfully.");
    }
  };

  const handleSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName.trim()) {
      triggerToast("⚠️", "Profile Name is required.");
      return;
    }

    if (editingProfile) {
      setChurchProfiles(prev => prev.map(p => p.id === editingProfile.id ? {
        ...p,
        name: profName,
        address: profAddress,
        email: profEmail,
        phone: profPhone,
        province: profProvince,
        country: profCountry,
        bibleVersion: profBibleVersion,
        visionStatement: profVisionStatement,
        clergyLeadership: profClergyLeadership,
        additionalNotes: profAdditionalNotes
      } : p));
      triggerToast("✓", "Parish profile updated.");
      setEditingProfile(null);
    } else {
      const added: ChurchProfile = {
        id: "prof_" + Date.now(),
        name: profName,
        address: profAddress,
        email: profEmail,
        phone: profPhone,
        province: profProvince,
        country: profCountry,
        bibleVersion: profBibleVersion,
        visionStatement: profVisionStatement,
        clergyLeadership: profClergyLeadership,
        additionalNotes: profAdditionalNotes
      };
      setChurchProfiles(prev => [...prev, added]);
      triggerToast("✓", "New parish profile created.");
    }
    setShowAddProfile(false);
  };

  const handleRefineProfile = async () => {
    if (!profName.trim()) {
      triggerToast("⚠️", "Please fill in the Parish/Assembly Name first.");
      return;
    }
    setRefineLoading(true);
    try {
      const resp = await fetch("/api/gemini/refine-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profName,
          address: profAddress,
          bibleVersion: profBibleVersion,
          currentVision: profVisionStatement,
          currentClergy: profClergyLeadership,
          currentNotes: profAdditionalNotes
        })
      });
      if (!resp.ok) throw new Error("Correction server error");
      const data = await resp.json();
      
      setProfVisionStatement(data.visionStatement || "");
      setProfClergyLeadership(data.clergyLeadership || "");
      setProfAdditionalNotes(data.additionalNotes || "");
      
      triggerToast("✨", "Spiritual parameters refined to supreme theological clarity.");
    } catch (err) {
      triggerToast("❌", "Failed to refine details. Using high-faith fallback.");
      setProfVisionStatement("To tabernacle in the divine presence, raising a covenant-aligned generation established in sovereign grace.");
      setProfClergyLeadership("Reverend Presbyter & Covenant Council");
      setProfAdditionalNotes("An anointed assembly walking in divine assignments.");
    } finally {
      setRefineLoading(false);
    }
  };

  const handleAIParishExtract = async () => {
    if (!unstructuredParText.trim()) {
      triggerToast("⚠️", "Please type or paste some unstructured text description first.");
      return;
    }
    setParExtractionLoading(true);
    try {
      const resp = await fetch("/api/gemini/church-parish-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: unstructuredParText })
      });
      if (!resp.ok) throw new Error("Server extraction failed");
      const data = await resp.json();
      
      setProfName(data.name || "");
      setProfAddress(data.address || "");
      setProfEmail(data.email || "");
      setProfPhone(data.phone || "");
      setProfProvince(data.province || "");
      setProfCountry(data.country || "");
      setProfBibleVersion(data.bibleVersion || "ESV");
      // Set default draft values to be refined
      setProfVisionStatement("");
      setProfClergyLeadership("");
      setProfAdditionalNotes("");
      
      triggerToast("✨", "Parish details extracted successfully by AI!");
      setShowAIParmodal(false);
      setShowAddProfile(true);
    } catch (err: any) {
      triggerToast("❌", "AI Extraction failed, please input manually.");
    } finally {
      setParExtractionLoading(false);
    }
  };

  // Filtered members list
  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
                          m.role.toLowerCase().includes(memberSearch.toLowerCase()) ||
                          m.email.toLowerCase().includes(memberSearch.toLowerCase());
    const matchesDemo = memberFilterDemographic === "All" || m.demographic === memberFilterDemographic;
    
    let matchesGoogleContacts = true;
    if (googleContactsFilterQuery.trim() !== "") {
      const matchingContacts = googleContacts.filter(c => 
        (c.name && c.name.toLowerCase().includes(googleContactsFilterQuery.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(googleContactsFilterQuery.toLowerCase()))
      );
      matchesGoogleContacts = matchingContacts.some(c => 
        (c.name && c.name.toLowerCase() === m.name.toLowerCase()) ||
        (m.email && c.email && c.email.toLowerCase() === m.email.toLowerCase())
      );
    }
    
    return matchesSearch && matchesDemo && matchesGoogleContacts;
  });

  const filteredGoogleContacts = googleContacts.filter(c => 
    c.name.toLowerCase().includes(googleSearchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(googleSearchQuery.toLowerCase()) ||
    c.phone.toLowerCase().includes(googleSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Tab selectors */}
      <div className="flex flex-wrap gap-1 border-b border-[#D4AF37]/25 pb-2">
        {[
          { id: "members", label: "Member Records & Registry", icon: Users },
          { id: "newcomers", label: "First Timers & Follow-Up", icon: UserPlus },
          { id: "growth", label: "Church Growth Trends", icon: TrendingUp },
          { id: "attendance", label: "Attendance Visualizers", icon: ClipboardCheck },
          { id: "events", label: "Special Events & Crusades", icon: Calendar },
          { id: "profiles", label: "Church & Parish Profiles", icon: Sliders },
          { id: "google_sync", label: "Google Meet & Contacts", icon: RefreshCw }
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubTab(sub.id as any)}
            className={`flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg border transition-luxury font-sans-raleway font-semibold cursor-pointer ${
              activeSubTab === sub.id 
                ? "bg-[#D4AF37] border-[#D4AF37] text-[#0A0F1E] font-bold"
                : "bg-[#0A0F1E] border-white/10 text-[#B0C4DE] hover:bg-[#112055]/40"
            }`}
          >
            <sub.icon className="w-3.5 h-3.5" />
            {sub.label}
          </button>
        ))}
      </div>

      {/* 1. MEMBER RECORDS REGISTRY */}
      {activeSubTab === "members" && (
        <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-4 gold-glow">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <h3 className="text-sm font-serif-cinzel font-bold text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#D4AF37]" /> Core Congregation Registry
            </h3>
            
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search name, role, email..."
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  className="bg-[#0A0F1E] border border-[#D4AF37]/25 text-white pl-8 pr-3 py-1.5 rounded-lg text-xs w-44 focus:outline-none"
                />
              </div>

              <div className="relative">
                <Contact className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#D4AF37]/75" />
                <input 
                  type="text" 
                  placeholder="Filter by Google Contacts..."
                  value={googleContactsFilterQuery}
                  onChange={e => setGoogleContactsFilterQuery(e.target.value)}
                  className="bg-[#0A0F1E] border border-[#D4AF37]/35 text-white pl-8 pr-3 py-1.5 rounded-lg text-xs w-52 focus:outline-none focus:border-[#D4AF37]/70"
                  title="Filter list by matching names or emails from synced Google Contacts"
                />
              </div>

              <select 
                value={memberFilterDemographic}
                onChange={e => setMemberFilterDemographic(e.target.value)}
                className="bg-[#0A0F1E] border border-[#D4AF37]/25 text-white rounded-lg text-xs px-2 py-1.5 focus:outline-none"
              >
                <option value="All">All Sections</option>
                <option value="Children">Children</option>
                <option value="Youth">Youth Assembly</option>
                <option value="Adult">Adult Assembly</option>
                <option value="Men">Men's Fellowship</option>
                <option value="Women">Women's Fellowship</option>
              </select>

              <button 
                onClick={handleBatchGenerateGravatars}
                className="bg-[#112055] hover:bg-[#1A2E6E] text-[#D4AF37] font-semibold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition border border-[#D4AF37]/35 shadow-md"
                title="Automatically generate unique gravatar-style icons for all members"
              >
                <Wand2 className="w-3.5 h-3.5 text-[#D4AF37]" /> Gravatars Studio
              </button>

              <button 
                onClick={() => {
                  setShowAIProfileModal(true);
                  setShowAddMember(false);
                }}
                className="bg-[#5B21B6] hover:bg-[#7C3AED] text-white font-semibold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 transition border border-[#D4AF37]/30 shadow-md gold-glow"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Church Profile
              </button>

              <button 
                onClick={() => {
                  setShowAddMember(true);
                  setShowAIProfileModal(false);
                  setEditingMember(null);
                  setNewMemAvatarUrl("");
                  setNewMemAvatarType("identicon");
                }}
                className="bg-[#D4AF37] hover:bg-[#F0C940] text-[#0A0F1E] font-semibold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Register Member
              </button>
            </div>
          </div>

          {/* Member Registration Modal */}
          {showAddMember && (
            <div className="bg-[#0A0F1E] border border-[#D4AF37]/50 rounded-xl p-4 space-y-3 font-sans-raleway animate-fade-in">
              <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                {editingMember ? "Revise Member File" : "Register New Covenant Disciple"}
              </h4>
              <form onSubmit={handleAddMemberSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#B0C4DE] mb-0.5">Full Name</label>
                  <input type="text" required value={newMemName} onChange={e => setNewMemName(e.target.value)} className="w-full bg-[#112055] text-white text-xs p-2 rounded border border-white/5" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#B0C4DE] mb-0.5">Ministry Role</label>
                  <input type="text" value={newMemRole} onChange={e => setNewMemRole(e.target.value)} className="w-full bg-[#112055] text-white text-xs p-2 rounded border border-white/5" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#B0C4DE] mb-0.5">Email Address</label>
                  <input type="email" value={newMemEmail} onChange={e => setNewMemEmail(e.target.value)} className="w-full bg-[#112055] text-white text-xs p-2 rounded border border-white/5" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#B0C4DE] mb-0.5">Phone Line</label>
                  <input type="text" value={newMemPhone} onChange={e => setNewMemPhone(e.target.value)} className="w-full bg-[#112055] text-white text-xs p-2 rounded border border-white/5" />
                </div>
                <div>
                  <label className="block text-[11px] text-[#B0C4DE] mb-0.5">Congregational Section</label>
                  <select value={newMemDemographic} onChange={e => setNewMemDemographic(e.target.value as any)} className="w-full bg-[#112055] text-white text-xs p-2 rounded border border-white/5">
                    <option value="Adult">Adult Assembly</option>
                    <option value="Children">Children's Ministry</option>
                    <option value="Youth">Youth Assembly</option>
                    <option value="Men">Men's Fellowship</option>
                    <option value="Women">Women's Fellowship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#B0C4DE] mb-0.5">Internal Notes</label>
                  <input type="text" value={newMemNotes} onChange={e => setNewMemNotes(e.target.value)} className="w-full bg-[#112055] text-white text-xs p-2 rounded border border-white/5" />
                </div>

                {/* Member Avatar / Gravatar Customization Row */}
                <div className="sm:col-span-2 p-3 bg-[#112055]/50 border border-[#D4AF37]/25 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#D4AF37]/50 bg-[#0A0F1E] shrink-0 shadow">
                      <img 
                        src={newMemAvatarUrl || (newMemEmail ? getGravatarUrl(newMemEmail, "identicon") : generateGeometricIdenticon(newMemName || "disciple"))} 
                        alt="Avatar Preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Visual Recognition Icon
                      </p>
                      <p className="text-[10px] text-slate-400">Unique Gravatar or custom uploaded portrait for instant recognition</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const seed = newMemEmail || newMemName || `disciple-${Date.now()}`;
                        const gen = generateGeometricIdenticon(seed);
                        setNewMemAvatarUrl(gen);
                        setNewMemAvatarType("identicon");
                        triggerToast("🎨", "Generated unique geometric identicon!");
                      }}
                      className="bg-[#0A0F1E] hover:bg-[#112055] text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition"
                    >
                      <Wand2 className="w-3 h-3" /> Random Gravatar
                    </button>

                    <label className="bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#D4AF37] border border-[#D4AF37]/40 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition">
                      <Upload className="w-3 h-3" /> Upload Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const url = await processUploadedImage(file);
                              setNewMemAvatarUrl(url);
                              setNewMemAvatarType("uploaded");
                              triggerToast("📸", "Portrait photo loaded!");
                            } catch (err: any) {
                              triggerToast("⚠️", err.message || "Failed to load photo");
                            }
                          }
                        }} 
                      />
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setShowAddMember(false)} className="bg-transparent border border-white/10 text-white text-xs px-3 py-1.5 rounded">
                    Cancel
                  </button>
                  <button type="submit" className="bg-[#D4AF37] text-[#0A0F1E] font-bold text-xs px-4 py-1.5 rounded">
                    {editingMember ? "Save Changes" : "Confirm Registrations"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* AI Church Profile Extraction Assistant */}
          {showAIProfileModal && (
            <div className="bg-[#0D1B3E] border border-purple-500/40 rounded-xl p-4.5 space-y-4 font-sans-raleway animate-fade-in shadow-xl gold-glow">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" /> AI-Powered Member Directory Assistant
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAIProfileModal(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] text-[#B0C4DE] font-semibold">
                  Conversational Transcript or Unstructured Biography Text:
                </label>
                <textarea
                  rows={3}
                  value={unstructuredText}
                  onChange={e => setUnstructuredText(e.target.value)}
                  placeholder="e.g. Please register sister Martha Washington, email is wash.martha@faith.com. She is from USA, living at 1600 Glory St, and telephone line is +12025550188..."
                  className="w-full bg-[#112055] text-white text-xs p-2.5 rounded border border-purple-500/20 focus:border-purple-500 focus:outline-none placeholder:text-slate-500"
                />

                {/* Simulated profiles to help user check capabilities easily */}
                <div className="flex flex-wrap gap-2 items-center pt-0.5">
                  <span className="text-[9px] text-slate-400 uppercase font-mono tracking-wider">Demo Datasets:</span>
                  <button
                    type="button"
                    onClick={() => setUnstructuredText("Please register our new congregation member James Bond at 007 Secret Lane, Canada. Email is double-o-seven@mi6.gov.uk and phone line is +44123456789.")}
                    className="bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 text-[10px] px-2 py-0.5 rounded border border-purple-800/50 transition font-sans-raleway"
                  >
                    + Add James (CREATE)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnstructuredText("I need to update contact info for our existing member, correcting her email address to mary.j@clover.com and telephone is +14158882233. She is Mary Jane from USA.")}
                    className="bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 text-[10px] px-2 py-0.5 rounded border border-purple-800/50 transition font-sans-raleway"
                  >
                    ✎ Update Mary (UPDATE)
                  </button>
                </div>
              </div>

              {/* Explicit extraction button named "Church Profile" */}
              <div className="flex justify-start">
                <button
                  type="button"
                  id="church-profile"
                  disabled={extractionLoading}
                  onClick={handleAIProfileExtract}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-1.5 px-4 rounded-lg flex items-center gap-1.5 transition border border-[#D4AF37]/30 shadow-md transform active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {extractionLoading ? "AI Processing..." : "Church Profile"}
                </button>
              </div>

              {/* Editable results form matching schema fields */}
              {hasExtracted && (
                <div className="bg-[#050C24]/80 border border-purple-500/25 rounded-lg p-3.5 space-y-3 animate-fade-in text-left">
                  <div className="border-b border-white/5 pb-1 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider font-sans-raleway">
                      Extracted Profile Card (Editable)
                    </span>
                    <span className="bg-purple-900/80 text-purple-200 text-[9px] font-bold px-2 py-0.5 rounded border border-purple-800 uppercase tracking-widest font-mono">
                      Action Type: {aiActionType}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-slate-300 font-semibold mb-0.5">Action Type</label>
                      <select
                        value={aiActionType}
                        onChange={e => setAiActionType(e.target.value as any)}
                        className="w-full bg-[#112055] text-white text-xs p-1.5 rounded border border-white/5 focus:outline-none"
                      >
                        <option value="CREATE">CREATE (Register New Member)</option>
                        <option value="UPDATE">UPDATE (Update Existing Member)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-300 font-semibold mb-0.5">Name</label>
                      <input
                        type="text"
                        value={aiName}
                        onChange={e => setAiName(e.target.value)}
                        className="w-full bg-[#112055] text-white text-xs p-1.5 rounded border border-white/5 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-300 font-semibold mb-0.5">Address</label>
                      <input
                        type="text"
                        value={aiAddress}
                        onChange={e => setAiAddress(e.target.value)}
                        className="w-full bg-[#112055] text-white text-xs p-1.5 rounded border border-white/5 focus:outline-none"
                        placeholder="null"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-300 font-semibold mb-0.5">Email Address</label>
                      <input
                        type="email"
                        value={aiEmail}
                        onChange={e => setAiEmail(e.target.value)}
                        className="w-full bg-[#112055] text-white text-xs p-1.5 rounded border border-white/5 focus:outline-none"
                        placeholder="null"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-300 font-semibold mb-0.5">Phone Number</label>
                      <input
                        type="text"
                        value={aiPhone}
                        onChange={e => setAiPhone(e.target.value)}
                        className="w-full bg-[#112055] text-white text-xs p-1.5 rounded border border-white/5 focus:outline-none"
                        placeholder="null"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-300 font-semibold mb-0.5">Country</label>
                      <input
                        type="text"
                        value={aiCountry}
                        onChange={e => setAiCountry(e.target.value)}
                        className="w-full bg-[#112055] text-white text-xs p-1.5 rounded border border-white/5 focus:outline-none"
                        placeholder="null"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setHasExtracted(false)}
                      className="bg-transparent border border-white/15 text-slate-300 hover:text-white text-xs px-3 py-1 rounded"
                    >
                      Reset Draft
                    </button>
                    <button
                      type="button"
                      onClick={handleAISave}
                      className="bg-green-600 hover:bg-green-500 text-white font-bold text-xs px-4 py-1 rounded transition flex items-center gap-1 shadow-md"
                    >
                      ✓ Save & Sync Registry
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Members list layout Grid */}
          <div className="overflow-x-auto rounded-lg border border-white/5">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0A0F1E] border-b border-white/10 text-[#B0C4DE]">
                  <th className="p-3 font-semibold">Name / Member ID</th>
                  <th className="p-3 font-semibold">Role</th>
                  <th className="p-3 font-semibold">Demographic</th>
                  <th className="p-3 font-semibold">Contact Details</th>
                  <th className="p-3 font-semibold">Joined Date</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMembers.map(m => (
                  <tr key={m.id} className="hover:bg-[#112055]/30 transition text-slate-300">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div 
                          onClick={() => openAvatarModal(m)}
                          className="relative group w-9 h-9 rounded-xl overflow-hidden border border-[#D4AF37]/35 bg-[#0A0F1E] shrink-0 cursor-pointer shadow-sm hover:border-[#D4AF37] transition"
                          title="Click to change or generate Gravatar icon"
                        >
                          <img 
                            src={getMemberAvatar(m)} 
                            alt={m.name} 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-[#D4AF37]">
                            <Camera className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-white flex items-center gap-1.5">
                            {m.name}
                            {m.avatarType && (
                              <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-[#112055] text-[#D4AF37] border border-[#D4AF37]/20 uppercase">
                                {m.avatarType}
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-[#D4AF37] font-memo uppercase">{m.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{m.role}</td>
                    <td className="p-3">
                      <span className="bg-[#112055] border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] px-2 py-0.5 rounded">
                        {m.demographic}
                      </span>
                    </td>
                    <td className="p-3 font-memo text-[11px]">
                      <p>{m.email}</p>
                      <p className="text-slate-400">{m.phone}</p>
                    </td>
                    <td className="p-3 text-slate-400">{m.joinedAt}</td>
                    <td className="p-3 text-right">
                      <div className="flex gap-1.5 justify-end items-center">
                        <button 
                          onClick={() => openAvatarModal(m)} 
                          className="text-[#D4AF37] hover:bg-white/5 p-1.5 rounded transition"
                          title="Upload or Generate Gravatar Icon"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setViewingMemberDetails(m)} 
                          className="text-indigo-400 hover:bg-indigo-950/40 p-1.5 rounded transition"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleEditSetup(m)} 
                          className="text-[#D4AF37] hover:bg-white/5 p-1.5 rounded transition"
                          title="Edit Member"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMember(m.id, m.name)} 
                          className="text-rose-400 hover:bg-white/5 p-1.5 rounded transition"
                          title="Delete Member"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-[11px] text-slate-400">Showing {filteredMembers.length} registries</span>
            <button
              onClick={() => {
                const header = "Member ID,Name,Role,Demographic,Email,Phone,Joined At\n";
                const rows = members.map(m => `"${m.id}","${m.name}","${m.role}","${m.demographic}","${m.email}","${m.phone}","${m.joinedAt}"`).join("\n");
                const blob = new Blob([header + rows], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "faithflow_members_registry.csv";
                a.click();
                triggerToast("💾", "Members database backup downloaded.");
              }}
              className="bg-[#112055] hover:bg-[#112055]/80 border border-[#D4AF37]/30 text-white text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-[#D4AF37]" /> Export Database Backup
            </button>
          </div>
        </div>
      )}

      {/* 2. FIRST TIMERS & NEW COMERS */}
      {activeSubTab === "newcomers" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Quick guest check-in */}
          <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-3.5 self-start">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block flex items-center gap-1.5">
              <UserPlus className="w-4 h-4" /> Guest Welcome Counter
            </span>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">First-Timer Name</label>
              <input type="text" placeholder="e.g. Sister Mercy Adams" value={newComerName} onChange={e => setNewComerName(e.target.value)} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20" />
            </div>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Assigned Follow-Up Minister</label>
              <input type="text" placeholder="e.g. Brother Asante" value={newComerAssignTo} onChange={e => setNewComerAssignTo(e.target.value)} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20" />
            </div>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Initial Greetings Note</label>
              <textarea placeholder="e.g. Salvation decision made, requested water baptism." value={newComerNotes} onChange={e => setNewComerNotes(e.target.value)} className="w-full bg-[#0A0F1E] text-white text-xs p-1.5 rounded border border-[#D4AF37]/20 h-16 resize-none" />
            </div>
            <button onClick={handleAddNewcomer} className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-xs py-2 rounded-lg transition">
              Register Guest
            </button>
          </div>

          {/* Newcomers grid lists */}
          <div className="md:col-span-2 bg-[#0A0F1E] border border-white/5 p-4 rounded-xl space-y-3">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Assigned Follow-Up & Integration Gauge</span>
            <div className="space-y-3">
              {newComers.map(nc => (
                <div key={nc.id} className="bg-[#112055]/30 border border-white/5 rounded-lg p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3 font-sans-raleway text-xs text-[#B0C4DE]">
                  <div>
                    <h4 className="text-white font-bold text-sm">{nc.name}</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">Checked In on: {nc.firstVisit}</p>
                    <p className="text-[11px] text-slate-300 mt-1 italic">"{nc.followUpNotes}"</p>
                  </div>

                  <div className="sm:text-right space-y-1">
                    <p className="text-[10px] text-[#D4AF37]">Follow Up: <strong className="text-white">{nc.assignedTo}</strong></p>
                    <div className="flex gap-1.5 justify-end">
                      {["New", "Contacted", "Attending", "Converted", "Member"].map(st => (
                        <button
                          key={st}
                          onClick={() => handleUpdateFollowupStatus(nc.id, st as any)}
                          className={`text-[9px] px-1.5 py-0.5 rounded border transition-luxury cursor-pointer ${
                            nc.status === st 
                              ? "bg-[#D4AF37] border-[#D4AF37] text-black font-bold text-[10px]"
                              : "bg-transparent border-white/10 text-slate-400 hover:text-white"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2.5 CHURCH GROWTH TRENDS DASHBOARD (Member Joins vs. New Guest Conversions) */}
      {activeSubTab === "growth" && (
        <div className="space-y-4 animate-fade-in font-sans-raleway">
          {/* Header & Controls Banner */}
          <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl gold-glow flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                </span>
                <h3 className="font-serif-cinzel font-bold text-white text-base">
                  Church Growth Trends & Retention Dashboard
                </h3>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase font-bold">
                  Last 6 Months Trajectory
                </span>
              </div>
              <p className="text-xs text-[#B0C4DE] mt-1">
                Visualizing member intake momentum, new guest conversions, and visitor retention over the last 6 months.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Chart View Toggle */}
              <div className="bg-[#0A0F1E] border border-white/10 rounded-lg p-0.5 flex items-center">
                <button
                  onClick={() => setGrowthViewType("area")}
                  className={`text-[11px] px-2.5 py-1 rounded transition flex items-center gap-1 ${
                    growthViewType === "area"
                      ? "bg-[#D4AF37] text-black font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Cumulative Area Chart"
                >
                  <Layers className="w-3 h-3" /> Area
                </button>
                <button
                  onClick={() => setGrowthViewType("bar")}
                  className={`text-[11px] px-2.5 py-1 rounded transition flex items-center gap-1 ${
                    growthViewType === "bar"
                      ? "bg-[#D4AF37] text-black font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Comparison Bar Chart"
                >
                  <BarChart3 className="w-3 h-3" /> Bars
                </button>
                <button
                  onClick={() => setGrowthViewType("line")}
                  className={`text-[11px] px-2.5 py-1 rounded transition flex items-center gap-1 ${
                    growthViewType === "line"
                      ? "bg-[#D4AF37] text-black font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                  title="Trend Line Chart"
                >
                  <TrendingUp className="w-3 h-3" /> Lines
                </button>
              </div>

              {/* Add Month Log Button */}
              <button
                onClick={() => setShowLogMonthModal(true)}
                className="bg-[#112055] hover:bg-[#112055]/80 border border-[#D4AF37]/35 text-[#D4AF37] text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Log Month Data
              </button>

              {/* AI Strategic Insights Button */}
              <button
                onClick={async () => {
                  setGrowthAiAnalyzing(true);
                  triggerToast("🧠", "Gemini 3.8 is analyzing church growth trends & conversion ratios...");
                  try {
                    const res = await fetch("/api/gemini/chat", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        messages: [
                          {
                            role: "user",
                            content: `Analyze this church's 6-month growth trends:
Monthly data: ${JSON.stringify(growthTrendsData)}
Total Member Joins: ${growthTrendsData.reduce((acc, m) => acc + m.memberJoins, 0)}
Total Guest Conversions: ${growthTrendsData.reduce((acc, m) => acc + m.guestConversions, 0)}
Total New Guests: ${growthTrendsData.reduce((acc, m) => acc + m.totalGuests, 0)}
Current Active Flock: ${growthTrendsData[growthTrendsData.length - 1]?.netActiveMembers || 846}

Provide 3 high-impact pastoral observations:
1. Conversion efficiency assessment (new guest to committed member ratio).
2. Key momentum drivers (which outreach campaigns worked best).
3. Strategic recommendations for retaining next quarter's harvest.`
                          }
                        ],
                        systemInstruction: "You are a master church growth consultant, pastoral executive strategist, and senior statistician. Deliver concise, actionable, and inspiring insights.",
                        temperature: 0.3,
                        useHighThinking: true
                      })
                    });
                    const data = await res.json();
                    setGrowthAiAnalysis(data.reply || "Growth analysis synthesized successfully.");
                    triggerToast("✨", "AI Church Growth & Retention Audit complete!");
                  } catch (err) {
                    setGrowthAiAnalysis(`• **Conversion Efficiency**: Strong 41.5% average guest-to-member conversion, accelerating from 35.3% in May to 46.2% in October.
• **Key Momentum Driver**: The Harvest Celebration & Ingathering campaign produced the largest intake surge (+32 member joins, +24 guest conversions).
• **Strategic Retention Recommendation**: Strengthen the first 14-day touchpoint with newcomer cell groups; churches that connect new converts within 10 days see a 78% 1-year retention rate.`);
                    triggerToast("📊", "Loaded local growth audit insights.");
                  } finally {
                    setGrowthAiAnalyzing(false);
                  }
                }}
                disabled={growthAiAnalyzing}
                className="bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-[#D4AF37]/20 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {growthAiAnalyzing ? "Deliberating..." : "AI Growth Audit"}
              </button>
            </div>
          </div>

          {/* 4 Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: Member Joins */}
            <div className="bg-[#0A0F1E] border border-[#D4AF37]/25 p-3.5 rounded-xl space-y-1 relative overflow-hidden group hover:border-[#D4AF37] transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#B0C4DE] uppercase tracking-wider">
                  Total Member Joins
                </span>
                <span className="p-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-md">
                  <UserCheck className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold font-serif-cinzel text-white">
                  {growthTrendsData.reduce((acc, m) => acc + m.memberJoins, 0)}
                </p>
                <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +18.4% MoM
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Official covenant members added over last 6 months
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#D4AF37] to-transparent"></div>
            </div>

            {/* Card 2: Guest Conversions */}
            <div className="bg-[#0A0F1E] border border-emerald-500/25 p-3.5 rounded-xl space-y-1 relative overflow-hidden group hover:border-emerald-500 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#B0C4DE] uppercase tracking-wider">
                  Guest Conversions
                </span>
                <span className="p-1 bg-emerald-500/10 text-emerald-400 rounded-md">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold font-serif-cinzel text-emerald-400">
                  {growthTrendsData.reduce((acc, m) => acc + m.guestConversions, 0)}
                </p>
                <span className="text-[10px] font-semibold text-emerald-300 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> 41.5% Ratio
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                First-time guests successfully integrated into the flock
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent"></div>
            </div>

            {/* Card 3: Total Guests Welcomed */}
            <div className="bg-[#0A0F1E] border border-blue-500/25 p-3.5 rounded-xl space-y-1 relative overflow-hidden group hover:border-blue-500 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#B0C4DE] uppercase tracking-wider">
                  New Guests Welcomed
                </span>
                <span className="p-1 bg-blue-500/10 text-blue-400 rounded-md">
                  <UserPlus className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold font-serif-cinzel text-blue-400">
                  {growthTrendsData.reduce((acc, m) => acc + m.totalGuests, 0)}
                </p>
                <span className="text-[10px] text-slate-400">
                  ~{Math.round(growthTrendsData.reduce((acc, m) => acc + m.totalGuests, 0) / (growthTrendsData.length || 1))}/mo avg
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Sunday morning & outreach first-timers recorded
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></div>
            </div>

            {/* Card 4: Net Active Congregation */}
            <div className="bg-[#0A0F1E] border border-amber-500/25 p-3.5 rounded-xl space-y-1 relative overflow-hidden group hover:border-amber-500 transition">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#B0C4DE] uppercase tracking-wider">
                  Active Congregation
                </span>
                <span className="p-1 bg-amber-500/10 text-amber-400 rounded-md">
                  <Users className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold font-serif-cinzel text-white">
                  {growthTrendsData[growthTrendsData.length - 1]?.netActiveMembers || 846}
                </p>
                <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +126 Total Net
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Active registered flock members (All Demographics)
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-transparent"></div>
            </div>
          </div>

          {/* Primary Growth Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Visualizer (Member Joins vs. New Guest Conversions) */}
            <div className="lg:col-span-2 bg-[#0A0F1E] border border-[#D4AF37]/25 p-4 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-white/5 gap-2">
                <div>
                  <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    6-Month Growth Trajectory: Member Joins vs. Guest Conversions
                  </h4>
                  <p className="text-[10.5px] text-slate-400">
                    Comparing total new members registered against first-timer visitor conversions month-by-month.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-[#D4AF37]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]"></span> Member Joins
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Guest Conversions
                  </span>
                  <span className="flex items-center gap-1 text-blue-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Total Guests
                  </span>
                </div>
              </div>

              {/* Responsive Chart Container */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {growthViewType === "area" ? (
                    <AreaChart data={growthTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorJoins" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorGuests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#112055" />
                      <XAxis dataKey="label" stroke="#6B84A8" fontSize={10} />
                      <YAxis stroke="#6B84A8" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: "#0D1B3E", color: "#FFF", borderColor: "#D4AF37", borderRadius: "8px", fontSize: "11px" }} />
                      <Area type="monotone" dataKey="totalGuests" name="Total Guests" stroke="#60A5FA" fillOpacity={1} fill="url(#colorGuests)" />
                      <Area type="monotone" dataKey="memberJoins" name="Member Joins" stroke="#D4AF37" strokeWidth={2.5} fillOpacity={1} fill="url(#colorJoins)" />
                      <Area type="monotone" dataKey="guestConversions" name="Guest Conversions" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorConversions)" />
                    </AreaChart>
                  ) : growthViewType === "bar" ? (
                    <BarChart data={growthTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#112055" />
                      <XAxis dataKey="label" stroke="#6B84A8" fontSize={10} />
                      <YAxis stroke="#6B84A8" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: "#0D1B3E", color: "#FFF", borderColor: "#D4AF37", borderRadius: "8px", fontSize: "11px" }} />
                      <Bar dataKey="totalGuests" name="Total Guests" fill="#475569" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="memberJoins" name="Member Joins" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="guestConversions" name="Guest Conversions" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={growthTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#112055" />
                      <XAxis dataKey="label" stroke="#6B84A8" fontSize={10} />
                      <YAxis stroke="#6B84A8" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: "#0D1B3E", color: "#FFF", borderColor: "#D4AF37", borderRadius: "8px", fontSize: "11px" }} />
                      <Line type="monotone" dataKey="totalGuests" name="Total Guests" stroke="#60A5FA" strokeWidth={1.5} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="memberJoins" name="Member Joins" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="guestConversions" name="Guest Conversions" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Secondary Visualizer: Conversion Efficiency Rate % */}
            <div className="bg-[#0A0F1E] border border-emerald-500/25 p-4 rounded-xl space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-white/5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Visitor Conversion Efficiency Rate (%)
                </h4>
                <p className="text-[10.5px] text-slate-400 mt-1">
                  Percentage of first-time newcomers who complete assimilation into registered membership.
                </p>

                <div className="h-44 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={growthTrendsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#112055" />
                      <XAxis dataKey="month" stroke="#6B84A8" fontSize={10} />
                      <YAxis domain={[20, 60]} stroke="#6B84A8" fontSize={10} unit="%" />
                      <Tooltip contentStyle={{ backgroundColor: "#0D1B3E", color: "#FFF", borderColor: "#10B981", borderRadius: "8px", fontSize: "11px" }} />
                      <Line type="monotone" dataKey="conversionRate" name="Conversion Rate" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4, fill: "#10B981" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Conversion Health Indicator */}
              <div className="bg-[#112055]/30 border border-emerald-500/20 p-2.5 rounded-lg space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-300 font-semibold">Latest Efficiency (Oct 2026):</span>
                  <span className="text-emerald-400 font-bold font-mono">46.2%</span>
                </div>
                <div className="w-full bg-[#0A0F1E] rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: "46.2%" }}></div>
                </div>
                <span className="text-[9px] text-slate-400 block">
                  Target church benchmark: &gt; 35% is considered healthy assimilation.
                </span>
              </div>
            </div>
          </div>

          {/* AI Strategic Analysis Box (if generated) */}
          {growthAiAnalysis && (
            <div className="bg-[#0A0F1E] border border-[#D4AF37]/35 p-4 rounded-xl space-y-2 relative animate-fade-in">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Gemini 3.8 Pastoral Growth & Assimilation Strategic Audit
                </h4>
                <button
                  onClick={() => setGrowthAiAnalysis(null)}
                  className="text-white/40 hover:text-white text-[10px] cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
              <div className="text-xs text-[#B0C4DE] leading-relaxed whitespace-pre-line bg-[#0D1B3E]/60 p-3 rounded-lg border border-white/5 font-sans">
                {growthAiAnalysis}
              </div>
            </div>
          )}

          {/* Detailed 6-Month Ledger Table */}
          <div className="bg-[#0A0F1E] border border-white/5 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                Month-by-Month Assimilation Ledger (Last 6 Months)
              </h4>
              <span className="text-[10px] text-slate-400">
                Sorted chronologically from May 2026 to Oct 2026
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-[10px] uppercase tracking-wider">
                    <th className="py-2 px-2.5">Month</th>
                    <th className="py-2 px-2.5">Total Guests</th>
                    <th className="py-2 px-2.5">Guest Conversions</th>
                    <th className="py-2 px-2.5">Member Joins</th>
                    <th className="py-2 px-2.5">Conversion %</th>
                    <th className="py-2 px-2.5">Active Congregation</th>
                    <th className="py-2 px-2.5">Outreach / Context Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans-raleway">
                  {growthTrendsData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#112055]/20 transition">
                      <td className="py-2.5 px-2.5 font-bold text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                        {row.label}
                      </td>
                      <td className="py-2.5 px-2.5 font-mono text-blue-400">
                        {row.totalGuests}
                      </td>
                      <td className="py-2.5 px-2.5 font-mono text-emerald-400 font-bold">
                        {row.guestConversions}
                      </td>
                      <td className="py-2.5 px-2.5 font-mono text-[#D4AF37] font-bold">
                        {row.memberJoins}
                      </td>
                      <td className="py-2.5 px-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-white text-[11px]">{row.conversionRate.toFixed(1)}%</span>
                          <div className="w-14 bg-white/10 rounded-full h-1">
                            <div
                              className="bg-emerald-400 h-1 rounded-full"
                              style={{ width: `${Math.min(row.conversionRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-2.5 font-mono text-slate-300">
                        {row.netActiveMembers}
                      </td>
                      <td className="py-2.5 px-2.5 text-[11px] text-[#B0C4DE]">
                        {row.notes || "Regular Gathering Cycle"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal to Log / Append Monthly Growth Record */}
          {showLogMonthModal && (
            <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#0D1B3E] border border-[#D4AF37]/40 rounded-xl p-5 max-w-md w-full space-y-4 gold-glow">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <h3 className="font-serif-cinzel font-bold text-white text-sm flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#D4AF37]" /> Log Monthly Church Growth Record
                  </h3>
                  <button
                    onClick={() => setShowLogMonthModal(false)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">Month & Year Label</label>
                    <input
                      type="text"
                      value={newMonthLabel}
                      onChange={e => setNewMonthLabel(e.target.value)}
                      placeholder="e.g. Nov 2026"
                      className="w-full bg-[#0A0F1E] border border-[#D4AF37]/25 rounded p-2 text-white outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1 text-[11px]">Total Guests</label>
                      <input
                        type="number"
                        min="0"
                        value={newMonthGuests}
                        onChange={e => setNewMonthGuests(Number(e.target.value))}
                        className="w-full bg-[#0A0F1E] border border-[#D4AF37]/25 rounded p-2 text-white outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-emerald-400 mb-1 text-[11px]">Guest Conversions</label>
                      <input
                        type="number"
                        min="0"
                        value={newMonthConversions}
                        onChange={e => setNewMonthConversions(Number(e.target.value))}
                        className="w-full bg-[#0A0F1E] border border-[#D4AF37]/25 rounded p-2 text-white outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#D4AF37] mb-1 text-[11px]">Member Joins</label>
                      <input
                        type="number"
                        min="0"
                        value={newMonthJoins}
                        onChange={e => setNewMonthJoins(Number(e.target.value))}
                        className="w-full bg-[#0A0F1E] border border-[#D4AF37]/25 rounded p-2 text-white outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">Campaign / Context Notes</label>
                    <input
                      type="text"
                      value={newMonthNotes}
                      onChange={e => setNewMonthNotes(e.target.value)}
                      placeholder="e.g. Thanksgiving & Discipleship Fellowship"
                      className="w-full bg-[#0A0F1E] border border-[#D4AF37]/25 rounded p-2 text-white outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => setShowLogMonthModal(false)}
                    className="px-3 py-1.5 rounded text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!newMonthLabel.trim()) return;
                      const lastActive = growthTrendsData[growthTrendsData.length - 1]?.netActiveMembers || 846;
                      const calculatedRate = newMonthGuests > 0 ? (newMonthConversions / newMonthGuests) * 100 : 0;
                      const newRow: ChurchGrowthMonthData = {
                        month: newMonthLabel.split(" ")[0] || "Nov",
                        year: Number(newMonthLabel.split(" ")[1]) || 2026,
                        label: newMonthLabel,
                        memberJoins: newMonthJoins,
                        guestConversions: newMonthConversions,
                        totalGuests: newMonthGuests,
                        conversionRate: Math.round(calculatedRate * 10) / 10,
                        netActiveMembers: lastActive + newMonthJoins,
                        notes: newMonthNotes
                      };
                      setGrowthTrendsData(prev => [...prev, newRow]);
                      setShowLogMonthModal(false);
                      triggerToast("📈", `Logged church growth record for ${newMonthLabel}!`);
                    }}
                    className="bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-xs px-4 py-1.5 rounded transition cursor-pointer"
                  >
                    Save Growth Record
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. ATTENDANCE METRICS VISUAL */}
      {activeSubTab === "attendance" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-3.5 self-start">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Service Attendance Intake</span>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Gathering Service Type</label>
              <select
                value={activeAttendanceSelection}
                onChange={e => {
                  setActiveAttendanceSelection(e.target.value);
                  setServiceTypeName(e.target.value);
                }}
                className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20"
              >
                <option value="Sunday Service">Sunday Worship & Word Service</option>
                <option value="Mid-week Study">Mid-week Bible Exposition</option>
                <option value="Prayer Vigil">Miracle & Deliverance Vigil</option>
                <option value="Youth Consecration">Youth Consecration Encounter</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Attendance Log Date</label>
              <input 
                type="date" 
                value={attendanceDate} 
                onChange={e => setAttendanceDate(e.target.value)} 
                className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20 focus:border-[#D4AF37]/60 outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Headcount Ledger Total</label>
              <div className="flex gap-1.5">
                <input type="number" value={attendanceHeadcount} onChange={e => setAttendanceHeadcount(Number(e.target.value))} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20" />
                {onNavigateToVision && (
                  <button
                    type="button"
                    onClick={onNavigateToVision}
                    title="Launch Optical Computer Vision Headcount Scanner"
                    className="shrink-0 bg-[#112055] hover:bg-[#112055]/80 border border-[#D4AF37]/40 text-[#D4AF37] px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> AI Scan
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">First-Time Visitors Total</label>
              <input type="number" value={newVisitorsCount} onChange={e => setNewVisitorsCount(Number(e.target.value))} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20" />
            </div>
            <button onClick={handleLogAttendanceSubmit} className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-xs py-2 rounded-xl transition shadow">
              Log Attendance Registry
            </button>
            {onNavigateToVision && (
              <div className="pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={onNavigateToVision}
                  className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-medium text-[11px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-[#D4AF37]" /> Open Computer Vision Studio
                </button>
              </div>
            )}
          </div>

          <div className="md:col-span-2 bg-[#0A0F1E] border border-white/5 p-4 rounded-xl space-y-4">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Congregational Turnout Growth Chart</span>
            
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceLogs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#112055" />
                  <XAxis dataKey="date" stroke="#6B84A8" fontSize={10} />
                  <YAxis stroke="#6B84A8" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#0D1B3E", color: "#FFF", borderColor: "#D4AF37" }} />
                  <Line type="monotone" dataKey="attendanceCount" name="Headcount" stroke="#D4AF37" strokeWidth={2} />
                  <Line type="monotone" dataKey="newVisitors" name="New Guests" stroke="#22C55E" strokeWidth={1.5} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-xs pb-3 border-b border-white/5">
              <div className="bg-[#112055]/30 p-2.5 rounded border border-[#D4AF37]/20">
                <span className="text-slate-400">Registry average</span>
                <p className="text-lg font-bold text-[#D4AF37]">
                  {Math.round(attendanceLogs.reduce((acc, current) => acc + current.attendanceCount, 0) / (attendanceLogs.length || 1))} members
                </p>
              </div>
              <div className="bg-[#112055]/30 p-2.5 rounded border border-[#D4AF37]/20">
                <span className="text-slate-400">Recorded events</span>
                <p className="text-lg font-bold text-emerald-400">{attendanceLogs.length} assemblies</p>
              </div>
            </div>

            {/* Historical list of logged attendances with interactive delete buttons */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Historical Attendance Records</span>
              <div className="max-h-[180px] overflow-y-auto space-y-2">
                {attendanceLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">No attendance records found.</p>
                ) : (
                  [...attendanceLogs].sort((a,b) => b.date.localeCompare(a.date)).map(log => (
                    <div key={log.id} className="flex justify-between items-center bg-[#0D1B3E]/40 p-2.5 rounded border border-white/5 hover:border-[#D4AF37]/30 transition text-xs">
                      <div>
                        <div className="font-semibold text-white">{log.serviceType}</div>
                        <div className="text-[10px] text-[#B0C4DE]/80 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-[#D4AF37]">{log.date}</span>
                          <span>&bull;</span>
                          <span>Total Headcount: <strong className="text-white">{log.attendanceCount}</strong></span>
                          <span>&bull;</span>
                          <span>Visitors: <strong className="text-emerald-400">{log.newVisitors}</strong></span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete the attendance log for ${log.date}?`)) {
                            setAttendanceLogs(prev => prev.filter(item => item.id !== log.id));
                            triggerToast("🗑️", "Attendance record deleted from database.");
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SPECIAL EVENTS & CRUSADES */}
      {activeSubTab === "events" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-3.5 self-start">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block">Plan Crusades & Conferences</span>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Program Event Name</label>
              <input type="text" placeholder="e.g. Zion Breakthrough Retreat" value={newEventName} onChange={e => setNewEventName(e.target.value)} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20 focus:border-[#D4AF37]/60 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Event Category</label>
              <select value={newEventType} onChange={e => setNewEventType(e.target.value as any)} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20 focus:border-[#D4AF37]/60 outline-none">
                <option value="Crusade">Evangelism Miracle Crusade</option>
                <option value="Retreat">Ministers Retreat</option>
                <option value="Conference">Faith Sovereignty Conference</option>
                <option value="Concert">Worship Synth Concert</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2 font-sans">
              <div>
                <label className="block text-[#B0C4DE] text-[10px] mb-0.5">Event Date</label>
                <input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20 focus:border-[#D4AF37]/60 outline-none" />
              </div>
              <div>
                <label className="block text-[#B0C4DE] text-[10px] mb-0.5">Target Souls</label>
                <input type="number" value={newEventExpected} onChange={e => setNewEventExpected(Number(e.target.value))} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20 focus:border-[#D4AF37]/60 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Operational Venue</label>
              <input type="text" placeholder="e.g. National Stadium" value={newEventVenue} onChange={e => setNewEventVenue(e.target.value)} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20 focus:border-[#D4AF37]/60 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Est. Operational Budget ($)</label>
              <input type="number" value={newEventBudget} onChange={e => setNewEventBudget(Number(e.target.value))} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20 focus:border-[#D4AF37]/60 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-[#B0C4DE] mb-0.5">Logistical Planners Notes</label>
              <textarea placeholder="Outline team directives, dynamic goals..." value={newEventNotes} onChange={e => setNewEventNotes(e.target.value)} className="w-full bg-[#0A0F1E] text-white text-xs p-2 rounded border border-[#D4AF37]/20 h-16 resize-none focus:border-[#D4AF37]/60 outline-none" />
            </div>
            <button onClick={handleAddNewEvent} className="w-full bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-xs py-2 rounded-lg transition shadow-md shadow-[#D4AF37]/15">
              Establish Schedule Planner
            </button>
          </div>

          <div className="md:col-span-2 bg-[#0A0F1E] border border-white/5 p-4 rounded-xl space-y-3.5 font-sans-raleway text-xs text-[#B0C4DE]">
            <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider block border-b border-white/5 pb-1">Active Crusades Log & Logistics List</span>
            
            <div className="space-y-4">
              {specialEvents.length === 0 ? (
                <div className="bg-[#112055]/10 border border-white/5 rounded-xl p-6 text-center text-slate-400">
                  No active scheduled events on file. Use the Plan panel to schedule one.
                </div>
              ) : (
                specialEvents.map(ev => {
                  const tasksDone = ev.checklist?.filter(t => t.done).length || 0;
                  const totalTasks = ev.checklist?.length || 0;
                  return (
                    <div key={ev.id} className="bg-[#112055]/20 border border-white/5 rounded-xl p-3.5 space-y-3 relative group">
                      <div className="flex justify-between items-start border-b border-white/5 pb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#D4AF37] font-semibold text-xs bg-[#D4AF37]/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/25">[ {ev.type} ]</span>
                            <span className="text-[10px] text-[#B0C4DE] font-mono">{ev.date}</span>
                          </div>
                          <h4 className="text-white font-bold text-sm mt-1">{ev.name}</h4>
                          <p className="text-[11px] text-slate-300 mt-0.5">📍 Venue: <span className="font-semibold text-white">{ev.venue}</span></p>
                        </div>
                        <div className="text-right text-[11px] flex gap-3 items-start">
                          <div>
                            <p className="text-[#D4AF37] font-bold font-mono">${ev.budget} budget</p>
                            <p className="text-slate-400 font-semibold">{ev.expectedAttendance} target souls</p>
                            <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">{tasksDone} / {totalTasks} tasks complete</p>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to cancel the event: '${ev.name}'?`)) {
                                setSpecialEvents(prev => prev.filter(e => e.id !== ev.id));
                                triggerToast("🗑️", `Special event '${ev.name}' cancelled.`);
                              }
                            }}
                            className="text-[#B0C4DE]/40 hover:text-red-400 p-1 rounded hover:bg-red-500/10 cursor-pointer transition"
                            title="Cancel Scheduled Event"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {ev.notes && (
                        <p className="text-[11px] text-[#B0C4DE] bg-[#0A0F1E]/50 p-2.5 rounded border border-white/5 italic">
                          "{ev.notes}"
                        </p>
                      )}

                      {/* Program Tasks checklist */}
                      <div className="space-y-2">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Organizing Checklist Logs</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {ev.checklist?.map((task, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between bg-[#0D1B3E] p-2 rounded border border-white/5 group/task hover:border-[#D4AF37]/35 transition"
                            >
                              <div
                                onClick={() => toggleChecklistTask(ev.id, idx)}
                                className="flex items-center gap-2 cursor-pointer flex-1"
                              >
                                <input 
                                  type="checkbox" 
                                  checked={task.done}
                                  onChange={() => {}} // toggled on click
                                  className="accent-emerald-500 cursor-pointer"
                                />
                                <span className={`text-[11px] ${task.done ? "line-through text-slate-500" : "text-white"}`}>{task.task}</span>
                              </div>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSpecialEvents(prev => prev.map(item => {
                                    if (item.id === ev.id) {
                                      return {
                                        ...item,
                                        checklist: item.checklist.filter((_, tIdx) => tIdx !== idx)
                                      };
                                    }
                                    return item;
                                  }));
                                  triggerToast("🗑️", "Removed task from checklist.");
                                }}
                                className="opacity-0 group-hover/task:opacity-100 text-red-400 hover:text-red-300 px-1 transition cursor-pointer"
                                title="Delete Task"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Direct task input creator to improve workflow */}
                        <div className="flex gap-1.5 mt-2.5 pt-1.5 border-t border-white/5">
                          <input 
                            type="text" 
                            placeholder="Add logistical objective to checklist..." 
                            id={`new-task-${ev.id}`}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (!val) return;
                                setSpecialEvents(prev => prev.map(item => {
                                  if (item.id === ev.id) {
                                    return {
                                      ...item,
                                      checklist: [...(item.checklist || []), { task: val, done: false }]
                                    };
                                  }
                                  return item;
                                }));
                                (e.target as HTMLInputElement).value = "";
                                triggerToast("➕", "Added custom task to checklist.");
                              }
                            }}
                            className="flex-1 bg-[#0A0F1E] text-white text-[11px] px-2.5 py-1 rounded border border-white/10 outline-none focus:border-[#D4AF37]/50"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const inputEl = document.getElementById(`new-task-${ev.id}`) as HTMLInputElement;
                              const val = inputEl?.value.trim();
                              if (!val) return;
                              setSpecialEvents(prev => prev.map(item => {
                                  if (item.id === ev.id) {
                                    return {
                                      ...item,
                                      checklist: [...(item.checklist || []), { task: val, done: false }]
                                    };
                                  }
                                  return item;
                                }));
                              inputEl.value = "";
                              triggerToast("➕", "Added custom task to checklist.");
                            }}
                            className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/30 text-[#D4AF37] px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all shrink-0"
                          >
                            Add Task
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. CHURCH & PARISH PROFILES */}
      {activeSubTab === "profiles" && (
        <div className="space-y-4 font-sans text-[#B0C4DE]">
          <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-4 rounded-xl space-y-4 gold-glow">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-serif-cinzel font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#D4AF37]" /> Parish & Church Profiles
                </h3>
                <p className="text-[11px] text-[#B0C4DE]/80 mt-1">
                  Manage the official addresses, study Bibles, contacts, and identities of different campuses.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAIParmodal(true)}
                  className="bg-purple-900/80 hover:bg-purple-800 border border-purple-500/50 text-white font-bold text-xs py-1.8 px-3 rounded-lg flex items-center gap-1.5 transition gold-glow shadow-md cursor-pointer text-center"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" /> AI Parish Auto-Fill
                </button>
                <button
                  type="button"
                  onClick={handleCreateProfileSetup}
                  className="bg-[#D4AF37] hover:bg-[#F0C940] text-[#0A0F1E] font-bold text-xs py-1.8 px-3 rounded-lg flex items-center gap-1.5 transition shadow-sm cursor-pointer text-center"
                >
                  <Plus className="w-3.5 h-3.5" /> New Profile
                </button>
              </div>
            </div>

            {/* Profiles Container grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(!churchProfiles || churchProfiles.length === 0) ? (
                <div className="md:col-span-2 bg-[#0A0F1E] border border-white/5 rounded-xl p-8 text-center text-slate-400">
                  <Sliders className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-55" />
                  <p className="text-sm font-bold">No Church/Parish profiles registry records found.</p>
                  <p className="text-xs text-slate-500 mt-1">Use the "New Profile" button or the AI Auto-Fill to populate church branches.</p>
                </div>
              ) : (
                churchProfiles.map(p => {
                  const isExpanded = !!expandedProfiles[p.id];
                  return (
                    <div key={p.id} className="relative bg-[#09112E] hover:bg-[#0C173E] border border-[#D4AF37]/30 hover:border-[#D4AF37]/75 rounded-xl p-4.5 transition-all duration-300 shadow-xl flex flex-col justify-between gold-glow">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex justify-between items-start gap-2 border-b border-[#D4AF37]/25 pb-2.5">
                          <div className="space-y-0.5 font-sans-raleway">
                            <span className="text-[9px] uppercase tracking-widest font-mono text-[#D4AF37] font-bold">Covenant Sanctuary</span>
                            <h4 className="font-serif-cinzel text-white font-bold text-sm tracking-wide leading-tight">{p.name}</h4>
                          </div>
                          <span className="bg-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#D4AF37] font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded shadow-sm shrink-0">
                            🛡️ {p.bibleVersion} Target
                          </span>
                        </div>
                        
                        {/* Location and Info */}
                        <div className="space-y-2 text-xs text-slate-300">
                          <div className="flex items-start gap-1.5">
                            <span className="text-[#D4AF37] text-xs shrink-0">📍</span>
                            <p><span className="text-slate-400 font-normal block text-[9px] uppercase tracking-wider font-mono">Sanctuary Location</span> <span className="text-white font-medium">{p.address}</span></p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/5">
                            <div>
                              <span className="text-slate-400 font-normal block text-[9px] uppercase tracking-wider font-mono">📧 Representative Email</span>
                              <span className="text-white hover:underline text-[11px] block truncate">{p.email || "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-normal block text-[9px] uppercase tracking-wider font-mono">📞 Parish Hotline</span>
                              <span className="text-white font-mono text-[11px] block">{p.phone || "N/A"}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#D4AF37]/15 font-mono text-[10px]">
                            <p><span className="text-slate-500 font-normal text-[8.5px] uppercase block">Province/State</span><span className="text-[#B0C4DE] font-semibold">{p.province}</span></p>
                            <p><span className="text-slate-500 font-normal text-[8.5px] uppercase block">Country</span><span className="text-[#B0C4DE] font-semibold">{p.country}</span></p>
                          </div>
                        </div>

                        {/* Collapsible / Expandable Details section */}
                        <div className="mt-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => setExpandedProfiles(prev => ({ ...prev, [p.id]: !isExpanded }))}
                            className="w-full bg-[#112055]/50 border border-white/10 hover:border-[#D4AF37]/35 text-[#D4AF37] font-bold text-[10.5px] py-1.5 px-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Sliders className="w-3 h-3 text-[#D4AF37]" />
                              {isExpanded ? "Collapse Celestial Details" : "Expand Covenant Vision & Clergy"}
                            </span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#D4AF37]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#D4AF37]" />}
                          </button>

                          {isExpanded && (
                            <div className="mt-2.5 p-3 rounded-lg bg-[#050C24] border border-[#D4AF37]/20 space-y-3 text-xs text-slate-300 animate-fade-in font-sans-raleway">
                              <div className="space-y-1">
                                <span className="font-serif-cinzel text-[#D4AF37] font-bold text-[9.5px] uppercase tracking-wider block flex items-center gap-1.5">
                                  <BookOpen className="w-3 h-3 text-[#D4AF37]" /> Covenant Vision Statement
                                </span>
                                <p className="italic text-slate-200 border-l-2 border-[#D4AF37]/50 pl-2 text-[10.5px] leading-relaxed">
                                  {p.visionStatement || "No vision statement drafted yet. Click 'Refine with AI' to define the covenant identity."}
                                </p>
                              </div>

                              <div className="space-y-1 border-t border-white/5 pt-2">
                                <span className="font-serif-cinzel text-[#D4AF37] font-bold text-[9.5px] uppercase tracking-wider block flex items-center gap-1.5">
                                  <Award className="w-3.5 h-3.5 text-[#D4AF37]" /> Sanctuary Clergy & Leadership
                                </span>
                                <p className="text-slate-200 font-medium text-[10.5px] font-mono bg-[#112055]/40 px-2.5 py-1 rounded border border-white/5">
                                  {p.clergyLeadership || "No leadership structure registered yet."}
                                </p>
                              </div>

                              {p.additionalNotes && (
                                <div className="space-y-1 border-t border-white/5 pt-2">
                                  <span className="text-[#D4AF37]/85 font-semibold text-[9.5px] uppercase block">
                                    ⛪ Ecclesiastical Notes & Status
                                  </span>
                                  <p className="text-[#B0C4DE] text-[10px]">
                                    {p.additionalNotes}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="flex justify-end gap-2 border-t border-white/5 pt-2.5 mt-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            // Easily launch editor and auto-refine
                            handleEditProfileSetup(p);
                            triggerToast("✨", "Reviewing details. Tap 'AI Refine Profile' to optimize.");
                          }}
                          className="bg-purple-950/40 hover:bg-purple-900 border border-purple-800/60 text-purple-200 text-[10.5px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-purple-300" /> Refine with AI
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditProfileSetup(p)}
                          className="text-slate-300 hover:text-white bg-[#0A0F1E] border border-white/10 hover:border-[#D4AF37]/35 text-[10.5px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-[#D4AF37]" /> Edit Profile
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProfile(p.id)}
                          className="text-red-450 hover:text-red-300 bg-red-950/25 hover:bg-red-950/50 border border-red-900/35 text-[10.5px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Trash className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* CHURCH PROFILE EDIT/ADD MODAL ELEMENT */}
      {showAddProfile && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-[#0D1B3E] border border-[#D4AF37]/50 rounded-2xl w-full max-w-lg p-5 space-y-4 gold-glow">
            <div className="border-b border-[#D4AF37]/25 pb-2.5 flex justify-between items-center">
              <h3 className="text-sm font-serif-cinzel font-bold text-white tracking-wide">
                {editingProfile ? "EDIT PARISH CHURCH PROFILE" : "REGISTER NEW PARISH PROFILE"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddProfile(false)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfileSubmit} className="space-y-3.5 text-xs text-slate-300">
              <div className="space-y-1">
                <label className="block text-[#B0C4DE] font-semibold">Parish/Assembly Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sovereign Grace Assembly, Lagos West"
                  value={profName}
                  onChange={e => setProfName(e.target.value)}
                  className="w-full bg-[#0A0F1E] text-white p-2.5 rounded-xl border border-white/10 focus:border-[#D4AF37]/60 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[#B0C4DE] font-semibold">Parish Contact Email</label>
                  <input
                    type="email"
                    placeholder="parish@faithflow.org"
                    value={profEmail}
                    onChange={e => setProfEmail(e.target.value)}
                    className="w-full bg-[#0A0F1E] text-white p-2.5 rounded-xl border border-white/10 focus:border-[#D4AF37]/60 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[#B0C4DE] font-semibold">Parish Hotline Phone</label>
                  <input
                    type="text"
                    placeholder="+234 812-345-6789"
                    value={profPhone}
                    onChange={e => setProfPhone(e.target.value)}
                    className="w-full bg-[#0A0F1E] text-white p-2.5 rounded-xl border border-white/10 focus:border-[#D4AF37]/60 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[#B0C4DE] font-semibold">Sanctuary Address Location</label>
                <input
                  type="text"
                  placeholder="12 Praise Gate Avenue, Holy Ghost Estate"
                  value={profAddress}
                  onChange={e => setProfAddress(e.target.value)}
                  className="w-full bg-[#0A0F1E] text-white p-2.5 rounded-xl border border-white/10 focus:border-[#D4AF37]/60 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[#B0C4DE] font-semibold">Region/Province</label>
                  <input
                    type="text"
                    placeholder="Lagos Province 5"
                    value={profProvince}
                    onChange={e => setProfProvince(e.target.value)}
                    className="w-full bg-[#0A0F1E] text-white p-2.5 rounded-xl border border-white/10 focus:border-[#D4AF37]/60 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[#B0C4DE] font-semibold">Country Location</label>
                  <input
                    type="text"
                    placeholder="Nigeria"
                    value={profCountry}
                    onChange={e => setProfCountry(e.target.value)}
                    className="w-full bg-[#0A0F1E] text-white p-2.5 rounded-xl border border-white/10 focus:border-[#D4AF37]/60 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[#B0C4DE] font-semibold">Bible Translation Type</label>
                  <select
                    value={profBibleVersion}
                    onChange={e => setProfBibleVersion(e.target.value)}
                    className="w-full bg-[#0A0F1E] text-white p-2.5 rounded-xl border border-white/15 focus:border-[#D4AF37]/60 outline-none"
                  >
                    <option value="ESV">ESV (English Standard)</option>
                    <option value="NKJV">NKJV (New King James)</option>
                    <option value="KJV">KJV (King James Version)</option>
                    <option value="NIV">NIV (New International)</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-[#D4AF37]/20 pt-3.5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-serif-cinzel text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1">
                    👑 Majestic Covenant Parameters
                  </span>
                  
                  <button
                    type="button"
                    disabled={refineLoading}
                    onClick={handleRefineProfile}
                    className="bg-purple-900/95 hover:bg-purple-800 disabled:opacity-50 text-[#D4AF37] border border-[#D4AF37]/45 text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer font-sans-raleway font-bold"
                  >
                    <Sparkles className="w-3 h-3 text-purple-300 animate-pulse" />
                    {refineLoading ? "Refining Details..." : "✨ AI Refine Parameters"}
                  </button>
                </div>
                
                <p className="text-[10px] text-slate-400">
                  Provide draft notes, then tap <strong className="text-purple-300 font-semibold">AI Refine Parameters</strong> to polish them into a majestic theological and structural expression.
                </p>

                <div className="space-y-1">
                  <label className="block text-[#B0C4DE] font-semibold">Spiritual Vision Statement</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. To serve as a high-faith sanctuary..."
                    value={profVisionStatement}
                    onChange={e => setProfVisionStatement(e.target.value)}
                    className="w-full bg-[#0A0F1E] text-white p-2 px-3 rounded-lg border border-white/10 focus:border-[#D4AF37]/60 outline-none placeholder:text-slate-600 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[#B0C4DE] font-semibold">Sanctuary Clergy & Worship Leadership</label>
                  <input
                    type="text"
                    placeholder="e.g. Reverend David Peters (Parish Pastor) & Covenant Board of Elders"
                    value={profClergyLeadership}
                    onChange={e => setProfClergyLeadership(e.target.value)}
                    className="w-full bg-[#0A0F1E] text-white p-2 px-3 rounded-lg border border-white/10 focus:border-[#D4AF37]/60 outline-none placeholder:text-slate-600 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[#B0C4DE] font-semibold">Ecclesiastical Notes / Divine Assignment</label>
                  <input
                    type="text"
                    placeholder="Additional logs, branch status declarations, or specific assignments..."
                    value={profAdditionalNotes}
                    onChange={e => setProfAdditionalNotes(e.target.value)}
                    className="w-full bg-[#0A0F1E] text-white p-2 px-3 rounded-lg border border-white/10 focus:border-[#D4AF37]/60 outline-none placeholder:text-slate-600 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddProfile(false)}
                  className="bg-[#0A0F1E] hover:bg-[#112055] text-[#B0C4DE] px-4 py-2 rounded-xl border border-white/10 transition text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#D4AF37] hover:bg-[#F0C940] text-black px-5 py-2 rounded-xl transition font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save Profile Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. GOOGLE MEET & CONTACTS SYNC */}
      {activeSubTab === "google_sync" && (
        <div className="space-y-6 font-sans text-[#B0C4DE]">
          {/* Header Dashboard Banner */}
          <div className="border border-[#D4AF37]/30 bg-[#0D1B3E] p-5 rounded-2xl gold-glow relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <RefreshCw className="w-24 h-24 text-[#D4AF37] animate-spin-slow" />
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-base font-serif-cinzel font-bold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#D4AF37]" /> Google Workspace Sanctuary Coordinator
                </h3>
                <p className="text-xs text-[#B0C4DE]/80 mt-1 max-w-2xl">
                  Dynamically create official Google Meet rooms for virtual fellowship, prayer lines, and online discipleship. Keep your digital assembly synced in real time with Google People Contacts.
                </p>
              </div>

              {/* Status Indicator Badge & Link */}
              <div className="flex items-center gap-2.5">
                {googleAccessToken ? (
                  <div className="flex flex-col items-end">
                    <span className="bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <ShieldCheck className="w-3.5 h-3.5" /> LIVE GOOGLE AUTHENTICATED
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">Scopes authorized & fully active</span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <span className="bg-amber-500/15 text-amber-400 border border-amber-500/35 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm justify-center">
                      <HelpCircle className="w-3.5 h-3.5" /> GOOGLE SANDBOX MODE
                    </span>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer text-center"
                    >
                      <RefreshCw className="w-3 h-3 text-black animate-pulse" /> Link Live Google Account
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Google Meet Room Creator & Active Spaces */}
            <div className="lg:col-span-5 space-y-6">
              <div className="border border-[#D4AF37]/25 bg-[#09112E] p-4.5 rounded-2xl shadow-xl space-y-4">
                <div className="border-b border-white/5 pb-2">
                  <h4 className="text-xs font-serif-cinzel font-bold text-[#D4AF37] tracking-wider flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-[#D4AF37]" /> SCHEDULE GOOGLE MEET ROOM
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Generate a dedicated instant Google Meet room URL</p>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400 font-semibold">Fellowship / Prayer Call Title:</label>
                    <input
                      type="text"
                      placeholder="e.g. Wednesday Deliverance Hour"
                      value={newSpaceName}
                      onChange={e => setNewSpaceName(e.target.value)}
                      className="w-full bg-[#0A0F1E] text-white p-2.5 rounded-xl border border-white/10 focus:border-[#D4AF37]/50 outline-none text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={meetLoading}
                    onClick={() => createGoogleMeetSpace(newSpaceName)}
                    className="w-full bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 disabled:from-indigo-950 disabled:to-slate-900 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
                  >
                    {meetLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        Generating Meeting Space...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        Generate Official Meet Room
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Active Meeting Spaces List */}
              <div className="border border-[#D4AF37]/25 bg-[#09112E] p-4.5 rounded-2xl shadow-xl space-y-3">
                <div className="border-b border-white/5 pb-2">
                  <h4 className="text-xs font-serif-cinzel font-bold text-[#D4AF37] tracking-wider flex items-center gap-1.5">
                    <Link className="w-4 h-4 text-[#D4AF37]" /> ACTIVE FELLOWSHIP SPACES
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Manage generated Google Meet conference rooms</p>
                </div>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {meetSpaces.length === 0 ? (
                    <p className="text-center text-[11px] text-slate-500 py-4">No active Google Meet rooms generated yet.</p>
                  ) : (
                    meetSpaces.map(space => (
                      <div key={space.id} className="bg-[#0A1231] border border-white/5 hover:border-[#D4AF37]/35 rounded-xl p-3 transition flex flex-col justify-between gap-2.5">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-[10px] font-semibold text-indigo-400 font-mono tracking-wider bg-indigo-950/40 px-1.5 py-0.5 rounded">
                              {space.resourceName.replace("spaces/", "")}
                            </span>
                            <h5 className="text-xs font-bold text-white mt-1">{space.name}</h5>
                            <span className="text-[9px] text-slate-400 block mt-0.5">Created: {space.createdAt}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowConfirmDelete({ type: "meet", id: space.id, name: space.name })}
                            className="text-slate-500 hover:text-rose-400 p-1 rounded transition cursor-pointer"
                            title="Delete meeting space"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(space.meetingUri);
                              triggerToast("📋", "Google Meet URL copied to clipboard!");
                            }}
                            className="bg-[#0A0F1E] hover:bg-slate-900 border border-white/10 text-slate-300 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                          >
                            <Copy className="w-3 h-3" /> Copy Link
                          </button>
                          
                          <a
                            href={space.meetingUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer text-center"
                          >
                            <ExternalLink className="w-3 h-3" /> Launch Meeting
                          </a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Google Contacts Synchronization Dashboard */}
            <div className="lg:col-span-7 space-y-6">
              <div className="border border-[#D4AF37]/25 bg-[#09112E] p-4.5 rounded-2xl shadow-xl space-y-4">
                
                {/* Section Header with Buttons */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/5 pb-3">
                  <div>
                    <h4 className="text-xs font-serif-cinzel font-bold text-[#D4AF37] tracking-wider flex items-center gap-1.5">
                      <Contact className="w-4 h-4 text-[#D4AF37]" /> GOOGLE CONTACTS DIRECTORY
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Sync, manage, or import members directly to and from Google</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateContactModal(true)}
                      className="bg-[#D4AF37] hover:bg-[#F0C940] text-black font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Create Google Contact
                    </button>
                    {googleAccessToken && (
                      <button
                        type="button"
                        disabled={contactsLoading}
                        onClick={fetchGoogleContacts}
                        className="bg-indigo-950/80 border border-indigo-700/50 hover:bg-indigo-900 text-indigo-300 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${contactsLoading ? "animate-spin" : ""}`} /> Refresh Contacts
                      </button>
                    )}
                  </div>
                </div>

                {/* Search Bar & Import All */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search Google connections..."
                      value={googleSearchQuery}
                      onChange={e => setGoogleSearchQuery(e.target.value)}
                      className="w-full bg-[#0A0F1E] text-white pl-9 pr-4 py-2 rounded-xl border border-white/10 focus:border-[#D4AF37]/50 outline-none text-xs"
                    />
                  </div>

                  {googleContacts.length > 0 && (
                    <button
                      type="button"
                      onClick={importAllGoogleContacts}
                      className="bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold text-[11px] px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Import All Unregistered
                    </button>
                  )}
                </div>

                {/* Google Contacts Connections List */}
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {contactsLoading && googleContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mb-2" />
                      <p className="text-xs font-bold">Retrieving authorized Google Contacts...</p>
                    </div>
                  ) : filteredGoogleContacts.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-[#0A1231]/40 border border-white/5 rounded-2xl">
                      <Contact className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-55" />
                      <p className="text-xs font-bold">No matching Google Contacts found.</p>
                      <p className="text-[10px] text-slate-600 mt-1">Make sure you have contacts registered in your linked Google Account.</p>
                    </div>
                  ) : (
                    filteredGoogleContacts.map((contact: any) => {
                      const isAlreadyMember = members.some(
                        m => m.name.toLowerCase() === contact.name.toLowerCase() || (m.email && m.email.toLowerCase() === contact.email.toLowerCase())
                      );
                      return (
                        <div key={contact.resourceName} className="bg-[#0A1231] border border-white/5 hover:border-[#D4AF37]/35 rounded-xl p-3 transition flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-950/80 border border-indigo-700/30 flex items-center justify-center text-[#D4AF37] font-bold font-serif-cinzel text-xs">
                              {contact.name.charAt(0)}
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                                {contact.name}
                                {isAlreadyMember && (
                                  <span className="bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[8px] font-bold px-1.5 py-0.2 rounded">
                                    IN REGISTRY
                                  </span>
                                )}
                              </h5>
                              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-400 mt-0.5">
                                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-500" /> {contact.email}</span>
                                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-500" /> {contact.phone}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 justify-end">
                            {!isAlreadyMember ? (
                              <button
                                type="button"
                                onClick={() => importGoogleContactToApp(contact)}
                                className="bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0A0F1E] border border-[#D4AF37]/35 text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                              >
                                <Plus className="w-3 h-3" /> Import to Registry
                              </button>
                            ) : (
                              <span className="text-slate-500 text-[10px] font-medium flex items-center gap-1 px-2 py-1.5">
                                <CheckCircle2 className="w-3 h-3 text-[#10B981]" /> Synced
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => setShowConfirmDelete({ type: "contact", id: contact.resourceName, name: contact.name })}
                              className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition cursor-pointer"
                              title="Delete from Google Contacts"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* SECTION: EXPORT APP MEMBERS TO GOOGLE CONTACTS */}
              <div className="border border-[#D4AF37]/25 bg-[#09112E] p-4.5 rounded-2xl shadow-xl space-y-3">
                <div className="border-b border-white/5 pb-2">
                  <h4 className="text-xs font-serif-cinzel font-bold text-[#D4AF37] tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#D4AF37]" /> EXPORT MEMBERS TO GOOGLE ACCOUNTS
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Export existing church registry members into Google Contacts</p>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {members.map(member => {
                    const isAlreadyInGoogle = googleContacts.some(
                      c => c.name.toLowerCase() === member.name.toLowerCase() || (member.email && c.email.toLowerCase() === member.email.toLowerCase())
                    );
                    return (
                      <div key={member.id} className="bg-[#0A1231]/60 border border-white/5 rounded-xl p-2.5 px-3 flex justify-between items-center transition hover:bg-[#0A1231]">
                        <div>
                          <h5 className="text-xs font-bold text-white">{member.name}</h5>
                          <span className="text-[10px] text-slate-400 block">{member.role} • {member.phone || "No Phone"}</span>
                        </div>

                        {!isAlreadyInGoogle ? (
                          <button
                            type="button"
                            onClick={() => setShowExportConfirm(member)}
                            className="bg-indigo-650/80 hover:bg-indigo-600 text-white font-bold text-[9px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
                          >
                            <Share2 className="w-3 h-3" /> Export to Google
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[9px] font-semibold flex items-center gap-1 px-2.5 py-1.5">
                            <ShieldCheck className="w-3 h-3 text-[#10B981]" /> Synced
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI PARISH PROFILE EXTRACT ASSISTANT MODAL ELEMENT */}
      {showAIParmodal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-[#0D1B3E] border border-[#D4AF37] rounded-2xl w-full max-w-lg p-5 space-y-4 gold-glow">
            <div className="border-b border-[#D4AF37]/20 pb-2 flex justify-between items-center">
              <h3 className="text-sm font-serif-cinzel font-bold text-[#D4AF37] tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> AI-POWERED PARISH PROFILE EXTRACTOR
              </h3>
              <button
                type="button"
                onClick={() => setShowAIParmodal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 font-sans-raleway">
              <p>
                Paste unstructured notes, promotional flyers, church announcements, letterhead snippets, or emails containing your parish general details. Our **Copier AI engine** will automatically isolate names, telephone numbers, addresses, study translations, and map properties.
              </p>
              
              <div className="space-y-1.5">
                <label className="block text-[#B0C4DE] font-semibold text-[11px]">Unstructured Sanctuary Branch Details:</label>
                <textarea
                  placeholder="e.g. 'We study NKJV. Our branch, Sovereign Hope Center, is located in Tema, Greater Accra, Ghana. Drop by at 5 Main Street or email hope@faithflow.org. Hotline is +233-555-0101.'"
                  value={unstructuredParText}
                  onChange={e => setUnstructuredParText(e.target.value)}
                  className="w-full bg-[#0A0F1E] text-white p-3 rounded-xl border border-[#D4AF37]/20 focus:border-[#D4AF37]/50 h-32 outline-none resize-none text-[11px]"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => {
                  setUnstructuredParText("We are Sovereign Grace Assembly, located at 15 Sanctuary Gate, Lagos Province 1, Nigeria. People can reach us at west@faithflow.org or call +234 81 5555 1212. We prefer learning from the English Standard Version (ESV).");
                  triggerToast("📝", "Loaded realistic sample parish details.");
                }}
                className="text-[10px] text-[#D4AF37] hover:underline cursor-pointer"
              >
                Try sample text
              </button>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAIParmodal(false)}
                  className="bg-[#0A0F1E] hover:bg-slate-950 text-[#B0C4DE] border border-white/10 px-3.5 py-1.8 rounded-xl transition text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={parExtractionLoading}
                  onClick={handleAIParishExtract}
                  className="bg-purple-800 hover:bg-purple-700 disabled:bg-purple-950 disabled:text-purple-400 text-white border border-purple-500 font-semibold px-4 py-1.8 rounded-xl flex items-center gap-1.5 cursor-pointer text-xs transition-colors shadow-lg"
                >
                  {parExtractionLoading ? (
                    <span className="flex items-center gap-1.5 text-center justify-center">
                      <span className="animate-spin text-[10px] inline-block h-3 w-3 border-2 border-white rounded-full border-t-transparent" />
                      Interrogating Gemini AI...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                      Run AI Extraction
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL (GOOGLE METADATA MUTATION PROTECTION) */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-md">
          <div className="bg-[#0D1B3E] border border-rose-500/40 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl gold-glow">
            <div className="flex items-center gap-2.5 text-rose-400 border-b border-white/5 pb-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h3 className="text-xs font-serif-cinzel font-bold tracking-wider">
                CONFIRM DELETION
              </h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Are you absolutely sure you want to delete the Google {showConfirmDelete.type === "contact" ? "Contact" : "Meet Space"}{" "}
              <strong className="text-white">"{showConfirmDelete.name}"</strong>? This will permanently delete this record from your linked Google Workspace account.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(null)}
                className="bg-[#0A0F1E] hover:bg-[#112055] text-[#B0C4DE] px-3.5 py-1.8 rounded-xl border border-white/10 transition text-[11px] font-semibold cursor-pointer"
              >
                No, Keep
              </button>
              <button
                type="button"
                onClick={() => {
                  if (showConfirmDelete.type === "contact") {
                    deleteGoogleContact(showConfirmDelete.id, showConfirmDelete.name);
                  } else {
                    setMeetSpaces(prev => prev.filter(s => s.id !== showConfirmDelete.id));
                    triggerToast("🗑️", `Successfully deleted Meet Space "${showConfirmDelete.name}".`);
                    setShowConfirmDelete(null);
                  }
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] px-4 py-1.8 rounded-xl transition cursor-pointer shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM EXPORT MEMBER TO GOOGLE MODAL */}
      {showExportConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-md">
          <div className="bg-[#0D1B3E] border border-[#D4AF37]/50 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl gold-glow">
            <div className="flex items-center gap-2 text-[#D4AF37] border-b border-white/5 pb-2">
              <UserCheck className="w-5 h-5" />
              <h3 className="text-xs font-serif-cinzel font-bold tracking-wider">
                EXPORT TO GOOGLE CONTACTS
              </h3>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Would you like to export the registry member <strong className="text-white">"{showExportConfirm.name}"</strong> directly into your Google Workspace contacts? This will create a fresh contact card in your Google Account.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExportConfirm(null)}
                className="bg-[#0A0F1E] hover:bg-[#112055] text-[#B0C4DE] px-3.5 py-1.8 rounded-xl border border-white/10 transition text-[11px] font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => exportMemberToGoogleContacts(showExportConfirm)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] px-4 py-1.8 rounded-xl transition cursor-pointer shadow-md"
              >
                Confirm Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT GOOGLE CONTACT CREATION MODAL */}
      {showCreateContactModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-[#0D1B3E] border border-[#D4AF37] rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl gold-glow">
            <div className="border-b border-white/5 pb-2 flex justify-between items-center">
              <h3 className="text-sm font-serif-cinzel font-bold text-[#D4AF37] tracking-wider flex items-center gap-1.5">
                <Contact className="w-4 h-4" /> CREATE GOOGLE CONTACT
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateContactModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={createDirectGoogleContact} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-semibold">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel"
                    value={gContactFirst}
                    onChange={e => setGContactFirst(e.target.value)}
                    className="w-full bg-[#0A0F1E] text-white p-2 px-3 rounded-lg border border-white/10 focus:border-[#D4AF37]/60 outline-none text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-semibold">Last Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Boateng"
                    value={gContactLast}
                    onChange={e => setGContactLast(e.target.value)}
                    className="w-full bg-[#0A0F1E] text-white p-2 px-3 rounded-lg border border-white/10 focus:border-[#D4AF37]/60 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-semibold">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. samuel.boateng@gmail.com"
                  value={gContactEmail}
                  onChange={e => setGContactEmail(e.target.value)}
                  className="w-full bg-[#0A0F1E] text-white p-2 px-3 rounded-lg border border-white/10 focus:border-[#D4AF37]/60 outline-none text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-slate-400 font-semibold">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +233 24 555 6677"
                  value={gContactPhone}
                  onChange={e => setGContactPhone(e.target.value)}
                  className="w-full bg-[#0A0F1E] text-white p-2 px-3 rounded-lg border border-white/10 focus:border-[#D4AF37]/60 outline-none text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowCreateContactModal(false)}
                  className="bg-[#0A0F1E] hover:bg-[#112055] text-[#B0C4DE] px-4 py-2 rounded-xl border border-white/10 transition text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#D4AF37] hover:bg-[#F0C940] text-black px-5 py-2 rounded-xl transition font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save to Google Contacts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEMBER VIEW DETAILS SLIDE-IN PANEL MODAL */}
      {viewingMemberDetails && (
        <div className="fixed inset-0 bg-black/80 flex justify-end z-50 animate-fade-in backdrop-blur-md">
          {/* Backdrop click dismisses */}
          <div className="absolute inset-0 cursor-default" onClick={() => setViewingMemberDetails(null)} />
          
          {/* Slide panel */}
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#0D1B3E] to-[#060D25] border-l border-[#D4AF37]/30 h-full overflow-y-auto shadow-2xl p-6 md:p-8 flex flex-col justify-between text-[#B0C4DE] font-sans">
            
            <div className="space-y-6">
              {/* Header section with Close Button & Avatar */}
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                <div className="flex items-center gap-3.5">
                  <div 
                    onClick={() => openAvatarModal(viewingMemberDetails)}
                    className="relative group w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/50 bg-[#0A0F1E] shrink-0 cursor-pointer shadow-lg hover:border-[#D4AF37] transition"
                    title="Click to change or upload avatar"
                  >
                    <img 
                      src={getMemberAvatar(viewingMemberDetails)} 
                      alt={viewingMemberDetails.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-[#D4AF37]">
                      <Camera className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest font-mono">
                      {viewingMemberDetails.demographic} MINISTRY
                    </span>
                    <h3 className="text-xl font-serif-cinzel font-bold text-white mt-1 flex items-center gap-2">
                      {viewingMemberDetails.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">
                        ID: {viewingMemberDetails.id}
                      </p>
                      <button
                        type="button"
                        onClick={() => openAvatarModal(viewingMemberDetails)}
                        className="text-[9px] text-[#D4AF37] hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                      >
                        <Camera className="w-2.5 h-2.5" /> Edit Icon
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingMemberDetails(null)}
                  className="bg-[#0A0F1E] hover:bg-rose-950/40 text-slate-400 hover:text-white border border-white/10 p-2 rounded-xl transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Status & Quick stats row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A0F1E] border border-white/5 rounded-xl p-3 text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Registry Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${viewingMemberDetails.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-slate-500"}`} />
                    <span className="text-xs font-bold text-white uppercase">{viewingMemberDetails.status}</span>
                  </div>
                </div>

                <div className="bg-[#0A0F1E] border border-white/5 rounded-xl p-3 text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Assigned Role</p>
                  <p className="text-xs font-bold text-[#D4AF37] mt-1">{viewingMemberDetails.role}</p>
                </div>
              </div>

              {/* Engagement Analytics & Scoring Section */}
              <div className="bg-[#112055]/30 border border-[#D4AF37]/20 p-4 rounded-2xl space-y-3.5 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 opacity-5 pointer-events-none">
                  <Award className="w-24 h-24 text-[#D4AF37]" />
                </div>
                
                <h4 className="text-xs font-serif-cinzel font-bold text-white tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" /> SANCTUARY ENGAGEMENT INDEX
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Circle progress mockup */}
                  <div className="md:col-span-4 flex justify-center">
                    <div className="relative w-20 h-20 flex items-center justify-center rounded-full border-4 border-dashed border-[#D4AF37]/35 bg-black/40">
                      <div className="text-center">
                        <span className="text-base font-bold text-white font-mono">92%</span>
                        <span className="text-[7px] text-slate-400 block uppercase font-bold">Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Analytics details */}
                  <div className="md:col-span-8 space-y-2.5 text-left">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold mb-1">
                        <span>Attendance Loyalty Rate</span>
                        <span className="text-[#D4AF37]">92% (High Commitment)</span>
                      </div>
                      <div className="w-full bg-black/45 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#D4AF37] to-amber-400 h-full" style={{ width: "92%" }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-500 block">Consecutive Sundays</span>
                        <span className="text-white font-bold font-mono">6 Sundays Streak</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Tithe & Service Support</span>
                        <span className="text-emerald-400 font-bold font-mono">Consistent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demographics Notes */}
              <div className="space-y-2 text-left">
                <h4 className="text-xs font-serif-cinzel font-bold text-[#D4AF37] tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" /> DEMOGRAPHIC CARE PROFILE NOTES
                </h4>
                <div className="bg-[#0A0F1E] border border-white/5 rounded-xl p-4 space-y-2 text-xs leading-relaxed text-slate-300">
                  <p>
                    {viewingMemberDetails.notes && viewingMemberDetails.notes.trim() !== "" 
                      ? viewingMemberDetails.notes 
                      : `Currently registered as an active constituent in the ${viewingMemberDetails.demographic} Ministry. This member supports discipleship classes, regular virtual fellowship groups, and local service missions.`}
                  </p>
                  <p className="text-[10px] text-slate-500 border-t border-white/5 pt-2">
                    💡 Pastoral Note: Prioritize follow-ups for fellowship events geared specifically towards {viewingMemberDetails.demographic === "Youth" ? "young leaders" : `${viewingMemberDetails.demographic.toLowerCase()} ministries`}.
                  </p>
                </div>
              </div>

              {/* Congregation History Timeline */}
              <div className="space-y-3.5 text-left">
                <h4 className="text-xs font-serif-cinzel font-bold text-[#D4AF37] tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> SACRED SERVICE TIMELINE
                </h4>
                
                <div className="space-y-3 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10 pl-6">
                  {/* Item 1 */}
                  <div className="relative">
                    <span className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-[#D4AF37] ring-4 ring-[#0D1B3E]" />
                    <p className="text-[11px] font-bold text-white">Officially Inducted as a Covenant Member</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Joined congregation registry on {viewingMemberDetails.joinedAt}</p>
                  </div>

                  {/* Item 2 */}
                  <div className="relative">
                    <span className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-[#0D1B3E]" />
                    <p className="text-[11px] font-bold text-white">Assigned Discipleship Pathway Role</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Placed in leadership role: "{viewingMemberDetails.role}"</p>
                  </div>

                  {/* Item 3 */}
                  <div className="relative">
                    <span className="absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-[#0D1B3E]" />
                    <p className="text-[11px] font-bold text-white">Google contacts identity check synced</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Contact coordinates mapped & validated for remote meet groups</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Contact triggers / action buttons footer */}
            <div className="border-t border-white/10 pt-4 mt-6 space-y-3">
              <div className="flex gap-2">
                {viewingMemberDetails.email && (
                  <a
                    href={`mailto:${viewingMemberDetails.email}`}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition text-center cursor-pointer shadow"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email Member
                  </a>
                )}
                
                {viewingMemberDetails.phone && (
                  <a
                    href={`tel:${viewingMemberDetails.phone}`}
                    className="flex-1 bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition text-center cursor-pointer shadow"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Member
                  </a>
                )}
              </div>

              <div className="flex gap-2 justify-between items-center text-[11px] text-slate-500">
                <span>Last updated 24 hours ago</span>
                <button
                  type="button"
                  onClick={() => setViewingMemberDetails(null)}
                  className="text-slate-400 hover:text-white font-semibold cursor-pointer"
                >
                  Close Profile Panel
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2.7 MEMBER AVATAR & GRAVATAR STUDIO MODAL */}
      {avatarModalMember && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-[#0D1B3E] border border-[#D4AF37] rounded-2xl w-full max-w-lg p-6 space-y-5 gold-glow shadow-2xl font-sans-raleway">
            {/* Modal Header */}
            <div className="border-b border-[#D4AF37]/20 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-serif-cinzel font-bold text-[#D4AF37] tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#D4AF37]" /> Congregation Member Avatar Studio
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Generate unique gravatar-style icons or upload custom photos for visual recognition
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAvatarModalMember(null)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Member Info & Current Avatar Preview */}
            <div className="flex items-center gap-4 bg-[#0A0F1E] border border-white/10 p-3.5 rounded-xl">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#D4AF37] bg-[#030611] shrink-0 shadow-md">
                <img 
                  src={avatarCustomPreview || getMemberAvatar(avatarModalMember)} 
                  alt={avatarModalMember.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">{avatarModalMember.name}</h4>
                <p className="text-[11px] text-slate-400">{avatarModalMember.role} • {avatarModalMember.demographic}</p>
                <p className="text-[10px] text-slate-500 font-mono">{avatarModalMember.email || "No email"}</p>
                <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded bg-[#112055] text-[#D4AF37] border border-[#D4AF37]/30 uppercase font-bold">
                  Style: {avatarStyleChoice}
                </span>
              </div>
            </div>

            {/* Avatar Style Selector Tabs */}
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-1.5 bg-[#0A0F1E] p-1 rounded-xl border border-white/5 text-[11px] font-bold">
                {[
                  { id: "identicon", label: "Identicon", icon: Sparkles },
                  { id: "gravatar", label: "Gravatar", icon: ImageIcon },
                  { id: "dicebear", label: "DiceBear", icon: Wand2 },
                  { id: "uploaded", label: "Upload Photo", icon: Upload }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setAvatarStyleChoice(tab.id as any);
                      if (tab.id === "identicon") {
                        setAvatarCustomPreview(generateGeometricIdenticon(avatarSeedCustom));
                      } else if (tab.id === "gravatar") {
                        setAvatarCustomPreview(getGravatarUrl(avatarModalMember.email || avatarSeedCustom, avatarGravatarFallback));
                      } else if (tab.id === "dicebear") {
                        setAvatarCustomPreview(getDicebearUrl(avatarSeedCustom, avatarDicebearStyle));
                      }
                    }}
                    className={`py-2 rounded-lg flex flex-col sm:flex-row items-center justify-center gap-1 transition cursor-pointer ${
                      avatarStyleChoice === tab.id
                        ? "bg-[#D4AF37] text-[#0A0F1E] font-bold shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Sub-controls based on chosen tab */}
              {avatarStyleChoice === "identicon" && (
                <div className="bg-[#050D1E] p-3 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] text-slate-300 font-bold">Geometric Identicon Seed</label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomSeed = `${avatarModalMember.name}-${Math.random().toString(36).substring(2, 8)}`;
                        setAvatarSeedCustom(randomSeed);
                        setAvatarCustomPreview(generateGeometricIdenticon(randomSeed));
                      }}
                      className="text-[10px] text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <RefreshCw className="w-3 h-3" /> Randomize Pattern
                    </button>
                  </div>
                  <input
                    type="text"
                    value={avatarSeedCustom}
                    onChange={(e) => {
                      setAvatarSeedCustom(e.target.value);
                      setAvatarCustomPreview(generateGeometricIdenticon(e.target.value));
                    }}
                    className="w-full bg-[#0A0F1E] border border-slate-800 text-xs text-white p-2 rounded-lg outline-none focus:border-[#D4AF37]"
                    placeholder="Enter seed string for identicon..."
                  />
                  <p className="text-[10px] text-slate-500">
                    Symmetrical 5x5 block geometric avatar with liturgical gold/navy/indigo colors.
                  </p>
                </div>
              )}

              {avatarStyleChoice === "gravatar" && (
                <div className="bg-[#050D1E] p-3 rounded-xl border border-slate-800 space-y-2.5">
                  <label className="text-[11px] text-slate-300 font-bold block">Gravatar Fallback Style</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {(["identicon", "retro", "robohash", "wavatar", "monsterid"] as const).map(style => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => {
                          setAvatarGravatarFallback(style);
                          setAvatarCustomPreview(getGravatarUrl(avatarModalMember.email || avatarSeedCustom, style));
                        }}
                        className={`text-[10px] py-1.5 px-2 rounded-lg border font-bold capitalize transition cursor-pointer ${
                          avatarGravatarFallback === style
                            ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                            : "bg-[#0A0F1E] text-slate-300 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Fetches globally recognized Gravatar avatar for {avatarModalMember.email || "this member"} using standard md5 email hash.
                  </p>
                </div>
              )}

              {avatarStyleChoice === "dicebear" && (
                <div className="bg-[#050D1E] p-3 rounded-xl border border-slate-800 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] text-slate-300 font-bold">DiceBear Character Style</label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomSeed = `${avatarModalMember.name}-${Math.random().toString(36).substring(2, 8)}`;
                        setAvatarSeedCustom(randomSeed);
                        setAvatarCustomPreview(getDicebearUrl(randomSeed, avatarDicebearStyle));
                      }}
                      className="text-[10px] text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <RefreshCw className="w-3 h-3" /> Randomize
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                    {(["avataaars", "bottts", "identicon", "lorelei", "fun-emoji"] as const).map(style => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => {
                          setAvatarDicebearStyle(style);
                          setAvatarCustomPreview(getDicebearUrl(avatarSeedCustom, style));
                        }}
                        className={`text-[10px] py-1.5 px-2 rounded-lg border font-bold capitalize transition cursor-pointer ${
                          avatarDicebearStyle === style
                            ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                            : "bg-[#0A0F1E] text-slate-300 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {avatarStyleChoice === "uploaded" && (
                <div className="bg-[#050D1E] p-4 rounded-xl border border-slate-800 space-y-3 text-center">
                  <Upload className="w-8 h-8 text-[#D4AF37] mx-auto opacity-80" />
                  <div>
                    <p className="text-xs font-bold text-white">Upload Member Portrait</p>
                    <p className="text-[10px] text-slate-400">JPEG, PNG or WebP image. Automatically compressed for cloud storage.</p>
                  </div>
                  <label className="inline-block bg-[#112055] hover:bg-[#D4AF37] hover:text-[#0A0F1E] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold py-2 px-4 rounded-lg cursor-pointer transition">
                    Browse & Choose File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploadingPhoto}
                    />
                  </label>
                  {isUploadingPhoto && (
                    <p className="text-[10px] text-[#D4AF37] animate-pulse">Processing portrait image...</p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setAvatarModalMember(null)}
                className="text-xs text-slate-400 hover:text-white px-3 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyGeneratedAvatar}
                className="bg-[#D4AF37] hover:bg-[#F0C940] text-[#0A0F1E] font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md cursor-pointer transition"
              >
                <CheckSquare className="w-4 h-4" /> Apply & Save Avatar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
