import { Helmet } from "react-helmet";
import AluSathiDashboard from "@/components/AluSathiDashboard";

export default function Index() {
  return (
    <>
      <Helmet>
        <title>আলুসাথী — আলুর রোগ বুঝুন, সহজে</title>
        <meta name="description" content="Bangla-first AI leaf screening, whole-field checks and weather-aware guidance for Bangladesh potato farmers." />
        <meta name="theme-color" content="#112a20" />
      </Helmet>
      <AluSathiDashboard />
    </>
  );
}
