import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { putar } from './putar'
import { SKENARIO } from './skenario'

/**
 * Fidelitas model koleksi terhadap JDK 21: setiap skenario diputar ulang pada model dan dibandingkan
 * langkah demi langkah dengan fixture hasil JDK asli (scripts/fixture-koleksi.ts).
 */
interface Fixture {
  jdk: string
  skenario: Record<string, unknown[]>
}

const muat = (berkas: string) =>
  JSON.parse(readFileSync(new URL(`./fixture/${berkas}.json`, import.meta.url), 'utf8')) as Fixture

for (const berkas of [...new Set(SKENARIO.map((s) => s.berkas))]) {
  const fixture = muat(berkas)
  describe(`fidelitas ${berkas} (JDK ${fixture.jdk})`, () => {
    for (const s of SKENARIO.filter((x) => x.berkas === berkas)) {
      it(s.nama, () => {
        const harapan = fixture.skenario[s.nama]
        expect(harapan, 'fixture belum ada: jalankan pnpm exec tsx scripts/fixture-koleksi.ts').toBeDefined()
        const { langkah } = putar(s)
        expect(langkah.length).toBe(harapan.length)
        langkah.forEach((l, i) =>
          expect(l, `langkah ${i}: ${JSON.stringify(s.langkah[i])}`).toEqual(harapan[i]),
        )
      })
    }
  })
}

describe('fixture', () => {
  it('memuat semua skenario dan tidak ada skenario usang', () => {
    for (const berkas of new Set(SKENARIO.map((s) => s.berkas))) {
      const nama = SKENARIO.filter((s) => s.berkas === berkas).map((s) => s.nama)
      expect(Object.keys(muat(berkas).skenario).sort()).toEqual(nama.sort())
    }
  })
})
