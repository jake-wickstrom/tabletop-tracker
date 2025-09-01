import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'
import { schema } from './schema'
import { migrations } from './migrations'

export function createLokiAdapter() {
  return new LokiJSAdapter({
    dbName: 'tabletop-tracker',
    schema,
    migrations,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
  })
}


