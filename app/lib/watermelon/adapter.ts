import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs'
import { schema } from './schema'

export function createLokiAdapter() {
  return new LokiJSAdapter({
    dbName: 'tabletop-tracker',
    schema,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
  })
}


