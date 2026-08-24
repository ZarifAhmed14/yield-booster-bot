import { Helmet } from "react-helmet";
import AluSathiDashboard from "@/components/AluSathiDashboard";

export default function Index() {
  return (
    <>
      <Helmet>
        <title>AluSathi — AI Potato Intelligence</title>
        <meta name="description" content="Bangla-first potato disease screening, yield planning, climate guidance and buyer matching for Bangladesh." />
        <meta name="theme-color" content="#12231b" />
      </Helmet>
      <AluSathiDashboard />
    </>
  );
}
