import { describe, expect, it } from 'vitest'
import type * as A from '@/engine/ast'
import { asalNull, deskripsiMethodUser, jenisArrayNpe, aksiUnboxing, pesanNpe, namaTipeJvm } from '@/engine/runtime/npe'
import { T, kelas, tipeArray } from '@/engine/tipe'
import { aturPanjang, ganti, hapus, hapusKarakter, karakterDi, potong, sisip, balik, indeksTerakhir } from '@/engine/pustaka/stringBuilder'
import { pesanClassCast, teksThrowable } from '@/engine/runtime/pengecualian'
import { PenyimpanBoks } from '@/engine/runtime/boks'
import type { ObjekHeap } from '@/engine/trace'

const span = { awal: 0, akhir: 0 }
const biner = (k: string) => ({ 'Main.Konfig': 'Main$Konfig', 'Main.Node': 'Main$Node', Main: 'Main', Dompet: 'Dompet' })[k]

const lokal = (nama: string): A.Nama =>
  ({ id: 0, span, jenis: 'Nama', nama, ikatan: { k: 'lokal', info: { nama, tipe: T.int, slot: 0, final: false, parameter: false, span } } }) as A.Nama
const fieldSimbol = (nama: string, statik: boolean, kls = 'Main'): A.SimbolField =>
  ({ nama, tipe: kelas('Node'), statik, final: false, deklarasi: {} as A.Deklarator, kelas: kls }) as A.SimbolField
const aksesField = (objek: A.Ekspresi, nama: string, field?: A.SimbolField): A.AksesField =>
  ({ id: 0, span, jenis: 'AksesField', objek, nama, spanNama: span, ikatan: field ? { k: 'field', field } : undefined }) as A.AksesField
const aksesArray = (array: A.Ekspresi, indeks: A.Ekspresi): A.AksesArray => ({ id: 0, span, jenis: 'AksesArray', array, indeks }) as A.AksesArray
const literal = (n: number): A.Literal => ({ id: 0, span, jenis: 'Literal', jenisLiteral: 'int', nilai: n }) as A.Literal
const metode = (nama: string, parameter: A.SimbolMethod['parameter'], kls = 'Main'): A.SimbolMethod =>
  ({ nama, parameter, kembali: kelas('Node'), statik: true, varargs: false, deklarasi: {} as A.DeklarasiMethod, tandaTangan: '', kelas: kls }) as A.SimbolMethod
const panggilUser = (m: A.SimbolMethod): A.PanggilMethod =>
  ({ id: 0, span, jenis: 'PanggilMethod', nama: m.nama, spanNama: span, argumen: [], target: { k: 'user', method: m } }) as A.PanggilMethod

describe('pesan NPE JDK 21', () => {
  it('variabel lokal, rantai field, dan field implisit this', () => {
    expect(asalNull(lokal('curr'), biner)).toBe('"curr"')
    expect(asalNull(aksesField(aksesField(lokal('p'), 'next'), 'next'), biner)).toBe('"p.next.next"')
    const kepala: A.Nama = { id: 0, span, jenis: 'Nama', nama: 'kepala', ikatan: { k: 'field', field: fieldSimbol('kepala', false) } }
    expect(asalNull(kepala, biner)).toBe('"this.kepala"')
  })

  it('field static memakai nama biner class pemiliknya', () => {
    const akar: A.Nama = { id: 0, span, jenis: 'Nama', nama: 'akar', ikatan: { k: 'field', field: fieldSimbol('akar', true) } }
    expect(asalNull(akar, biner)).toBe('"Main.akar"')
    const aktif = aksesField({ id: 0, span, jenis: 'Nama', nama: 'Konfig', ikatan: { k: 'kelas', nama: 'Main.Konfig' } } as A.Nama, 'aktif', fieldSimbol('aktif', true, 'Main.Konfig'))
    expect(asalNull(aktif, biner)).toBe('"Main$Konfig.aktif"')
  })

  it('elemen array: indeks literal/lokal ditulis, indeks rumit menjadi ...', () => {
    expect(asalNull(aksesArray(lokal('rak'), literal(2)), biner)).toBe('"rak[2]"')
    expect(asalNull(aksesArray(lokal('nama'), lokal('i')), biner)).toBe('"nama[i]"')
    const rumit = { id: 0, span, jenis: 'Biner', op: '+', kiri: lokal('i'), kanan: literal(1) } as A.Biner
    expect(asalNull(aksesArray(lokal('jadwal'), rumit), biner)).toBe('"jadwal[...]"')
    expect(asalNull(aksesField(aksesArray(lokal('a'), lokal('i')), 'next'), biner)).toBe('"a[i].next"')
  })

  it('nilai kembali method: langsung vs sebagai bagian jalur', () => {
    const cari = metode('cari', [T.int])
    expect(asalNull(panggilUser(cari), biner)).toBe('the return value of "Main.cari(int)"')
    const buat = metode('buat', [])
    expect(asalNull(aksesField(panggilUser(buat), 'next'), biner)).toBe('"Main.buat().next"')
    const get = {
      id: 0, span, jenis: 'PanggilMethod', nama: 'get', spanNama: span, argumen: [],
      target: { k: 'pustaka', id: 'List.get(int)', parameter: [T.int], kembali: kelas('Node'), statik: false, varargs: false, jvm: 'java.util.List.get(int)' },
    } as A.PanggilMethod
    expect(asalNull(get, biner)).toBe('the return value of "java.util.List.get(int)"')
    expect(asalNull(aksesField(get, 'nama'), biner)).toBe('"java.util.List.get(int).nama"')
  })

  it('ternary tidak punya klausa because; cast transparan', () => {
    const t = { id: 0, span, jenis: 'Kondisional', kondisi: lokal('c'), ya: lokal('q'), tidak: lokal('k') } as A.Kondisional
    expect(pesanNpe('Cannot read field "nama"', asalNull(t, biner))).toBe('Cannot read field "nama"')
    const c = { id: 0, span, jenis: 'Cast', tipeNode: {} as A.NodeTipe, ekspresi: lokal('q') } as A.Cast
    expect(pesanNpe('Cannot read field "nama"', asalNull(c, biner))).toBe('Cannot read field "nama" because "q" is null')
  })

  it('deskripsi method dan nama tipe gaya JVM', () => {
    expect(deskripsiMethodUser(metode('bayar', [T.int, T.String], 'Dompet'), biner)).toBe('Dompet.bayar(int, String)')
    expect(deskripsiMethodUser(metode('setor', [T.int], 'Main.Node'), biner)).toBe('Main$Node.setor(int)')
    expect(namaTipeJvm(kelas('List', kelas('Integer')), biner)).toBe('java.util.List')
    expect(namaTipeJvm(tipeArray(T.int), biner)).toBe('int[]')
    expect(jenisArrayNpe(T.boolean)).toBe('byte/boolean')
    expect(jenisArrayNpe(T.String)).toBe('object')
    expect(aksiUnboxing('Integer')).toBe('Cannot invoke "java.lang.Integer.intValue()"')
    expect(aksiUnboxing('Boolean')).toBe('Cannot invoke "java.lang.Boolean.booleanValue()"')
  })
})

describe('StringBuilder (pesan exception diverifikasi terhadap JDK 21)', () => {
  const pesan = (f: () => unknown) => {
    try {
      f()
      return 'ok'
    } catch (e) {
      return (e as { pesanJava: string }).pesanJava
    }
  }
  it('insert, substring, delete, replace, deleteCharAt, charAt, setLength', () => {
    expect(pesan(() => sisip('halo!', -1, 'x'))).toBe('Range [-1, 5) out of bounds for length 5')
    expect(sisip('halo!', 5, 'x')).toBe('halo!x')
    expect(pesan(() => sisip('halo!', 6, 'c'))).toBe('Range [6, 5) out of bounds for length 5')
    expect(pesan(() => potong('halo!', 7))).toBe('Range [7, 5) out of bounds for length 5')
    expect(pesan(() => potong('halo!', 2, 9))).toBe('Range [2, 9) out of bounds for length 5')
    expect(pesan(() => hapus('halo!', 6, 9))).toBe('Range [6, 5) out of bounds for length 5')
    expect(hapus('halo!', 5, 9)).toBe('halo!')
    expect(hapus('halo!', 1, 3)).toBe('ho!')
    expect(ganti('halo!', 5, 9, 'Z')).toBe('halo!Z')
    expect(pesan(() => ganti('halo!', 6, 9, 'Z'))).toBe('Range [6, 5) out of bounds for length 5')
    expect(pesan(() => hapusKarakter('halo!', -1))).toBe('Index -1 out of bounds for length 5')
    expect(pesan(() => karakterDi('halo!', 10))).toBe('Index 10 out of bounds for length 5')
    expect(pesan(() => aturPanjang('halo!', -1))).toBe('String index out of range: -1')
    expect(aturPanjang('halo!', 7)).toBe('halo!\u0000\u0000')
    expect(balik('abc')).toBe('cba')
    expect(indeksTerakhir('halo!', 'l', -1)).toBe(-1)
  })
})

describe('exception & boxing', () => {
  it('pesan ClassCastException dan toString Throwable', () => {
    expect(pesanClassCast('Main$Dolar', 'Main$Rupiah')).toBe(
      "class Main$Dolar cannot be cast to class Main$Rupiah (Main$Dolar and Main$Rupiah are in unnamed module of loader 'app')",
    )
    expect(pesanClassCast('java.lang.String', 'Main$Rupiah')).toBe(
      "class java.lang.String cannot be cast to class Main$Rupiah (java.lang.String is in module java.base of loader 'bootstrap'; Main$Rupiah is in unnamed module of loader 'app')",
    )
    expect(pesanClassCast('java.lang.String', 'java.lang.Integer')).toBe(
      "class java.lang.String cannot be cast to class java.lang.Integer (java.lang.String and java.lang.Integer are in module java.base of loader 'bootstrap')",
    )
    expect(teksThrowable('java.lang.RuntimeException', '')).toBe('java.lang.RuntimeException: ')
    expect(teksThrowable('java.util.EmptyStackException', null)).toBe('java.util.EmptyStackException')
  })

  it('cache boxing Integer −128..127, Double tidak pernah', () => {
    const heap: ObjekHeap[] = []
    const p = new PenyimpanBoks((o) => heap.push(o))
    expect(p.boks('Integer', 127).id).toBe(p.boks('Integer', 127).id)
    expect(p.boks('Integer', 128).id).not.toBe(p.boks('Integer', 128).id)
    expect(p.boks('Integer', -128).cache).toBe(true)
    expect(p.boks('Long', 5n).id).toBe(p.boks('Long', 5n).id)
    expect(p.boks('Character', 65).id).toBe(p.boks('Character', 65).id)
    expect(p.boks('Character', 200).id).not.toBe(p.boks('Character', 200).id)
    expect(p.boks('Boolean', true).id).toBe(p.boks('Boolean', true).id)
    expect(p.boks('Double', 1.5).id).not.toBe(p.boks('Double', 1.5).id)
  })
})
