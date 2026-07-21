# Changelog

All notable changes to the **Boris Cleaning Portal** project will be documented in
this file.

> Dieses Repo entstand am 21.07.2026 als GitHub-Template-Kopie von
> `amela-clean-hub-selfhosted`. Alle Einträge vor diesem Datum stammen aus dem
> Ursprungs-Repo und beschreiben die gemeinsame Codebasis.

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