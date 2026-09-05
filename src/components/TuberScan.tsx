import { useState } from "react";
import { Sprout } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { scanPotatoTuberOffline } from "@/lib/tuber-offline-model";

export default function TuberScan() {
  const { language } = useLanguage(); const bn = language === "bn";
  const [text, setText] = useState(""); const [busy, setBusy] = useState(false);
  async function inspect(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 8 * 1024 * 1024) { setText(bn ? "৮ MB-এর মধ্যে JPG, PNG বা WebP ছবি দিন।" : "Choose a JPG, PNG or WebP up to 8 MB."); return; }
    setBusy(true); setText("");
    try {
      const model = await scanPotatoTuberOffline(file);
      const finding = model.label === "healthy"
        ? (bn ? "ছবিতে বড় ধরনের দৃশ্যমান ত্রুটি ধরা পড়েনি।" : "No major visible defect was detected in this image.")
        : model.label === "defective"
          ? (bn ? "ছবিতে ত্রুটির লক্ষণ থাকতে পারে। আলুটি আলাদা করে সব দিক হাতে দেখুন।" : "A visible defect may be present. Separate the tuber and inspect every side by hand.")
          : (bn ? "ফলটি নিশ্চিত নয়। দিনের আলোতে কাছে থেকে আরেকটি পরিষ্কার ছবি তুলুন।" : "The result is uncertain. Retake one clear close-up in daylight.");
      setText(bn
        ? `${finding} এটি ফোনেই চলা পরীক্ষামূলক AI ফল; ছবি কোথাও পাঠানো হয়নি। এটি রোগের নাম, খাওয়ার নিরাপত্তা বা বাজারের গ্রেড নিশ্চিত করে না। সন্দেহ থাকলে কৃষি কর্মকর্তাকে দেখান।`
        : `${finding} This experimental AI check ran on this device; the photo was not uploaded. It does not confirm a disease name, food safety or a market grade. Ask an agricultural officer when in doubt.`);
    } catch { setText(bn ? "ছবিটি পরীক্ষা করা যায়নি। পাতা নয়, একটি আলুর পরিষ্কার JPG, PNG বা WebP ছবি দিয়ে আবার চেষ্টা করুন।" : "The image could not be checked. Retry with a clear JPG, PNG or WebP photo of one potato, not a leaf."); }
    finally { setBusy(false); }
  }
  return <section id="tuber" className="app-shell scroll-mt-24 pb-12"><details className="farmer-tool"><summary><Sprout />{bn ? "তোলা আলুর ছবি দেখুন" : "Check harvested potatoes"}</summary><div className="tool-body"><p>{bn ? "একটি আলু এক রঙের পটভূমিতে রাখুন। দাগ বা পচনের মতো দৃশ্যমান ত্রুটি আছে কি না AI দেখবে।" : "Place one potato on a plain background. AI will check for visible defects such as marks or rot."}</p><label className="upload-action">{busy ? (bn ? "ছবি দেখা হচ্ছে…" : "Checking…") : (bn ? "আলুর ছবি দিন" : "Choose potato photo")}<input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" disabled={busy} onChange={e => { inspect(e.target.files?.[0]); e.currentTarget.value = ""; }} /></label>{text && <p className="tool-notice" role="status">{text}</p>}</div></details></section>;
}
