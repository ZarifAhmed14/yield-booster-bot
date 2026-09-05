import { useState } from "react";
import { MapPin, Snowflake, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

type Quote = { name: string; rate: string; basis: string; periods: string; transport: string; handling: string; other: string };
const emptyQuote = (): Quote => ({ name: "", rate: "", basis: "season", periods: "1", transport: "", handling: "", other: "" });

export default function ColdStorage() {
  const { language } = useLanguage();
  const bn = language === "bn";
  const [location, setLocation] = useState("");
  const [kg, setKg] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([emptyQuote()]);
  const text = (bangla: string, english: string) => bn ? bangla : english;
  const money = (n: number) => `৳${n.toLocaleString(bn ? "bn-BD" : "en-BD", { maximumFractionDigits: 2 })}`;
  const valid = (s: string) => s.trim() !== "" && Number.isFinite(Number(s)) && Number(s) >= 0 && Number(s) <= 10000000;
  const quantity = valid(kg) && Number(kg) > 0 ? Number(kg) : null;
  const costs = quotes.map(q => {
    if (!quantity || ![q.rate, q.transport, q.handling, q.other].every(valid)) return null;
    if (q.basis !== "season" && (!valid(q.periods) || Number(q.periods) < 1 || !Number.isInteger(Number(q.periods)))) return null;
    const storage = quantity * Number(q.rate) * (q.basis === "season" ? 1 : Number(q.periods));
    return { storage, total: storage + Number(q.transport) + Number(q.handling) + Number(q.other) };
  });
  function update(index: number, key: keyof Quote, value: string) {
    setQuotes(previous => previous.map((q, i) => i === index ? { ...q, [key]: value } : q));
  }
  return <section id="cold-storage" className="app-shell scroll-mt-24 py-12">
    <div className="section-heading"><div><p className="section-kicker"><Snowflake size={16} />{text("আলু রাখার জায়গা", "After harvest")}</p><h2>{text("হিমাগার খুঁজুন, খরচ মিলিয়ে নিন", "Find cold storage. Know the costs.")}</h2><p>{text("আগে খোঁজ নিন। তারপর মালিকের বলা খরচ লিখে তুলনা করুন।", "Find a provider, then compare the costs they quote.")}</p></div></div>
    <div className="storage-finder">
      <div className="tool-form"><label>{text("কোন জেলা বা উপজেলায় খুঁজবেন?", "District or upazila to search")}<input maxLength={100} value={location} onChange={e => setLocation(e.target.value)} autoComplete="off" /></label>
        {location.trim() ? <a className="secondary-main" target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`potato cold storage ${location.trim()} Bangladesh`)}`}><MapPin size={18} />{text("ম্যাপে হিমাগার খুঁজুন", "Find storage on Google Maps")}<ExternalLink size={15} /></a> : <p>{text("ম্যাপ খুলতে এলাকার নাম লিখুন।", "Enter an area to open the map search.")}</p>}
      </div>
      <p className="tool-notice">{text("ম্যাপের তথ্য আলুসাথী যাচাই করেনি। ভাড়া ও খালি জায়গার সরাসরি তথ্য নেই। ফোন করে আলু রাখার সুবিধা, জায়গা ও সব খরচ নিশ্চিত করুন।", "Map listings are not verified by AluSathi. Live rates and capacity are not connected. Call to confirm potato storage, space and all charges.")}</p>
    </div>
    <details className="farmer-tool storage-calculator"><summary><Snowflake />{text("মোট কত খরচ হবে?", "Compare total costs")}</summary><div className="tool-body tool-form">
      <p>{text("সব টাকার অঙ্ক হিমাগার বা পরিবহনকারীর কাছ থেকে জেনে লিখুন। কোনো খরচ না থাকলে ০ লিখুন; জানা না থাকলে ফাঁকা রাখুন।", "Use quotes from the provider or transporter. Enter 0 only when a charge does not apply; leave unknown costs blank.")}</p>
      <label>{text("মোট আলু (কেজি)", "Total potatoes (kg)")}<input type="number" inputMode="decimal" min="0.01" max="10000000" step="any" value={kg} onChange={e => setKg(e.target.value)} /></label>
      <div className="storage-quotes">{quotes.map((q, i) => <fieldset className="storage-quote tool-form" key={i}><legend>{text(`হিমাগার ${i + 1}`, `Storage ${i + 1}`)}</legend>
        <label>{text("হিমাগারের নাম", "Storage name")}<input maxLength={100} value={q.name} onChange={e => update(i, "name", e.target.value)} /></label>
        <div className="tool-columns"><label>{text("প্রতি কেজি ভাড়া (টাকা)", "Rate per kg (BDT)")}<input type="number" min="0" max="10000000" step="any" value={q.rate} onChange={e => update(i, "rate", e.target.value)} /></label>
          <label>{text("এই ভাড়া কত দিনের জন্য?", "Rate covers")}<select value={q.basis} onChange={e => update(i, "basis", e.target.value)}><option value="season">{text("পুরো চুক্তির সময়", "Whole agreed term")}</option><option value="month">{text("১ মাস", "One billed month")}</option><option value="day">{text("১ দিন", "One billed day")}</option></select></label></div>
        {q.basis !== "season" && <label>{q.basis === "month" ? text("কত মাসের ভাড়া দিতে হবে?", "Number of billed months") : text("কত দিনের ভাড়া দিতে হবে?", "Number of billed days")}<input type="number" min="1" max="10000000" step="1" value={q.periods} onChange={e => update(i, "periods", e.target.value)} /></label>}
        {([['transport', 'যাওয়া ও ফেরার মোট গাড়িভাড়া (টাকা)', 'Total outward + return transport (BDT)'], ['handling', 'মোট ওঠানো-নামানো ও বস্তার খরচ (টাকা)', 'Total handling + bags (BDT)'], ['other', 'করসহ অন্য সব খরচ (টাকা)', 'Other charges including taxes (BDT)']] as const).map(([key, bangla, english]) => <label key={key}>{text(bangla, english)}<input type="number" min="0" max="10000000" step="any" value={q[key]} onChange={e => update(i, key, e.target.value)} /></label>)}
        {costs[i] ? <output className="storage-total" aria-live="polite"><span>{text("হিমাগারের ভাড়া", "Storage charge")}: {money(costs[i]!.storage)}</span><strong>{text("মোট খরচ", "Total cost")}: {money(costs[i]!.total)}</strong><span>{money(costs[i]!.total / quantity!)} / {text("কেজি", "kg")}</span></output> : <p role="status">{text("ওজন ও সব খরচ সঠিকভাবে দিলে মোট দেখা যাবে।", "Enter a valid weight and every cost to see the total.")}</p>}
      </fieldset>)}</div>
      {quotes.length === 1 ? <button className="secondary-main" onClick={() => setQuotes(previous => [...previous, emptyQuote()])}>{text("আরেকটি হিমাগারের খরচ মিলিয়ে দেখুন", "Compare a second storage quote")}</button> : <button className="text-button" onClick={() => setQuotes(previous => previous.slice(0, 1))}>{text("দ্বিতীয় হিসাব সরান", "Remove second quote")}</button>}
      {costs.length === 2 && costs[0] && costs[1] && <p className="tool-result" role="status">{text("খরচের পার্থক্য", "Cost difference")}: {money(Math.abs(costs[0].total - costs[1].total))}. {text("একই পরিমাণ আলু ও একই মেয়াদের জন্য তুলনা করুন। কম খরচ মানেই ভালো সেবা নয়।", "Compare the same quantity and storage duration. Lower cost does not guarantee better service.")}</p>}
      <p className="tool-notice">{text("এটি আপনার লেখা খরচের হিসাব; বুকিং বা নিশ্চিত ভাড়া নয়। আলুর ওজন কমা বা নষ্ট হওয়ার ক্ষতি এতে ধরা নেই। এই হিসাব পেজ বন্ধ করলে থাকবে না।", "This is your cost estimate, not a booking or confirmed tariff. Shrinkage and spoilage losses are excluded. These entries are not saved when you leave the page.")}</p>
      <details><summary>{text("টাকা দেওয়ার আগে ৪টি কথা জেনে নিন", "Four things to confirm before paying")}</summary><ul className="storage-checklist"><li>{text("কতদিন রাখবেন এবং সর্বনিম্ন কত আলু নেয়?", "Agreed storage dates and minimum quantity.")}</li><li>{text("সব খরচ লিখিতভাবে দেবে?", "Written quote covering all charges.")}</li><li>{text("ওজন কমলে বা আলু নষ্ট হলে কার দায়িত্ব?", "Responsibility for weight loss or damaged potatoes.")}</li><li>{text("আলু ফেরত নেওয়ার নিয়ম ও রসিদ পাবেন?", "Collection terms and a receipt for your potatoes.")}</li></ul></details>
    </div></details>
  </section>;
}
