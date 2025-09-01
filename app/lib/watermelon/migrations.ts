import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'

// Baseline is schema version 1 (no prior tables). Add steps when bumping to v2+.
export const migrations = schemaMigrations({
  migrations: [
    // Example for future changes:
    // {
    //   toVersion: 2,
    //   steps: [
    //     addColumns({ table: 'games', columns: [{ name: 'foo', type: 'string' }] }),
    //   ],
    // },
  ],
})


