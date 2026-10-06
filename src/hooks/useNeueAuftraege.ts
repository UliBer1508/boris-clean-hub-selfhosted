// Neue Reinigungsaufträge als Info-Pop-up (06.10.2026, Uli-Entscheidung).
//
// "Neu" = eine Reinigung dieses Dienstleisters, die auf GEPLANT steht und die
// auf diesem Gerät noch nicht gemeldet wurde. Damit gilt:
//   - Reinigungen aus der Buchungs-Automatik werden gemeldet, sobald Uli sie
//     vom Entwurf auf "geplant" setzt — nicht schon beim Anlegen. (Früher kam
//     beim Anlegen eine 5-Sekunden-Meldung, obwohl der Entwurf in der Liste
//     gar nicht stand; nach der Freigabe kam nichts mehr.)
//   - Reinigungen ohne Buchung (Fenster, Saisonstart) stehen gleich auf
//     "geplant" und werden sofort gemeldet.
//   - War das Portal geschlossen, kommt die Meldung beim nächsten Öffnen.
//
// Gemerkt wird je Gerät in localStorage. Beim allerersten Start werden alle
// vorhandenen Reinigungen still als bekannt eingetragen (sonst Pop-up-Flut).
// Reine Info: keine Bestätigung, kein Eintrag im Chat.
//
// Diese Datei ist in amela- und boris-clean-hub IDENTISCH. Änderungen in
// beiden Portalen nachziehen.
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface NeuerAuftrag {
  id: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  notes: string | null;
  booking_id: string | null;
  houses: { name: string | null } | null;
}

const SPEICHER_KEY = "gemeldete-reinigungen";

const ladeBekannte = (): Set<string> | null => {
  try {
    const roh = localStorage.getItem(SPEICHER_KEY);
    return roh ? new Set(JSON.parse(roh) as string[]) : null;
  } catch {
    return null;
  }
};

const speichereBekannte = (ids: Set<string>) => {
  try {
    localStorage.setItem(SPEICHER_KEY, JSON.stringify([...ids]));
  } catch {
    /* noop */
  }
};

export const useNeueAuftraege = (
  providerId: string,
  aktiv: boolean,
  beiNeu?: (anzahl: number) => void
) => {
  const [warteschlange, setWarteschlange] = useState<NeuerAuftrag[]>([]);
  const bekannteRef = useRef<Set<string> | null>(null);
  // Rückruf (Glocke, Ton) über Ref, damit die Abfrage nicht neu startet.
  const beiNeuRef = useRef(beiNeu);
  beiNeuRef.current = beiNeu;

  const pruefen = useCallback(async () => {
    const heute = new Date();
    const heuteStr = `${heute.getFullYear()}-${String(heute.getMonth() + 1).padStart(2, "0")}-${String(heute.getDate()).padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("service_tasks")
      .select("id, scheduled_date, scheduled_time, notes, booking_id, houses!service_tasks_house_id_fkey ( name )")
      .eq("provider_id", providerId)
      .eq("service_type", "cleaning")
      .eq("status", "scheduled")
      .gte("scheduled_date", heuteStr)
      .order("scheduled_date", { ascending: true });

    if (error) {
      console.error("[useNeueAuftraege] Abfrage fehlgeschlagen", error);
      return;
    }
    const auftraege = (data || []) as unknown as NeuerAuftrag[];

    if (bekannteRef.current === null) {
      const gespeichert = ladeBekannte();
      if (gespeichert === null) {
        // Erster Start auf diesem Gerät: alles Vorhandene gilt als bekannt.
        bekannteRef.current = new Set(auftraege.map((a) => a.id));
        speichereBekannte(bekannteRef.current);
        return;
      }
      bekannteRef.current = gespeichert;
    }

    const bekannt = bekannteRef.current;
    const neu = auftraege.filter((a) => !bekannt.has(a.id));
    if (neu.length === 0) return;
    neu.forEach((a) => bekannt.add(a.id));
    speichereBekannte(bekannt);
    beiNeuRef.current?.(neu.length);
    if (aktiv) setWarteschlange((prev) => [...prev, ...neu]);
  }, [providerId, aktiv]);

  useEffect(() => {
    pruefen();

    const kanal = supabase
      .channel(`neue-auftraege-${providerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_tasks", filter: `provider_id=eq.${providerId}` },
        () => pruefen()
      )
      .subscribe();

    const beiSichtbar = () => {
      if (document.visibilityState === "visible") pruefen();
    };
    document.addEventListener("visibilitychange", beiSichtbar);

    return () => {
      supabase.removeChannel(kanal);
      document.removeEventListener("visibilitychange", beiSichtbar);
    };
  }, [pruefen, providerId]);

  const aktueller = warteschlange[0] ?? null;
  const schliessen = useCallback(() => setWarteschlange((prev) => prev.slice(1)), []);

  return { aktueller, anzahl: warteschlange.length, schliessen };
};
