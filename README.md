# Boris Reinigungsportal

Arbeits-App für **Boris**, die zweite Reinigungskraft der Steinbock Chalets.
Boris sieht hier, wann welche Buchung ansteht, wann gereinigt werden muss und wann
die Wäsche geliefert wird. Reinigungstermine kann Boris bei Bedarf verschieben.
Boris springt ein, wenn Amela keine Zeit hat, und übernimmt die Fensterreinigung.

- **Live:** https://boris-clean-hub-selfhosted.vercel.app
- **Teil von:** Steinbock Chalets Hausverwaltung (`hausmanagement-selfhosted`)
- **Fachliche Beschreibung:** [`doc/Boris Zweck Ablauf und Zusammenspiel_2.txt`](doc/Boris%20Zweck%20Ablauf%20und%20Zusammenspiel_2.txt)

## Wichtig zu wissen

- Reinigungen werden **nicht** in diesem Portal angelegt, sondern von der
  Hausverwaltung erzeugt (standardmäßig am Check-in-Tag jeder Buchung).
- Das Portal zeigt nur Reinigungen des eigenen Dienstleisters
  (`service_tasks.provider_id = 193a013f-45ed-4621-b95f-b449aa79c2c9`).
- Das Portal meldet sich automatisch mit einem eigenen Portal-Konto an.
- Es ist eine **PWA** (installierbar, offline-fähig), gebaut mit `vite-plugin-pwa`.

## Technik

| Bereich | Lösung |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Supabase (Projekt `usblrulkcgucxtkhugck`, Frankfurt), gemeinsam mit Hausverwaltung und den anderen Portalen |
| Hosting | Vercel – jeder Push auf `main` wird automatisch veröffentlicht |

## Umgebungsvariablen (in Vercel gesetzt)

| Variable | Zweck |
|---|---|
| `VITE_PORTAL_EMAIL` | E-Mail des Portal-Kontos für die automatische Anmeldung |
| `VITE_PORTAL_PASSWORD` | Passwort des Portal-Kontos |
| `VITE_PROVIDER_ID` | Dienstleister-ID (optional, Standardwert steht in `src/constants/app.ts`) |

## Lokal starten (optional)

Voraussetzung: Node.js 18+.

```sh
git clone https://github.com/UliBer1508/boris-clean-hub-selfhosted.git
cd boris-clean-hub-selfhosted
npm install
npm run dev              # startet auf http://localhost:8080
```

## Änderungen vornehmen

Änderungen werden direkt im GitHub-Editor (oder per Pull Request) auf `main`
committet. Vercel baut und veröffentlicht danach automatisch.
