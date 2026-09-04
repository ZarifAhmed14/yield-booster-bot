import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Calculator, CalendarPlus, Sprout, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { areaSquareMetres, dosageAmount, sampleYield, calendarReminder, downloadFile, type AreaUnit } from "@/lib/farmer-tools";
import { deleteRecord, readRecords, writeRecord } from "@/lib/farmer-records";

type Reminder = { id: string; title: string; due: string; notified: boolean };
export default function FarmerTools() {
  const { user } = useAuth(); const { language } = useLanguage(); const bn = language === "bn";
  const [area, setArea] = useState(""); const [unit, setUnit] = useState<AreaUnit>("decimal"); const [bigha, setBigha] = useState("33");
  const [dose, setDose] = useState(""); const [basis, setBasis] = useState<"hectare" | "decimal" | "litre">("decimal"); const [quantityUnit, setQuantityUnit] = useState("g"); const [water, setWater] = useState(""); const [confirmed, setConfirmed] = useState(false);
  const [sampleArea, setSampleArea] = useState(""); const [weights, setWeights] = useState(["", "", ""]); const [yieldResult, setYieldResult] = useState<ReturnType<typeof sampleYield> | null>(null);
  const [message, setMessage] = useState(""); const [reminders, setReminders] = useState<Reminder[]>([]); const [title, setTitle] = useState(""); const [due, setDue] = useState(""); const [saving, setSaving] = useState(false);
  const number = (n: number) => n.toLocaleString(bn ? "bn-BD" : "en-GB", { maximumFractionDigits: 2 });
  let metres: number | null = null; let amount: number | null = null;
  try { metres = areaSquareMetres(Number(area), unit, Number(bigha)); if (confirmed) amount = dosageAmount(metres, Number(dose), basis, Number(water)); } catch { /* Incomplete forms show no result. */ }
  useEffect(() => {
    setReminders([]); setMessage(""); setYieldResult(null);
    if (!user) return;
    let active = true;
    readRecords(user.id, "reminder").then(rows => { if (active) setReminders(rows.flatMap(row => { const p = row.payload as Record<string, unknown>; return p && typeof p.title === "string" && typeof p.due === "string" && Number.isFinite(Date.parse(p.due)) ? [{ id: row.id, title: p.title, due: p.due, notified: p.notified === true }] : []; })); }).catch(() => { if (active) setMessage(bn ? "আগের তথ্য লোড হয়নি। আবার পেজ খুলুন।" : "Could not load saved reminders. Reopen this page."); });
    return () => { active = false; };
  }, [user, bn]);
  useEffect(() => {
    if (!user) return;
    const check = async () => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      for (const reminder of reminders.filter(r => !r.notified && Date.parse(r.due) <= Date.now())) {
        try {
          const registration = await navigator.serviceWorker?.getRegistration();
          if (registration) await registration.showNotification("AluSathi", { body: reminder.title, tag: reminder.id, icon: "/pwa-192x192.png" });
          else new Notification("AluSathi", { body: reminder.title, tag: reminder.id });
          setReminders(previous => previous.map(r => r.id === reminder.id ? { ...r, notified: true } : r));
          await writeRecord(user.id, "reminder", reminder.id, { ...reminder, notified: true });
        } catch { /* Calendar remains available when browser notifications are unsupported. */ }
      }
    };
    const interval = window.setInterval(check, 30000); check();
    return () => clearInterval(interval);
  }, [user, reminders]);
  async function saveReminder(e: React.FormEvent) {
    e.preventDefault(); if (!user || saving) return; setSaving(true); setMessage("");
    try {
      calendarReminder(title, due);
      const reminder = { id: crypto.randomUUID(), title: title.trim(), due: new Date(due).toISOString(), notified: false };
      await writeRecord(user.id, "reminder", reminder.id, reminder);
      setReminders(previous => [reminder, ...previous]); setMessage(bn ? "সময় সেভ হয়েছে। ফোনে মনে করাতে ক্যালেন্ডারেও যোগ করুন।" : "Reminder saved. Add it to your phone calendar for alerts when the app is closed.");
    } catch { setMessage(bn ? "সেভ হয়নি। ভবিষ্যতের সময় দিন ও ইন্টারনেট দেখুন।" : "Could not save. Choose a future time and check your connection."); }
    finally { setSaving(false); }
  }
  async function projectYield(e: React.FormEvent) {
    e.preventDefault(); setMessage(""); setYieldResult(null);
    try {
      const result = sampleYield(metres || 0, Number(sampleArea), weights.map(Number)); setYieldResult(result);
      if (user) await writeRecord(user.id, "yield", crypto.randomUUID(), { ...result, area_m2: metres, sample_m2: Number(sampleArea), sample_kg: weights.map(Number), method: "sample_harvest_projection" });
    } catch { setMessage(bn ? "তথ্য বা সংযোগে সমস্যা। ক্ষেতের মাপ ও তিনটি নমুনা দেখুন।" : "Check the field area, three sample weights and connection."); }
  }
  return <section id="tools" className="app-shell scroll-mt-24 py-12"><div className="section-heading"><div><p className="section-kicker"><Calculator size={16} />{bn ? "জমির কাজ সহজ করুন" : "Useful field tools"}</p><h2>{bn ? "হিসাব ও মনে করানো" : "Calculate and remember"}</h2><p>{bn ? "যেটি দরকার শুধু সেটি খুলুন।" : "Open only the tool you need."}</p></div></div>
    <div className="farmer-tools-grid"><details className="farmer-tool" open><summary><Calculator />{bn ? "জমির মাপ ও ওষুধের হিসাব" : "Land area & label-dose calculator"}</summary><div className="tool-body">
      <div className="tool-form tool-columns"><label>{bn ? "জমির পরিমাণ" : "Land area"}<input type="number" min="0.001" step="any" inputMode="decimal" value={area} onChange={e => { setArea(e.target.value); setYieldResult(null); }} /></label><label>{bn ? "একক" : "Unit"}<select value={unit} onChange={e => { setUnit(e.target.value as AreaUnit); setYieldResult(null); }}><option value="decimal">{bn ? "শতক" : "Decimal"}</option><option value="acre">{bn ? "একর" : "Acre"}</option><option value="hectare">{bn ? "হেক্টর" : "Hectare"}</option><option value="bigha">{bn ? "বিঘা" : "Bigha"}</option></select></label></div>
      {unit === "bigha" && <label className="tool-form">{bn ? "আপনার এলাকায় ১ বিঘা কত শতক?" : "Decimals per bigha in your area"}<input type="number" min="1" step="any" value={bigha} onChange={e => setBigha(e.target.value)} /><small>{bn ? "এলাকাভেদে মাপ বদলায়। স্থানীয় মাপ মিলিয়ে নিন।" : "Bigha varies locally. Confirm your local conversion."}</small></label>}
      {metres !== null && <output className="tool-result">{number(metres)} {bn ? "বর্গমিটার" : "m²"} · {number(metres / 10000)} ha</output>}
      <details><summary>{bn ? "লেবেলের মাত্রা দিয়ে ওষুধের পরিমাণ বের করুন" : "Calculate from the product label"}</summary><div className="tool-form">
        <p>{bn ? "লেবেল বা কৃষি বিশেষজ্ঞের বলা মাত্রা লিখুন। এই হিসাব কোন ওষুধ বা মাত্রা বাছাই করে না।" : "Enter the rate from the product label or adviser. This tool does not choose a product or rate."}</p>
        <div className="tool-columns"><label>{bn ? "লেবেলে লেখা পরিমাণ" : "Label amount"}<input type="number" min="0.001" step="any" value={dose} onChange={e => { setDose(e.target.value); setConfirmed(false); }} /></label><label>{bn ? "ওষুধের একক" : "Product unit"}<select value={quantityUnit} onChange={e => { setQuantityUnit(e.target.value); setConfirmed(false); }}><option value="g">{bn ? "গ্রাম" : "grams"}</option><option value="ml">{bn ? "মিলিলিটার" : "millilitres"}</option></select></label></div>
        <label>{bn ? "কতটুকুর জন্য এই মাত্রা?" : "Rate applies per"}<select value={basis} onChange={e => { setBasis(e.target.value as typeof basis); setConfirmed(false); }}><option value="decimal">{bn ? "১ শতক জমি" : "1 decimal of land"}</option><option value="hectare">{bn ? "১ হেক্টর জমি" : "1 hectare of land"}</option><option value="litre">{bn ? "১ লিটার পানি" : "1 litre of water"}</option></select></label>
        {basis === "litre" && <label>{bn ? "মোট পানি (লিটার)" : "Total water (litres)"}<input type="number" min="0.1" step="any" value={water} onChange={e => setWater(e.target.value)} /></label>}
        <label className="checkbox-label"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />{bn ? "লেবেলের মাত্রা ও একক মিলিয়েছি" : "I checked the label rate and units"}</label>
        {amount !== null && <output className="tool-result">{number(amount)} {quantityUnit} {bn ? "ওষুধ লাগবে। লেবেলের সর্বোচ্চ মাত্রা ও ফসল তোলার বিরতি মানুন।" : "of product. Follow label limits and the pre-harvest interval."}</output>}
      </div></details>
    </div></details>
    <details className="farmer-tool"><summary><Sprout />{bn ? "কত আলু হতে পারে?" : "Yield estimate"}</summary><div className="tool-body"><p>{bn ? "জমির মাপ উপরের হিসাবে দিন। সমান মাপের ৩টি আলাদা জায়গার আলু তুলে ওজন করুন। সেই নমুনা থেকে হিসাব হবে; ভবিষ্যতের AI পূর্বাভাস নয়।" : "Enter your field area in the calculator. Weigh harvested potatoes from three separate, equal-size sample plots. This is a sample-based projection, not a trained future-yield forecast."}</p>
      <form className="tool-form" onSubmit={projectYield}><label>{bn ? "প্রতিটি নমুনা জায়গার মাপ (বর্গমিটার)" : "Area of each sample plot (m²)"}<input type="number" min="0.01" step="any" required value={sampleArea} onChange={e => { setSampleArea(e.target.value); setYieldResult(null); }} /></label><div className="tool-columns">{weights.map((value, i) => <label key={i}>{bn ? `নমুনা ${i+1} (কেজি)` : `Sample ${i+1} (kg)`}<input type="number" min="0.01" step="any" required value={value} onChange={e => { setWeights(previous => previous.map((w, index) => index === i ? e.target.value : w)); setYieldResult(null); }} /></label>)}</div><button className="secondary-main">{bn ? "হিসাব দেখুন" : "Calculate estimate"}</button></form>
      {yieldResult && <output className="tool-result">{number(yieldResult.low)}–{number(yieldResult.high)} {bn ? "কেজি। নমুনার সবচেয়ে কম ও বেশি ফলনের ভিত্তিতে; নিশ্চিত সীমা নয়।" : "kg, based on the lowest and highest samples; not a confidence interval."}</output>}
      {!user && <p><Link to="/auth">{bn ? "হিসাব খাতায় রাখতে লগইন করুন" : "Log in to keep yield records"}</Link></p>}
    </div></details>
    <details className="farmer-tool"><summary><Bell />{bn ? "চিকিৎসার সময় মনে করান" : "Treatment reminder"}</summary><div className="tool-body"><p>{bn ? "বিশেষজ্ঞের দেওয়া কাজ ও সময় লিখুন। চিকিৎসা নিজে থেকে ঠিক করা হবে না।" : "Record the task and time agreed with your adviser. No treatment is prescribed automatically."}</p><form className="tool-form" onSubmit={saveReminder}><label>{bn ? "কী কাজ?" : "What task?"}<input maxLength={120} required value={title} onChange={e => setTitle(e.target.value)} /></label><label>{bn ? "কখন?" : "When?"}<input type="datetime-local" required value={due} onChange={e => setDue(e.target.value)} /></label><div className="report-actions">{user ? <button className="secondary-main" disabled={saving}>{bn ? "মনে রাখুন" : "Save reminder"}</button> : <Link className="secondary-main" to="/auth">{bn ? "সেভ করতে লগইন করুন" : "Log in to save"}</Link>}<button className="text-button" type="button" onClick={() => { try { downloadFile("AluSathi-reminder.ics", calendarReminder(title, due), "text/calendar;charset=utf-8"); setMessage(bn ? "ডাউনলোড করা ফাইল খুলে ফোনের ক্যালেন্ডারে যোগ করুন।" : "Open the downloaded file and add it to your calendar."); } catch { setMessage(bn ? "কাজ ও ভবিষ্যতের সময় দিন।" : "Enter a task and a future time."); } }}><CalendarPlus size={16} />{bn ? "ফোনের ক্যালেন্ডারে দিন" : "Add to phone calendar"}</button></div></form>
      {user && <button className="text-button" onClick={async () => { try { const permission = "Notification" in window ? await Notification.requestPermission() : "denied"; setMessage(permission === "granted" ? (bn ? "অ্যাপ খোলা থাকলে নোটিফিকেশন আসবে। বন্ধ থাকলে ক্যালেন্ডার ব্যবহার করুন।" : "Notifications are enabled while the app is open. Use the calendar for alerts while closed.") : (bn ? "নোটিফিকেশন চালু হয়নি। ক্যালেন্ডার ব্যবহার করুন।" : "Notifications are unavailable. Use the calendar instead.")); } catch { setMessage(bn ? "ফোনের ক্যালেন্ডার ব্যবহার করুন।" : "Use your phone calendar."); } }}>{bn ? "অ্যাপের নোটিফিকেশন চালু করুন" : "Enable in-app notifications"}</button>}
      <ul className="reminder-list">{reminders.map(r => <li key={r.id}><span><strong>{r.title}</strong><time>{new Date(r.due).toLocaleString(bn ? "bn-BD" : "en-GB")}</time></span><button aria-label={bn ? "মুছুন" : "Delete"} onClick={async () => { if (!user) return; try { await deleteRecord(user.id, "reminder", r.id); setReminders(previous => previous.filter(item => item.id !== r.id)); } catch { setMessage(bn ? "মোছা হয়নি। আবার চেষ্টা করুন।" : "Could not delete. Try again."); } }}><Trash2 size={17} /></button></li>)}</ul>
    </div></details></div>{message && <p className="tool-notice" role="status">{message}</p>}
  </section>;
}
