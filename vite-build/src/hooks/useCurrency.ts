import { useEffect, useState } from "react";
import { detectCurrency, guessCurrency, type Currency } from "@/lib/bizcard";

export function useCurrency(): Currency {
  const [c, setC] = useState<Currency>(guessCurrency());
  useEffect(() => { let on = true; detectCurrency().then(v => { if (on) setC(v); }); return () => { on = false; }; }, []);
  return c;
}
