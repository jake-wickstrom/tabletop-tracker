import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'

// Placeholder migrations. When bumping schema version beyond 2, add steps here.
export const migrations = schemaMigrations({
  migrations: [
    // Example for future changes:
    // {
    //   toVersion: 3,
    //   steps: [
    //     addColumns({ table: 'games', columns: [{ name: 'foo', type: 'string' }] }),
    //   ],
    // },
  ],
})


