import Loki, { LokiFsAdapter } from 'lokijs'
import { LokiJSAdapter } from '@nozbe/watermelondb/adapters/lokijs'
import type { LokiAdapterOptions } from '@nozbe/watermelondb/adapters/lokijs'
import { schema } from './schema'

export function createLokiAdapter(): LokiJSAdapter {
  const options: LokiAdapterOptions = {
    dbName: 'tabletop-tracker',
    schema,
    useWebWorker: false,
    useIncrementalIndexedDB: true,
    // WatermelonDB uses IndexedDB under the hood on web via LokiJS
  }

  return new LokiJSAdapter(options)
}


