/** Kelas warna badge per tipe Java (sama dengan pewarnaan tipe di editor). */
export function kelasTipe(tipe: string): string {
  if (tipe.endsWith('[]')) return 'text-tipe-ref bg-tipe-ref/10'
  switch (tipe) {
    case 'int':
    case 'long':
    case 'short':
    case 'byte':
      return 'text-tipe-int bg-tipe-int/10'
    case 'double':
    case 'float':
      return 'text-tipe-pecahan bg-tipe-pecahan/10'
    case 'char':
      return 'text-tipe-char bg-tipe-char/10'
    case 'boolean':
      return 'text-tipe-boolean bg-tipe-boolean/10'
    case 'String':
      return 'text-tipe-string bg-tipe-string/10'
    default:
      return 'text-tipe-ref bg-tipe-ref/10'
  }
}

/** Penjelasan singkat tiap tipe untuk tooltip. */
export function infoTipe(tipe: string): string {
  if (tipe.endsWith('[]')) return `Referensi ke array ${tipe} di memori. Variabel menyimpan "alamat" array, bukan isinya.`
  const info: Record<string, string> = {
    int: 'Bilangan bulat 32-bit: −2.147.483.648 s.d. 2.147.483.647',
    long: 'Bilangan bulat 64-bit: kira-kira ±9,2 × 10¹⁸. Literalnya diakhiri L, mis. 5000000000L',
    short: 'Bilangan bulat 16-bit: −32.768 s.d. 32.767',
    byte: 'Bilangan bulat 8-bit: −128 s.d. 127',
    double: 'Bilangan pecahan 64-bit, ketelitian ±15–16 digit',
    float: 'Bilangan pecahan 32-bit, ketelitian ±7 digit. Literalnya diakhiri f, mis. 1.5f',
    char: "Satu karakter Unicode (16-bit), ditulis dengan kutip tunggal, mis. 'A'. Di baliknya char adalah angka (kode Unicode).",
    boolean: 'Hanya dua kemungkinan nilai: true atau false',
    String: 'Teks (objek), ditulis dengan kutip ganda, mis. "Halo"',
    Scanner: 'Objek untuk membaca input dari keyboard (System.in)',
  }
  return info[tipe] ?? `Tipe ${tipe}`
}
