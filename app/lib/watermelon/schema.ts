import { appSchema, type TableSchema } from '@nozbe/watermelondb'

// Initial empty schema; business tables will be added in future tickets
export const schema = appSchema({
  version: 1,
  tables: [] as TableSchema[],
})


