import { describe, it, expect } from 'vitest'
import { parseBggSearch, parseBggThing } from './xml'

describe('given BGG XML responses', () => {
  describe('when parsing search results', () => {
    it('should extract id, name and optional year', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
      <items total="1" termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
        <item type="boardgame" id="174430">
          <name type="primary" value="Gloomhaven"/>
          <yearpublished value="2017"/>
        </item>
      </items>`

      const items = parseBggSearch(xml)
      expect(items.length).toBe(1)
      expect(items[0]).toEqual({
        id: '174430',
        name: 'Gloomhaven',
        yearPublished: 2017,
        imageUrl: undefined,
        thumbnailUrl: undefined,
      })
    })

    it('should handle missing year gracefully', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
      <items total="1" termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
        <item type="boardgame" id="13">
          <name type="primary" value="Catan"/>
        </item>
      </items>`

      const items = parseBggSearch(xml)
      expect(items.length).toBe(1)
      expect(items[0].yearPublished).toBeUndefined()
    })
  })

  describe('when parsing thing details', () => {
    it('should extract name, year, publishers, and images', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
      <items>
        <item type="boardgame" id="123">
          <thumbnail>http://example.com/thumb.jpg</thumbnail>
          <image>http://example.com/image.jpg</image>
          <name type="primary" sortindex="1" value="Example Game"/>
          <yearpublished value="2020"/>
          <link type="boardgamepublisher" id="5" value="Acme Publishing"/>
          <link type="boardgamepublisher" id="6" value="Second Publisher"/>
        </item>
      </items>`

      const items = parseBggThing(xml)
      expect(items.length).toBe(1)
      expect(items[0].id).toBe('123')
      expect(items[0].name).toBe('Example Game')
      expect(items[0].yearPublished).toBe(2020)
      expect(items[0].publishers[0]).toBe('Acme Publishing')
      expect(items[0].imageUrl).toBe('http://example.com/image.jpg')
      expect(items[0].thumbnailUrl).toBe('http://example.com/thumb.jpg')
    })

    it('should handle missing fields safely', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
      <items>
        <item type="boardgame" id="456">
          <name type="primary" value="No Year Game"/>
        </item>
      </items>`

      const items = parseBggThing(xml)
      expect(items.length).toBe(1)
      expect(items[0].yearPublished).toBeUndefined()
      expect(items[0].publishers.length).toBe(0)
      expect(items[0].imageUrl).toBeUndefined()
      expect(items[0].thumbnailUrl).toBeUndefined()
    })
  })
})


