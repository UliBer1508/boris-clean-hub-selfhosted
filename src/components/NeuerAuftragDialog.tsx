// Info-Pop-up "Neue Reinigung" (06.10.2026). Reine Info, ohne Bestätigung:
// schließbar per OK, X, Esc oder Klick daneben. Kein Eintrag im Chat.
// Diese Datei ist in amela- und boris-clean-hub IDENTISCH.
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { NeuerAuftrag } from "@/hooks/useNeueAuftraege";

const datumDE = (s: string | null): string => {
  if (!s) return "ohne Datum";
  const [y, m, d] = s.slice(0, 10).split("-");
  return y && m && d ? `${d}.${m}.${y}` : s;
};

interface Props {
  auftrag: NeuerAuftrag | null;
  weitere: number;
  onClose: () => void;
}

const NeuerAuftragDialog = ({ auftrag, weitere, onClose }: Props) => {
  const zeit = auftrag?.scheduled_time ? `, ${String(auftrag.scheduled_time).slice(0, 5)} Uhr` : "";
  const anlass = auftrag && !auftrag.booking_id && auftrag.notes ? String(auftrag.notes).trim() : "";

  return (
    <Dialog open={!!auftrag} onOpenChange={(offen) => { if (!offen) onClose(); }}>
      <DialogContent className="w-[88vw] max-w-sm rounded-3xl">
        <DialogHeader>
          <DialogTitle>🆕 Neue Reinigung</DialogTitle>
        </DialogHeader>
        {auftrag && (
          <div className="space-y-2 text-base">
            <p>
              <strong>{auftrag.houses?.name ?? "Objekt"}</strong>
              <br />
              {datumDE(auftrag.scheduled_date)}{zeit}
            </p>
            {anlass && <p className="text-sm text-muted-foreground">{anlass}</p>}
            {weitere > 0 && (
              <p className="text-xs text-muted-foreground">
                Danach {weitere === 1 ? "folgt noch 1 weitere" : `folgen noch ${weitere} weitere`}.
              </p>
            )}
          </div>
        )}
        <DialogFooter>
          <Button className="w-full" onClick={onClose}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NeuerAuftragDialog;
