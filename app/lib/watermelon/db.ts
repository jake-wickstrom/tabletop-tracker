import { Database } from '@nozbe/watermelondb'
import { createLokiAdapter } from './adapter'

// Centralized WatermelonDB database factory
export function createDatabase(): Database {
  const adapter = createLokiAdapter()
  return new Database({
    adapter,
    modelClasses: [],
  })
}


