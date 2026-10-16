import { describe, expect, it } from 'vitest'
import { BARIS_HAPUS, KODE_DEMO, sumberTanpaBaris } from '@/app/komponen/demoBeranda'
import { tokenJava } from '@/app/komponen/sorotJava'

const ringkas = (baris: string) => tokenJava(baris).filter((t) => t.jenis !== 'biasa').map((t) => `${t.jenis}:${t.teks}`)

describe('pewarnaan sintaks cuplikan Beranda', () => {
  it('tipe Java memakai warna tipenya, kata kunci dan angka dibedakan', () => {
    expect(ringkas('        int[] data = {5, 2, 8};')).toEqual(['int:int', 'angka:5', 'angka:2', 'angka:8'])
    expect(ringkas('for (int i = 0; i < n; i++) {')).toEqual(['kunci:for', 'int:int', 'angka:0'])
    expect(ringkas('double ipk = 3.75; char c = \'A\'; String s = "hai";')).toEqual([
      'pecahan:double', 'angka:3.75', 'char:char', "teks:'A'", 'string:String', 'teks:"hai"',
    ])
    expect(ringkas('boolean ok = true; Object o = null;')).toEqual(['boolean:boolean', 'angka:true', 'angka:null'])
  })

  it('pemanggilan method, komentar, dan teks yang memuat kata kunci', () => {
    expect(ringkas('System.out.println("for if"); // selesai')).toEqual(['fungsi:println', 'teks:"for if"', 'komentar:// selesai'])
  })

  it('token digabung kembali menjadi baris aslinya', () => {
    for (const baris of KODE_DEMO.split('\n')) expect(tokenJava(baris).map((t) => t.teks).join('')).toBe(baris)
  })

  it('menghapus satu baris demo tidak menggeser nomor baris lain', () => {
    const asli = KODE_DEMO.split('\n')
    const baru = sumberTanpaBaris(KODE_DEMO, BARIS_HAPUS).split('\n')
    expect(baru).toHaveLength(asli.length)
    expect(asli[BARIS_HAPUS - 1].trim()).toBe('data[j + 1] = tmp;')
    expect(baru[BARIS_HAPUS - 1]).toBe('')
    expect(baru.filter((_, i) => i !== BARIS_HAPUS - 1)).toEqual(asli.filter((_, i) => i !== BARIS_HAPUS - 1))
  })
})
