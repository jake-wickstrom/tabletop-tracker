import { Database } from '@nozbe/watermelondb'
import { createLokiAdapter } from './adapter'
import { schema } from './schema'

// Centralized WatermelonDB database factory
export function createDatabase(): Database {
  const adapter = createLokiAdapter()
  return new Database({
    adapter,
    modelClasses: [],
    actionsEnabled: true,
  })
}


