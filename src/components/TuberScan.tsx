import { useState } from "react";
import { Sprout } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function TuberScan() {
  const { language } = useLanguage(); const bn = language === "bn";
  const [text, setText] = useState(""); const [busy, setBusy] = useState(false);
  async function inspect(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) { setText(bn ? "৮ MB-এর মধ্যে JPG, PNG বা WebP ছবি দিন।" : "Choose a JPG, PNG or WebP up to 8 MB."); return; }
    setBusy(true); setText("");
    try {
      const body = new FormData(); body.append("file", file);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "/api"}/tuber/inspect`, { method: "POST", body, signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error();
      const result = await response.json();
      if (result.count === null) { setText(bn ? "এই ছবিতে আলু আলাদা করে গোনা যাচ্ছে না। সাদা বা এক রঙের কাপড়ে আলুগুলো ফাঁক রেখে দিন। তারপর ওপর থেকে ছবি তুলুন।" : "The objects cannot be separated reliably in this photo. Place the potatoes apart on a plain cloth. Take a photograph from directly above."); return; }
      const flags = result.surface_flags.length > 0;
      setText(bn
        ? `ছবিতে প্রায় ${result.count}টি আলাদা বস্তু দেখা যাচ্ছে—সবগুলো আলু কি না মিলিয়ে নিন। আকার ${result.mixed_sizes ? "মিশ্র মনে হচ্ছে; বড় ও ছোট আলাদা করুন" : "কাছাকাছি মনে হচ্ছে"}। ${flags ? "কিছু সবুজ বা কালো অংশ আছে; ময়লা, ছায়া বা ক্ষতি কি না হাতে দেখে নিন" : "বড় রঙের পরিবর্তন ধরা পড়েনি; তবু সব দিক হাতে দেখে নিন"}। এটি ছবির আনুমানিক হিসাব; রোগ, খাওয়ার নিরাপত্তা বা বাজারের গ্রেড নিশ্চিত করে না।`
        : `About ${result.count} separate objects are visible; confirm that each is a potato. Their apparent sizes ${result.mixed_sizes ? "vary; separate larger and smaller tubers" : "look similar"}. ${flags ? "Green or dark patches need a hands-on check for dirt, shadow or damage" : "No large colour changes were flagged; inspect every side by hand"}. This photo estimate does not confirm disease, food safety or a market grade.`);
    } catch { setText(bn ? "এখন পরীক্ষা হয়নি। ইন্টারনেট ও সংযোগ দেখে আবার চেষ্টা করুন।" : "The check could not run. Check your connection and retry."); }
    finally { setBusy(false); }
  }
  return <section id="tuber" className="app-shell scroll-mt-24 pb-12"><details className="farmer-tool"><summary><Sprout />{bn ? "তোলা আলুর ছবি দেখুন" : "Check harvested potatoes"}</summary><div className="tool-body"><p>{bn ? "এক রঙের পটভূমিতে আলুগুলো আলাদা করে রাখুন। গোনা, আকার ও দৃশ্যমান দাগের হিসাব একসাথে দেখা হবে।" : "Separate the potatoes on a plain background. Counting, apparent size and visible colour checks run together."}</p><label className="upload-action">{busy ? (bn ? "ছবি দেখা হচ্ছে…" : "Checking…") : (bn ? "আলুর ছবি দিন" : "Choose potato photo")}<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={busy} onChange={e => inspect(e.target.files?.[0])} /></label>{text && <p className="tool-notice" role="status">{text}</p>}</div></details></section>;
}
