export type BggSearchItem = {
  id: string
  name: string
  yearPublished?: number
  imageUrl?: string
  thumbnailUrl?: string
}

export type BggThing = {
  id: string
  name: string
  yearPublished?: number
  publishers: string[]
  imageUrl?: string
  thumbnailUrl?: string
}

export type BggSearchResponse = {
  items: BggSearchItem[]
}


