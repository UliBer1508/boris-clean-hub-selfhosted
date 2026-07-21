// BORIS-PORTAL — Provider-ID.
//
// Diese eine Konstante steuert, WESSEN Reinigungen das Portal zeigt und unter
// wessen Namen Nachrichten gesendet werden. Sie wird an 15 Stellen verwendet
// (usePortalMessages.ts, CleaningPortal.tsx, useBookings.ts).
//
// WICHTIG — der Fallback muss Boris sein, NICHT der andere Dienstleister:
// Fehlt die Umgebungsvariable in Vercel, zeigte das Portal sonst fremde
// Reinigungen und sendete Nachrichten unter fremder Provider-ID — still, ohne
// Fehlermeldung.
//
//   Boris (dieses Portal): 193a013f-45ed-4621-b95f-b449aa79c2c9
//   Amela (anderes Portal): 9de6e071-7e89-4d66-9433-a5f01acaa493
//
// Umbenannt am 21.07.2026 von AMELA_PROVIDER_ID / VITE_AMELA_PROVIDER_ID.
// Beim Ändern der Vercel-Variable muss der Name dort mitgezogen werden.
export const PROVIDER_ID =
  (import.meta.env.VITE_PROVIDER_ID as string | undefined) ??
  '193a013f-45ed-4621-b95f-b449aa79c2c9';

export const APP_CONFIG = {
  ITEMS_PER_PAGE: 50,
  SEARCH_DEBOUNCE_MS: 300,
  DEFAULT_TIME: '09:00',
  LOADING_TIMEOUT: 30000,
} as const;

export const TIME_FILTERS = {
  all: 'Alle Zeiten',
  week: 'n. Woche', 
  month: 'n. Monat',
  '3months': 'n. 3 Monate',
} as const;

export const STATUS_FILTERS = {
  all: 'Alle Status',
  scheduled: 'Geplant',
  completed: 'Abgeschlossen',
  cancelled: 'Storniert',
  in_progress: 'In Bearbeitung',
  delayed: 'Verzögert',
} as const;

export const NOTIFICATION_TYPES = {
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated', 
  TASK_COMPLETED: 'task_completed',
  TASK_CANCELLED: 'task_cancelled',
} as const;