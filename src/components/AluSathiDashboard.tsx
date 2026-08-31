import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, ArrowRight, BookOpen, Camera, Check, ChevronDown, CloudRain,
  Ear, Globe2, HelpCircle, History, Leaf, Loader2, MapPin, Menu, Mic2,
  PhoneCall, RefreshCw, ScanLine, ShieldCheck, Sprout, Trash2, WifiOff, X,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { DiseaseLabel, DiseaseResult, getModelHealth, ModelHealth, scanPotatoLeaf } from "@/lib/disease-api";
import { getWeather, WeatherData } from "@/lib/api";
import { deletePendingScan, listPendingScans, savePendingScan } from "@/lib/pending-scans";

type ScanMode = "quick" | "field";
type Risk = "healthy" | "watch" | "urgent" | "uncertain";

interface DiaryEntry {
  id: string;
  createdAt: string;
  mode: ScanMode;
  risk: Risk;
  label: DiseaseLabel;
  district: string;
  scanCount: number;
  affectedCount: number;
  humidity?: number;
}

const DIARY_KEY = "alusathi-field-diary-v1";
const FIELD_POINTS = [1, 2, 3, 4, 5];

const COPY = {
  bn: {
    brandLine: "আলুর রোগ বুঝুন, সহজে",
    navScan: "ছবি তুলুন", navField: "আমার জমি", navHelp: "সাহায্য",
    online: "অনলাইন", offline: "ইন্টারনেট নেই",
    heroKicker: "বাংলাদেশের আলুচাষির ডিজিটাল সাথী",
    heroTitle: "পাতার ছবি দিন।", heroAccent: "ঝুঁকি আগে জানুন।",
    heroBody: "আলুসাথী পাতার ছবি, আবহাওয়া ও জমির কয়েকটি স্থান দেখে রোগের সম্ভাবনা বুঝতে সাহায্য করে।",
    quick: "একটি পাতা দেখুন", quickHint: "দ্রুত ফল",
    full: "পুরো জমি দেখুন", fullHint: "৫ জায়গা · বেশি ভরসা",
    trust: "AI ফল নিশ্চিত রোগ নির্ণয় নয়",
    weatherLoading: "আবহাওয়া দেখা হচ্ছে…", weatherGood: "আজ নজর রাখুন",
    weatherRisk: "রোগ বাড়ার মতো আবহাওয়া", weatherUnavailable: "আবহাওয়া এখন পাওয়া যাচ্ছে না", humidity: "আর্দ্রতা",
    scanKicker: "পাতা পরীক্ষা", scanTitle: "একটি পরিষ্কার ছবি তুলুন",
    scanBody: "একটি পাতা কাছে আনুন। দিনের আলো ব্যবহার করুন। ক্যামেরা স্থির রাখুন।",
    fieldTitle: "জমির ৫ জায়গা দেখুন", fieldBody: "একবারে শুধু একটি জায়গা দেখানো হবে। প্রতিটি জায়গায় একটি পাতা তুলুন।",
    point: "জায়গা", of: "এর মধ্যে",
    pointInstructions: ["জমির সামনের বাঁ পাশ", "জমির সামনের ডান পাশ", "জমির মাঝখান", "জমির পেছনের বাঁ পাশ", "জমির পেছনের ডান পাশ"],
    choose: "ছবি তুলুন বা বাছুন", formats: "JPG, PNG বা WebP · সর্বোচ্চ ৮ MB", replace: "অন্য ছবি দিন",
    analyze: "ছবি পরীক্ষা করুন", analyzing: "ছবি দেখা হচ্ছে…", nextPoint: "পরের জায়গায় যান", retake: "আবার ছবি তুলুন",
    noResult: "ফল এখানে দেখা যাবে", noResultBody: "আলুসাথী তিনটি অবস্থা দেখে: সুস্থ পাতা, আগাম ধসা ও নাবি ধসা।",
    error: "ছবিটি দেখা যায়নি। পরিষ্কার ছবি দিয়ে আবার চেষ্টা করুন।", offlineSaved: "ছবিটি এই ফোনে সেভ হয়েছে। ইন্টারনেট এলে পরীক্ষা হবে।",
    syncDone: "টি জমা থাকা ছবি পরীক্ষা হয়েছে",
    result: "আপনার ফল", healthy: "পাতায় ধসা রোগের লক্ষণ পাওয়া যায়নি",
    early: "আগাম ধসার লক্ষণ থাকতে পারে", late: "নাবি ধসার লক্ষণ থাকতে পারে", unknown: "ফল পরিষ্কার নয়",
    fieldHealthy: "বেশির ভাগ জায়গা ভালো দেখাচ্ছে", fieldWatch: "কয়েকটি জায়গায় সমস্যা দেখা গেছে",
    fieldUrgent: "জমির অনেক জায়গায় রোগের লক্ষণ", fieldUnknown: "আরও পরিষ্কার ছবি দরকার",
    affected: "সমস্যার সংকেত", clear: "ভালো দেখাচ্ছে", uncertain: "নিশ্চিত নয়",
    now: "এখন", tomorrow: "আগামীকাল", helpAction: "সহায়তা নিন",
    todayHealthy: "আজ আর কিছু করতে হবে না। একই জায়গা মনে রাখুন।",
    todayRisk: "আক্রান্ত মনে হওয়া পাতাগুলো চিহ্নিত করুন। ভেজা পাতা অন্য জমিতে নেবেন না।",
    tomorrowHealthy: "কাল সকালে একই জায়গা আবার দেখুন।",
    tomorrowRisk: "কাল সকালে কাছের গাছগুলোও দেখুন এবং নতুন ছবি তুলুন।",
    expertHealthy: "লক্ষণ ছড়ালে কৃষি বিশেষজ্ঞকে জানান।",
    expertRisk: "রাসায়নিক ব্যবহারের আগে কৃষি বিশেষজ্ঞের পরামর্শ নিন।",
    todayUnknown: "দিনের আলোতে পাঁচ জায়গার পরিষ্কার ছবি আবার তুলুন।", tomorrowUnknown: "এই ফল দেখে কোনো চিকিৎসার সিদ্ধান্ত নেবেন না।", expertUnknown: "আক্রান্ত গাছ কৃষি বিশেষজ্ঞকে দেখান।",
    why: "আলুসাথী কেন এমন বলল?", confidence: "AI-এর মিল", limitations: "এই ফল সহায়তার জন্য। নিশ্চিত রোগ নির্ণয় নয়।",
    fieldValidationPending: "মাঠের পরীক্ষায় AI এখনো যথেষ্ট নির্ভরযোগ্য নয়। তাই নিরাপত্তার জন্য রোগের নাম দেখানো হয়নি।",
    photoProblem: "ছবিটি আরেকবার তুলুন", tooDark: "ছবিতে আলো কম ছিল।", tooBright: "ছবিতে আলো বেশি ছিল।", lowContrast: "পাতাটি পরিষ্কার বোঝা যায়নি।",
    callExpert: "কৃষি বিশেষজ্ঞকে কল করুন", callCharge: "১৬১২৩ · চার্জ প্রযোজ্য",
    listen: "শুনুন", stop: "বন্ধ করুন", newScan: "নতুন ছবি",
    diaryKicker: "আমার জমি", diaryTitle: "আগের পরীক্ষাগুলো",
    diaryBody: "ফল নিজে থেকে এই ফোনে সেভ হয়। কোনো অ্যাকাউন্ট লাগে না।",
    emptyDiary: "এখনও কোনো পরীক্ষা সেভ হয়নি", emptyDiaryBody: "প্রথম ছবি পরীক্ষা করলে ফল এখানে থাকবে।",
    quickLabel: "একটি পাতা", fieldLabel: "৫ জায়গা", scans: "টি ছবি", delete: "মুছুন", clearAll: "সব মুছুন",
    helpKicker: "সহজ সাহায্য", helpTitle: "তিনটি কথা মনে রাখুন",
    helpCards: [
      ["একটি পাতা", "এক ছবিতে একটি পাতা রাখুন। খুব দূর থেকে ছবি তুলবেন না।"],
      ["দিনের আলো", "সকাল বা বিকেলের আলো ভালো। ছায়া ও ফ্ল্যাশ এড়িয়ে চলুন।"],
      ["আবার দেখুন", "একটি ফলের ওপর ভরসা না করে ২৪–৪৮ ঘণ্টা পরে আবার পরীক্ষা করুন।"],
    ],
    sourceTitle: "ভরসাযোগ্য তথ্য",
    sourceBody: "আবহাওয়া ও মাঠের করণীয় BAMIS, BARI ও কৃষি তথ্য সার্ভিসের প্রকাশিত তথ্যের ভিত্তিতে সহজ করা হয়েছে।",
    aboutTitle: "এই AI সম্পর্কে",
    aboutBody: "১৩,৮০০টি আলাদা আঞ্চলিক ছবির পরীক্ষায় এই AI প্রতি ১০০টির মধ্যে প্রায় ৫১টি ঠিক চিনেছে। তাই এটি এখন শুধু গবেষণার জন্য; কৃষকের রোগ নির্ণয়ের জন্য নয়।",
    modelReady: "AI প্রস্তুত", modelResearch: "গবেষণা পর্যায়", modelMissing: "AI সংযোগ নেই", modelVersion: "মডেল", regionalTest: "আঞ্চলিক পরীক্ষা",
    privacy: "আপনার ছবি প্রশিক্ষণে ব্যবহার করা হয় না।", footer: "আলুসাথী · কৃষকের সিদ্ধান্ত, AI-এর সহায়তা",
  },
  en: {
    brandLine: "Understand potato disease, simply",
    navScan: "Scan", navField: "My field", navHelp: "Help", online: "Online", offline: "Offline",
    heroKicker: "A digital companion for Bangladesh potato farmers",
    heroTitle: "Photograph a leaf.", heroAccent: "See risk earlier.",
    heroBody: "AluSathi uses leaf photos, weather and checks from different parts of a field to help farmers understand possible disease risk.",
    quick: "Check one leaf", quickHint: "Quick result", full: "Check whole field", fullHint: "5 places · stronger evidence",
    trust: "An AI result is not a confirmed diagnosis",
    weatherLoading: "Checking weather…", weatherGood: "Keep watch today", weatherRisk: "Weather may support disease",
    weatherUnavailable: "Weather is unavailable now", humidity: "Humidity",
    scanKicker: "Leaf check", scanTitle: "Take one clear photograph",
    scanBody: "Bring one leaf close. Use daylight. Hold the camera still.",
    fieldTitle: "Check five field places", fieldBody: "Only one place is shown at a time. Photograph one leaf at each place.",
    point: "Place", of: "of",
    pointInstructions: ["Front-left of the field", "Front-right of the field", "Middle of the field", "Back-left of the field", "Back-right of the field"],
    choose: "Take or choose a photo", formats: "JPG, PNG or WebP · up to 8 MB", replace: "Choose another",
    analyze: "Check this photo", analyzing: "Checking photo…", nextPoint: "Go to next place", retake: "Take again",
    noResult: "Your result will appear here", noResultBody: "AluSathi checks three conditions: healthy, early blight and late blight.",
    error: "The photo could not be checked. Try again with a clear photo.", offlineSaved: "The photo is saved on this phone. It will be checked when internet returns.",
    syncDone: "saved photo(s) checked",
    result: "Your result", healthy: "No supported blight pattern was found", early: "Early-blight signs may be present",
    late: "Late-blight signs may be present", unknown: "The result is unclear",
    fieldHealthy: "Most field places look clear", fieldWatch: "Some field places need attention",
    fieldUrgent: "Disease signs appear across the field", fieldUnknown: "More clear photographs are needed",
    affected: "Possible problem", clear: "Looks clear", uncertain: "Uncertain",
    now: "Now", tomorrow: "Tomorrow", helpAction: "Get help",
    todayHealthy: "No immediate action is needed. Remember this place.",
    todayRisk: "Mark affected-looking leaves. Do not carry wet foliage to another field.",
    tomorrowHealthy: "Check the same place again tomorrow morning.",
    tomorrowRisk: "Check nearby plants tomorrow morning and take new photos.",
    expertHealthy: "Contact an agricultural expert if symptoms spread.",
    expertRisk: "Confirm with an agricultural expert before using chemicals.",
    todayUnknown: "Retake clear daylight photos from all five places.", tomorrowUnknown: "Do not make a treatment decision from these results.", expertUnknown: "Show affected plants to an agricultural expert.",
    why: "Why did AluSathi say this?", confidence: "AI match", limitations: "This result supports decisions. It is not a confirmed diagnosis.",
    fieldValidationPending: "Field testing shows that this AI is not reliable enough yet. The disease name is hidden for safety.",
    photoProblem: "Take the photograph again", tooDark: "The photograph was too dark.", tooBright: "The photograph was too bright.", lowContrast: "The leaf was not clear enough.",
    callExpert: "Call an agricultural expert", callCharge: "16123 · charges apply",
    listen: "Listen", stop: "Stop", newScan: "New scan",
    diaryKicker: "My field", diaryTitle: "Previous checks", diaryBody: "Results save automatically on this phone. No account is required.",
    emptyDiary: "No checks saved yet", emptyDiaryBody: "Your first completed check will appear here.",
    quickLabel: "One leaf", fieldLabel: "5 places", scans: "photos", delete: "Delete", clearAll: "Delete all",
    helpKicker: "Simple help", helpTitle: "Remember three things",
    helpCards: [
      ["One leaf", "Keep one leaf in each photo. Do not photograph from far away."],
      ["Daylight", "Morning or afternoon light works best. Avoid shadows and flash."],
      ["Check again", "Do not rely on one result. Check again after 24–48 hours."],
    ],
    sourceTitle: "Trusted information",
    sourceBody: "Weather and field actions are simplified from published BAMIS, BARI and Agricultural Information Service information.",
    aboutTitle: "About this AI",
    aboutBody: "On 13,800 separate regional images, this AI identified about 51 in every 100 correctly. It is therefore research-only, not ready for farmer diagnosis.",
    modelReady: "AI ready", modelResearch: "Research stage", modelMissing: "AI disconnected", modelVersion: "Model", regionalTest: "Regional test",
    privacy: "Your photograph is not used for training.", footer: "AluSathi · Farmer decisions, assisted by AI",
  },
} as const;

type Copy = typeof COPY.bn | typeof COPY.en;

function readDiary(): DiaryEntry[] {
  try { return JSON.parse(localStorage.getItem(DIARY_KEY) || "[]") as DiaryEntry[]; }
  catch { return []; }
}

function storeDiaryEntry(entry: DiaryEntry): DiaryEntry[] {
  const next = [entry, ...readDiary()].slice(0, 30);
  localStorage.setItem(DIARY_KEY, JSON.stringify(next));
  return next;
}

function riskFromResults(results: DiseaseResult[], weather: WeatherData | null): Risk {
  const affected = results.filter((item) => item.label === "early_blight" || item.label === "late_blight").length;
  const uncertain = results.filter((item) => item.label === "unknown").length;
  const weatherPressure = Boolean(weather && weather.humidity >= 80 && weather.temperature >= 14 && weather.temperature <= 24);
  if (!results.length || uncertain > results.length / 2) return "uncertain";
  if (affected >= 3 || (affected >= 2 && weatherPressure)) return "urgent";
  if (affected >= 1) return "watch";
  return "healthy";
}

export default function AluSathiDashboard() {
  const { language, setLanguage } = useLanguage();
  const copy = COPY[language];
  const [mode, setMode] = useState<ScanMode>("quick");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [fieldResults, setFieldResults] = useState<DiseaseResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(navigator.onLine);
  const [speaking, setSpeaking] = useState(false);
  const [district, setDistrict] = useState(() => localStorage.getItem("alusathi-district") || "Rangpur");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [diary, setDiary] = useState<DiaryEntry[]>(readDiary);
  const [modelHealth, setModelHealth] = useState<ModelHealth | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncedCount, setSyncedCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const scanRef = useRef<HTMLElement>(null);
  const syncingRef = useRef(false);
  const fieldComplete = fieldResults.length === FIELD_POINTS.length;
  const fieldRisk = useMemo(() => riskFromResults(fieldResults, weather), [fieldResults, weather]);

  const syncPendingScans = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return;
    syncingRef.current = true;
    let completed = 0;
    try {
      const pending = await listPendingScans();
      for (const item of pending) {
        try {
          const queuedFile = new File([item.blob], item.fileName, { type: item.fileType });
          const queuedResult = await scanPotatoLeaf(queuedFile);
          setDiary(storeDiaryEntry({
            id: crypto.randomUUID(), createdAt: item.createdAt, mode: "quick", district: item.district,
            risk: riskFromResults([queuedResult], null), label: queuedResult.label, scanCount: 1,
            affectedCount: ["early_blight", "late_blight"].includes(queuedResult.label) ? 1 : 0,
          }));
          await deletePendingScan(item.id);
          completed += 1;
        } catch {
          break;
        }
      }
    } finally {
      setPendingCount((await listPendingScans()).length);
      if (completed) setSyncedCount(completed);
      syncingRef.current = false;
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    const updateOnline = () => {
      setOnline(navigator.onLine);
      if (navigator.onLine) syncPendingScans();
    };
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    getModelHealth().then(setModelHealth);
    listPendingScans().then((items) => {
      setPendingCount(items.length);
      if (navigator.onLine && items.length) syncPendingScans();
    });
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
      window.speechSynthesis?.cancel();
    };
  }, [language, syncPendingScans]);

  useEffect(() => {
    setWeatherLoading(true);
    getWeather(district).then(setWeather).catch(() => setWeather(null)).finally(() => setWeatherLoading(false));
    localStorage.setItem("alusathi-district", district);
  }, [district]);

  function startScan(nextMode: ScanMode) {
    setMode(nextMode); setFile(null); setPreview(null); setResult(null); setFieldResults([]); setError("");
    requestAnimationFrame(() => scanRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function chooseFile(next?: File) {
    if (!next) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(next.type) || next.size > 8 * 1024 * 1024) { setError(copy.error); return; }
    if (preview) URL.revokeObjectURL(preview);
    setFile(next); setPreview(URL.createObjectURL(next)); setResult(null); setError("");
  }

  function saveDiary(entry: DiaryEntry) {
    setDiary(storeDiaryEntry(entry));
  }

  async function analyze() {
    if (!file) return;
    if (!online) {
      try {
        await savePendingScan(file, district);
        setSyncedCount(0);
        setPendingCount((count) => count + 1);
        setError(copy.offlineSaved);
      } catch {
        setError(copy.error);
      }
      return;
    }
    setLoading(true); setError("");
    try {
      const nextResult = await scanPotatoLeaf(file);
      setResult(nextResult);
      if (mode === "quick") {
        saveDiary({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), mode, district,
          risk: riskFromResults([nextResult], weather), label: nextResult.label, scanCount: 1,
          affectedCount: ["early_blight", "late_blight"].includes(nextResult.label) ? 1 : 0, humidity: weather?.humidity });
      } else if (nextResult.label !== "unknown") {
        const nextField = [...fieldResults, nextResult];
        setFieldResults(nextField);
        if (nextField.length === FIELD_POINTS.length) {
          const risk = riskFromResults(nextField, weather);
          const labels = nextField.map((item) => item.label);
          const late = labels.filter((label) => label === "late_blight").length;
          const early = labels.filter((label) => label === "early_blight").length;
          saveDiary({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), mode, district, risk,
            label: late >= early && late ? "late_blight" : early ? "early_blight" : risk === "uncertain" ? "unknown" : "healthy",
            scanCount: nextField.length, affectedCount: late + early, humidity: weather?.humidity });
        }
      }
    } catch { setError(copy.error); }
    finally { setLoading(false); }
  }

  function nextFieldPoint() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null); setPreview(null); setResult(null); setError("");
    scanRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function retakeCurrent() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null); setPreview(null); setResult(null); setError("");
    scanRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "bn" ? "bn-BD" : "en-US"; utterance.rate = 0.88;
    utterance.onend = () => setSpeaking(false); setSpeaking(true); window.speechSynthesis.speak(utterance);
  }

  function removeDiary(id?: string) {
    const next = id ? diary.filter((entry) => entry.id !== id) : [];
    localStorage.setItem(DIARY_KEY, JSON.stringify(next)); setDiary(next);
  }

  const weatherRisk = Boolean(weather && weather.humidity >= 80 && weather.temperature >= 14 && weather.temperature <= 24);

  return <div className={language === "bn" ? "font-bangla" : ""}>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="site-header">
      <div className="app-shell flex h-16 items-center justify-between gap-3">
        <a href="#top" className="flex items-center gap-3" aria-label="AluSathi home"><span className="brand-mark"><Leaf size={22} /></span><span><strong className="block text-lg leading-none">আলুসাথী</strong><small className="mt-1 hidden text-[11px] font-semibold text-ink/50 sm:block">{copy.brandLine}</small></span></a>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation"><a className="top-nav" href="#scan"><Camera size={16} />{copy.navScan}</a><a className="top-nav" href="#diary"><History size={16} />{copy.navField}</a><a className="top-nav" href="#help"><HelpCircle size={16} />{copy.navHelp}</a></nav>
        <div className="flex items-center gap-2"><span className={`connection-chip ${online ? "online" : "offline"}`}>{online ? <ShieldCheck size={14} /> : <WifiOff size={14} />}{online ? copy.online : copy.offline}{pendingCount > 0 ? ` · ${pendingCount}` : ""}</span><button className="icon-button" onClick={() => setLanguage(language === "bn" ? "en" : "bn")} aria-label="Change language"><Globe2 size={18} /><span>{language === "bn" ? "EN" : "বাংলা"}</span></button><button className="icon-button md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button></div>
      </div>
      {menuOpen && <nav className="mobile-menu app-shell" aria-label="Mobile navigation"><a href="#scan" onClick={() => setMenuOpen(false)}>{copy.navScan}</a><a href="#diary" onClick={() => setMenuOpen(false)}>{copy.navField}</a><a href="#help" onClick={() => setMenuOpen(false)}>{copy.navHelp}</a></nav>}
    </header>
    {syncedCount > 0 && <div className="sync-notice" role="status"><div className="app-shell"><Check size={18} /><strong>{language === "bn" ? `${syncedCount}${copy.syncDone}` : `${syncedCount} ${copy.syncDone}`}</strong><button onClick={() => setSyncedCount(0)} aria-label={copy.stop}><X size={17} /></button></div></div>}

    <main id="main">
      <section id="top" className="hero-section"><div className="hero-photo" aria-hidden="true" /><div className="hero-wash" aria-hidden="true" /><div className="nakshi-pattern" aria-hidden="true" />
        <div className="app-shell relative grid min-h-[760px] items-end pb-12 pt-28 sm:min-h-[720px] sm:pb-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:pb-8">
          <div className="hero-copy animate-rise"><p className="hero-kicker"><span /><Sprout size={17} />{copy.heroKicker}</p><h1>{copy.heroTitle}<br /><em>{copy.heroAccent}</em></h1><p className="hero-body">{copy.heroBody}</p>
            <div className="mt-8 grid gap-3 sm:max-w-xl sm:grid-cols-2"><button className="hero-action primary" onClick={() => startScan("quick")}><span className="action-icon"><Camera size={24} /></span><span><strong>{copy.quick}</strong><small>{copy.quickHint}</small></span><ArrowRight className="ml-auto" size={20} /></button><button className="hero-action secondary" onClick={() => startScan("field")}><span className="action-icon"><MapPin size={24} /></span><span><strong>{copy.full}</strong><small>{copy.fullHint}</small></span><ArrowRight className="ml-auto" size={20} /></button></div>
            <p className="mt-5 flex items-center gap-2 text-sm font-bold text-ink/60"><ShieldCheck size={17} className="text-leaf" />{copy.trust}</p>
          </div><div className="hidden lg:block" />
        </div>
      </section>

      <section className="weather-ribbon" aria-live="polite"><div className="app-shell flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className={`weather-icon ${weatherRisk ? "risk" : ""}`}><CloudRain size={21} /></span><div><strong className="block">{weatherLoading ? copy.weatherLoading : weather ? (weatherRisk ? copy.weatherRisk : copy.weatherGood) : copy.weatherUnavailable}</strong>{weather && <small className="text-ink/55">{district} · {weather.temperature}°C · {copy.humidity} {weather.humidity}%</small>}</div></div><label className="district-picker"><MapPin size={15} /><span className="sr-only">District</span><select value={district} onChange={(event) => setDistrict(event.target.value)}><option>Rangpur</option><option>Bogura</option><option>Dinajpur</option><option>Panchagarh</option><option>Thakurgaon</option><option>Rajshahi</option><option>Munshiganj</option></select><ChevronDown size={15} /></label></div></section>

      <section id="scan" ref={scanRef} className="app-shell scroll-mt-24 py-16 sm:py-24">
        <div className="section-heading"><div><p className="section-kicker"><ScanLine size={16} />{copy.scanKicker}</p><h2>{mode === "field" ? copy.fieldTitle : copy.scanTitle}</h2><p>{mode === "field" ? copy.fieldBody : copy.scanBody}</p></div><div className="mode-switch" role="group" aria-label="Scan mode"><button className={mode === "quick" ? "active" : ""} onClick={() => startScan("quick")}>{copy.quick}</button><button className={mode === "field" ? "active" : ""} onClick={() => startScan("field")}>{copy.full}</button></div></div>
        {mode === "field" && !fieldComplete && <div className="field-progress-card"><div className="field-path" aria-label={`${fieldResults.length} of 5 completed`}>{FIELD_POINTS.map((point, index) => <span key={point} className={index < fieldResults.length ? "done" : index === fieldResults.length ? "current" : ""}>{index < fieldResults.length ? <Check size={16} /> : point}</span>)}</div><div><p className="text-sm font-bold text-leaf">{copy.point} {fieldResults.length + 1} {copy.of} 5</p><strong className="mt-1 block text-xl text-ink">{copy.pointInstructions[fieldResults.length]}</strong></div></div>}
        <div className="scan-workspace"><div className="scan-capture"><label className={`camera-stage ${preview ? "has-image" : ""}`}><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={(event) => chooseFile(event.target.files?.[0])} />{preview ? <img src={preview} alt={language === "bn" ? "বাছাই করা আলু পাতা" : "Selected potato leaf"} /> : <div className="camera-empty"><span className="leaf-frame"><Leaf size={62} /></span><strong>{copy.choose}</strong><small>{copy.formats}</small></div>}{preview && <span className="replace-photo"><RefreshCw size={16} />{copy.replace}</span>}</label><div className="photo-tips"><span><Check />{language === "bn" ? "একটি পাতা" : "One leaf"}</span><span><Check />{language === "bn" ? "দিনের আলো" : "Daylight"}</span><span><Check />{language === "bn" ? "কাছে থেকে" : "Close view"}</span></div>{error && <p className="error-message" role="alert"><AlertTriangle size={18} />{error}</p>}<button className="main-button" disabled={!file || loading} onClick={analyze}>{loading ? <Loader2 className="animate-spin" /> : <ScanLine />}{loading ? copy.analyzing : copy.analyze}</button></div>
          <div className="result-stage" aria-live="polite">{fieldComplete ? <FieldResult results={fieldResults} risk={fieldRisk} weather={weather} copy={copy} speak={speak} speaking={speaking} restart={() => startScan("field")} /> : result ? <SingleResult result={result} language={language} copy={copy} speak={speak} speaking={speaking} retake={retakeCurrent} /> : <div className="result-empty"><span><Leaf size={42} /></span><h3>{copy.noResult}</h3><p>{copy.noResultBody}</p></div>}{mode === "field" && result && result.label !== "unknown" && !fieldComplete && <button className="next-button" onClick={nextFieldPoint}>{copy.nextPoint}<ArrowRight size={18} /></button>}</div></div>
      </section>

      <section id="diary" className="diary-section scroll-mt-20"><div className="app-shell py-16 sm:py-24"><div className="section-heading light"><div><p className="section-kicker"><History size={16} />{copy.diaryKicker}</p><h2>{copy.diaryTitle}</h2><p>{copy.diaryBody}</p></div>{diary.length > 0 && <button className="text-button" onClick={() => removeDiary()}><Trash2 size={16} />{copy.clearAll}</button>}</div>{diary.length === 0 ? <div className="empty-diary"><span><History size={31} /></span><h3>{copy.emptyDiary}</h3><p>{copy.emptyDiaryBody}</p><button className="secondary-main" onClick={() => startScan("quick")}><Camera size={18} />{copy.quick}</button></div> : <div className="diary-grid">{diary.map((entry) => <DiaryCard key={entry.id} entry={entry} language={language} copy={copy} onDelete={() => removeDiary(entry.id)} />)}</div>}</div></section>

      <section id="help" className="app-shell scroll-mt-20 py-16 sm:py-24"><div className="section-heading"><div><p className="section-kicker"><HelpCircle size={16} />{copy.helpKicker}</p><h2>{copy.helpTitle}</h2></div></div><div className="help-grid">{copy.helpCards.map(([title, body], index) => <article key={title}><span>{index + 1}</span><h3>{title}</h3><p>{body}</p><button onClick={() => speak(`${title}. ${body}`)}><Ear size={17} />{copy.listen}</button></article>)}</div>
        <div className="trust-grid"><article className="source-card"><BookOpen /><div><h3>{copy.sourceTitle}</h3><p>{copy.sourceBody}</p><div className="source-links"><a href="https://www.bamis.gov.bd/en/diseases/1/all/52/" target="_blank" rel="noreferrer">BAMIS</a><a href="https://bari.gov.bd/" target="_blank" rel="noreferrer">BARI</a><a href="https://ais.gov.bd/" target="_blank" rel="noreferrer">AIS</a><a href="https://moa.gov.bd/pages/internal-eservices/%E0%A6%95%E0%A7%83%E0%A6%B7%E0%A6%BF-%E0%A6%95%E0%A6%B2-%E0%A6%B8%E0%A7%87%E0%A6%A8%E0%A7%8D%E0%A6%9F%E0%A6%BE%E0%A6%B0-%E0%A7%A7%E0%A7%AC%E0%A7%A7%E0%A7%A8%E0%A7%A9-a71861-694031b6a31054345f0d0e12" target="_blank" rel="noreferrer">১৬১২৩</a></div></div></article><article className="model-card"><ShieldCheck /><div><div className="flex flex-wrap items-center gap-2"><h3>{copy.aboutTitle}</h3><span className={`model-status ${modelHealth?.status !== "ready" ? "missing" : modelHealth.field_validated ? "ready" : "research"}`}>{modelHealth?.status !== "ready" ? copy.modelMissing : modelHealth.field_validated ? copy.modelReady : copy.modelResearch}</span></div><p>{copy.aboutBody}</p><dl><div><dt>{copy.modelVersion}</dt><dd>{modelHealth?.model_version || modelHealth?.model || "MobileNetV3-Small"}</dd></div><div><dt>{copy.regionalTest}</dt><dd>{modelHealth?.regional_test_accuracy ? `${Math.round(modelHealth.regional_test_accuracy * 100)}% · ${modelHealth.regional_test_images?.toLocaleString(language === "bn" ? "bn-BD" : "en-GB")} ${language === "bn" ? "ছবি" : "images"}` : language === "bn" ? "তথ্য নেই" : "Unavailable"}</dd></div><div><dt>{language === "bn" ? "শ্রেণি" : "Classes"}</dt><dd>{language === "bn" ? "সুস্থ · আগাম ধসা · নাবি ধসা" : "Healthy · Early blight · Late blight"}</dd></div></dl></div></article></div>
      </section>
    </main>

    <footer><div className="app-shell"><div className="footer-brand"><span className="brand-mark"><Leaf size={22} /></span><div><strong>আলুসাথী</strong><small>{copy.footer}</small></div></div><p><ShieldCheck size={15} />{copy.privacy}</p></div></footer>
    <nav className="bottom-nav" aria-label="Mobile navigation"><a href="#scan"><Camera />{copy.navScan}</a><a href="#diary"><History />{copy.navField}</a><a href="#help"><HelpCircle />{copy.navHelp}</a></nav>
  </div>;
}

function labelText(label: DiseaseLabel, copy: Copy) {
  return label === "healthy" ? copy.healthy : label === "early_blight" ? copy.early : label === "late_blight" ? copy.late : copy.unknown;
}

function riskText(risk: Risk, copy: Copy) {
  return risk === "healthy" ? copy.fieldHealthy : risk === "watch" ? copy.fieldWatch : risk === "urgent" ? copy.fieldUrgent : copy.fieldUnknown;
}

function SingleResult({ result, language, copy, speak, speaking, retake }: { result: DiseaseResult; language: "bn" | "en"; copy: Copy; speak: (text: string) => void; speaking: boolean; retake: () => void }) {
  const status: Risk = result.label === "healthy" ? "healthy" : result.label === "unknown" ? "uncertain" : "watch";
  const title = labelText(result.label, copy);
  const actions = result.next_steps[language];
  const qualityMessages = result.quality.issues.map((issue) => issue === "too_dark" ? copy.tooDark : issue === "too_bright" ? copy.tooBright : copy.lowContrast);
  return <div className="result-content animate-rise"><div className={`result-symbol ${status}`}>{status === "healthy" ? <Check /> : <AlertTriangle />}</div><p className="result-kicker">{copy.result}</p><h3>{title}</h3>{qualityMessages.length > 0 && <div className="photo-warning" role="status"><Camera size={20} /><div><strong>{copy.photoProblem}</strong>{qualityMessages.map((message) => <p key={message}>{message}</p>)}</div></div>}<button className="listen-button" aria-pressed={speaking} onClick={() => speak(`${title}. ${actions.join(" ")}`)}><Mic2 size={18} />{speaking ? copy.stop : copy.listen}</button><div className="action-list">{[copy.now, copy.tomorrow, copy.helpAction].map((heading, index) => <article key={heading}><span>{index + 1}</span><div><strong>{heading}</strong><p>{actions[index]}</p></div></article>)}</div><div className="result-actions">{result.label === "unknown" && <button className="secondary-main" onClick={retake}><RefreshCw size={18} />{copy.retake}</button>}<a className="expert-call" href="tel:16123"><PhoneCall size={18} /><span><strong>{copy.callExpert}</strong><small>{copy.callCharge}</small></span></a></div><details className="why-card"><summary>{copy.why}<ChevronDown size={17} /></summary><div>{result.field_validated ? <><p>{copy.confidence}: <strong>{Math.round(result.confidence * 100)}%</strong></p><div className="confidence-track"><span style={{ width: `${Math.round(result.confidence * 100)}%` }} /></div><p className="mt-3">{copy.limitations}</p></> : <p>{copy.fieldValidationPending}</p>}</div></details></div>;
}

function FieldResult({ results, risk, weather, copy, speak, speaking, restart }: { results: DiseaseResult[]; risk: Risk; weather: WeatherData | null; copy: Copy; speak: (text: string) => void; speaking: boolean; restart: () => void }) {
  const affected = results.filter((item) => item.label === "early_blight" || item.label === "late_blight").length;
  const clear = results.filter((item) => item.label === "healthy").length;
  const uncertain = results.filter((item) => item.label === "unknown").length;
  const title = riskText(risk, copy); const risky = risk === "watch" || risk === "urgent";
  const actions = risk === "uncertain"
    ? [copy.todayUnknown, copy.tomorrowUnknown, copy.expertUnknown]
    : [risky ? copy.todayRisk : copy.todayHealthy, risky ? copy.tomorrowRisk : copy.tomorrowHealthy, risky ? copy.expertRisk : copy.expertHealthy];
  return <div className="result-content field-summary animate-rise"><div className={`result-symbol ${risk}`}>{risk === "healthy" ? <Check /> : <AlertTriangle />}</div><p className="result-kicker">{copy.full}</p><h3>{title}</h3><button className="listen-button" aria-pressed={speaking} onClick={() => speak(`${title}. ${actions.join(" ")}`)}><Mic2 size={18} />{speaking ? copy.stop : copy.listen}</button><div className="field-counts"><div className="risk"><strong>{affected}</strong><span>{copy.affected}</span></div><div className="clear"><strong>{clear}</strong><span>{copy.clear}</span></div><div className="unknown"><strong>{uncertain}</strong><span>{copy.uncertain}</span></div></div>{weather && <p className="weather-context"><CloudRain size={18} />{weather.humidity}% {copy.humidity} · {weather.temperature}°C</p>}<div className="action-list compact">{[copy.now, copy.tomorrow, copy.helpAction].map((heading, index) => <article key={heading}><span>{index + 1}</span><div><strong>{heading}</strong><p>{actions[index]}</p></div></article>)}</div><a className="expert-call mt-4" href="tel:16123"><PhoneCall size={18} /><span><strong>{copy.callExpert}</strong><small>{copy.callCharge}</small></span></a><button className="secondary-main mt-3 w-full justify-center" onClick={restart}><RefreshCw size={18} />{copy.newScan}</button></div>;
}

function DiaryCard({ entry, language, copy, onDelete }: { entry: DiaryEntry; language: "bn" | "en"; copy: Copy; onDelete: () => void }) {
  const date = new Intl.DateTimeFormat(language === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(entry.createdAt));
  return <article className="diary-card"><div className="flex items-start justify-between gap-3"><span className={`diary-status ${entry.risk}`}>{entry.risk === "healthy" ? <Check /> : <AlertTriangle />}</span><button onClick={onDelete} aria-label={copy.delete}><Trash2 size={16} /></button></div><p className="mt-5 text-xs font-bold uppercase tracking-[.12em] text-white/45">{entry.mode === "field" ? copy.fieldLabel : copy.quickLabel}</p><h3>{entry.mode === "field" ? riskText(entry.risk, copy) : labelText(entry.label, copy)}</h3><div className="mt-5 flex flex-wrap gap-2"><span><MapPin />{entry.district}</span><span><Camera />{entry.scanCount} {copy.scans}</span>{entry.humidity && <span><CloudRain />{entry.humidity}%</span>}</div><time>{date}</time></article>;
}
