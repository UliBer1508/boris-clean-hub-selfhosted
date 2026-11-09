import { Lock } from 'lucide-react';

// Anzeige bei gesperrtem Portal (NEU 09.11.2026) — siehe usePortalSperre.ts
const PortalGesperrt = () => (
  <div className="flex min-h-[100dvh] items-center justify-center bg-background p-6">
    <div className="max-w-sm text-center space-y-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Lock className="h-6 w-6 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-semibold">Zugang deaktiviert</h1>
      <p className="text-sm text-muted-foreground">
        Dieses Portal ist derzeit nicht freigeschaltet. Bei Fragen wende dich bitte an Uli
        von Steinbock Chalets.
      </p>
    </div>
  </div>
);

export default PortalGesperrt;
