import { describe, expect, it } from 'vitest'
import { ikutiJalur, pesanMasalahJalur } from '@/viz/jalur'
import { alurException, hitungSorotan, idExceptionAktif, jenisSorotan } from '@/viz/sorotan'
import { PembangunTrace, simpulInt } from '@/viz/uji/pembangunTrace'
import type { Langkah } from '@/engine/trace'

describe('ikutiJalur', () => {
  it('variabel, field berantai, this, field static Main dan class lain', () => {
    const t = new PembangunTrace()
    const n2 = simpulInt(t, 2)
    const n1 = simpulInt(t, 1, n2)
    const daftar = t.objek('Main$Daftar', { head: n1, size: 2 }, { head: 'Node', size: 'int' })
    t.statik('kepala', 'Node', n1)
    t.statik('Konfig.awal', 'Node', n2)
    const main = t.frame('main', [{ nama: 'args', tipe: 'String[]', nilai: null }])
    t.deklarasi(main, 'daftar', 'Daftar', daftar)
    t.deklarasi(main, 'kosong', 'Node')
    t.frame('tambah', [{ nama: 'this', tipe: 'Daftar', nilai: daftar, slot: -1 }])
    const s = t.state
    expect(ikutiJalur(s, 'daftar.head').nilai).toBe(n1)
    expect(ikutiJalur(s, 'daftar.head.next')).toMatchObject({ nilai: n2, tipe: 'Node' })
    expect(ikutiJalur(s, 'this.head').nilai).toBe(n1)
    expect(ikutiJalur(s, 'this.size')).toMatchObject({ nilai: 2, tipe: 'int' })
    expect(ikutiJalur(s, 'kepala').nilai).toBe(n1)
    expect(ikutiJalur(s, 'Main.kepala').nilai).toBe(n1)
    expect(ikutiJalur(s, 'Konfig.awal').nilai).toBe(n2)
    expect(ikutiJalur(s, 'daftar.head.next.next')).toMatchObject({ nilai: null })
    const tengah = ikutiJalur(s, 'daftar.head.next.next.next')
    expect(tengah).toMatchObject({ masalah: 'null-di-tengah', pada: 'daftar.head.next.next' })
    expect(pesanMasalahJalur(tengah, 'daftar.head.next.next.next')).toContain('bernilai null')
    expect(ikutiJalur(s, 'daftar.ekor')).toMatchObject({ masalah: 'field-tidak-ada', pada: 'daftar.ekor' })
    expect(ikutiJalur(s, 'kosong')).toMatchObject({ masalah: 'belum-diisi' })
    expect(ikutiJalur(s, 'tidakAda')).toMatchObject({ masalah: 'tidak-ada' })
  })

  it('arah luar memilih frame terbawah (seluruh pohon), arah dalam frame teratas (penunjuk)', () => {
    const t = new PembangunTrace()
    const anak = simpulInt(t, 2)
    const akar = simpulInt(t, 1, anak)
    const main = t.frame('main')
    t.deklarasi(main, 'root', 'Node', akar)
    t.frame('sisip', [{ nama: 'root', tipe: 'Node', nilai: anak }])
    expect(ikutiJalur(t.state, 'root', 'luar').nilai).toBe(akar)
    expect(ikutiJalur(t.state, 'root', 'dalam').nilai).toBe(anak)
  })
})

describe('hitungSorotan (Fase 2)', () => {
  it('field, objek baru, salin-elemen, StringBuilder, cache Integer, pemanggilan pustaka', () => {
    const t = new PembangunTrace()
    const n = simpulInt(t, 1)
    t.int(127)
    t.catat()
    t.tulisField(n, 'data', 5)
    t.bacaField(n, 'next')
    const a = t.array('Object', [null, null, null])
    t.emit({ k: 'salin-elemen', id: a, mulai: 1, nilai: [7, 8] })
    const sb = t.alokasi({ k: 'pembangun', nilai: '' })
    t.emit({ k: 'tulis-pembangun', id: sb, lama: '', baru: 'ab', metode: 'append' })
    const lagi = t.int(127)
    t.emit({ k: 'pustaka', id: a, kelas: 'java.util.ArrayList', metode: 'get' })
    t.catat()
    const tr = t.selesai()
    const s = hitungSorotan(tr.langkah[1])
    expect(s.tulis.has(`field:${n}:data`)).toBe(true)
    expect(s.baca.has(`field:${n}:next`)).toBe(true)
    expect(s.baru.has(`obj:${a}`)).toBe(true)
    expect([...s.tulis].filter((k) => k.startsWith(`el:${a}:`))).toEqual([`el:${a}:1`, `el:${a}:2`])
    expect(s.tulis.has(`obj:${sb}`)).toBe(true)
    expect(s.baca.has(`obj:${lagi}`)).toBe(true)
    expect(s.baca.has(`obj:${a}`)).toBe(true)
    expect([...s.berubah].sort((x, y) => x - y)).toEqual([n, a, sb].sort((x, y) => x - y))
    expect(jenisSorotan(s, ['field:999:x', `field:${n}:data`])).toBe('tulis')
    expect(jenisSorotan(s, [`field:${n}:next`])).toBe('baca')
  })

  it('alur exception: lempar, rambat, tangkap, finally', () => {
    const langkah: Langkah = {
      baris: 9,
      jenis: 'pernyataan',
      panjangOutput: 0,
      kedalaman: 1,
      peristiwa: [
        { k: 'lempar', kelas: 'java.lang.IllegalStateException', pesan: 'Stok habis', id: 12 },
        { k: 'rambat', frame: 3, method: 'ambil', kelas: 'java.lang.IllegalStateException' },
        { k: 'buang-frame', frame: 3 },
        { k: 'tangkap', kelas: 'java.lang.IllegalStateException', tipe: 'IllegalStateException', variabel: 'e', id: 12 },
        { k: 'finally', sebab: 'exception' },
      ],
    }
    const a = alurException(langkah)!
    expect(a.lempar?.pesan).toBe('Stok habis')
    expect(a.rambat.map((r) => r.method)).toEqual(['ambil'])
    expect(a.tangkap?.variabel).toBe('e')
    expect(a.finally?.sebab).toBe('exception')
    expect(idExceptionAktif(a)).toBe(12)
    expect(alurException({ ...langkah, peristiwa: [] })).toBeNull()
  })
})
