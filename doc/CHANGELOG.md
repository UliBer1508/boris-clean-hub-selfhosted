# Changelog

All notable changes to the **Boris Cleaning Portal** project will be documented in
this file.

> Dieses Repo entstand am 21.07.2026 als GitHub-Template-Kopie von
> `amela-clean-hub-selfhosted`. Alle Einträge vor diesem Datum stammen aus dem
> Ursprungs-Repo und beschreiben die gemeinsame Codebasis.



---

## [Boris 1.1.0] - 2026-08-18

### Kalender: Belegungsraster statt Terminliste

Die Wochenansicht des Kalenders zeigt jetzt Belegung und Auftrag im selben Bild
(Zeile = Haus, Spalte = Tag, vier Wochen untereinander). Beschreibung in
`doc/Boris Zweck Ablauf und Zusammenspiel_2.txt`, Abschnitt 3a.

#### Neue Dateien
- `src/lib/belegung.ts` — Belegungslogik (`getDayInfo`, `getCellStyle`) und
  Hausfarben (`getHouseColors`). Wörtlich aus `HouseStackedCalendar.tsx` bzw.
  `src/lib/utils.ts` der Hausverwaltung übernommen, damit „Wechseltag" und die
  Hausfarben überall dasselbe bedeuten. **Inhaltsgleich in allen Portal-Repos.**
- `src/components/Belegungsraster.tsx` — die Darstellung. Portalneutral: kennt
  weder Provider noch Rolle; wer welche Aufgaben sieht, entscheidet die
  aufrufende Seite.

#### Fehlerbehebung
- **Der Kalender filterte nicht nach `provider_id`.** `src/pages/Calendar.tsx`
  importierte `PROVIDER_ID` nicht und baute seine Termine aus **allen**
  `service_tasks` aller Buchungen. Die dokumentierte Regel („Das Portal zeigt
  ausschließlich Reinigungen mit `provider_id = 193a013f…`", Abschnitt 1 der
  Portal-Doku) war dort nicht umgesetzt — der Kalender verließ sich
  unausgesprochen auf die Datenbank. Jetzt steht der Filter explizit im Code,
  an beiden Datenquellen.
  **Derselbe Zustand besteht in Amelas Portal** (`Calendar.tsx` ist bis auf zwei
  Zeilen identisch) und wird beim Übertragen des Rasters mitbehoben.
  Dies ist der **zweite** Fund dieser Art: am 21.07. lief bereits
  `totalCleaningTasks` am Provider-Filter vorbei. Beide Male war die angezeigte
  Liste korrekt und eine Nebenstelle nicht.
- **Reinigungen ohne Buchung fehlten im Kalender vollständig.** Die Termine
  wurden ausschließlich aus `booking.service_tasks` gebaut; Standalone-Aufgaben
  (`booking_id is null`) — Fensterreinigung, Generalreinigung — tauchten nicht
  auf. Fensterputzen ist laut Portal-Doku einer der beiden Gründe für dieses
  Portal. Sie kommen jetzt aus `useBookings().standaloneCleanings` dazu, ohne
  zusätzliche Abfrage.
- **Eigene Hausfarben-Tabelle entfernt.** `Calendar.tsx` färbte Wald grün und
  Venediger violett; Hausverwaltung und Website nutzen cyan und amber. Farben
  kommen jetzt aus `belegung.ts`. Betrifft auch die Monatsansicht.

#### Geändert
- `src/hooks/useAllBookings.ts`
  - `houses` als `!inner` mit `.eq('houses.rental_type','tourist')`. Ohne den
    Filter kämen die Dauermietobjekte als eigene Zeilen ins Raster; `useHouses`
    filtert seit jeher so, die Buchungsabfrage nicht.
  - `linen_orders` mitgeladen (id, status, delivery_date, delivery_time,
    total_items) — der Kalender braucht sie für den Wäsche-Streifen. Bisher lud
    sie nur `useBookings`.
  - Realtime-Kanal für `linen_orders` ergänzt, sonst bliebe eine gerade als
    geliefert gemeldete Bestellung im Raster offen stehen.
- `src/pages/Calendar.tsx`
  - Wochenansicht durch `<Belegungsraster>` ersetzt; die Blöcke „Wochenliste"
    und „Kommende Wochen" entfallen, das Raster deckt beides ab.
  - Schaltfläche „Woche" heißt jetzt „Belegung"; der Zeitraumtitel nennt alle
    vier Wochen statt nur einer.
  - Monatsansicht und Detail-Sheet unverändert (nur die Farben ändern sich).

#### Neu im Raster
- **Wäsche-Streifen** am unteren Zellenrand, gepaart über `booking_id` — nicht
  über das Datum. Grün = geliefert, grau = offen.
- **Roter Rahmen**, wenn die Reinigung ansteht und die zugehörige Wäsche nicht
  geliefert ist. Dieselbe Bedingung, die `max-linen-reminders` für Teunis
  Erinnerungen auswertet — hier dauerhaft sichtbar statt nur in einer Nachricht.
- **Kollisionspunkt** (amber), wenn beide Häuser am selben Tag eine Reinigung
  haben. Das war seit dem 27.07.2026 als offener Punkt in
  `docs/Session-2026-07-27-Kalender-Neubau.md` der Hausverwaltung vermerkt, dort
  aber nie gebaut.

#### Bewusst NICHT geändert
- Amelas Reinigungen erscheinen **gar nicht**, auch nicht ausgegraut. Das folgt
  der Portal-Doku („Amelas Reinigungen sind unsichtbar"). Ein grauer Hinweis
  wäre fachlich vertretbar (Boris sähe, welcher Wechseltag schon abgedeckt ist),
  ist aber eine eigene Entscheidung.
- Monatsansicht bleibt bestehen — Rückweg, falls sich das Raster nicht bewährt.

#### Geprüft / nicht geprüft
- Syntax aller vier Dateien mit `esbuild` — das prüft **nur** Syntax, keine
  Typen und keine Spaltenexistenz.
- Feldnamen einzeln gegen `src/integrations/supabase/types.ts` belegt.
- Das `!inner` mit `.eq('houses.rental_type','tourist')` ist dasselbe Muster,
  das Teunis `CalendarView.tsx` produktiv nutzt.
- **Nicht geprüft:** Verhalten in der laufenden App. Nach dem Deploy: Startseite
  muss unverändert sein, im Raster dürfen nur Boris' Termine stehen.

---

## [Boris 1.0.0] - 2026-07-21

### Umstellung von Amela auf Boris

Vollständige Kopie des Amela-Portals, umgestellt auf Boris als Portal-Eigner.
Das Frontend ist noch **nicht** reduziert (siehe
`doc/Boris Zweck Ablauf und Zusammenspiel`, Abschnitt 5).

#### Provider-Identität
- `src/constants/app.ts`: Fallback der Konstante `AMELA_PROVIDER_ID` von Amela
  (`9de6e071-…`) auf **Boris** (`193a013f-…`) geändert.
  **Begründung:** Fehlt die Vercel-Variable, hätte das Portal sonst still Amelas
  Reinigungen gezeigt und Nachrichten unter ihrer Provider-ID gesendet — ohne
  Fehlermeldung. Der Konstantenname bleibt vorerst; Umbenennen auf
  `PROVIDER_ID` ist für Version 2 vorgemerkt (15 Fundstellen).

#### Datenintegrität
- `src/hooks/useBookings.ts`: `status_changed_by: 'Amela'` → `'Boris'`.
  Setzt Boris eine Reinigung auf „erledigt", stand vorher in `service_tasks` und
  in der Hausverwaltung („Geändert von: …") **Amela**.
- `src/hooks/useNotificationPreferences.ts`: Filter `user_name = 'Amela'` →
  `'Boris'` (3 Stellen + Realtime-Filter). Die Tabelle
  `boris_notification_preferences` enthält genau einen Datensatz mit
  `user_name = 'Boris'`; der Amela-Filter fand ihn nie und fiel auf
  Standardwerte zurück.
- `src/components/NotificationSettings.tsx`: Default-Parameter
  `userName = 'Amela'` → `'Boris'`.

#### Trennung von Amelas Portal (kritisch bei parallelem Betrieb)
- **Realtime-Kanäle** umbenannt, sonst kollidieren beide Portale im selben
  Browser:
  · `amela-portal-messages-*` → `boris-portal-messages-*` (`usePortalMessages.ts`)
  · `amela-portal-notifications` → `boris-portal-notifications` (`CleaningPortal.tsx`)
- **localStorage-Schlüssel** umbenannt, sonst überschreiben sich die
  Einstellungen gegenseitig:
  · `amela_reminder_settings_v1` → `boris_reminder_settings_v1`
  · `amela:reminder-settings-changed` → `boris:…` (Event)
  · `amela:reminder-popup-dismissed` → `boris:…`

#### Sichtbare Beschriftungen
- „Amela Reinigungsportal" → „Boris Reinigungsportal" in `CleaningPortal.tsx`,
  `Calendar.tsx`, `PutzkraeftePage.tsx` und `index.html` (Titel + Meta-Angaben)
- Erinnerungs-Banner: „Hallo Amela, …" → „Hallo Boris, …"

#### Komponenten umbenannt
- Ordner `src/components/amela/` → `src/components/boris/`
- `AmelaBookingInfoCard.tsx` → `BorisBookingInfoCard.tsx`
- `AmelaCleaningCard.tsx` → `BorisCleaningCard.tsx`
- `AmelaEntryRow.tsx` → `BorisEntryRow.tsx`
- `CleaningReminderBanner.tsx`, `LaundryStatusRow.tsx`,
  `ReminderSettingsPopover.tsx` behalten ihre Namen
- Import-Pfade in `CleaningPortal.tsx` und `Calendar.tsx` angepasst

#### Fehlerbehebung
- **Badge-Zähler zeigte 55 statt 3.** `totalCleaningTasks` in `useBookings.ts`
  zählte **alle** `service_tasks` aller geladenen Buchungen plus alle
  Standalone-Reinigungen — ohne Provider-Filter. Die angezeigte **Liste** war nie
  betroffen (`filteredEntries` prüft `task.provider_id === providerFilter`); nur
  der Zähler lief daran vorbei. Korrigiert mit derselben Bedingung, damit Liste
  und Badge nicht auseinanderlaufen können.
  **Derselbe Fehler existierte in Amelas Portal** und wurde dort am selben Tag
  behoben — Amela zählte Boris' Reinigungen mit.

#### Deployment
- Vercel-Projekt `boris-clean-hub-selfhosted`, Domain
  `boris-clean-hub-selfhosted.vercel.app`
- Supabase-Nutzer `boris@portal.local` (existierte bereits seit 11/2025,
  Passwort neu gesetzt)
- `service_providers.portal_token` für Boris auf die neue Domain aktualisiert
  (stand vorher auf `boris-clean-desk-selfhosted.vercel.app` — Deployment unter
  diesem Namen hat nie existiert)

#### Verifiziert
Portal live geprüft: Titel korrekt, angezeigte Reinigungen sind ausschließlich
Boris' (29.07. Venediger, 02.08. Wald, 09.08. Venediger), Wäsche-Lieferstatus
wird angezeigt.

---

## [1.0.0] - 2025-09-30

### 🎉 Initial Release - Version 1.0

#### ✨ Features
- **Calendar View**: Interactive calendar displaying all bookings with date navigation
- **Configurable Booking Cards**: Fully customizable booking display with admin settings
- **Cleaning Portal**: Dedicated interface for cleaning staff to view and manage assignments
- **PWA Support**: Progressive Web App functionality with offline capabilities
- **Mobile-Responsive Design**: Optimized layouts for desktop, tablet, and mobile devices
- **Admin Settings Panel**: Comprehensive configuration options for booking card display
- **Mobile Settings Control**: Admin can control whether settings button appears on mobile devices
- **Real-time Updates**: Live data synchronization with Supabase backend
- **Staff Management**: Complete CRUD operations for cleaning staff
- **House Management**: Property management with detailed information
- **Booking Management**: Full booking lifecycle management

#### 🎨 User Interface
- Modern design with Tailwind CSS
- Shadcn/ui component library integration
- Dark/light theme support via next-themes
- Responsive navigation and layouts
- Toast notifications for user feedback
- Loading states and error handling

#### 🔧 Technical Features
- React 18 with TypeScript
- Supabase integration for backend services
- React Query for data fetching and caching
- React Hook Form for form management
- Date-fns for date manipulation
- Vite for fast development and building
- ESLint for code quality

#### 📱 PWA Capabilities
- App installation prompts
- Offline functionality
- Service worker integration
- Pull-to-refresh functionality
- Update notifications

#### 🛡️ Security & Performance
- Row Level Security (RLS) policies
- Optimized bundle size
- Lazy loading for better performance
- Error boundaries for stability

### 🔧 Configuration Options

#### Booking Card Settings
- Guest information display toggles
- Contact details visibility
- Booking information controls
- Cleaning task display options
- User interaction preferences
- Mobile button visibility control

#### Staff Portal Features
- Task assignment view
- Status management
- Time tracking capabilities
- Notes and communication tools

---

**Full Changelog**: This is the initial release establishing the foundation for the Amela Cleaning Portal application.
