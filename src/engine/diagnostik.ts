import type { Span } from './sumber'
import { Sumber } from './sumber'

export interface Diagnostik {
  kode: string
  span: Span
  baris: number
  kolom: number
  /** Baris pertama pesan javac, mis. `incompatible types: possible lossy conversion from double to int`. */
  pesan: string
  /** Baris tambahan javac (symbol:, location:, required:, found:, …). */
  detail: string[]
  /** Penjelasan Bahasa Indonesia. */
  artinya: string
  /** Saran perbaikan konkret (opsional). */
  saran?: string
  /** true bila ini batasan simulator, bukan error Java. */
  simulator?: boolean
}

export interface IsiPesan {
  pesan: string
  detail?: string[]
  artinya: string
  saran?: string
  simulator?: boolean
}

const kode = (s: string) => '`' + s + '`'

function saranKonversi(dari: string, ke: string): string | undefined {
  if (dari === 'String' && ['int', 'long', 'short', 'byte'].includes(ke))
    return `Untuk mengubah teks angka menjadi ${ke}, gunakan ${kode(ke === 'long' ? 'Long.parseLong(teks)' : 'Integer.parseInt(teks)')}.`
  if (dari === 'String' && (ke === 'double' || ke === 'float'))
    return `Untuk mengubah teks angka menjadi ${ke}, gunakan ${kode('Double.parseDouble(teks)')}.`
  if (dari === 'String' && ke === 'char')
    return `Gunakan tanda kutip tunggal untuk char, mis. ${kode("'A'")}, atau ambil satu karakter dengan ${kode('teks.charAt(0)')}.`
  if (ke === 'String' && dari !== '<null>')
    return `Ubah nilai menjadi teks dengan ${kode('String.valueOf(nilai)')} atau ${kode('"" + nilai')}.`
  if (ke === 'boolean')
    return `Kondisi harus bernilai true/false. Untuk membandingkan gunakan ${kode('==')} (dua tanda sama dengan), bukan ${kode('=')}.`
  if (dari === 'boolean') return `Nilai boolean hanya bisa disimpan di variabel bertipe ${kode('boolean')}.`
  return undefined
}

/** Katalog pesan. Teks `pesan` mengikuti javac 21 apa adanya. */
export const katalog = {
  titikKoma: (): IsiPesan => ({
    pesan: "';' expected",
    artinya: 'Setiap pernyataan di Java harus diakhiri titik koma (;). Java sampai di sini dan tidak menemukannya.',
    saran: 'Tambahkan ; di akhir baris yang ditunjuk.',
  }),
  tokenDiharapkan: (t: string): IsiPesan => ({
    pesan: `'${t}' expected`,
    artinya: `Java mengharapkan tanda ${kode(t)} di posisi ini. Biasanya karena tanda kurung atau kurawal tidak berpasangan.`,
    saran: `Periksa pasangan tanda kurung ( ) dan kurawal { } di sekitar baris ini.`,
  }),
  identifierDiharapkan: (): IsiPesan => ({
    pesan: '<identifier> expected',
    artinya: 'Java mengharapkan sebuah nama (identifier) di sini, mis. nama variabel atau method.',
    saran: 'Pastikan pernyataan berada di dalam method (mis. di dalam main), dan nama tidak diawali angka.',
  }),
  awalEkspresiIlegal: (): IsiPesan => ({
    pesan: 'illegal start of expression',
    artinya: 'Ada simbol yang tidak bisa mengawali sebuah ekspresi di posisi ini.',
    saran: 'Periksa operator yang tertinggal, tanda kurung yang belum ditutup, atau kurawal } yang berlebih/kurang.',
  }),
  awalTipeIlegal: (): IsiPesan => ({
    pesan: 'illegal start of type',
    artinya: 'Java mengharapkan sebuah tipe (mis. int, String) di posisi ini.',
  }),
  bukanPernyataan: (): IsiPesan => ({
    pesan: 'not a statement',
    artinya:
      'Baris ini menghasilkan nilai, tetapi nilainya tidak dipakai. Pernyataan Java harus melakukan sesuatu: assignment, pemanggilan method, ++/--, atau deklarasi.',
    saran: `Mungkin maksudmu menyimpan hasilnya, mis. ${kode('x = x + 1;')} atau mencetaknya dengan ${kode('System.out.println(...)')}.`,
  }),
  elseTanpaIf: (): IsiPesan => ({
    pesan: "'else' without 'if'",
    artinya: 'Ada else yang tidak punya pasangan if. Biasanya karena ada titik koma setelah if (...) atau kurawal yang salah tempat.',
    saran: `Hapus titik koma setelah kondisi if, mis. ${kode('if (x > 0) {')} bukan ${kode('if (x > 0); {')}.`,
  }),
  akhirFile: (): IsiPesan => ({
    pesan: 'reached end of file while parsing',
    artinya: 'Java sampai di akhir file, tetapi masih ada blok yang belum ditutup.',
    saran: 'Biasanya kurang tanda kurawal tutup }. Hitung pasangan { dan } di kodemu.',
  }),
  stringTakTertutup: (): IsiPesan => ({
    pesan: 'unclosed string literal',
    artinya: 'Teks (String) dibuka dengan tanda kutip " tetapi tidak ditutup di baris yang sama.',
    saran: 'Tambahkan tanda kutip penutup ".',
  }),
  charTakTertutup: (): IsiPesan => ({
    pesan: 'unclosed character literal',
    artinya: "Literal char harus berisi tepat satu karakter di antara tanda kutip tunggal, mis. 'A'.",
    saran: "Untuk teks lebih dari satu karakter gunakan String dengan tanda kutip ganda, mis. \"AB\".",
  }),
  charKosong: (): IsiPesan => ({
    pesan: 'empty character literal',
    artinya: "Literal char tidak boleh kosong ('').",
    saran: "Isi dengan satu karakter, mis. ' ' untuk spasi.",
  }),
  escapeIlegal: (): IsiPesan => ({
    pesan: 'illegal escape character',
    artinya: 'Setelah garis miring terbalik \\ hanya boleh ada karakter escape yang dikenal Java, mis. \\n, \\t, \\", \\\\.',
    saran: 'Untuk menulis garis miring terbalik gunakan \\\\.',
  }),
  komentarTakTertutup: (): IsiPesan => ({
    pesan: 'unclosed comment',
    artinya: 'Komentar blok /* belum ditutup dengan */.',
    saran: 'Tambahkan */ di akhir komentar.',
  }),
  karakterIlegal: (c: string): IsiPesan => ({
    pesan: `illegal character: '${c}'`,
    artinya: `Karakter ${kode(c)} tidak boleh dipakai di kode Java (di luar teks/komentar).`,
  }),
  angkaTerlaluBesar: (): IsiPesan => ({
    pesan: 'integer number too large',
    artinya: 'Angka ini terlalu besar untuk int (maksimum 2147483647).',
    saran: 'Gunakan tipe long dan tambahkan akhiran L, mis. 3000000000L.',
  }),
  kelasDiharapkan: (): IsiPesan => ({
    pesan: 'class, interface, enum, or record expected',
    artinya: 'Ada kode di luar class. Di Java, semua kode harus berada di dalam class.',
    saran: 'Biasanya ada kurawal } yang berlebih sehingga class tertutup terlalu cepat.',
  }),
  belumDidukung: (fitur: string, alternatif?: string): IsiPesan => ({
    pesan: `[Simulator] ${fitur} belum didukung`,
    artinya: `${fitur} adalah Java yang sah, tetapi simulator ini (Fase 1) belum mendukungnya.`,
    saran: alternatif,
    simulator: true,
  }),
  simbolTidakDitemukan: (jenis: 'variable' | 'method' | 'class', simbol: string, lokasi = 'class Main'): IsiPesan => ({
    pesan: 'cannot find symbol',
    detail: [`symbol:   ${jenis} ${simbol}`, `location: ${lokasi}`],
    artinya:
      jenis === 'variable'
        ? `Java tidak mengenal nama ${kode(simbol)}. Mungkin variabel belum dideklarasikan, salah ketik (huruf besar/kecil berbeda), atau dideklarasikan di blok lain sehingga di luar jangkauan (scope).`
        : jenis === 'method'
          ? `Tidak ada method ${kode(simbol)}. Periksa ejaan nama method dan jumlah/tipe argumennya.`
          : `Java tidak mengenal class ${kode(simbol)}. Periksa ejaan atau import yang dibutuhkan.`,
    saran:
      jenis === 'variable'
        ? `Deklarasikan dulu, mis. ${kode(`int ${simbol} = 0;`)}, atau periksa ejaannya.`
        : jenis === 'class' && simbol === 'Scanner'
          ? `Tambahkan ${kode('import java.util.Scanner;')} di baris paling atas.`
          : undefined,
  }),
  tipeTidakCocok: (dari: string, ke: string): IsiPesan => ({
    pesan: `incompatible types: ${dari} cannot be converted to ${ke}`,
    artinya: `Nilai bertipe ${kode(dari)} tidak bisa dipakai di tempat yang membutuhkan ${kode(ke)}. Java adalah bahasa strongly typed: setiap variabel hanya menerima nilai yang sesuai tipenya.`,
    saran: saranKonversi(dari, ke),
  }),
  konversiLossy: (dari: string, ke: string, ekspresi?: string): IsiPesan => {
    const e = ekspresi?.trim().replace(/\s+/g, ' ')
    const contoh = !e || e.length > 24 ? `(${ke}) (…)` : /^[\w.]+$/.test(e) ? `(${ke}) ${e}` : `(${ke}) (${e})`
    return {
      pesan: `incompatible types: possible lossy conversion from ${dari} to ${ke}`,
      artinya: `Nilai ${kode(dari)} bisa kehilangan data bila disimpan ke ${kode(ke)} (bagian desimal terbuang atau angkanya terlalu besar). Java menolak konversi seperti ini kecuali kamu menuliskannya secara eksplisit.`,
      saran: `Tulis casting ${kode(contoh)} bila memang ingin memotongnya, atau ubah tipe tujuannya menjadi ${kode(dari)}.`,
    }
  },
  operandBinerSalah: (op: string, a: string, b: string): IsiPesan => ({
    pesan: `bad operand types for binary operator '${op}'`,
    detail: [`first type:  ${a}`, `second type: ${b}`],
    artinya: `Operator ${kode(op)} tidak bisa dipakai untuk tipe ${kode(a)} dan ${kode(b)}.`,
    saran:
      op === '&&' || op === '||'
        ? 'Kedua sisi && dan || harus bernilai boolean (true/false).'
        : a === 'String' || b === 'String'
          ? `Untuk membandingkan isi String gunakan ${kode('teks.equals(lain)')}.`
          : undefined,
  }),
  operandUnarySalah: (op: string, t: string): IsiPesan => ({
    pesan: `bad operand type ${t} for unary operator '${op}'`,
    artinya: `Operator ${kode(op)} tidak bisa dipakai untuk tipe ${kode(t)}.`,
    saran: op === '!' ? 'Operator ! hanya untuk nilai boolean.' : undefined,
  }),
  takTerbandingkan: (a: string, b: string): IsiPesan => ({
    pesan: `incomparable types: ${a} and ${b}`,
    artinya: `Nilai bertipe ${kode(a)} tidak bisa dibandingkan dengan ${kode(b)}.`,
  }),
  sudahDidefinisikan: (x: string, metode: string): IsiPesan => ({
    pesan: `variable ${x} is already defined in method ${metode}`,
    artinya: `Nama ${kode(x)} sudah dipakai variabel lain di method ini. Satu nama variabel hanya boleh dideklarasikan sekali dalam jangkauan yang sama.`,
    saran: `Gunakan nama lain, atau hapus tipe di depannya bila kamu hanya ingin mengubah nilainya: ${kode(`${x} = ...;`)}`,
  }),
  belumDiinisialisasi: (x: string): IsiPesan => ({
    pesan: `variable ${x} might not have been initialized`,
    artinya: `Variabel ${kode(x)} dibaca sebelum dipastikan punya nilai. Java mewajibkan variabel lokal diisi dulu sebelum dipakai, di semua kemungkinan jalur eksekusi.`,
    saran: `Beri nilai awal saat deklarasi, mis. ${kode(`${x} = 0`)}.`,
  }),
  finalDiubah: (x: string): IsiPesan => ({
    pesan: `cannot assign a value to final variable ${x}`,
    artinya: `${kode(x)} dideklarasikan final (konstanta), jadi nilainya tidak boleh diubah setelah diisi.`,
    saran: 'Hapus kata kunci final bila nilainya memang perlu berubah.',
  }),
  finalMungkinSudahDiisi: (x: string): IsiPesan => ({
    pesan: `variable ${x} might already have been assigned`,
    artinya: `${kode(x)} adalah variabel final, jadi hanya boleh diisi tepat satu kali. Di titik ini ${kode(x)} mungkin sudah pernah diisi sebelumnya.`,
    saran: 'Pastikan variabel final hanya diisi sekali di setiap jalur eksekusi, atau hapus kata kunci final.',
  }),
  finalDiisiDalamLoop: (x: string): IsiPesan => ({
    pesan: `variable ${x} might be assigned in loop`,
    artinya: `${kode(x)} adalah variabel final, tetapi diisi di dalam perulangan sehingga bisa terisi berkali-kali.`,
    saran: 'Pindahkan pengisian ke luar perulangan, atau hapus kata kunci final.',
  }),
  returnHilang: (): IsiPesan => ({
    pesan: 'missing return statement',
    artinya:
      'Method ini menjanjikan nilai kembali (bukan void), tetapi ada jalur eksekusi yang sampai ke akhir method tanpa return.',
    saran: 'Pastikan setiap jalur (termasuk cabang else) diakhiri return nilai.',
  }),
  tidakTerjangkau: (): IsiPesan => ({
    pesan: 'unreachable statement',
    artinya: 'Pernyataan ini tidak mungkin pernah dijalankan, mis. karena berada setelah return, break, continue, atau perulangan tanpa akhir.',
    saran: 'Hapus atau pindahkan pernyataan ini.',
  }),
  returnTakTerduga: (): IsiPesan => ({
    pesan: 'incompatible types: unexpected return value',
    artinya: 'Method bertipe void tidak boleh mengembalikan nilai.',
    saran: 'Hapus nilai setelah return, atau ubah tipe kembali method dari void menjadi tipe nilai tersebut.',
  }),
  returnTanpaNilai: (): IsiPesan => ({
    pesan: 'incompatible types: missing return value',
    artinya: 'Method ini harus mengembalikan nilai, tetapi return ditulis tanpa nilai.',
    saran: 'Tuliskan nilai yang dikembalikan, mis. return hasil;',
  }),
  methodTidakCocok: (m: string, butuh: string, ditemukan: string, alasan: string): IsiPesan => ({
    pesan: `method ${m} in class Main cannot be applied to given types;`,
    detail: [`required: ${butuh || 'no arguments'}`, `found:    ${ditemukan || 'no arguments'}`, `reason: ${alasan}`],
    artinya: `Argumen yang diberikan ke ${kode(m)} tidak sesuai dengan parameternya (jumlah atau tipenya berbeda).`,
    saran: `Method ini membutuhkan (${butuh || 'tanpa argumen'}).`,
  }),
  methodPustakaTidakCocok: (m: string, kelas: string, butuh: string, ditemukan: string, alasan: string): IsiPesan => ({
    pesan: `method ${m} in class ${kelas} cannot be applied to given types;`,
    detail: [`required: ${butuh || 'no arguments'}`, `found:    ${ditemukan || 'no arguments'}`, `reason: ${alasan}`],
    artinya: `Argumen untuk ${kode(m)} tidak sesuai jumlah atau tipenya.`,
  }),
  tidakAdaMethodCocok: (m: string, argumen: string): IsiPesan => ({
    pesan: `no suitable method found for ${m}(${argumen})`,
    artinya: `Tidak ada versi method ${kode(m)} yang menerima argumen bertipe (${argumen}).`,
  }),
  referensiAmbigu: (m: string): IsiPesan => ({
    pesan: `reference to ${m} is ambiguous`,
    artinya: `Ada lebih dari satu versi method ${kode(m)} yang sama-sama cocok, sehingga Java tidak bisa memilih.`,
  }),
  konteksStatikMethod: (sig: string): IsiPesan => ({
    pesan: `non-static method ${sig} cannot be referenced from a static context`,
    artinya: 'Method ini tidak bertanda static, sehingga tidak bisa dipanggil langsung dari method static seperti main.',
    saran: `Tambahkan kata kunci static pada deklarasi method, mis. ${kode('public static ...')}.`,
  }),
  konteksStatikVariabel: (x: string): IsiPesan => ({
    pesan: `non-static variable ${x} cannot be referenced from a static context`,
    artinya: `Variabel ${kode(x)} tidak bertanda static, sehingga tidak bisa dipakai dari method static seperti main.`,
    saran: `Tambahkan static pada deklarasinya, mis. ${kode(`static int ${x}`)}.`,
  }),
  dereferencePrimitif: (t: string): IsiPesan => ({
    pesan: `${t} cannot be dereferenced`,
    artinya: `Nilai bertipe ${kode(t)} adalah primitif, bukan objek, sehingga tidak punya method atau field yang bisa dipanggil dengan titik (.).`,
    saran:
      t === 'char'
        ? `Gunakan method statis Character, mis. ${kode('Character.isDigit(c)')}.`
        : t === 'int'
          ? `Untuk mengubah int menjadi teks gunakan ${kode('String.valueOf(x)')}.`
          : undefined,
  }),
  butuhArray: (t: string): IsiPesan => ({
    pesan: `array required, but ${t} found`,
    artinya: `Tanda [ ] hanya bisa dipakai pada array, sedangkan nilai ini bertipe ${kode(t)}.`,
    saran: t === 'String' ? `Untuk mengambil karakter String gunakan ${kode('teks.charAt(i)')}.` : undefined,
  }),
  breakDiLuar: (): IsiPesan => ({
    pesan: 'break outside switch or loop',
    artinya: 'break hanya boleh dipakai di dalam perulangan (for/while/do-while) atau switch.',
  }),
  continueDiLuar: (): IsiPesan => ({
    pesan: 'continue outside of loop',
    artinya: 'continue hanya boleh dipakai di dalam perulangan.',
  }),
  caseDuplikat: (): IsiPesan => ({
    pesan: 'duplicate case label',
    artinya: 'Ada dua case dengan nilai yang sama di switch ini.',
  }),
  butuhKonstanta: (): IsiPesan => ({
    pesan: 'constant expression required',
    artinya: 'Label case harus berupa nilai konstan (literal atau variabel final), bukan variabel biasa.',
  }),
  kelasPublikNamaFile: (x: string): IsiPesan => ({
    pesan: `class ${x} is public, should be declared in a file named ${x}.java`,
    artinya: `File ini bernama Main.java, jadi class public di dalamnya harus bernama Main.`,
    saran: `Ganti ${kode(`public class ${x}`)} menjadi ${kode('public class Main')}.`,
  }),
  tipeTakTerduga: (butuh: string, ditemukan: string): IsiPesan => ({
    pesan: 'unexpected type',
    detail: [`required: ${butuh}`, `found:    ${ditemukan}`],
    artinya: 'Di sisi kiri tanda = (atau pada ++/--) harus ada variabel, bukan nilai.',
  }),
  foreachTidakBerlaku: (t: string): IsiPesan => ({
    pesan: 'for-each not applicable to expression type',
    detail: ['required: array or java.lang.Iterable', `found:    ${t}`],
    artinya: 'Perulangan for-each hanya bisa menelusuri array (atau koleksi).',
  }),
  methodSudahAda: (sig: string): IsiPesan => ({
    pesan: `method ${sig} is already defined in class Main`,
    artinya: 'Sudah ada method dengan nama dan tipe parameter yang sama.',
  }),
  selektorSwitch: (t: string): IsiPesan => ({
    pesan: `selector type ${t} is not allowed`,
    artinya: `Nilai yang diperiksa switch tidak boleh bertipe ${kode(t)}. Switch hanya menerima int, char, short, byte, dan String.`,
    saran: t === 'boolean' ? 'Untuk nilai true/false, gunakan if/else.' : 'Gunakan rangkaian if/else if untuk membandingkan nilai bertipe ini.',
  }),
  labelCaseTidakCocok: (dari: string, ke: string): IsiPesan => ({
    pesan: `constant label of type ${dari} is not compatible with switch selector type ${ke}`,
    artinya: `Nilai case bertipe ${kode(dari)} tidak cocok dengan tipe nilai switch (${kode(ke)}).`,
  }),
  pemanggilanKonstruktor: (t: string): IsiPesan => ({
    pesan: `[Simulator] membuat objek ${t} dengan new belum didukung`,
    artinya: 'Pada Fase 1 simulator hanya mendukung new untuk array, Scanner, dan String.',
    simulator: true,
  }),
  paketTidakAda: (nama: string, mirip?: string): IsiPesan => ({
    pesan: `package ${nama} does not exist`,
    artinya: `Java tidak mengenal ${kode(nama)}, sehingga menganggapnya nama package. Biasanya ini salah ketik nama class.`,
    saran: mirip ? `Mungkin maksudmu ${kode(mirip)}? Ingat, Java membedakan huruf besar dan kecil.` : undefined,
  }),
  tidakAdaMain: (): IsiPesan => ({
    pesan: '[Simulator] class Main tidak ditemukan',
    artinya: 'File Main.java harus berisi public class Main.',
    simulator: true,
  }),
}

export type KunciKatalog = keyof typeof katalog

/** Pembuat diagnostik yang mengisi baris/kolom dari Sumber. */
export class PengumpulDiagnostik {
  readonly daftar: Diagnostik[] = []
  constructor(private readonly sumber: Sumber) {}

  /** Potongan kode sumber pada rentang tertentu (untuk contoh perbaikan di saran). */
  teks(span: Span): string {
    return this.sumber.potong(span)
  }

  tambah(kodeDiag: string, span: Span, isi: IsiPesan): Diagnostik {
    const d: Diagnostik = {
      kode: kodeDiag,
      span,
      baris: this.sumber.baris(span.awal),
      kolom: this.sumber.kolom(span.awal),
      pesan: isi.pesan,
      detail: isi.detail ?? [],
      artinya: isi.artinya,
      saran: isi.saran,
      simulator: isi.simulator,
    }
    this.daftar.push(d)
    return d
  }

  get adaError(): boolean {
    return this.daftar.length > 0
  }
}

/** Format teks seperti keluaran javac (untuk tab Masalah / uji diferensial). */
export function formatJavac(d: Diagnostik, sumber: Sumber): string {
  const baris = sumber.teksBaris(d.baris)
  const caret = ' '.repeat(Math.max(0, d.kolom - 1)) + '^'
  return [`Main.java:${d.baris}: error: ${d.pesan}`, baris, caret, ...d.detail.map((x) => '  ' + x)].join('\n')
}
