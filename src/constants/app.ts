// BORIS-PORTAL — Provider-ID.
//
// Der Name der Konstante stammt aus dem Amela-Portal, aus dem dieses Repo
// kopiert wurde (21.07.2026). Der WERT ist Boris. Umbenennen auf
// PROVIDER_ID ist für Version 2 vorgemerkt (15 Fundstellen in
// usePortalMessages.ts und CleaningPortal.tsx).
//
// WICHTIG: Der Fallback muss Boris sein, NICHT Amela. Fehlt die
// Umgebungsvariable in Vercel, würde das Portal sonst still Amelas
// Reinigungen zeigen und Nachrichten unter ihrer Provider-ID senden —
// ohne Fehlermeldung.
//
//   Boris: 193a013f-45ed-4621-b95f-b449aa79c2c9
//   Amela: 9de6e071-7e89-4d66-9433-a5f01acaa493  (NICHT hier verwenden)
export const AMELA_PROVIDER_ID =
  (import.meta.env.VITE_AMELA_PROVIDER_ID as string | undefined) ??
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

export const STAFF_FILTERS = {
  all: 'Alle Putzkräfte',
  amela: 'Amela',
  tatort: 'Tatort Reiniger',
} as const;

export const NOTIFICATION_TYPES = {
  TASK_CREATED: 'task_created',
  TASK_UPDATED: 'task_updated', 
  TASK_COMPLETED: 'task_completed',
  TASK_CANCELLED: 'task_cancelled',
} as const;