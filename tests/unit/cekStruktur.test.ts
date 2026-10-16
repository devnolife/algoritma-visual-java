import { describe, expect, it } from 'vitest'
import type { Trace } from '@/engine/trace'
import { periksaTantangan, type Penjalan } from '@/lessons/tantangan/periksa'
import { skemaCek, type Tantangan } from '@/lessons/skema'
import { PembangunTrace, simpulInt, simpulPohon } from '@/viz/uji/pembangunTrace'

const tantangan = (cek: unknown[]): Tantangan => ({ id: 'uji', judul: 'Uji', soal: 'Uji', cek: cek.map((c) => skemaCek.parse(c)), petunjuk: [] })
const penjalan = (trace: Trace): Penjalan => async () => ({ ok: true, diagnostik: [], konstruksi: [], trace })

/** Program sintetis: main membangun head → 1 → 2 → 3 lalu selesai. */
function traceRantai(melingkar = false): Trace {
  const t = new PembangunTrace()
  const main = t.frame('main', [{ nama: 'args', tipe: 'String[]', nilai: null }])
  t.catat()
  const n3 = simpulInt(t, 3)
  const n2 = simpulInt(t, 2, n3)
  const n1 = simpulInt(t, 1, n2)
  t.deklarasi(main, 'head', 'Node', n1)
  t.catat()
  if (melingkar) t.tulisField(n3, 'next', n2)
  return t.selesai()
}

describe('cek isiRantai', () => {
  it('lulus bila isi dari kepala sampai null sama', async () => {
    const h = await periksaTantangan(tantangan([{ jenis: 'isiRantai', kepala: 'head', harapan: [1, 2, 3] }]), '', penjalan(traceRantai()))
    expect(h.lulus).toBe(true)
    expect(h.butir[0].pesan).toBe('Isi rantai `head` sesuai: [1, 2, 3].')
  })

  it('gagal dengan rincian isi sebenarnya, rantai melingkar, atau kepala yang tidak ada', async () => {
    const beda = await periksaTantangan(tantangan([{ jenis: 'isiRantai', kepala: 'head', harapan: [1, 3] }]), '', penjalan(traceRantai()))
    expect(beda.lulus).toBe(false)
    expect(beda.butir[0].rincian).toBe('Diharapkan [1, 3], ternyata [1, 2, 3].')
    const lingkar = await periksaTantangan(tantangan([{ jenis: 'isiRantai', kepala: 'head', harapan: [1, 2, 3] }]), '', penjalan(traceRantai(true)))
    expect(lingkar.butir[0].pesan).toMatch(/melingkar/)
    const hilang = await periksaTantangan(tantangan([{ jenis: 'isiRantai', kepala: 'kepala', harapan: [] }]), '', penjalan(traceRantai()))
    expect(hilang.butir[0].pesan).toMatch(/`kepala` tidak ditemukan/)
  })

  it('data String dan field static', async () => {
    const t = new PembangunTrace()
    const tipe = { nama: 'String', berikut: 'Gerbong' }
    const b = t.objek('Main$Gerbong', { nama: t.str('B'), berikut: null }, tipe)
    const a = t.objek('Main$Gerbong', { nama: t.str('A'), berikut: b }, tipe)
    t.statik('depan', 'Gerbong', a)
    t.frame('main')
    const h = await periksaTantangan(tantangan([{ jenis: 'isiRantai', kepala: 'depan', data: 'nama', harapan: ['A', 'B'] }]), '', penjalan(t.selesai()))
    expect(h.lulus).toBe(true)
  })
})

describe('cek isiPohon', () => {
  function tracePohon(): Trace {
    const t = new PembangunTrace()
    const n1 = simpulPohon(t, 1)
    const n5 = simpulPohon(t, 5)
    const n3 = simpulPohon(t, 3, n1, n5)
    const n9 = simpulPohon(t, 9)
    const n7 = simpulPohon(t, 7, n3, n9)
    const main = t.frame('main')
    t.deklarasi(main, 'root', 'Node', n7)
    return t.selesai()
  }

  it('urutan inorder bawaan, preorder dan postorder', async () => {
    const tr = tracePohon()
    const h = await periksaTantangan(
      tantangan([
        { jenis: 'isiPohon', akar: 'root', harapan: [1, 3, 5, 7, 9] },
        { jenis: 'isiPohon', akar: 'root', urutan: 'preorder', harapan: [7, 3, 1, 5, 9] },
        { jenis: 'isiPohon', akar: 'root', urutan: 'postorder', harapan: [1, 5, 3, 9, 7] },
      ]),
      '',
      penjalan(tr),
    )
    expect(h.butir.map((b) => b.lulus)).toEqual([true, true, true])
    expect(h.butir[1].pesan).toBe('Isi pohon `root` (preorder) sesuai: [7, 3, 1, 5, 9].')
    const gagal = await periksaTantangan(tantangan([{ jenis: 'isiPohon', akar: 'root', harapan: [1, 3, 7] }]), '', penjalan(tr))
    expect(gagal.butir[0].rincian).toBe('Diharapkan [1, 3, 7], ternyata [1, 3, 5, 7, 9].')
  })

  it('trace tanpa langkah lengkap ditolak dengan pesan yang jelas', async () => {
    const tr = tracePohon()
    const ringkas = { ...tr, checkpoint: undefined } as unknown as Trace
    const h = await periksaTantangan(tantangan([{ jenis: 'isiPohon', akar: 'root', harapan: [] }]), '', penjalan(ringkas))
    expect(h.butir[0].pesan).toMatch(/tidak bisa dibaca/)
  })
})
