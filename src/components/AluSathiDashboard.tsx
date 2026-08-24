import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  CloudSun,
  Droplets,
  Globe2,
  Leaf,
  Loader2,
  Lightbulb,
  MapPin,
  PhoneCall,
  ScanLine,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sprout,
  Upload,
  Users,
  Wheat,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { DiseaseResult, scanPotatoLeaf } from "@/lib/disease-api";
import { getWeather, WeatherData } from "@/lib/api";


const COPY = {
  en: {
    brandLine: "Potato intelligence for Bangladesh",
    demo: "Online-data demo model",
    titleA: "See crop risk",
    titleB: "before it spreads.",
    subtitle: "One field view for disease screening, yield planning, climate readiness and verified buyer matching.",
    scanNow: "Scan a potato leaf",
    fieldView: "View field plan",
    season: "Rangpur demo · Week 7",
    scanTitle: "Disease Scout",
    scanSubtitle: "Upload a clear leaf photo. The demo checks healthy, early blight and late blight patterns.",
    camera: "Take or upload photo",
    format: "JPG, PNG or WebP · maximum 8 MB",
    replace: "Replace photo",
    analyze: "Analyze leaf",
    analyzing: "Analyzing image",
    tips: "Better scan",
    tip1: "Use daylight and keep the leaf sharp",
    tip2: "Show one affected leaf close-up",
    tip3: "Include both sides in separate scans",
    awaiting: "Your scan result will appear here",
    awaitingBody: "The model returns a probability—not a guaranteed diagnosis. Uncertain scans are sent for expert review.",
    result: "Screening result",
    confidence: "Model confidence",
    expert: "Expert review required",
    noExpert: "Continue routine monitoring",
    steps: "Safe next steps",
    limitation: "Demo limitation",
    limitationBody: "Trained on controlled online images. Do not use this result to select or apply pesticide.",
    fieldTitle: "One field, connected decisions",
    fieldSubtitle: "AluSathi is designed around yield improvement—not five disconnected AI features.",
    fieldHealth: "Field health",
    fieldHealthValue: "Watch closely",
    blightRisk: "Blight risk",
    blightRiskValue: "Elevated",
    harvest: "Harvest window",
    harvestValue: "28 Jan – 6 Feb",
    yield: "Expected yield",
    yieldValue: "29.4 t/ha",
    yieldTitle: "Yield forecast",
    yieldSubtitle: "Probabilistic range · BARI Alu-25 · 0.84 ha",
    conservative: "Lower range",
    expected: "Most likely",
    upside: "Upper range",
    scenario: "Scenario",
    standard: "Current plan",
    response: "Early response",
    timing: "Precise timing",
    factors: "Main forecast drivers",
    canopy: "Canopy condition",
    weatherFit: "Weather signal",
    diseasePressure: "Disease pressure",
    fieldRecords: "Field records",
    visionLabel: "AI leaf screening",
    coreLabel: "Yield planning demo",
    climateLabel: "Weather guidance",
    marketLabel: "Market demo",
    demoScenario: "Illustrative scenario",
    fieldProfile: "Your field profile",
    fieldProfileBody: "These inputs connect weather and planning to one field.",
    district: "District",
    variety: "Variety",
    area: "Land (hectares)",
    planted: "Planting date",
    update: "Update live weather",
    updating: "Checking weather",
    currentWeather: "Current weather",
    weatherUnavailable: "Live weather unavailable; showing the labelled demo scenario.",
    climateTitle: "Climate-ready field plan",
    climateBody: "Cool, humid weather can raise late-blight pressure.",
    climateAction: "Photograph the north block tomorrow morning and clear standing water before evening.",
    marketTitle: "Verified buyer matches",
    marketBody: "Matched against expected date, grade, quantity and travel distance.",
    marketNote: "Prices and buyers below are illustrative—not verified live offers.",
    price: "Demo price",
    netIncome: "Estimated net after transport",
    updated: "Example updated 10:30 · not live",
    match: "match",
    consent: "Farmer contact remains hidden until consent",
    safetyTitle: "Human decision, AI evidence",
    safetyBody: "Chemical advice is drafted from approved sources and released only after a field officer reviews the scan, weather and field history.",
    historyTitle: "What happened in earlier seasons?",
    historyNote: "Illustrative demo history—not a real farmer record. Replace it with consented local field data before deployment.",
    happened: "What happened",
    actionTaken: "What farmers did",
    outcome: "Harvest result",
    meaningTitle: "In simple words",
    meaningBody: "Similar cool, wet weather previously helped blight spread. Take clear photos now, remove standing water and ask the field officer before using any chemical.",
    practicalTips: "Easy field tips",
    practicalTip1: "Check 10 plants from different parts of the field every morning.",
    practicalTip2: "Photograph the same marked plants every two days to compare changes.",
    practicalTip3: "Keep a simple notebook: rain, irrigation, symptoms and action taken.",
    urgentTitle: "Call a field officer today when",
    urgentBody: "Spots spread to nearby plants within 24–48 hours, white mould appears under leaves, or many plants suddenly collapse.",
    confidenceNote: "Model match—not diagnostic certainty",
    confidenceHigh: "High match",
    confidenceMedium: "Medium match",
    secondScan: "Every demo result needs a second scan or field-officer review before treatment.",
    officer: "Field officer queue",
    footer: "AluSathi · YieldMax demo",
    privacy: "Photos stay private and are not reused for training without consent.",
    navScan: "Scan",
    navField: "Field",
    navMarket: "Market",
    errorSize: "Choose an image smaller than 8 MB.",
    errorType: "Choose a JPG, PNG or WebP image.",
    errorScan: "The scan could not be completed. Try another clear photo.",
  },
  bn: {
    brandLine: "বাংলাদেশের আলু চাষের বুদ্ধিমত্তা",
    demo: "অনলাইন ডেটার ডেমো মডেল",
    titleA: "রোগ ছড়ানোর আগেই",
    titleB: "ঝুঁকি দেখুন।",
    subtitle: "রোগ শনাক্তকরণ, ফলন পরিকল্পনা, জলবায়ু প্রস্তুতি ও যাচাইকৃত ক্রেতা—সব এক জায়গায়।",
    scanNow: "আলুর পাতা স্ক্যান করুন",
    fieldView: "জমির পরিকল্পনা দেখুন",
    season: "রংপুর নমুনা · ৭ম সপ্তাহ",
    scanTitle: "রোগ পর্যবেক্ষক",
    scanSubtitle: "পাতার পরিষ্কার ছবি দিন। ডেমোটি সুস্থ পাতা, আগাম ধসা ও নাবি ধসার লক্ষণ পরীক্ষা করে।",
    camera: "ছবি তুলুন বা আপলোড করুন",
    format: "JPG, PNG বা WebP · সর্বোচ্চ ৮ MB",
    replace: "ছবি বদলান",
    analyze: "পাতা বিশ্লেষণ করুন",
    analyzing: "ছবি বিশ্লেষণ হচ্ছে",
    tips: "ভালো স্ক্যানের নিয়ম",
    tip1: "দিনের আলো ব্যবহার করুন এবং পাতা পরিষ্কার রাখুন",
    tip2: "একটি আক্রান্ত পাতার কাছের ছবি দিন",
    tip3: "পাতার দুই পাশ আলাদা স্ক্যানে দিন",
    awaiting: "স্ক্যানের ফল এখানে দেখা যাবে",
    awaitingBody: "মডেল সম্ভাবনা দেখায়—নিশ্চিত রোগ নির্ণয় নয়। অনিশ্চিত স্ক্যান বিশেষজ্ঞের কাছে যাবে।",
    result: "প্রাথমিক স্ক্যান ফলাফল",
    confidence: "মডেলের আস্থা",
    expert: "বিশেষজ্ঞের পর্যালোচনা প্রয়োজন",
    noExpert: "নিয়মিত পর্যবেক্ষণ চালিয়ে যান",
    steps: "নিরাপদ পরবর্তী পদক্ষেপ",
    limitation: "ডেমোর সীমাবদ্ধতা",
    limitationBody: "নিয়ন্ত্রিত অনলাইন ছবিতে প্রশিক্ষিত। এই ফল দেখে কীটনাশক বাছাই বা প্রয়োগ করবেন না।",
    fieldTitle: "একটি জমি, সংযুক্ত সিদ্ধান্ত",
    fieldSubtitle: "আলুসাথী পাঁচটি আলাদা ফিচার নয়—ফলন বৃদ্ধির একটি সম্পূর্ণ সিদ্ধান্ত ব্যবস্থা।",
    fieldHealth: "জমির স্বাস্থ্য",
    fieldHealthValue: "নজরে রাখুন",
    blightRisk: "ধসা রোগের ঝুঁকি",
    blightRiskValue: "বাড়ছে",
    harvest: "ফসল তোলার সময়",
    harvestValue: "২৮ জানু – ৬ ফেব্রু",
    yield: "প্রত্যাশিত ফলন",
    yieldValue: "২৯.৪ টন/হেক্টর",
    yieldTitle: "ফলনের পূর্বাভাস",
    yieldSubtitle: "সম্ভাব্য পরিসর · বারি আলু-২৫ · ০.৮৪ হেক্টর",
    conservative: "কম ফলনের সীমা",
    expected: "সবচেয়ে সম্ভাব্য",
    upside: "ভালো অবস্থার সীমা",
    scenario: "পরিস্থিতি",
    standard: "বর্তমান পরিকল্পনা",
    response: "আগাম ব্যবস্থা",
    timing: "সঠিক সময়",
    factors: "পূর্বাভাসের প্রধান কারণ",
    canopy: "গাছের পাতার অবস্থা",
    weatherFit: "আবহাওয়ার সংকেত",
    diseasePressure: "রোগের চাপ",
    fieldRecords: "জমির আগের তথ্য",
    visionLabel: "AI পাতার প্রাথমিক পরীক্ষা",
    coreLabel: "ফলন পরিকল্পনার নমুনা",
    climateLabel: "আবহাওয়ার করণীয়",
    marketLabel: "বাজারের নমুনা",
    demoScenario: "বোঝানোর জন্য নমুনা",
    fieldProfile: "আপনার জমির পরিচয়",
    fieldProfileBody: "এই তথ্য দিয়ে একই জমির আবহাওয়া ও পরিকল্পনা একসঙ্গে দেখা হবে।",
    district: "জেলা",
    variety: "আলুর জাত",
    area: "জমি (হেক্টর)",
    planted: "রোপণের তারিখ",
    update: "বর্তমান আবহাওয়া দেখুন",
    updating: "আবহাওয়া দেখা হচ্ছে",
    currentWeather: "বর্তমান আবহাওয়া",
    weatherUnavailable: "বর্তমান আবহাওয়া পাওয়া যায়নি; চিহ্নিত নমুনা পরিস্থিতি দেখানো হচ্ছে।",
    climateTitle: "জলবায়ু-প্রস্তুত জমি পরিকল্পনা",
    climateBody: "ঠান্ডা ও আর্দ্র আবহাওয়ায় নাবি ধসার ঝুঁকি বাড়তে পারে।",
    climateAction: "আগামীকাল সকালে উত্তর ব্লকের ছবি তুলুন এবং সন্ধ্যার আগে জমে থাকা পানি সরান।",
    marketTitle: "যাচাইকৃত ক্রেতার মিল",
    marketBody: "সম্ভাব্য তারিখ, গ্রেড, পরিমাণ ও দূরত্ব অনুযায়ী মিল করা হয়েছে।",
    marketNote: "নিচের দাম ও ক্রেতা শুধু নমুনা—যাচাইকৃত বর্তমান প্রস্তাব নয়।",
    price: "নমুনা দাম",
    netIncome: "পরিবহন বাদে আনুমানিক আয়",
    updated: "নমুনা সময় ১০:৩০ · লাইভ নয়",
    match: "মিল",
    consent: "কৃষকের সম্মতি না পাওয়া পর্যন্ত যোগাযোগের তথ্য গোপন থাকবে",
    safetyTitle: "সিদ্ধান্ত মানুষের, প্রমাণ AI-এর",
    safetyBody: "অনুমোদিত উৎস থেকে রাসায়নিক পরামর্শের খসড়া তৈরি হয়; মাঠ কর্মকর্তা ছবি, আবহাওয়া ও জমির ইতিহাস দেখে অনুমোদন করবেন।",
    historyTitle: "আগের মৌসুমে কী হয়েছিল?",
    historyNote: "এগুলো বোঝানোর জন্য তৈরি নমুনা তথ্য—কোনো বাস্তব কৃষকের রেকর্ড নয়। ব্যবহারের আগে সম্মতি নিয়ে স্থানীয় জমির তথ্য বসাতে হবে।",
    happened: "কী হয়েছিল",
    actionTaken: "কৃষক কী করেছিলেন",
    outcome: "ফসলের ফল",
    meaningTitle: "সহজ কথায় এর মানে",
    meaningBody: "আগেও ঠান্ডা ও ভেজা আবহাওয়ায় ধসা রোগ দ্রুত ছড়িয়েছিল। তাই এখনই পরিষ্কার ছবি তুলুন, জমে থাকা পানি সরান এবং কোনো রাসায়নিক ব্যবহারের আগে মাঠ কর্মকর্তাকে দেখান।",
    practicalTips: "সহজ মাঠের কৌশল",
    practicalTip1: "প্রতিদিন সকালে জমির ভিন্ন জায়গা থেকে ১০টি গাছ দেখুন।",
    practicalTip2: "একই গাছ চিহ্নিত করে দুই দিন পরপর ছবি তুলুন—দাগ বাড়ছে কি না বুঝবেন।",
    practicalTip3: "খাতায় চারটি বিষয় লিখুন: বৃষ্টি, সেচ, লক্ষণ এবং নেওয়া ব্যবস্থা।",
    urgentTitle: "আজই মাঠ কর্মকর্তাকে জানান যদি",
    urgentBody: "২৪–৪৮ ঘণ্টায় পাশের গাছে দাগ ছড়ায়, পাতার নিচে সাদা ছত্রাক দেখা যায় অথবা অনেক গাছ হঠাৎ নুয়ে পড়ে।",
    confidenceNote: "মডেলের মিল—নিশ্চিত রোগ নির্ণয় নয়",
    confidenceHigh: "মিল বেশি",
    confidenceMedium: "মিল মাঝারি",
    secondScan: "ডেমোর প্রতিটি ফলের পর চিকিৎসার আগে দ্বিতীয় ছবি বা মাঠ কর্মকর্তার পর্যালোচনা প্রয়োজন।",
    officer: "মাঠ কর্মকর্তার সারি",
    footer: "আলুসাথী · YieldMax ডেমো",
    privacy: "সম্মতি ছাড়া ছবি প্রশিক্ষণে ব্যবহার করা হবে না।",
    navScan: "স্ক্যান",
    navField: "জমি",
    navMarket: "বাজার",
    errorSize: "৮ MB-এর ছোট ছবি বাছাই করুন।",
    errorType: "JPG, PNG বা WebP ছবি বাছাই করুন।",
    errorScan: "স্ক্যান শেষ করা যায়নি। আরেকটি পরিষ্কার ছবি দিয়ে চেষ্টা করুন।",
  },
};

const scenarioYields = {
  standard: [23.8, 29.4, 34.1],
  response: [25.2, 31.1, 35.8],
  timing: [24.7, 30.5, 35.0],
};

const buyers = {
  en: [
    { name: "Rangpur Fresh Foods", meta: "Grade A · 12 t · 29 Jan · 18 km", score: 92, price: "৳31–33/kg", net: "৳3.48–3.71 lakh" },
    { name: "North Bengal Cold Store", meta: "Grade A/B · 20 t · 2 Feb · 27 km", score: 86, price: "৳29–31/kg", net: "৳5.31–5.69 lakh" },
  ],
  bn: [
    { name: "রংপুর ফ্রেশ ফুডস", meta: "গ্রেড A · ১২ টন · ২৯ জানু · ১৮ কিমি", score: 92, price: "৳৩১–৩৩/কেজি", net: "৳৩.৪৮–৩.৭১ লাখ" },
    { name: "নর্থ বেঙ্গল কোল্ড স্টোর", meta: "গ্রেড A/B · ২০ টন · ২ ফেব্রু · ২৭ কিমি", score: 86, price: "৳২৯–৩১/কেজি", net: "৳৫.৩১–৫.৬৯ লাখ" },
  ],
};

const fieldHistory = {
  en: [
    { season: "2022–23", event: "Four cool, humid nights; first spots seen in week 7", action: "Standing water cleared and affected rows marked", result: "27.6 t/ha" },
    { season: "2023–24", event: "38 mm rain followed by fast late-blight spread", action: "Photos reviewed by an officer; field movement limited", result: "25.9 t/ha" },
    { season: "2024–25", event: "Symptoms photographed two days earlier than usual", action: "Drainage opened early and nearby plants checked daily", result: "30.2 t/ha" },
  ],
  bn: [
    { season: "২০২২–২৩", event: "টানা ৪ রাত ঠান্ডা ও আর্দ্র ছিল; ৭ম সপ্তাহে প্রথম দাগ দেখা যায়", action: "জমে থাকা পানি সরিয়ে আক্রান্ত সারি চিহ্নিত করা হয়", result: "২৭.৬ টন/হেক্টর" },
    { season: "২০২৩–২৪", event: "৩৮ মিমি বৃষ্টির পর নাবি ধসা দ্রুত ছড়ায়", action: "মাঠ কর্মকর্তা ছবি দেখেন; আক্রান্ত জমিতে চলাচল কমানো হয়", result: "২৫.৯ টন/হেক্টর" },
    { season: "২০২৪–২৫", event: "স্বাভাবিক সময়ের ২ দিন আগে লক্ষণের ছবি তোলা হয়", action: "আগেই নালা খুলে পাশের গাছ প্রতিদিন পরীক্ষা করা হয়", result: "৩০.২ টন/হেক্টর" },
  ],
};

export default function AluSathiDashboard() {
  const { language, setLanguage } = useLanguage();
  const copy = COPY[language];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scenario, setScenario] = useState<keyof typeof scenarioYields>("standard");
  const [profile, setProfile] = useState({ district: "Rangpur", variety: "BARI Alu-25", area: "0.84", planted: "2025-12-08" });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(false);
  const [activeSection, setActiveSection] = useState("scan");
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  const yields = scenarioYields[scenario];

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const chooseFile = (selected?: File) => {
    setError("");
    setResult(null);
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type)) return setError(copy.errorType);
    if (selected.size > 8 * 1024 * 1024) return setError(copy.errorSize);
    setFile(selected);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      setResult(await scanPotatoLeaf(file));
    } catch {
      setError(copy.errorScan);
    } finally {
      setLoading(false);
    }
  };

  const updateWeather = async (event: React.FormEvent) => {
    event.preventDefault();
    setWeatherLoading(true);
    setWeatherError(false);
    try {
      setWeather(await getWeather(profile.district));
    } catch {
      setWeatherError(true);
    } finally {
      setWeatherLoading(false);
    }
  };

  return (
    <div className={`${language === "bn" ? "font-bangla" : ""} pb-20 sm:pb-0`}>
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/95 backdrop-blur-xl">
        <div className="app-shell flex h-16 items-center justify-between">
          <a href="#top" className="flex items-center gap-3" aria-label="AluSathi home">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-lime shadow-[0_8px_30px_rgba(18,35,27,.16)]"><Sprout size={21} /></span>
            <span><strong className="block font-display text-xl leading-none text-ink">AluSathi</strong><small className="mt-1 hidden text-xs text-ink/55 sm:block">{copy.brandLine}</small></span>
          </a>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full border border-amber-300/70 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 sm:flex"><Sparkles size={13} />{copy.demo}</span>
            <button onClick={() => setLanguage(language === "bn" ? "en" : "bn")} className="control-button" aria-label="Change language"><Globe2 size={16} />{language === "bn" ? "EN" : "বাংলা"}</button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden border-b border-ink/10 pt-14 sm:pt-20">
          <div className="field-grid absolute inset-0 opacity-45" />
          <div className="app-shell relative grid items-end gap-10 pb-16 lg:grid-cols-[1.12fr_.88fr] lg:pb-20">
            <div className="max-w-3xl animate-rise">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3 py-2 text-xs font-bold uppercase tracking-[.16em] text-ink/65"><MapPin size={14} className="text-leaf" />{copy.season}</div>
              <h1 className={`${language === "bn" ? "font-bangla text-[clamp(2.9rem,6.5vw,5.8rem)] leading-[1.14] tracking-[-.025em]" : "font-display text-[clamp(3.1rem,7vw,6.5rem)] leading-[.94] tracking-[-.05em]"} font-semibold text-ink`}>{copy.titleA}<br /><span className={language === "bn" ? "text-leaf" : "italic text-leaf"}>{copy.titleB}</span></h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-ink/65 sm:text-xl">{copy.subtitle}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#scan" className="primary-button"><ScanLine size={18} />{copy.scanNow}<ArrowRight size={17} /></a>
                <a href="#field" className="secondary-button"><BarChart3 size={18} />{copy.fieldView}</a>
              </div>
            </div>
            <div className="relative hidden min-h-[390px] lg:block" aria-hidden="true">
              <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-lime/65 blur-3xl" />
              <div className="absolute bottom-2 right-8 w-[82%] rounded-[2rem] border border-white/70 bg-ink p-6 text-white shadow-2xl">
                <div className="flex items-center justify-between"><span className="text-sm text-white/70">{language === "bn" ? "উত্তর ব্লক · জমি ০৪" : "North block · Field 04"}</span><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-950">{copy.demoScenario}</span></div>
                <div className="mt-14 flex items-end justify-between"><div><span className="text-sm text-white/70">{language === "bn" ? "সম্ভাব্য ফলন" : "Likely yield"}</span><strong className="mt-1 block font-display text-5xl">29.4</strong><span className="text-sm text-white/70">{language === "bn" ? "টন / হেক্টর" : "tonnes / hectare"}</span></div><div className="grid h-24 w-24 place-items-center rounded-full border-[10px] border-lime/25 border-t-lime text-center"><span className="text-xs text-white/70">{language === "bn" ? "জমির সংকেত" : "Field signal"}<br /><b className="text-xl text-white">78</b></span></div></div>
                <div className="mt-8 grid grid-cols-3 gap-2 text-xs text-white/70"><span className="rounded-xl bg-white/10 p-3">{language === "bn" ? "আর্দ্রতা" : "Humidity"}<br /><b className="mt-1 block text-base text-white">82%</b></span><span className="rounded-xl bg-white/10 p-3">{language === "bn" ? "ঝুঁকি" : "Risk"}<br /><b className="mt-1 block text-base text-amber-300">{language === "bn" ? "বাড়ছে" : "Elevated"}</b></span><span className="rounded-xl bg-white/10 p-3">{language === "bn" ? "পরের ছবি" : "Next scan"}<br /><b className="mt-1 block text-base text-white">{language === "bn" ? "আগামীকাল" : "Tomorrow"}</b></span></div>
              </div>
            </div>
          </div>
        </section>

        <section id="scan" className="app-shell scroll-mt-24 py-14 sm:py-20">
          <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="eyebrow"><Camera size={15} />{copy.visionLabel}</p><h2 className="section-title">{copy.scanTitle}</h2><p className="section-copy">{copy.scanSubtitle}</p></div><span className="model-chip">MobileNetV3 · {language === "bn" ? "৩ ধরনের পাতা" : "3 leaf classes"}</span></div>
          <div className="grid overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-[0_30px_80px_rgba(18,35,27,.09)] lg:grid-cols-2">
            <div className="border-b border-ink/10 p-5 sm:p-8 lg:border-b-0 lg:border-r">
              <label className={`upload-zone ${preview ? "has-image" : ""}`}>
                <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} />
                {preview ? <img src={preview} alt={language === "bn" ? "বাছাই করা আলুর পাতা" : "Selected potato leaf"} className="absolute inset-0 h-full w-full object-cover" /> : <><span className="grid h-14 w-14 place-items-center rounded-2xl bg-lime text-ink"><Upload size={24} /></span><strong className="mt-5 text-lg text-ink">{copy.camera}</strong><small className="mt-2 text-ink/60">{copy.format}</small></>}
                {preview && <span className="absolute bottom-4 left-4 rounded-full bg-ink/90 px-4 py-2 text-sm font-bold text-white backdrop-blur"><Camera size={15} className="mr-2 inline" />{copy.replace}</span>}
              </label>
              {error && <p role="alert" className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"><AlertTriangle size={16} />{error}</p>}
              <button onClick={analyze} disabled={!file || loading} className="primary-button mt-4 w-full justify-center disabled:cursor-not-allowed disabled:opacity-45">{loading ? <Loader2 className="animate-spin" size={18} /> : <ScanLine size={18} />}{loading ? copy.analyzing : copy.analyze}</button>
              <div className="mt-7"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-ink/45">{copy.tips}</p><ul className="mt-3 space-y-2 text-sm text-ink/65">{[copy.tip1, copy.tip2, copy.tip3].map((tip) => <li key={tip} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-leaf" />{tip}</li>)}</ul></div>
            </div>

            <div className="min-h-[520px] bg-mist/45 p-5 sm:p-8">
              {!result ? <div className="grid h-full min-h-[420px] place-items-center text-center"><div className="max-w-sm"><span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-dashed border-ink/25 bg-white text-ink/35"><Leaf size={32} /></span><h3 className="mt-5 font-display text-2xl text-ink">{copy.awaiting}</h3><p className="mt-3 leading-7 text-ink/55">{copy.awaitingBody}</p></div></div> : <ResultPanel result={result} language={language} copy={copy} />}
            </div>
          </div>
        </section>

        <section id="field" className="scroll-mt-20 border-y border-ink/10 bg-ink py-14 text-white sm:py-20">
          <div className="app-shell"><p className="eyebrow text-lime"><Wheat size={15} />{copy.coreLabel}</p><h2 className="section-title max-w-3xl text-white">{copy.fieldTitle}</h2><p className="section-copy max-w-2xl text-white/70">{copy.fieldSubtitle}</p>
            <form onSubmit={updateWeather} className="mt-8 rounded-2xl border border-white/15 bg-white/[.07] p-5"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><h3 className="text-xl font-bold">{copy.fieldProfile}</h3><p className="mt-1 text-sm text-white/65">{copy.fieldProfileBody}</p></div>{weather && <span className="rounded-full bg-lime px-3 py-2 text-sm font-bold text-ink">{copy.currentWeather}: {weather.temperature}°C · {weather.humidity}%</span>}</div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><label className="text-sm text-white/70">{copy.district}<select value={profile.district} onChange={(event) => setProfile({ ...profile, district: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-ink px-3 text-white"><option>Rangpur</option><option>Bogura</option><option>Dinajpur</option><option>Rajshahi</option></select></label><label className="text-sm text-white/70">{copy.variety}<select value={profile.variety} onChange={(event) => setProfile({ ...profile, variety: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-ink px-3 text-white"><option>BARI Alu-25</option><option>BARI Alu-7</option><option>BARI Alu-13</option></select></label><label className="text-sm text-white/70">{copy.area}<input type="number" min="0.1" max="100" step="0.01" value={profile.area} onChange={(event) => setProfile({ ...profile, area: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-ink px-3 text-white" /></label><label className="text-sm text-white/70">{copy.planted}<input type="date" value={profile.planted} onChange={(event) => setProfile({ ...profile, planted: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-ink px-3 text-white" /></label><button className="primary-button mt-auto justify-center bg-lime text-ink hover:bg-white" disabled={weatherLoading}>{weatherLoading ? copy.updating : copy.update}</button></div>{weatherError && <p className="mt-3 text-sm text-amber-300">{copy.weatherUnavailable}</p>}</form>
            <div className="mt-9 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                [copy.fieldHealth, copy.fieldHealthValue, Leaf], [copy.blightRisk, copy.blightRiskValue, AlertTriangle], [copy.harvest, copy.harvestValue, CloudSun], [copy.yield, copy.yieldValue, BarChart3],
              ].map(([label, value, Icon]) => <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[.07] p-5"><Icon className="text-lime" size={20} /><span className="mt-8 block text-sm font-semibold text-white/70">{label as string}</span><strong className="mt-2 block text-lg">{value as string}</strong></div>)}
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[.07] p-5 sm:p-7"><div className="flex flex-col justify-between gap-4 sm:flex-row"><div><h3 className="font-display text-2xl">{copy.yieldTitle}</h3><p className="mt-1 text-sm text-white/65">{profile.variety} · {profile.area} ha · {copy.demoScenario}</p></div><div className="flex flex-wrap gap-2">{(["standard", "response", "timing"] as const).map((key) => <button key={key} onClick={() => setScenario(key)} className={`scenario-button ${scenario === key ? "active" : ""}`}>{copy[key]}</button>)}</div></div>
                <div className="mt-10 grid h-56 grid-cols-3 items-end gap-4 border-b border-white/15 px-2 sm:gap-8">{yields.map((value, index) => <div key={value} className="flex h-full flex-col justify-end text-center"><strong className="mb-2 text-lg">{value.toFixed(1)}</strong><div className={`yield-bar ${index === 1 ? "featured" : ""}`} style={{ height: `${(value / 38) * 100}%` }} /><span className="mt-3 text-xs font-bold text-white/70">{[copy.conservative, copy.expected, copy.upside][index]}</span></div>)}</div>
              </div>
              <div className="rounded-[1.75rem] bg-lime p-6 text-ink sm:p-7"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-ink/60">{copy.factors} · {copy.demoScenario}</p><div className="mt-7 space-y-6">{[[copy.canopy, 84], [copy.weatherFit, 72], [copy.diseasePressure, 58], [copy.fieldRecords, 66]].map(([name, value]) => <div key={String(name)}><div className="mb-2 flex justify-between text-sm font-bold"><span>{name}</span><span>{value}%</span></div><div className="h-2 rounded-full bg-ink/15"><div className="h-full rounded-full bg-ink" style={{ width: `${value}%` }} /></div></div>)}</div></div>
            </div>
          </div>
        </section>

        <section id="market" className="app-shell scroll-mt-20 py-14 sm:py-20">
          <div className="grid gap-5 lg:grid-cols-2">
            <article className="feature-panel min-w-0 bg-sky"><span className="feature-icon bg-white/80 text-blue-800"><CloudSun /></span><p className="eyebrow mt-8 text-blue-900/70">{copy.climateLabel}</p><div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-blue-950">{weather ? "Open-Meteo · live" : copy.demoScenario}</span>{weather && <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-blue-950">{copy.demoScenario}</span>}{weather && <span className="rounded-full bg-blue-950 px-3 py-1 text-xs font-bold text-white">{weather.temperature}°C · {weather.humidity}%</span>}</div><h2 className="mt-4 font-display text-3xl text-ink">{copy.climateTitle}</h2><p className="mt-4 text-lg leading-8 text-ink/70">{weather ? `${profile.district}: ${weather.weather}, ${weather.rainfall} mm, ${weather.humidity}%` : copy.climateBody}</p><div className="mt-7 rounded-2xl border border-blue-900/10 bg-white/70 p-5"><div className="flex gap-3"><Droplets className="mt-1 shrink-0 text-blue-700" /><p className="font-semibold leading-7 text-ink/80">{copy.climateAction}</p></div></div></article>
            <article className="feature-panel min-w-0 bg-peach"><span className="feature-icon bg-white/80 text-orange-800"><ShoppingBag /></span><p className="eyebrow mt-8 text-orange-900/70">{copy.marketLabel}</p><h2 className="mt-3 font-display text-3xl text-ink">{copy.marketTitle}</h2><p className="mt-4 leading-7 text-ink/70">{copy.marketBody}</p><p className="mt-2 text-sm font-semibold text-orange-950/65">{copy.marketNote}</p><div className="mt-6 space-y-3">{buyers[language].map((buyer) => <div key={buyer.name} className="grid grid-cols-[auto_1fr] gap-3 rounded-2xl border border-orange-950/10 bg-white/80 p-4 sm:grid-cols-[auto_1fr_auto]"><span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-lime"><Users size={19} /></span><div className="min-w-0"><strong className="block truncate text-ink">{buyer.name}</strong><small className="text-ink/60">{buyer.meta}</small><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs"><span><b>{copy.price}:</b> {buyer.price}</span><span><b>{copy.netIncome}:</b> {buyer.net}</span></div></div><span className="col-start-2 w-fit rounded-full bg-lime px-3 py-1 text-xs font-extrabold text-ink sm:col-start-auto">{buyer.score}% {copy.match}</span></div>)}</div><p className="mt-4 text-xs font-semibold text-ink/55">{copy.updated}</p><p className="mt-2 flex items-center gap-2 text-xs font-semibold text-ink/55"><ShieldCheck size={15} />{copy.consent}</p></article>
          </div>

          <section className="mt-5 rounded-[2rem] border border-ink/10 bg-white p-6 shadow-[0_24px_70px_rgba(18,35,27,.07)] sm:p-9">
            <div className="grid items-start gap-5 lg:grid-cols-[auto_1fr_auto]">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-ink text-lime"><BadgeCheck size={28} /></span>
              <div><h2 className="font-display text-3xl text-ink">{copy.safetyTitle}</h2><p className="mt-2 max-w-3xl text-lg leading-8 text-ink/65">{copy.safetyBody}</p></div>
              <span className="model-chip"><BookOpen size={14} className="inline" /> {copy.officer}</span>
            </div>

            <div className="mt-9 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
              <details className="group min-w-0 rounded-[1.5rem] border border-ink/10 bg-cream p-5 sm:p-6">
                <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3"><CalendarDays className="shrink-0 text-leaf" size={21} /><span className="font-display text-2xl text-ink">{copy.historyTitle}</span><span className="ml-auto text-2xl text-leaf transition group-open:rotate-45">+</span></summary>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/60">{copy.historyNote}</p>
                <div className="mt-5 grid gap-3 lg:grid-cols-3">{fieldHistory[language].map((record) => <article key={record.season} className="rounded-2xl border border-ink/10 bg-white p-4"><strong className="inline-flex rounded-full bg-lime px-3 py-1 text-sm text-ink">{record.season} · {copy.demoScenario}</strong><dl className="mt-4 space-y-4 text-sm"><div><dt className="font-extrabold text-ink">{copy.happened}</dt><dd className="mt-1 leading-6 text-ink/65">{record.event}</dd></div><div><dt className="font-extrabold text-ink">{copy.actionTaken}</dt><dd className="mt-1 leading-6 text-ink/65">{record.action}</dd></div><div><dt className="font-extrabold text-ink">{copy.outcome}</dt><dd className="mt-1 font-display text-xl text-leaf">{record.result}</dd></div></dl></article>)}</div>
              </details>

              <aside className="rounded-[1.5rem] bg-ink p-5 text-white sm:p-6">
                <div className="flex gap-3"><Lightbulb className="mt-1 shrink-0 text-lime" size={22} /><div><h3 className="font-display text-2xl">{copy.meaningTitle}</h3><p className="mt-2 leading-7 text-white/65">{copy.meaningBody}</p></div></div>
                <div className="mt-6 border-t border-white/10 pt-5"><h4 className="text-sm font-extrabold text-lime">{copy.practicalTips}</h4><ul className="mt-3 space-y-3">{[copy.practicalTip1, copy.practicalTip2, copy.practicalTip3].map((tip) => <li key={tip} className="flex gap-2 text-sm leading-6 text-white/70"><Check className="mt-1 shrink-0 text-lime" size={15} />{tip}</li>)}</ul></div>
              </aside>
            </div>

            <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 sm:flex-row sm:items-center"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-900 text-amber-100"><PhoneCall size={20} /></span><div><h3 className="font-extrabold text-amber-950">{copy.urgentTitle}</h3><p className="mt-1 text-sm leading-6 text-amber-900/75">{copy.urgentBody}</p></div></div>
          </section>
        </section>
      </main>

      <footer className="border-t border-ink/10 pb-24 pt-8 sm:pb-8"><div className="app-shell flex flex-col justify-between gap-3 text-sm text-ink/50 sm:flex-row"><strong className="text-ink">{copy.footer}</strong><span>{copy.privacy}</span></div></footer>
      <nav className="fixed inset-x-3 bottom-[calc(.75rem+env(safe-area-inset-bottom))] z-50 flex justify-around rounded-2xl border border-white/10 bg-ink/95 p-2 text-white shadow-2xl backdrop-blur sm:hidden"><a href="#scan" aria-current={activeSection === "scan" ? "page" : undefined} onClick={() => setActiveSection("scan")} className={`mobile-nav ${activeSection === "scan" ? "active" : ""}`}><ScanLine />{copy.navScan}</a><a href="#field" aria-current={activeSection === "field" ? "page" : undefined} onClick={() => setActiveSection("field")} className={`mobile-nav ${activeSection === "field" ? "active" : ""}`}><Sprout />{copy.navField}</a><a href="#market" aria-current={activeSection === "market" ? "page" : undefined} onClick={() => setActiveSection("market")} className={`mobile-nav ${activeSection === "market" ? "active" : ""}`}><ShoppingBag />{copy.navMarket}</a></nav>
    </div>
  );
}

function ResultPanel({ result, language, copy }: { result: DiseaseResult; language: "en" | "bn"; copy: typeof COPY.en }) {
  const statusClass = result.label === "healthy" ? "result-healthy" : result.label === "unknown" ? "result-unknown" : "result-risk";
  const score = Math.round(result.confidence * 100);
  const band = score >= 85 ? copy.confidenceHigh : copy.confidenceMedium;
  return <div className="animate-rise"><div className="flex flex-wrap items-center justify-between gap-2"><p className="eyebrow"><ScanLine size={15} />{copy.result}</p><span className={`result-pill ${statusClass}`}>{result.label === "healthy" ? <Check size={14} /> : <AlertTriangle size={14} />}{result.labels[language]}</span></div><h3 className={`mt-8 text-4xl text-ink ${language === "bn" ? "font-bangla font-semibold" : "font-display"}`}>{result.labels[language]}</h3><div className="mt-5"><div className="mb-2 flex justify-between gap-3 text-sm font-bold text-ink/70"><span>{copy.confidenceNote}</span><span>{band} · {score}%</span></div><div className="h-3 overflow-hidden rounded-full bg-ink/10"><div className={`h-full rounded-full ${result.label === "healthy" ? "bg-leaf" : "bg-amber-500"}`} style={{ width: `${score}%` }} /></div></div><div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-950"><AlertTriangle size={17} className="mt-1 shrink-0" />{copy.secondScan}</div><div className="mt-7"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-ink/55">{copy.steps}</p><ol className="mt-3 space-y-3">{result.next_steps[language].map((step, index) => <li key={step} className="flex gap-3 text-sm leading-6 text-ink/75"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white">{index + 1}</span>{step}</li>)}</ol></div><div className="mt-7 rounded-2xl border border-amber-300/80 bg-amber-50 p-4"><p className="flex items-center gap-2 text-sm font-extrabold text-amber-950"><AlertTriangle size={16} />{copy.limitation}</p><p className="mt-2 text-sm leading-6 text-amber-900/80">{copy.limitationBody}</p></div></div>;
}
