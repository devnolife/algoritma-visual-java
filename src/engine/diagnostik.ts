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
    artinya: `${fitur} adalah Java yang sah, tetapi simulator ini belum mendukungnya.`,
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
  /** `lokasi` gaya javac: `method main(String[])`, `constructor Titik(int)`, atau `class Produk`. */
  sudahDidefinisikan: (x: string, lokasi: string): IsiPesan => ({
    pesan: `variable ${x} is already defined in ${lokasi}`,
    artinya: lokasi.startsWith('class ')
      ? `Field ${kode(x)} sudah dideklarasikan di class ini. Satu nama field hanya boleh dipakai sekali dalam satu class.`
      : `Nama ${kode(x)} sudah dipakai variabel lain di method ini. Satu nama variabel hanya boleh dideklarasikan sekali dalam jangkauan yang sama.`,
    saran: lokasi.startsWith('class ')
      ? 'Hapus salah satu deklarasi atau beri nama yang berbeda.'
      : `Gunakan nama lain, atau hapus tipe di depannya bila kamu hanya ingin mengubah nilainya: ${kode(`${x} = ...;`)}`,
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
  voidTidakBoleh: (): IsiPesan => ({
    pesan: "'void' type not allowed here",
    artinya: 'Method bertipe void tidak menghasilkan nilai apa pun, jadi hasilnya tidak bisa dicetak, digabung dengan teks, atau dipakai sebagai argumen.',
    saran: 'Panggil method void sebagai pernyataan tersendiri, mis. `sapa("Rina");`, atau ubah method agar mengembalikan nilai (return).',
  }),
  classDiharapkan: (): IsiPesan => ({
    pesan: "'.class' expected",
    artinya: 'Di tempat ini Java mengharapkan sebuah nilai, tetapi yang ditulis adalah nama tipe (mis. `int`) atau `nama[]` tanpa indeks.',
    saran: 'Tulis nilai atau variabelnya, bukan tipenya. Untuk array, sertakan indeks, mis. `data[0]`, atau tulis `data` saja untuk seluruh array.',
  }),
  caseYatim: (kata: 'case' | 'default'): IsiPesan => ({
    pesan: `orphaned ${kata}`,
    artinya: `${kode(kata)} hanya boleh ditulis di dalam blok switch.`,
    saran: 'Pastikan kurawal { } switch belum tertutup sebelum label ini, atau tulis bagian ini di dalam switch.',
  }),
  badanMethodHilang: (): IsiPesan => ({
    pesan: 'missing method body, or declare abstract',
    artinya: 'Method ini tidak punya badan { … }. Tanda ; setelah tanda kurung parameter mengakhiri deklarasi sebelum badannya ditulis.',
    saran: 'Hapus tanda ; lalu tulis badan method di dalam kurawal, mis. `static void cetakGaris() { … }`.',
  }),
  tipeKembaliHilang: (): IsiPesan => ({
    pesan: 'invalid method declaration; return type required',
    artinya: 'Setiap method wajib menuliskan tipe nilai kembaliannya sebelum nama method.',
    saran: 'Tambahkan tipe kembali, mis. `static int hitungLuas(...)`, atau `void` bila method tidak mengembalikan nilai.',
  }),
  kelasTanpaNama: (): IsiPesan => ({
    pesan: 'unnamed classes are a preview feature and are disabled by default.',
    detail: ['(use --enable-preview to enable unnamed classes)'],
    artinya: 'Method atau variabel ini ditulis di luar class Main. Di Java, semua method dan variabel harus berada di dalam kurawal class.',
    saran: 'Pindahkan bagian ini ke dalam class Main, sebelum kurawal penutup } class yang terakhir.',
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
  /**
   * `jenis` = `method`/`constructor`; `pemilik` gaya javac, mis. `class Main`, `interface List<E>`.
   * `where` = baris klausa where (variabel tipe) bila ada.
   */
  methodTidakCocok: (jenis: 'method' | 'constructor', m: string, pemilik: string, butuh: string, ditemukan: string, alasan: string[], where: string[] = []): IsiPesan => ({
    pesan: `${jenis} ${m} in ${pemilik} cannot be applied to given types;`,
    detail: [`required: ${butuh || 'no arguments'}`, `found:    ${ditemukan || 'no arguments'}`, `reason: ${alasan[0]}`, ...alasan.slice(1), ...where],
    artinya:
      jenis === 'constructor'
        ? `Argumen yang diberikan saat membuat objek ${kode(m)} tidak sesuai dengan parameter konstruktornya (jumlah atau tipenya berbeda).`
        : `Argumen yang diberikan ke ${kode(m)} tidak sesuai dengan parameternya (jumlah atau tipenya berbeda).`,
    saran:
      jenis === 'constructor'
        ? butuh
          ? `Konstruktor ini membutuhkan argumen (${butuh}).`
          : `Class ini hanya punya konstruktor tanpa argumen. Tulis ${kode(`new ${m}()`)} lalu isi field-nya, atau buat konstruktor yang menerima argumen tersebut.`
        : `Method ini membutuhkan (${butuh || 'tanpa argumen'}).`,
  }),
  konteksStatikMethod: (sig: string): IsiPesan => ({
    pesan: `non-static method ${sig} cannot be referenced from a static context`,
    artinya: 'Method ini tidak bertanda static, sehingga tidak bisa dipanggil langsung dari method static seperti main.',
    saran: `Tambahkan kata kunci static pada deklarasi method, mis. ${kode('public static ...')}.`,
  }),
  konteksStatikVariabel: (x: string): IsiPesan =>
    x === 'this'
      ? {
          pesan: 'non-static variable this cannot be referenced from a static context',
          artinya:
            'Di dalam method static (seperti main) tidak ada objek "this". Ini juga terjadi saat membuat objek inner class (class non-static di dalam class lain) langsung dari method static, karena objek inner selalu membutuhkan objek class luarnya.',
          saran: 'Jadikan class bersarangnya static (`static class ...`), atau buat objeknya dari method instance class luar.',
        }
      : {
          pesan: `non-static variable ${x} cannot be referenced from a static context`,
          artinya: `Variabel ${kode(x)} milik objek (tidak bertanda static), sehingga tidak bisa dipakai dari konteks static, mis. method static seperti main atau lewat nama class.`,
          saran: `Pakai lewat sebuah objek, mis. ${kode(`obj.${x}`)}, atau tambahkan static pada deklarasinya bila memang milik class.`,
        },
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
  methodSudahAda: (sig: string, kelas: string, konstruktor = false): IsiPesan => ({
    pesan: `${konstruktor ? 'constructor' : 'method'} ${sig} is already defined in class ${kelas}`,
    artinya: konstruktor
      ? 'Sudah ada konstruktor dengan tipe parameter yang sama di class ini.'
      : 'Sudah ada method dengan nama dan tipe parameter yang sama di class ini. Tipe kembalian yang berbeda tidak cukup untuk membedakan dua method.',
    saran: 'Hapus salah satunya, atau ubah nama/tipe parameternya.',
  }),
  selektorSwitch: (t: string): IsiPesan => ({
    pesan: `selector type ${t} is not allowed`,
    artinya: `Nilai yang diperiksa switch tidak boleh bertipe ${kode(t)}. Switch menerima int, char, short, byte, class pembungkusnya (Integer, Character, Short, Byte), dan String.`,
    saran: t === 'boolean' ? 'Untuk nilai true/false, gunakan if/else.' : 'Gunakan rangkaian if/else if untuk membandingkan nilai bertipe ini.',
  }),
  labelCaseTidakCocok: (dari: string, ke: string): IsiPesan => ({
    pesan: `constant label of type ${dari} is not compatible with switch selector type ${ke}`,
    artinya: `Nilai case bertipe ${kode(dari)} tidak cocok dengan tipe nilai switch (${kode(ke)}).`,
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

  // ---------- Fase 2: class, objek, akses ----------
  tidakAdaMethodCocok: (jenis: 'method' | 'constructor', m: string, argumen: string, detail: string[] = []): IsiPesan => ({
    pesan: `no suitable ${jenis} found for ${m}(${argumen})`,
    detail,
    artinya:
      jenis === 'constructor'
        ? `Tidak ada konstruktor ${kode(m)} yang menerima argumen bertipe (${argumen}). Detail di bawah menjelaskan mengapa setiap konstruktor tidak cocok.`
        : `Tidak ada versi method ${kode(m)} yang menerima argumen bertipe (${argumen}). Detail di bawah menjelaskan mengapa setiap versi tidak cocok.`,
  }),
  referensiAmbigu: (m: string, detail: string[] = []): IsiPesan => ({
    pesan: `reference to ${m} is ambiguous`,
    detail,
    artinya: `Ada lebih dari satu versi ${kode(m)} yang sama-sama cocok, sehingga Java tidak bisa memilih.`,
    saran: 'Tulis argumen dengan tipe yang lebih jelas, mis. dengan casting.',
  }),
  aksesPrivat: (simbol: string, kelas: string): IsiPesan => ({
    pesan: `${simbol} has private access in ${kelas}`,
    artinya: `${kode(simbol)} dideklarasikan private di class ${kode(kelas)}, sehingga hanya bisa dipakai dari dalam class itu (beserta class yang membungkusnya).`,
    saran: 'Pakai method publik yang disediakan class itu (mis. getter), atau hapus private bila memang boleh diakses dari luar.',
  }),
  aksesProtected: (simbol: string, kelas: string): IsiPesan => ({
    pesan: `${simbol} has protected access in ${kelas}`,
    artinya: `${kode(simbol)} dideklarasikan protected di ${kode(kelas)}, sehingga tidak bisa dipakai dari sini.`,
  }),
  aksesPaket: (simbol: string, kelas: string): IsiPesan => ({
    pesan: `${simbol} is not public in ${kelas}; cannot be accessed from outside package`,
    artinya: `${kode(simbol)} adalah bagian internal ${kode(kelas)} yang tidak bisa dipakai dari luar package-nya.`,
    saran: 'Gunakan method publik class itu, mis. size() dengan tanda kurung.',
  }),
  kelasDuplikat: (x: string): IsiPesan => ({
    pesan: `duplicate class: ${x}`,
    artinya: `Ada dua class bernama ${kode(x)} di file ini. Setiap class harus punya nama yang berbeda.`,
    saran: 'Hapus salah satunya atau ganti namanya.',
  }),
  kelasSudahAda: (x: string, luar: string): IsiPesan => ({
    pesan: `class ${x} is already defined in class ${luar}`,
    artinya: `Class ${kode(luar)} sudah punya class bersarang bernama ${kode(x)}.`,
  }),
  modifierTidakBoleh: (m: string): IsiPesan => ({
    pesan: `modifier ${m} not allowed here`,
    artinya:
      m === 'static'
        ? 'Class top-level (yang tidak berada di dalam class lain) tidak boleh diberi static. Kata kunci static hanya untuk class bersarang.'
        : `Kata kunci ${kode(m)} tidak boleh dipakai di posisi ini.`,
    saran: `Hapus ${kode(m)}.`,
  }),
  finalBelumDiisiKonstruktorBawaan: (x: string): IsiPesan => ({
    pesan: `variable ${x} not initialized in the default constructor`,
    artinya: `Field ${kode(x)} bertanda final tetapi tidak pernah diisi. Class ini tidak punya konstruktor, sehingga konstruktor bawaan (tanpa isi) yang dipakai dan ${kode(x)} tetap kosong.`,
    saran: `Beri nilai awal saat deklarasi, mis. ${kode(`final int ${x} = 0;`)}, atau buat konstruktor yang mengisinya.`,
  }),
  panggilKonstruktorPertama: (bentuk: 'this' | 'super'): IsiPesan => ({
    pesan: `call to ${bentuk} must be first statement in constructor`,
    artinya: `${kode(`${bentuk}(...)`)} hanya boleh ditulis sebagai pernyataan pertama di dalam konstruktor.`,
    saran: `Pindahkan ${kode(`${bentuk}(...)`)} ke baris pertama konstruktor; hitung argumennya langsung di dalam kurung bila perlu.`,
  }),
  butuhObjekLuar: (x: string): IsiPesan => ({
    pesan: `an enclosing instance that contains ${x} is required`,
    artinya: `${kode(x)} adalah inner class (tidak static), jadi objeknya hanya bisa dibuat dari dalam objek class luarnya.`,
    saran: 'Jadikan class bersarangnya static, atau buat objeknya dari method instance class luar.',
  }),
  tidakMengoverride: (): IsiPesan => ({
    pesan: 'method does not override or implement a method from a supertype',
    artinya: '@Override menyatakan method ini menimpa method milik class induk (mis. toString, equals, hashCode dari Object), tetapi tidak ada method dengan nama dan parameter yang sama di sana.',
    saran: 'Periksa ejaan nama method dan tipe parameternya, mis. `public String toString()` atau `public boolean equals(Object o)`.',
  }),
  tidakBisaOverride: (m: string, kelas: string, mInduk: string, kelasInduk: string, alasan: string, kata: 'override' | 'implement' = 'override', detail: string[] = []): IsiPesan => ({
    pesan: `${m} in ${kelas} cannot ${kata} ${mInduk} in ${kelasInduk}`,
    detail: [alasan, ...detail],
    artinya: alasan.startsWith('attempting to assign weaker access')
      ? `Method yang menimpa (override) tidak boleh lebih tertutup aksesnya daripada aslinya. ${kode(mInduk)} di ${kode(kelasInduk)} bersifat public.`
      : alasan.startsWith('return type')
        ? `Method yang menimpa (override) harus punya tipe kembalian yang sama dengan aslinya di ${kode(kelasInduk)}.`
        : `Method static tidak bisa menimpa method instance ${kode(mInduk)} milik ${kode(kelasInduk)}.`,
    saran: alasan.startsWith('attempting') ? 'Tambahkan public di depan deklarasi method.' : undefined,
  }),
  tidakAbstrak: (kelas: string, m: string, induk: string): IsiPesan => ({
    pesan: `${kelas} is not abstract and does not override abstract method ${m} in ${induk}`,
    artinya: `Class ${kode(kelas)} menyatakan implements ${kode(induk)}, sehingga wajib menulis method ${kode(m)} dengan tanda tangan yang persis sama.`,
    saran: induk === 'Comparable' ? `Tambahkan ${kode(`public int ${m.replace(/\((\w+)\)/, '($1 lain)')} { ... }`)} di class ${kode(kelas)}.` : undefined,
  }),
  tipeTakTerdugaGenerik: (ditemukan: string): IsiPesan => ({
    pesan: 'unexpected type',
    detail: ['required: reference', `found:    ${ditemukan}`],
    artinya: `Argumen tipe generik (di dalam < >) harus berupa class, bukan tipe primitif ${kode(ditemukan)}.`,
    saran: `Gunakan class pembungkusnya, mis. ${kode(ditemukan === 'int' ? 'Integer' : ditemukan === 'char' ? 'Character' : ditemukan.charAt(0).toUpperCase() + ditemukan.slice(1))}.`,
  }),
  jumlahArgumenTipe: (n: number): IsiPesan => ({
    pesan: `wrong number of type arguments; required ${n}`,
    artinya: `Tipe ini membutuhkan ${n} argumen tipe di dalam < >.`,
    saran: n === 2 ? 'Map membutuhkan tipe kunci dan tipe nilai, mis. Map<String, Integer>.' : undefined,
  }),
  arrayGenerik: (): IsiPesan => ({
    pesan: 'generic array creation',
    artinya: 'Java tidak mengizinkan membuat array dari tipe generik berparameter, mis. new ArrayList<Integer>[n].',
    saran: 'Gunakan ArrayList<ArrayList<Integer>> sebagai gantinya, atau new ArrayList[n] (tanpa argumen tipe).',
  }),
  bukanAntarmukaFungsional: (t: string): IsiPesan => ({
    pesan: `incompatible types: ${t} is not a functional interface`,
    artinya: `Ekspresi lambda hanya bisa disimpan ke tipe antarmuka fungsional (mis. Comparator), bukan ke ${kode(t)}.`,
  }),
  lambdaParameterTidakCocok: (): IsiPesan => ({
    pesan: 'incompatible types: incompatible parameter types in lambda expression',
    artinya: 'Jumlah atau tipe parameter lambda tidak sesuai dengan yang diharapkan. Lambda untuk Comparator harus punya tepat dua parameter, mis. (a, b) -> ...',
  }),
  lambdaKembalianSalah: (detail: string): IsiPesan => ({
    pesan: 'incompatible types: bad return type in lambda expression',
    detail: [detail],
    artinya: 'Nilai yang dikembalikan lambda tidak sesuai. Lambda Comparator harus mengembalikan int: negatif bila a lebih dulu, positif bila b lebih dulu, 0 bila setara.',
    saran: detail === 'missing return value' ? 'Tambahkan return di akhir badan lambda, mis. return a - b;' : undefined,
  }),
  /** Cabang `? :` tidak cocok dengan tipe tujuan; `detail` = baris javac (kondisional bersarang menambah baris). */
  kondisionalTidakCocok: (detail: string[]): IsiPesan => ({
    pesan: 'incompatible types: bad type in conditional expression',
    detail,
    artinya: 'Salah satu hasil operator ? : tidak cocok dengan tipe yang dibutuhkan di sini. Kedua cabangnya (setelah ? dan setelah :) harus bisa disimpan ke tipe tujuan.',
    saran: 'Samakan tipe kedua cabang, mis. keduanya String atau keduanya angka.',
  }),
  lambdaVariabelTidakFinal: (): IsiPesan => ({
    pesan: 'local variables referenced from a lambda expression must be final or effectively final',
    artinya: 'Variabel lokal yang dipakai di dalam lambda tidak boleh diubah, baik sebelum, sesudah, maupun di dalam lambda.',
    saran: 'Salin nilainya ke variabel baru yang tidak pernah diubah, mis. `final int arahTetap = arah;`, lalu pakai variabel itu di lambda.',
  }),

  // ---------- Fase 2: exception ----------
  tryTanpaCatch: (): IsiPesan => ({
    pesan: "'try' without 'catch', 'finally' or resource declarations",
    artinya: 'Blok try harus diikuti setidaknya satu blok catch atau finally.',
    saran: 'Tambahkan catch (TipeException e) { ... } setelah blok try.',
  }),
  catchTanpaTry: (): IsiPesan => ({
    pesan: "'catch' without 'try'",
    artinya: 'Blok catch harus langsung mengikuti blok try { ... }.',
    saran: 'Bungkus kode yang mungkin melempar exception dengan try { ... } tepat sebelum catch.',
  }),
  finallyTanpaTry: (): IsiPesan => ({
    pesan: "'finally' without 'try'",
    artinya: 'Blok finally harus mengikuti blok try (atau catch).',
  }),
  exceptionTidakDilaporkan: (x: string): IsiPesan => ({
    pesan: `unreported exception ${x}; must be caught or declared to be thrown`,
    artinya: `${kode(x)} adalah checked exception: Java mewajibkan kamu menangkapnya dengan try-catch, atau menyatakan bahwa method ini meneruskannya dengan throws.`,
    saran: `Bungkus dengan try { ... } catch (${x} e) { ... }, atau tambahkan ${kode(`throws ${x}`)} pada deklarasi method.`,
  }),
  exceptionTidakPernahDilempar: (x: string): IsiPesan => ({
    pesan: `exception ${x} is never thrown in body of corresponding try statement`,
    artinya: `Tidak ada kode di dalam blok try yang bisa melempar checked exception ${kode(x)}, sehingga catch ini tidak akan pernah berjalan.`,
    saran: 'Hapus catch ini, atau pastikan kode di dalam try memang memanggil method yang melempar exception tersebut.',
  }),
  exceptionSudahDitangkap: (x: string): IsiPesan => ({
    pesan: `exception ${x} has already been caught`,
    artinya: `Catch sebelumnya sudah menangkap ${kode(x)} (atau class induknya), sehingga catch ini tidak akan pernah berjalan.`,
    saran: 'Urutkan catch dari exception yang paling khusus ke yang paling umum (Exception paling akhir).',
  }),
  multiCatchBersubkelas: (sub: string, induk: string): IsiPesan => ({
    pesan: 'Alternatives in a multi-catch statement cannot be related by subclassing',
    detail: [`Alternative ${sub} is a subclass of alternative ${induk}`],
    artinya: `${kode(sub)} adalah turunan ${kode(induk)}, jadi menangkap ${kode(induk)} saja sudah cukup.`,
    saran: `Hapus ${kode(sub)} dari multi-catch.`,
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
    const titik = span.fokus ?? span.awal
    // Seperti javac (Log.shouldReport): paling banyak satu error per posisi sumber.
    const sama = this.daftar.find((x) => (x.span.fokus ?? x.span.awal) === titik)
    if (sama) return sama
    const d: Diagnostik = {
      kode: kodeDiag,
      span,
      baris: this.sumber.baris(titik),
      kolom: this.sumber.kolom(titik),
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
