import { XMLParser } from 'fast-xml-parser'
import type { BggSearchItem, BggThing } from './types'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  allowBooleanAttributes: true,
  parseTagValue: false,
})

export function parseBggSearch(xml: string): BggSearchItem[] {
  const doc = parser.parse(xml)
  const items = Array.isArray(doc.items?.item) ? doc.items.item : (doc.items?.item ? [doc.items.item] : [])
  return items.map((i: any) => {
    const primaryName = Array.isArray(i.name) ? i.name.find((n: any) => n.type === 'primary') : i.name
    const year = i.yearpublished?.value ? Number(i.yearpublished.value) : undefined
    return {
      id: String(i.id),
      name: String(primaryName?.value || primaryName || ''),
      yearPublished: Number.isFinite(year) ? year : undefined,
      imageUrl: undefined,
      thumbnailUrl: undefined,
    }
  })
}

export function parseBggThing(xml: string): BggThing[] {
  const doc = parser.parse(xml)
  const items = Array.isArray(doc.items?.item) ? doc.items.item : (doc.items?.item ? [doc.items.item] : [])
  return items.map((i: any) => {
    const primaryName = Array.isArray(i.name) ? i.name.find((n: any) => n.type === 'primary') : i.name
    const year = i.yearpublished?.value ? Number(i.yearpublished.value) : undefined
    const links = Array.isArray(i.link) ? i.link : (i.link ? [i.link] : [])
    const publishers = links
      .filter((l: any) => l.type === 'boardgamepublisher')
      .map((l: any) => String(l.value))

    return {
      id: String(i.id),
      name: String(primaryName?.value || primaryName || ''),
      yearPublished: Number.isFinite(year) ? year : undefined,
      publishers,
      imageUrl: i.image ? String(i.image) : undefined,
      thumbnailUrl: i.thumbnail ? String(i.thumbnail) : undefined,
    }
  })
}


