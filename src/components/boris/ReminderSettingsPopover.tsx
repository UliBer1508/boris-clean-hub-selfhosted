import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarClock, Mail, Minus, Plus, Send } from 'lucide-react';
import { useReminderSettings } from '@/hooks/useReminderSettings';
import { useEmailReminder } from '@/hooks/useEmailReminder';
import { validateEmail } from '@/utils/validation';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STUNDEN = Array.from({ length: 24 }, (_, h) => h);

const tageText = (tage: number) =>
  tage === 0 ? 'am Reinigungstag' : tage === 1 ? 'am Vortag' : `${tage} Tage vorher`;

const ReminderSettingsPopover: React.FC<Props> = ({ open, onOpenChange }) => {
  const { settings, update } = useReminderSettings();

  // E-Mail-Erinnerung (NEU 09.11.2026) — liegt in der Datenbank, nicht im
  // localStorage, weil der Server die Mail verschickt (siehe useEmailReminder).
  const { werte: mail, laedt: mailLaedt, fehler: mailFehler, speichern, testMail } = useEmailReminder();
  const [adresse, setAdresse] = useState('');
  const [hinweis, setHinweis] = useState<{ ok: boolean; text: string } | null>(null);
  const [testLaeuft, setTestLaeuft] = useState(false);

  const gespeicherteAdresse = mail?.email_address ?? '';
  useEffect(() => {
    setAdresse(gespeicherteAdresse);
  }, [gespeicherteAdresse]);

  // Adresse erst beim Verlassen des Feldes speichern, nur wenn gültig.
  const adresseSpeichern = async () => {
    if (!mail) return;
    const neu = adresse.trim();
    if (neu === gespeicherteAdresse) return;
    if (neu === '') {
      await speichern({ email_address: null, email_reminder_enabled: false });
      setHinweis(null);
      return;
    }
    const pruefung = validateEmail(neu);
    if (!pruefung.isValid) {
      setHinweis({ ok: false, text: pruefung.error ?? 'Ungültige E-Mail-Adresse' });
      return;
    }
    const ok = await speichern({ email_address: neu });
    setHinweis(ok ? { ok: true, text: 'E-Mail-Adresse gespeichert.' } : null);
  };

  const mailSchalten = async (an: boolean) => {
    if (an && !mail?.email_address) {
      setHinweis({ ok: false, text: 'Bitte zuerst deine E-Mail-Adresse eintragen.' });
      return;
    }
    setHinweis(null);
    await speichern({ email_reminder_enabled: an });
  };

  const testSenden = async () => {
    setTestLaeuft(true);
    setHinweis(null);
    const r = await testMail();
    setHinweis({ ok: r.ok, text: r.meldung });
    setTestLaeuft(false);
  };

  const mailTage = mail?.email_reminder_days_before ?? 1;
  const mailAn = mail?.email_reminder_enabled === true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-status-delayed" />
            Erinnerung
          </DialogTitle>
          <DialogDescription>
            Erinnerung an die nächste Reinigung – im Portal und per E-Mail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Label className="text-base font-medium">Erinnerung aktiv</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Popup vor der nächsten Reinigung einblenden
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => update({ enabled: checked })}
              className="flex-shrink-0"
            />
          </div>

          <div
            className={`flex items-center justify-between gap-3 ${
              !settings.enabled ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <div className="min-w-0 flex-1">
              <Label className="text-base font-medium">Tage vorher</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Popup erscheint, wenn die Reinigung in höchstens {settings.daysBefore}{' '}
                {settings.daysBefore === 1 ? 'Tag' : 'Tagen'} ansteht
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => update({ daysBefore: Math.max(0, settings.daysBefore - 1) })}
                className="w-11 h-11 rounded-md border border-border bg-card flex items-center justify-center active:scale-95 transition disabled:opacity-50"
                aria-label="Weniger Tage"
                disabled={settings.daysBefore <= 0}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-xl font-bold tabular-nums">
                {settings.daysBefore}
              </span>
              <button
                type="button"
                onClick={() => update({ daysBefore: Math.min(14, settings.daysBefore + 1) })}
                className="w-11 h-11 rounded-md border border-border bg-card flex items-center justify-center active:scale-95 transition disabled:opacity-50"
                aria-label="Mehr Tage"
                disabled={settings.daysBefore >= 14}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <Separator />

          {/* E-Mail-Erinnerung */}
          {mailLaedt ? (
            <p className="text-sm text-muted-foreground">Lade E-Mail-Einstellung …</p>
          ) : !mail ? (
            <p className="text-sm text-destructive">
              E-Mail-Einstellung konnte nicht geladen werden{mailFehler ? `: ${mailFehler}` : '.'}
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Per E-Mail erinnern
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Mail mit allen Reinigungen des Tages
                  </p>
                </div>
                <Switch
                  checked={mailAn}
                  onCheckedChange={mailSchalten}
                  className="flex-shrink-0"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="erinnerung-email" className="text-sm font-medium">
                  Deine E-Mail-Adresse
                </Label>
                <Input
                  id="erinnerung-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  onBlur={adresseSpeichern}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  }}
                  placeholder="name@beispiel.at"
                  className="h-11 text-base"
                />
              </div>

              <div className={`space-y-4 ${!mailAn ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Label className="text-base font-medium">Wann</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{tageText(mailTage)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => speichern({ email_reminder_days_before: Math.max(0, mailTage - 1) })}
                      className="w-11 h-11 rounded-md border border-border bg-card flex items-center justify-center active:scale-95 transition disabled:opacity-50"
                      aria-label="Weniger Tage vorher"
                      disabled={mailTage <= 0}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center text-xl font-bold tabular-nums">{mailTage}</span>
                    <button
                      type="button"
                      onClick={() => speichern({ email_reminder_days_before: Math.min(7, mailTage + 1) })}
                      className="w-11 h-11 rounded-md border border-border bg-card flex items-center justify-center active:scale-95 transition disabled:opacity-50"
                      aria-label="Mehr Tage vorher"
                      disabled={mailTage >= 7}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <Label className="text-base font-medium">Uhrzeit</Label>
                  <Select
                    value={String(mail.email_reminder_hour)}
                    onValueChange={(v) => speichern({ email_reminder_hour: Number(v) })}
                  >
                    <SelectTrigger className="w-32 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STUNDEN.map((h) => (
                        <SelectItem key={h} value={String(h)}>
                          {String(h).padStart(2, '0')}:00 Uhr
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={testSenden}
                disabled={testLaeuft || !mail.email_address}
              >
                <Send className="w-4 h-4 mr-2" />
                {testLaeuft ? 'Wird gesendet …' : 'Test-Mail senden'}
              </Button>

              {hinweis && (
                <p className={`text-sm ${hinweis.ok ? 'text-muted-foreground' : 'text-destructive'}`}>
                  {hinweis.text}
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderSettingsPopover;
