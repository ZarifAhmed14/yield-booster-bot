import { createContext, useContext, useState, type ReactNode } from 'react';
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const DemoContext = createContext({ demo: false, setDemo: (_value: boolean) => {} });
export function DemoProvider({ children }: { children: ReactNode }) {
  const [demo, update] = useState(() => {
    try { return sessionStorage.getItem('alusathi-demo') === 'true'; } catch { return false; }
  });
  function setDemo(value: boolean) {
    try { sessionStorage.setItem('alusathi-demo', String(value)); } catch { /* In-memory demo still works. */ }
    update(value);
  }
  return <DemoContext.Provider value={{ demo, setDemo }}>{children}</DemoContext.Provider>;
}
export const useDemo = () => useContext(DemoContext);

export function DemoEntry() {
  const { demo, setDemo } = useDemo();
  useEffect(() => { if (!demo) setDemo(true); }, [demo, setDemo]);
  return demo ? <Navigate to="/" replace /> : null;
}
