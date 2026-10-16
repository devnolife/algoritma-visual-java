/**
 * Helper exception runtime Fase 2: nama kelas JVM, teks toString, baris stack trace, dan pesan ClassCastException.
 * Format diverifikasi terhadap JDK 21 (tests/korpus-fase2/CATATAN.md §2, §5, §6).
 */
import { namaLengkapPustaka } from '../hierarki'

/** Nama JVM sebuah kelas: pustaka → nama lengkap (`java.lang.Integer`), class mahasiswa → nama biner (`Main$Node`). */
export function namaKelasJvm(nama: string, binerUser: (kanonik: string) => string | undefined): string {
  return binerUser(nama) ?? namaLengkapPustaka(nama) ?? nama
}

/** `Throwable.toString()`: `kelas` atau `kelas: pesan`. Pesan kosong tetap memakai titik dua dan spasi. */
export function teksThrowable(kelasJvm: string, pesan: string | null): string {
  return pesan === null ? kelasJvm : `${kelasJvm}: ${pesan}`
}

/** Satu baris stack trace, mis. `\tat Main$Pecahan.<init>(Main.java:9)`. */
export function barisJejak(kelasBiner: string, method: string, baris: number): string {
  return `\tat ${kelasBiner}.${method}(Main.java:${baris})`
}

const adalahJdk = (kelasJvm: string) => kelasJvm.startsWith('java.')

function lokasiModul(kelasJvm: string): string {
  return adalahJdk(kelasJvm) ? "module java.base of loader 'bootstrap'" : "unnamed module of loader 'app'"
}

/**
 * Pesan ClassCastException HotSpot, mis.
 * `class Main$Dolar cannot be cast to class Main$Rupiah (Main$Dolar and Main$Rupiah are in unnamed module of loader 'app')`.
 */
export function pesanClassCast(dari: string, ke: string): string {
  const info =
    lokasiModul(dari) === lokasiModul(ke)
      ? `${dari} and ${ke} are in ${lokasiModul(dari)}`
      : `${dari} is in ${lokasiModul(dari)}; ${ke} is in ${lokasiModul(ke)}`
  return `class ${dari} cannot be cast to class ${ke} (${info})`
}
