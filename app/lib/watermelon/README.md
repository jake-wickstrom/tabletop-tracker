# WatermelonDB (Web) – Offline Data Layer

This directory contains the offline-first data layer for the web app using WatermelonDB with the LokiJS adapter (IndexedDB persistence).

- Adapter: `adapter.ts` (LokiJSAdapter for web)
- Database factory: `db.ts` (creates the WatermelonDB `Database`)
- Schema: `schema.ts` (WatermelonDB schema definition)
- Sync utilities: `sync.ts` (client-side pull/push logic)
- React context: `app/contexts/WatermelonContext.tsx` (provider + sync loop)
- API endpoints: `app/api/wm-sync/route.ts` (server pull/push – currently stubbed)

WatermelonDB on web uses LokiJS for fast in-memory operations and persists to IndexedDB for durability. If you later target React Native, swap to the SQLite adapter without changing app logic.

## Conventions

- **IDs**: Use UUID strings generated on the client for offline creates.
- **Timestamps**: Use epoch milliseconds on the client; convert to/from timestamptz on the server.
- **Soft deletes**: Use a nullable `deleted_at` (epoch ms). In sync payloads, deletions are represented as a list of deleted IDs.
- **Typescript**: Prefer explicit types; avoid `any`. Prefer `undefined` over `null`.
- **Auth/RLS**: All server operations are scoped via Supabase Row Level Security to the authenticated user.

---

## How to add a new table + model

1) Update schema
- Edit `schema.ts` and add a `tableSchema` entry.
- Bump the `version` number when changing schema. Provide a WatermelonDB migration when changing schema in production. During early development, a reset may be acceptable.
- Index query-heavy fields with `isIndexed: true`.
- Prefer numbers for timestamps (epoch ms) on the client.

2) Create the model class
- Add `app/lib/watermelon/models/<YourModel>.ts` extending Watermelon `Model`.
- Decorate fields and relations using decorators (e.g., `@field`, `@text`, `@date`, `@relation`, `@children`).

3) Register model classes
- Export an array of model classes in `app/lib/watermelon/models/index.ts`.
- Import that array in `db.ts` and pass it to `new Database({ adapter, modelClasses })`.

4) Migrations (when bumping version)
- For production changes, provide WatermelonDB migrations. During development, a reset is acceptable but avoid in production.

### Example sketch

- `schema.ts` (excerpt)
```ts
import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'games',
      columns: [
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'min_players', type: 'number' },
        { name: 'max_players', type: 'number' },
        { name: 'estimated_playtime_minutes', type: 'number' },
        { name: 'complexity_rating', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted_at', type: 'number', isOptional: true },
      ],
    }),
  ],
})
```

- `models/Game.ts` (excerpt)
```ts
import { Model } from '@nozbe/watermelondb'
import { field, date, text } from '@nozbe/watermelondb/decorators'

export class Game extends Model {
  static table = 'games'

  @text('name') name!: string
  @text('description') description: string | undefined
  @field('min_players') minPlayers!: number
  @field('max_players') maxPlayers!: number
  @field('estimated_playtime_minutes') estimatedPlaytimeMinutes!: number
  @field('complexity_rating') complexityRating!: number
  @date('created_at') createdAt!: number
  @date('updated_at') updatedAt!: number
  @date('deleted_at') deletedAt: number | undefined
}
```

- `models/index.ts`
```ts
import { Game } from './Game'
export const modelClasses = [Game]
```

- `db.ts` (excerpt)
```ts
import { Database } from '@nozbe/watermelondb'
import { createLokiAdapter } from './adapter'
import { modelClasses } from './models'

export function createDatabase(): Database {
  const adapter = createLokiAdapter()
  return new Database({ adapter, modelClasses })
}
```

---

## Sync: client and server responsibilities

- Client pull: `GET /api/wm-sync?cursor=<epoch_ms>` → returns `{ changes, timestamp }`.
- Client push: `POST /api/wm-sync` → sends `{ changes, lastPulledAt }`, expects `{ ok: true }`.
- Conflict policy (initial): **Last-Write-Wins** using `updated_at`. Soft-deletes via `deleted_at`.

### Update the client sync
- See `sync.ts` (`runSync`) – implement `pullChanges` and `pushChanges` according to the contract above.
- See `WatermelonContext.tsx` – the sync loop triggers on app load and when the browser comes online. Follow-up tasks will add cursor persistence, retry/backoff, and auth-aware triggers.

### Update the server endpoints
- See `app/api/wm-sync/route.ts` – replace the stub with:
  - GET: compute `timestamp` at request start; for each table, return `created`/`updated`/`deleted` since the last `cursor`, scoped by RLS.
  - POST: apply creates/updates/deletes in a transaction-like flow, honoring RLS and client UUIDs.

---

## Usage in components

Use the context to access the database and observe queries.

```tsx
'use client'
import { useEffect, useState } from 'react'
import { Q } from '@nozbe/watermelondb'
import { useWatermelon } from '@/app/contexts/WatermelonContext'

export default function GamesList() {
  const { db } = useWatermelon()
  const [names, setNames] = useState<string[]>([])

  useEffect(() => {
    if (!db) return
    const collection = db.collections.get('games')
    const subscription = collection
      .query(Q.where('deleted_at', Q.eq(null)))
      .observe()
      .subscribe((records) => setNames(records.map((g) => g.get('name'))))
    return () => subscription.unsubscribe()
  }, [db])

  return (
    <ul>
      {names.map((n) => (
        <li key={n}>{n}</li>
      ))}
    </ul>
  )
}
```

---

## Testing guidelines

- Use Given/When/Should nesting; use `it` for the Should-level assertions.
- Use a constant date in tests (do not use the current time). Example:
```ts
const FIXED_NOW = new Date('2024-01-01T00:00:00Z')
vi.setSystemTime(FIXED_NOW)
```
- Break multiple conditions for a single When into separate checks so they can fail independently.

---

Docs:
- Installation (Web LokiJS): https://watermelondb.dev/docs/Installation/#web
- Schema: https://watermelondb.dev/docs/Schema/
- Models & Relations: https://watermelondb.dev/docs/Model/
- Sync: https://watermelondb.dev/docs/Sync/Intro/
