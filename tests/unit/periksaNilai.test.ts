import { describe, expect, it } from 'vitest'
import type { NilaiAkhir } from '@/engine/trace'
import { periksaTantangan, samaNilai, teksNilai, type Penjalan } from '@/lessons/tantangan/periksa'
import { skemaCek, type Tantangan } from '@/lessons/skema'

const tantangan = (cek: unknown[]): Tantangan => ({ id: 'uji', judul: 'Uji', soal: 'Uji', cek: cek.map((c) => skemaCek.parse(c)), petunjuk: [] })

/** Penjalan tiruan yang hanya mengisi nilai akhir main (bentuk JSON dari runtime Fase 2). */
const penjalan =
  (akhirMain: Record<string, NilaiAkhir>): Penjalan =>
  async () => ({ ok: true, diagnostik: [], konstruksi: [], trace: { output: '', rentangErr: [], status: 'selesai', akhirMain, langkah: { length: 1 } } })

const AKHIR: Record<string, NilaiAkhir> = {
  mhs: { tipe: 'Mahasiswa', nilai: { nama: 'Ani', ipk: 3.5, aktif: true } },
  daftar: { tipe: 'ArrayList<Integer>', nilai: [1, 2, 3] },
  frekuensi: { tipe: 'HashMap<String,Integer>', nilai: { a: 2, b: 1 } },
  nilaiRata: { tipe: 'ArrayList<Double>', nilai: [7, 8.5] },
  kosong: { tipe: 'Node', nilai: null },
}

describe('samaNilai dan teksNilai untuk objek & koleksi', () => {
  it('membandingkan objek secara mendalam: kunci harus sama persis, nilai rekursif dengan toleransi pecahan', () => {
    expect(samaNilai({ nama: 'Ani', ipk: 3.5 }, { ipk: 3.5, nama: 'Ani' })).toBe(true)
    expect(samaNilai({ a: { b: [1, 0.1 + 0.2] } }, { a: { b: [1, 0.3] } })).toBe(true)
    expect(samaNilai({ nama: 'Ani' }, { nama: 'Ani', ipk: 3.5 })).toBe(false)
    expect(samaNilai({ nama: 'Ani', ipk: undefined }, { nama: 'Ani', umur: undefined })).toBe(false)
    expect(samaNilai({ a: 1 }, [1])).toBe(false)
    expect(samaNilai(null, {})).toBe(false)
  })

  it('menulis objek sebagai {field=nilai}, koleksi generik sebagai [..], array tetap {..}', () => {
    expect(teksNilai({ nama: 'Ani', ipk: 3.5 }, 'Mahasiswa')).toBe('{nama="Ani", ipk=3.5}')
    expect(teksNilai([1, 2, 3], 'ArrayList<Integer>')).toBe('[1, 2, 3]')
    expect(teksNilai([7, 8.5], 'List<Double>')).toBe('[7.0, 8.5]')
    expect(teksNilai({ a: 2 }, 'Map<String,Integer>')).toBe('{"a"=2}')
    expect(teksNilai({ 1: [2, 3] }, 'Map<Integer,List<Integer>>')).toBe('{1=[2, 3]}')
    expect(teksNilai([1, 2], 'int[]')).toBe('{1, 2}')
    expect(teksNilai([[1], [2]], 'int[][]')).toBe('{{1}, {2}}')
    expect(teksNilai(['a'], 'char[]')).toBe("{'a'}")
    expect(teksNilai(7, 'Double')).toBe('7.0')
  })
})

describe('cek variabel untuk objek dan koleksi', () => {
  it('lulus untuk objek, ArrayList, dan Map yang sesuai', async () => {
    const h = await periksaTantangan(
      tantangan([
        { jenis: 'variabel', nama: 'mhs', harapan: { nama: 'Ani', ipk: 3.5, aktif: true } },
        { jenis: 'variabel', nama: 'daftar', tipe: 'ArrayList<Integer>', harapan: [1, 2, 3] },
        { jenis: 'variabel', nama: 'frekuensi', harapan: { b: 1, a: 2 } },
        { jenis: 'variabel', nama: 'nilaiRata', harapan: [7.0, 8.5] },
        { jenis: 'variabel', nama: 'kosong', harapan: null },
      ]),
      '',
      penjalan(AKHIR),
    )
    expect(h.butir.map((b) => b.lulus)).toEqual([true, true, true, true, true])
    expect(h.butir[0].pesan).toBe('`mhs` bernilai {nama="Ani", ipk=3.5, aktif=true}.')
    expect(h.butir[1].pesan).toBe('`daftar` bernilai [1, 2, 3].')
    expect(h.butir[2].pesan).toBe('`frekuensi` bernilai {"b"=1, "a"=2}.')
  })

  it('gagal dengan rincian objek/koleksi yang terbaca', async () => {
    const h = await periksaTantangan(
      tantangan([
        { jenis: 'variabel', nama: 'mhs', harapan: { nama: 'Ani', ipk: 3.6, aktif: true } },
        { jenis: 'variabel', nama: 'daftar', harapan: [1, 2] },
        { jenis: 'variabel', nama: 'mhs', harapan: { nama: 'Ani' } },
      ]),
      '',
      penjalan(AKHIR),
    )
    expect(h.butir.map((b) => b.lulus)).toEqual([false, false, false])
    expect(h.butir[0].rincian).toBe('Diharapkan {nama="Ani", ipk=3.6, aktif=true}, ternyata {nama="Ani", ipk=3.5, aktif=true}.')
    expect(h.butir[1].rincian).toBe('Diharapkan [1, 2], ternyata [1, 2, 3].')
  })

  it('skema menerima harapan berbentuk objek', () => {
    expect(skemaCek.safeParse({ jenis: 'variabel', nama: 'p', harapan: { x: 1, y: [2] } }).success).toBe(true)
  })
})
