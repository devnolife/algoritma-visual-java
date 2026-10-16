import type { Trace } from '@/engine'

/** Bentuk konfigurasi yang dihasilkan (cocok dengan `KonfigVisual` di Panggung). */
export type KonfigOtomatis =
  | { jenis: 'array'; variabel: string; penunjuk: string[] }
  | { jenis: 'array2d'; variabel: string; baris?: string; kolom?: string }
  | { jenis: 'rantai'; kepala: string; sebelum?: string; penunjuk: string[] }
  | { jenis: 'pohon'; akar: string; penunjuk: string[] }
  | { jenis: 'koleksi'; variabel: string; sebagai?: 'tumpukan' | 'antrian' }
  | { jenis: 'evaluasi' }
  | { jenis: 'memori' }
  | { jenis: 'konsol' }

const DASAR: KonfigOtomatis[] = [{ jenis: 'evaluasi' }, { jenis: 'memori' }, { jenis: 'konsol' }]
const MAKS_ARRAY = 2
/** Batas visual struktur (rantai/pohon + koleksi) dan batas semua visual di atas panel dasar. */
const MAKS_STRUKTUR = 2
const MAKS_VISUAL = 3
const MAKS_PENUNJUK = 4
/** Nama variabel int yang lazim dipakai sebagai indeks array. */
const NAMA_INDEKS = /^([a-z]|idx|indeks|kiri|kanan|tengah|awal|akhir|lo|hi|mid|pos|posisi|baris|kolom)$/
/** Tipe koleksi java.util yang ditampilkan dengan renderer `koleksi`. */
const TIPE_KOLEKSI =
  /^(ArrayList|LinkedList|List|ArrayDeque|Deque|Queue|Stack|Vector|PriorityQueue|HashMap|LinkedHashMap|TreeMap|Map|SortedMap|NavigableMap|HashSet|LinkedHashSet|TreeSet|Set|SortedSet|NavigableSet|Collection)$/
/** Nama lazim untuk akar struktur berantai; diutamakan bila ada beberapa variabel bertipe simpul. */
const NAMA_AKAR = /^(head|kepala|root|akar|first|awal|pertama|top|puncak|front|depan)$/i
const NAMA_SEBELUM = /^(prev|previous|sebelum|sblm|before)$/i
const NAMA_INDUK = /^(parent|induk|ortu)$/i
/** Deque/LinkedList yang hanya dipakai lewat push/pop digambar sebagai tumpukan, lewat offer/poll sebagai antrean. */
const TIPE_DUA_UJUNG = /^(ArrayDeque|Deque|LinkedList|Queue)$/
const METODE_TUMPUKAN = new Set(['push', 'pop'])
const METODE_ANTREAN = new Set(['offer', 'poll', 'offerLast', 'pollFirst', 'addLast', 'removeFirst'])

function sebagaiKoleksi(tipe: string, metode: ReadonlySet<string>): 'tumpukan' | 'antrian' | undefined {
  const t = dasar(tipe)
  if (!TIPE_DUA_UJUNG.test(t)) return undefined
  const tumpukan = [...metode].some((m) => METODE_TUMPUKAN.has(m))
  const antrean = [...metode].some((m) => METODE_ANTREAN.has(m))
  if (tumpukan && !antrean) return 'tumpukan'
  if (t === 'Queue' || (antrean && !tumpukan)) return 'antrian'
  return undefined
}

/** Nama dasar tipe/class: tanpa argumen generik dan tanpa class pembungkus (`Main$Node<T>` → `Node`). */
function dasar(tipe: string): string {
  const t = tipe.replace(/<.*$/, '')
  return t.slice(Math.max(t.lastIndexOf('.'), t.lastIndexOf('$')) + 1)
}

interface VarReferensi {
  nama: string
  tipe: string
}

/**
 * Visual untuk Ruang Coba yang disusun dari program mahasiswa sendiri:
 * - class berantai (punya field bertipe class itu sendiri) → `rantai`, dua field seperti itu → `pohon`;
 * - koleksi java.util di `main` atau field static → `koleksi` (Deque/LinkedList yang hanya dipakai lewat push/pop
 *   digambar sebagai tumpukan, lewat offer/poll sebagai antrean);
 * - array (maks. 2) yang dideklarasikan di `main` → deret sel dengan penunjuk indeks;
 * diikuti evaluasi kondisi, memori, dan konsol.
 */
export function visualOtomatis(trace: Trace | null): KonfigOtomatis[] {
  if (!trace) return DASAR
  let frameMain: number | undefined
  const array1d: string[] = []
  const array2d: string[] = []
  const koleksi: VarReferensi[] = []
  const indeks = new Set<string>()
  /** Variabel di main dan field static, urut deklarasi: calon akar struktur berantai. */
  const varAkar: VarReferensi[] = []
  /** Semua nama variabel per tipe dasar (semua frame): calon penunjuk. */
  const namaPerTipe = new Map<string, Set<string>>()
  /** Tipe field per class mahasiswa (nama dasar), dari objek pertama yang dialokasikan. */
  const kelas = new Map<string, Record<string, string>>()
  /** Objek heap yang pernah ditunjuk tiap variabel main/field static, dan metode pustaka yang dipanggil per objek. */
  const objekVar = new Map<string, Set<number>>()
  const metodeObjek = new Map<number, Set<string>>()
  const catatObjek = (nama: string, nilai: unknown) => {
    if (typeof nilai !== 'number') return
    const s = objekVar.get(nama) ?? new Set<number>()
    s.add(nilai)
    objekVar.set(nama, s)
  }
  const catatNama = (nama: string, tipe: string) => {
    const t = dasar(tipe)
    const s = namaPerTipe.get(t) ?? new Set<string>()
    s.add(nama)
    namaPerTipe.set(t, s)
  }
  for (const l of trace.langkah) {
    for (const p of l.peristiwa) {
      if (p.k === 'panggil') {
        if (frameMain === undefined) frameMain = p.frame.id
        for (const v of p.frame.vars) if (v.nama !== 'this') catatNama(v.nama, v.tipe)
      } else if (p.k === 'alokasi') {
        if (p.objek.k === 'objek' && !p.objek.kelas.startsWith('java.') && !kelas.has(dasar(p.objek.kelas))) {
          kelas.set(dasar(p.objek.kelas), p.objek.tipeField)
        }
      } else if (p.k === 'deklarasi-statik') {
        catatNama(p.nama, p.tipe)
        catatObjek(p.nama, p.nilai)
        varAkar.push({ nama: p.nama, tipe: p.tipe })
        if (TIPE_KOLEKSI.test(dasar(p.tipe))) koleksi.push({ nama: p.nama, tipe: p.tipe })
      } else if (p.k === 'tulis-statik') {
        catatObjek(p.nama, p.baru)
      } else if (p.k === 'tulis') {
        if (p.frame === frameMain) catatObjek(p.nama, p.baru)
      } else if (p.k === 'pustaka') {
        const s = metodeObjek.get(p.id) ?? new Set<string>()
        s.add(p.metode.replace(/\(.*$/, ''))
        metodeObjek.set(p.id, s)
      } else if (p.k === 'deklarasi') {
        catatNama(p.nama, p.tipe)
        if (p.tipe === 'int' && NAMA_INDEKS.test(p.nama)) indeks.add(p.nama)
        if (p.frame !== frameMain) continue
        catatObjek(p.nama, p.nilai)
        const baru = !varAkar.some((v) => v.nama === p.nama)
        if (baru) varAkar.push({ nama: p.nama, tipe: p.tipe })
        if (/^\w+\[\]$/.test(p.tipe) && !array1d.includes(p.nama)) array1d.push(p.nama)
        else if (/^\w+\[\]\[\]$/.test(p.tipe) && !array2d.includes(p.nama)) array2d.push(p.nama)
        else if (baru && TIPE_KOLEKSI.test(dasar(p.tipe))) koleksi.push({ nama: p.nama, tipe: p.tipe })
      }
    }
  }

  const hasil: KonfigOtomatis[] = []
  const struktur = strukturBerantai(kelas, varAkar, namaPerTipe)
  if (struktur) hasil.push(struktur)
  // Class mahasiswa yang kebetulan bernama Stack/LinkedList/… bukan koleksi java.util.
  for (const k of koleksi) {
    if (hasil.length >= MAKS_STRUKTUR) break
    if (kelas.has(dasar(k.tipe))) continue
    const metode = new Set([...(objekVar.get(k.nama) ?? [])].flatMap((id) => [...(metodeObjek.get(id) ?? [])]))
    const sebagai = sebagaiKoleksi(k.tipe, metode)
    hasil.push(sebagai ? { jenis: 'koleksi', variabel: k.nama, sebagai } : { jenis: 'koleksi', variabel: k.nama })
  }
  const penunjuk = [...indeks].sort()
  let jumlahArray = 0
  for (const nama of array2d) {
    if (jumlahArray >= MAKS_ARRAY || hasil.length >= MAKS_VISUAL) break
    hasil.push({ jenis: 'array2d', variabel: nama, baris: indeks.has('i') ? 'i' : undefined, kolom: indeks.has('j') ? 'j' : undefined })
    jumlahArray++
  }
  for (const nama of array1d) {
    if (jumlahArray >= MAKS_ARRAY || hasil.length >= MAKS_VISUAL) break
    hasil.push({ jenis: 'array', variabel: nama, penunjuk })
    jumlahArray++
  }
  return [...hasil, ...DASAR]
}

/**
 * Rantai/pohon dari class berantai pertama yang punya akar: variabel main/field static bertipe class itu
 * (nama lazim seperti `head`/`root` diutamakan), atau field di objek pembungkus (`daftar.head`).
 */
function strukturBerantai(
  kelas: Map<string, Record<string, string>>,
  varAkar: VarReferensi[],
  namaPerTipe: Map<string, Set<string>>,
): KonfigOtomatis | undefined {
  for (const [nama, tipeField] of kelas) {
    const penghubung = Object.keys(tipeField).filter((f) => dasar(tipeField[f]) === nama && !NAMA_INDUK.test(f))
    if (penghubung.length === 0) continue
    const langsung = varAkar.filter((v) => dasar(v.tipe) === nama)
    let akar = (langsung.find((v) => NAMA_AKAR.test(v.nama)) ?? langsung[0])?.nama
    for (const v of akar ? [] : varAkar) {
      const field = Object.entries(kelas.get(dasar(v.tipe)) ?? {}).find(([, t]) => dasar(t) === nama)
      if (field) {
        akar = `${v.nama}.${field[0]}`
        break
      }
    }
    if (!akar) continue
    const penunjuk = [...(namaPerTipe.get(nama) ?? [])].filter((n) => n !== akar).slice(0, MAKS_PENUNJUK)
    const sebelum = penghubung.find((f) => NAMA_SEBELUM.test(f))
    if (penghubung.length >= 2 && !sebelum) return { jenis: 'pohon', akar, penunjuk }
    return sebelum ? { jenis: 'rantai', kepala: akar, sebelum, penunjuk } : { jenis: 'rantai', kepala: akar, penunjuk }
  }
  return undefined
}
