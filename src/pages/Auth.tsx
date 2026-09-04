import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Auth() {
  const { user, signIn, signUp, configured } = useAuth();
  const { language } = useLanguage();
  const bn = language === "bn";
  const navigate = useNavigate();
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { if (user) navigate("/", { replace: true }); }, [user, navigate]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); setBusy(true);
    const fields = new FormData(event.currentTarget);
    try {
      const email = String(fields.get("email")).trim();
      const password = String(fields.get("password"));
      const response = register ? await signUp(email, password, String(fields.get("name")).trim()) : await signIn(email, password);
      if (response.error) setMessage(bn ? "লগইন হয়নি। ইমেইল, পাসওয়ার্ড ও ইন্টারনেট দেখুন। নতুন অ্যাকাউন্ট হলে ইমেইলের লিংক খুলুন।" : "Unable to sign in. Check your details and connection. For a new account, open the confirmation email first.");
      else if (register) setMessage(bn ? "ইমেইলে পাঠানো লিংক খুলে অ্যাকাউন্ট চালু করুন।" : "Open the confirmation link sent to your email.");
      else navigate("/");
    } catch { setMessage(bn ? "যোগাযোগ হয়নি। একটু পরে চেষ্টা করুন।" : "Connection failed. Please try again."); }
    finally { setBusy(false); }
  }
  return <main className={`account-page ${bn ? "font-bangla" : ""}`}><section className="account-card">
    <Link to="/" className="text-button"><ArrowLeft size={18} />{bn ? "লগইন ছাড়াই ব্যবহার করুন" : "Continue without logging in"}</Link>
    <span className="brand-mark"><Leaf /></span><p className="section-kicker">আলুসাথী</p><h1>{bn ? "আপনার জমির খাতা" : "Your field notebook"}</h1>
    <p>{bn ? "আগের ফল, ফলনের হিসাব ও মনে করানোর সময় এক জায়গায় রাখুন। ছবি দেখতে লগইন লাগে না।" : "Keep your history, yield estimates and reminders together. Photo checks never require login."}</p>
    {!configured && <p className="tool-notice" role="status">{bn ? "অ্যাকাউন্ট সেবা চালু হচ্ছে। আপাতত লগইন ছাড়াই ব্যবহার করুন।" : "Account service is awaiting connection. Continue as a guest for now."}</p>}
    <form onSubmit={submit} className="tool-form">
      {register && <label>{bn ? "আপনার নাম" : "Your name"}<input name="name" autoComplete="name" required maxLength={80} /></label>}
      <label>{bn ? "ইমেইল" : "Email"}<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <label>{bn ? "পাসওয়ার্ড" : "Password"}<input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} minLength={register ? 8 : 1} required /></label>
      {register && <small>{bn ? "অন্তত ৮ অক্ষরের পাসওয়ার্ড দিন।" : "Use at least 8 characters."}</small>}
      <button className="main-button" disabled={busy || !configured}>{busy ? "…" : register ? (bn ? "অ্যাকাউন্ট খুলুন" : "Create account") : (bn ? "লগইন করুন" : "Log in")}</button>
      {message && <p role="status">{message}</p>}
    </form><button className="text-button" onClick={() => { setRegister(!register); setMessage(""); }}>{register ? (bn ? "আগেই অ্যাকাউন্ট আছে" : "I already have an account") : (bn ? "নতুন অ্যাকাউন্ট খুলুন" : "Create a new account")}</button>
    <small className="account-privacy"><ShieldCheck size={16} />{bn ? "আপনার খাতা শুধু আপনার জন্য।" : "Your records belong to your account."}</small>
  </section></main>;
}
