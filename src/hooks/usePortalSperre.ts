import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PROVIDER_ID } from '@/constants/app';
import { istGesperrt } from '@/lib/providerStatus';

// Portal-Sperre (NEU 09.11.2026, SQL 69 in hausmanagement-selfhosted)
//
// Uli kann einen Dienstleister in der Provider Verwaltung inaktiv schalten und
// dabei "Portal sperren" ankreuzen. Dann zeigt dieses Portal nur noch
// "Zugang deaktiviert".
//
// Bewusst "im Zweifel offen": Kann der Status nicht gelesen werden (Netz weg,
// Spalte noch nicht angelegt), bleibt das Portal benutzbar. Eine fälschliche
// Sperre wäre für Boris schlimmer als eine verspätete.
//
// Hinweis: Das ist eine Sperre der Oberfläche, keine Datenbank-Sperre — das
// Portal-Konto selbst bleibt angemeldet.
export const usePortalSperre = (aktiv: boolean) => {
  const { data } = useQuery({
    queryKey: ['portal-sperre', PROVIDER_ID],
    enabled: aktiv,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      // Cast noetig, bis integrations/supabase/types.ts neu generiert ist (inaktiv_wirkung).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: provider, error } = await (supabase as any)
        .from('service_providers')
        .select('is_active, inaktiv_wirkung')
        .eq('id', PROVIDER_ID)
        .maybeSingle();
      if (error) return false;
      return istGesperrt(provider, 'portal_gesperrt');
    },
  });
  return data === true;
};
