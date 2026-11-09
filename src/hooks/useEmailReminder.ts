import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PROVIDER_ID } from '@/constants/app';

// E-Mail-Erinnerung an Reinigungen (NEU 09.11.2026)
//
// Boris stellt hier selbst ein, ob er per E-Mail an Reinigungen erinnert werden
// will, an welche Adresse, wie viele Tage vorher und um wie viel Uhr.
//
// Gespeichert in `notification_preferences` (Zeile user_name = 'Boris') —
// Spalten aus SQL 68 in hausmanagement-selfhosted. Verschickt wird die Mail von
// der Edge Function `reinigung-erinnerung` (stündlicher Cron).
//
// Bewusst NICHT im localStorage wie das Banner (useReminderSettings): Die Mail
// verschickt der Server, er muss die Einstellung lesen können.

export interface EmailReminder {
  id: string;
  email_address: string | null;
  email_reminder_enabled: boolean;
  email_reminder_days_before: number;
  email_reminder_hour: number;
}

type Aenderung = Partial<Omit<EmailReminder, 'id'>>;

const USER_NAME = 'Boris';

// Die neuen Spalten stehen erst nach dem nächsten Generieren in types.ts
// (Datei wird nie von Hand editiert). Bis dahin über eine ungetypte Sicht.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tabelle = () => (supabase as any).from('notification_preferences');

export const useEmailReminder = () => {
  const [werte, setWerte] = useState<EmailReminder | null>(null);
  const [laedt, setLaedt] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);

  const laden = useCallback(async () => {
    setLaedt(true);
    setFehler(null);
    const { data, error } = await tabelle()
      .select('id, email_address, email_reminder_enabled, email_reminder_days_before, email_reminder_hour')
      .eq('user_name', USER_NAME)
      .maybeSingle();
    if (error) {
      setFehler(error.message);
    } else if (data) {
      setWerte(data as EmailReminder);
    } else {
      const { data: neu, error: insErr } = await tabelle()
        .insert({ user_name: USER_NAME, provider_id: PROVIDER_ID })
        .select('id, email_address, email_reminder_enabled, email_reminder_days_before, email_reminder_hour')
        .single();
      if (insErr) setFehler(insErr.message);
      else setWerte(neu as EmailReminder);
    }
    setLaedt(false);
  }, []);

  useEffect(() => {
    laden();
  }, [laden]);

  const speichern = useCallback(
    async (aenderung: Aenderung): Promise<boolean> => {
      if (!werte) return false;
      const vorher = werte;
      setWerte({ ...werte, ...aenderung });
      // provider_id immer mitschreiben: die Edge Function sucht die Reinigungen
      // über diesen Dienstleister.
      const { error } = await tabelle()
        .update({ ...aenderung, provider_id: PROVIDER_ID })
        .eq('id', werte.id);
      if (error) {
        setWerte(vorher);
        setFehler(error.message);
        return false;
      }
      setFehler(null);
      return true;
    },
    [werte],
  );

  // Test-Mail an die gespeicherte Adresse. Die Adresse wird bewusst NICHT
  // mitgeschickt — die Edge Function liest sie aus der Datenbank.
  const testMail = useCallback(async (): Promise<{ ok: boolean; meldung: string }> => {
    const { data, error } = await supabase.functions.invoke('reinigung-erinnerung', {
      body: { test: true, provider_id: PROVIDER_ID },
    });
    const ergebnis = data?.ergebnisse?.[0];
    if (error || !data?.success || !ergebnis?.gesendet_an) {
      return {
        ok: false,
        meldung: ergebnis?.fehler || ergebnis?.uebersprungen || data?.error || 'Die Test-Mail konnte nicht gesendet werden.',
      };
    }
    return { ok: true, meldung: 'Test-Mail ist unterwegs. Bitte auch im Spam-Ordner nachsehen.' };
  }, []);

  return { werte, laedt, fehler, speichern, testMail };
};
