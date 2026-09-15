# App Piano Alimentare — stato del progetto

Aggiornato il 15 settembre 2026 sul commit di partenza `d98ba85`.

## Obiettivo

Piattaforma multi-tenant per nutrizionisti e organizzazioni che consenta di gestire
pazienti, modelli alimentari riutilizzabili, piani assegnati e misure nel tempo.

## Architettura attuale

- Frontend React 19 + Vite, pubblicato su Cloudflare Pages.
- API TypeScript su Cloudflare Workers.
- Database PostgreSQL su Neon.
- Repository organizzato per feature con controller, service, repo e types.
- Autenticazione tramite JWT HS256 con organizzazione attiva e ruolo nel token.

Ambienti pubblicati:

- Frontend: <https://app-piano-alimentare.pages.dev>
- API: <https://api.stemoro84.workers.dev>
- Health check: `GET /v1/health`
- Database check: `GET /v1/db-check`

## Funzioni presenti

### Backend

- Registrazione: crea utente, organizzazione e membership `owner`.
- Login con selezione dell'organizzazione quando l'utente appartiene a più tenant.
- Ruoli: `owner`, `admin`, `dietitian`, `assistant`, `patient`.
- Contesto autenticato e controllo RBAC.
- CRUD pazienti filtrato per `org_id`.
- Creazione e lettura dei membri dell'organizzazione.
- CRUD dei metadati dei template alimentari.
- CRUD della struttura dei template: giorni, pasti e item.
- Lettura aggregata dell'intero template.

### Frontend

- Login tecnico.
- Elenco, creazione, selezione, modifica ed eliminazione dei template.
- Creazione dei giorni.
- Creazione, modifica ed eliminazione dei pasti.
- Creazione, modifica ed eliminazione degli item.
- Visualizzazione ad albero del template completo.

Il frontend corrente è uno strumento tecnico di verifica, non ancora l'interfaccia
definitiva destinata a nutrizionista e paziente.

## Vincoli da preservare

- Ogni query operativa deve essere filtrata per `org_id`.
- Ogni endpoint deve verificare ruolo e appartenenza all'organizzazione.
- Template e piani assegnati devono rimanere entità separate.
- Piani e misure devono avere un log minimo delle modifiche.
- Ogni file non banale deve contenere l'header tecnico concordato.
- La logica backend resta separata in controller, service, repo e types.

## Verifiche del 15 settembre 2026

- API pubblica raggiungibile.
- `GET /v1/health` restituisce lo stato atteso.
- `GET /v1/db-check` conferma la connessione a Neon.
- Frontend pubblico raggiungibile e allineato agli asset generati dal repository.
- Build frontend superata.
- Lint frontend superato.
- Type-check backend superato.
- I vecchi test dimostrativi `Hello World` erano obsoleti e sono stati sostituiti
  con una baseline coerente con il router attuale.

## Debito tecnico prioritario

1. Rendere realmente atomica la registrazione: il blocco `sql.begin` attuale chiama
   repository che creano client indipendenti e quindi non condividono la transazione.
2. Ampliare i test con RBAC, isolamento multi-tenant e integrazione su database di test.
3. Rimuovere dal frontend le credenziali dimostrative precompilate.
4. Limitare il CORS agli origin autorizzati prima dell'uso reale.
5. Gestire la revoca o variazione dei ruoli durante le otto ore di validità del JWT.
6. Completare nel frontend modifica ed eliminazione dei giorni.
7. Gestire meglio i conflitti di `sort_order` per giorni, pasti e item.
8. Uniformare formattazione e gestione degli errori nei controller.

## Funzioni di prodotto ancora mancanti

- Interfaccia completa per pazienti e membri dell'organizzazione.
- Piani alimentari assegnati ai singoli pazienti, separati dai template.
- Copia iniziale del template nel piano assegnato, modificabile senza alterare il modello.
- Misure del paziente e relativo storico.
- Log delle modifiche per piani e misure.
- Dashboard nutrizionista e area paziente.
- Stampa o esportazione del piano.
- Recupero password e gestione completa della sessione.

## Ordine di lavoro proposto

1. Stabilizzazione: test reali, transazione di registrazione, credenziali demo e CORS.
2. Completamento editor dei template.
3. Interfaccia e flussi pazienti.
4. Piani assegnati e audit log.
5. Misure e storico.
6. Dashboard, area paziente, stampa/esportazione e rifinitura grafica.

Per ogni blocco backend: test locale, commit, push, deploy Worker e smoke test
sull'ambiente pubblicato prima di iniziare il blocco successivo.

