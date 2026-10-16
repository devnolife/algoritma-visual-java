/**
 * Pesan helpful NullPointerException JDK 21 (JEP 358): `<aksi> because <asal> is null`.
 * Aturannya diperiksa terhadap JDK asli (lihat tests/korpus-fase2/CATATAN.md §1):
 * - asal berupa jalur: `"curr"`, `"this.kepala"`, `"Main.akar"`, `"Main$Konfig.aktif"`, `"a[i].next"`, `"a[...]"`
 *   (indeks yang bukan literal/variabel lokal), `"Main.buat().next"`, `"java.util.List.get(int).nama"`;
 * - nilai kembali langsung: `the return value of "Main.cari(int)"` (tanpa kutip di depan);
 * - ternary: klausa `because` tidak ditulis; cast transparan.
 */
import type * as A from '../ast'
import { namaLengkapPustaka } from '../hierarki'
import type { Tipe } from '../tipe'

/** Pemetaan nama kanonik class mahasiswa → nama biner (`Main.Node` → `Main$Node`). */
export type NamaBiner = (kanonik: string) => string | undefined

/** Nama tipe seperti di deskripsi method JVM: String/Object disingkat, pustaka lain lengkap, class mahasiswa biner. */
export function namaTipeJvm(t: Tipe, biner: NamaBiner): string {
  switch (t.k) {
    case 'primitif':
      return t.nama
    case 'array':
      return namaTipeJvm(t.elemen, biner) + '[]'
    case 'kelas': {
      if (t.nama === 'String' || t.nama === 'Object') return t.nama
      const user = biner(t.nama)
      if (user) return user
      return namaLengkapPustaka(t.nama) ?? t.nama
    }
    case 'variabel':
    case 'wildcard':
      return 'Object'
    default:
      return 'Object'
  }
}

/** Deskripsi method mahasiswa gaya JVM, mis. `Main$Akun.setor(int)`, `Dompet.bayar(int, String)`. */
export function deskripsiMethodUser(m: A.SimbolMethod, biner: NamaBiner): string {
  const kelas = (m.kelas && biner(m.kelas)) ?? m.kelas ?? 'Main'
  return `${kelas}.${m.nama}(${m.parameter.map((p) => namaTipeJvm(p, biner)).join(', ')})`
}

/** Deskripsi pemanggilan (user/pustaka) untuk aksi `Cannot invoke "..."` maupun jalur asal. */
export function deskripsiPanggil(target: A.TargetPanggil | undefined, nama: string, biner: NamaBiner): string {
  if (!target) return nama
  if (target.k === 'user') return deskripsiMethodUser(target.method, biner)
  return target.jvm ?? target.id
}

function deskripsiIndeks(e: A.Ekspresi): string {
  if (e.jenis === 'Literal' && typeof e.nilai === 'number') return String(e.nilai)
  if (e.jenis === 'Nama' && e.ikatan?.k === 'lokal') return e.nama
  return '...'
}

/** Jalur sebuah ekspresi tanpa tanda kutip, atau undefined bila JDK tidak bisa mendeskripsikannya. */
export function jalurEkspresi(e: A.Ekspresi, biner: NamaBiner): string | undefined {
  switch (e.jenis) {
    case 'Nama': {
      const ik = e.ikatan
      if (!ik || ik.k === 'lokal') return e.nama
      if (ik.k === 'field') {
        if (ik.field.statik) return `${(ik.field.kelas && biner(ik.field.kelas)) ?? 'Main'}.${e.nama}`
        return `this.${e.nama}`
      }
      return undefined
    }
    case 'This':
      return 'this'
    case 'AksesField': {
      const ik = e.ikatan
      if (ik?.k === 'field' && ik.field.statik) return `${(ik.field.kelas && biner(ik.field.kelas)) ?? 'Main'}.${e.nama}`
      if (ik?.k === 'field-pustaka') return `${ik.id.slice(0, ik.id.lastIndexOf('.'))}.${e.nama}`
      const dasar = jalurEkspresi(e.objek, biner)
      return dasar === undefined ? undefined : `${dasar}.${e.nama}`
    }
    case 'AksesArray': {
      const dasar = jalurEkspresi(e.array, biner)
      return dasar === undefined ? undefined : `${dasar}[${deskripsiIndeks(e.indeks)}]`
    }
    case 'PanggilMethod':
      return deskripsiPanggil(e.target, e.nama, biner)
    case 'Cast':
      return jalurEkspresi(e.ekspresi, biner)
    default:
      return undefined
  }
}

/**
 * Klausa asal untuk ekspresi yang bernilai null, mis. `"p.next"` atau `the return value of "Main.cari(int)"`.
 * null bila JDK tidak menulis klausa `because` (mis. hasil ternary).
 */
export function asalNull(e: A.Ekspresi, biner: NamaBiner): string | null {
  if (e.jenis === 'Cast') return asalNull(e.ekspresi, biner)
  if (e.jenis === 'PanggilMethod') return `the return value of "${deskripsiPanggil(e.target, e.nama, biner)}"`
  const jalur = jalurEkspresi(e, biner)
  return jalur === undefined ? null : `"${jalur}"`
}

/** Gabungkan aksi dan asal menjadi pesan lengkap. */
export function pesanNpe(aksi: string, asal: string | null): string {
  return asal === null ? aksi : `${aksi} because ${asal} is null`
}

/** Nama jenis array untuk aksi `Cannot load from <x> array`. */
export function jenisArrayNpe(tipeElemen: Tipe): string {
  if (tipeElemen.k !== 'primitif') return 'object'
  if (tipeElemen.nama === 'byte' || tipeElemen.nama === 'boolean') return 'byte/boolean'
  return tipeElemen.nama
}

/** Aksi unboxing, mis. `Cannot invoke "java.lang.Integer.intValue()"`. */
export function aksiUnboxing(pembungkus: string): string {
  const primitif: Record<string, string> = {
    Integer: 'int', Long: 'long', Double: 'double', Float: 'float', Short: 'short', Byte: 'byte', Character: 'char', Boolean: 'boolean',
  }
  return `Cannot invoke "java.lang.${pembungkus}.${primitif[pembungkus] ?? 'int'}Value()"`
}
