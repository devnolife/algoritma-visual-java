import { z } from 'zod'
import { KELAS_KOMPLEKSITAS } from '@/engine/pertumbuhan'

/** Label baris/kolom tabel: nama variabel (String atau array) atau daftar teks. */
const skemaLabel = z.union([z.string(), z.array(z.union([z.string(), z.number()]))])

export const skemaVisual = z.discriminatedUnion('jenis', [
  z.object({
    jenis: z.literal('array'),
    variabel: z.string(),
    gaya: z.enum(['sel', 'batang']).optional(),
    penunjuk: z.array(z.string()).optional(),
    /** Dua variabel int, mis. [kiri, kanan]: elemen di luar rentang dipudarkan. */
    rentang: z.tuple([z.string(), z.string()]).optional(),
    judul: z.string().optional(),
  }),
  z.object({
    jenis: z.literal('array2d'),
    variabel: z.string(),
    baris: z.string().optional(),
    kolom: z.string().optional(),
    gaya: z.enum(['grid', 'tabel', 'papan']).optional(),
    labelBaris: skemaLabel.optional(),
    labelKolom: skemaLabel.optional(),
  }),
  z.object({ jenis: z.literal('string'), variabel: z.string() }),
  z.object({ jenis: z.literal('memori'), stringSebagaiObjek: z.boolean().optional() }),
  z.object({ jenis: z.literal('evaluasi') }),
  z.object({ jenis: z.literal('konsol') }),
  z.object({ jenis: z.literal('input') }),
  z.object({
    jenis: z.literal('pohonPanggilan'),
    /** Hanya tampilkan pemanggilan method ini (mis. fib). */
    method: z.string().optional(),
    maks: z.number().int().min(7).max(255).optional(),
    /** Garis putus-putus untuk panggilan berargumen sama; matikan untuk backtracking. */
    tandaiBerulang: z.boolean().optional(),
  }),
  z.object({
    jenis: z.literal('graf'),
    /** Matriks ketetanggaan int[][]/boolean[][], atau daftar ketetanggaan ArrayList<ArrayList<Integer>> / ArrayList<Integer>[]. */
    variabel: z.string(),
    /** Nama simpul: daftar teks atau nama variabel String[]/char[]. */
    nama: skemaLabel.optional(),
    berarah: z.boolean().optional(),
    /** Variabel boolean[] penanda simpul yang sudah dikunjungi. */
    dikunjungi: z.string().optional(),
    /** Variabel array (mis. jarak) yang nilainya ditempel di bawah simpul. */
    label: z.string().optional(),
    /** Variabel int yang menunjuk simpul, mis. [u, v]: simpul pertama = simpul aktif. */
    simpul: z.array(z.string()).max(3).optional(),
    /** Koordinat simpul (0–100). Bila kosong, simpul ditata melingkar. */
    posisi: z.array(z.tuple([z.number(), z.number()])).optional(),
    /** Nilai matriks yang berarti "tidak ada sisi" (selain 0 dan Integer.MAX_VALUE). */
    kosong: z.number().optional(),
  }),
  z.object({
    jenis: z.literal('rantai'),
    /** Jalur ke simpul pertama: `head`, `daftar.head`, `this.head`, atau field static. */
    kepala: z.string(),
    /** Field penghubung (bawaan: `next`, `berikut`, atau field bertipe class simpul itu sendiri). */
    berikut: z.string().optional(),
    /** Field ke simpul sebelumnya untuk rantai dua arah, mis. `prev`. */
    sebelum: z.string().optional(),
    /** Field yang ditampilkan di dalam simpul (bawaan: `data`, `nilai`, `val`, …). */
    data: z.string().optional(),
    /** Variabel/jalur penunjuk yang tampil sebagai label di atas simpul, mis. [curr, prev, tail]. */
    penunjuk: z.array(z.string()).max(6).optional(),
    judul: z.string().optional(),
  }),
  z.object({
    jenis: z.literal('pohon'),
    /** Jalur ke akar: `root`, `pohon.root`, `this.root`, atau field static. */
    akar: z.string(),
    /** Field anak kiri/kanan (bawaan: `left`/`right` atau `kiri`/`kanan`). */
    kiri: z.string().optional(),
    kanan: z.string().optional(),
    data: z.string().optional(),
    /** Penunjuk: simpulnya disorot beserta jalur dari akar. */
    penunjuk: z.array(z.string()).max(6).optional(),
    judul: z.string().optional(),
  }),
  z.object({
    jenis: z.literal('tumpukan'),
    /** Stack/Deque/LinkedList, array (dengan `puncak` atau `ukuran`), atau simpul teratas tumpukan berantai. */
    variabel: z.string(),
    /** Variabel int: indeks elemen teratas pada array (−1 = kosong). */
    puncak: z.string().optional(),
    /** Variabel int: jumlah elemen pada array (alternatif `puncak`). */
    ukuran: z.string().optional(),
    berikut: z.string().optional(),
    data: z.string().optional(),
    judul: z.string().optional(),
  }),
  z.object({
    jenis: z.literal('antrian'),
    /** Queue/Deque, array (dengan `depan` + `belakang`/`ukuran`), atau simpul terdepan antrean berantai. */
    variabel: z.string(),
    /** Variabel int: indeks elemen terdepan pada array. */
    depan: z.string().optional(),
    /** Variabel int: indeks elemen terakhir pada array. */
    belakang: z.string().optional(),
    /** Variabel int: jumlah elemen (disarankan untuk array melingkar). */
    ukuran: z.string().optional(),
    berikut: z.string().optional(),
    data: z.string().optional(),
    judul: z.string().optional(),
  }),
  z.object({
    jenis: z.literal('tabelHash'),
    /** Array bucket berisi simpul (chaining), atau HashMap/HashSet (memakai `table` internalnya). */
    variabel: z.string(),
    berikut: z.string().optional(),
    kunci: z.string().optional(),
    nilai: z.string().optional(),
    /** Variabel int menandai bucket, variabel simpul menandai simpul. */
    penunjuk: z.array(z.string()).max(6).optional(),
    judul: z.string().optional(),
  }),
  z.object({
    jenis: z.literal('koleksi'),
    /** Variabel koleksi java.util (List, Set, Map, Queue/Deque, Stack, PriorityQueue). */
    variabel: z.string(),
    /** Tampilkan struktur internal JDK sejak awal (tombol "Lihat isi dalam" sudah aktif). */
    isiDalam: z.boolean().optional(),
    /** ArrayDeque/LinkedList: gambar sebagai tumpukan (push/pop di depan) atau antrean (offer/poll). */
    sebagai: z.enum(['tumpukan', 'antrian']).optional(),
    judul: z.string().optional(),
  }),
])

const skemaKelas = z.enum(KELAS_KOMPLEKSITAS)

export const skemaPertumbuhan = z.object({
  /** Variabel lokal di main yang nilai awalnya diganti dengan setiap ukuran n. */
  variabel: z.string().min(1),
  nilai: z.array(z.number().int().min(0).max(100_000)).min(2).max(10),
  /** `langkah`, `method:<nama>`, atau nama variabel penghitung (lokal main / field static). */
  ukur: z.string().default('langkah'),
  seri: z
    .array(
      z.object({
        nama: z.string().min(1),
        ganti: z.record(z.string(), z.union([z.number(), z.boolean(), z.string()])).default({}),
      }),
    )
    .min(1)
    .max(3)
    .default([{ nama: 'program', ganti: {} }]),
  acuan: z.array(skemaKelas).max(4).optional(),
})

export const skemaFrontmatter = z.object({
  judul: z.string().min(1),
  urutan: z.number().int(),
  ringkasan: z.string().min(1),
  tujuan: z.array(z.string()).min(1),
  visual: z.array(skemaVisual).default([{ jenis: 'evaluasi' }, { jenis: 'memori' }]),
  /** Variabel yang perubahannya ditandai hijau di slider. */
  pantau: z.array(z.string()).default([]),
  /** Isi bawaan tab Input (stdin untuk Scanner). */
  input: z.string().default(''),
  batasLangkah: z.number().int().positive().max(100_000).optional(),
  /** Grafik pertumbuhan: program dijalankan untuk beberapa ukuran n. */
  pertumbuhan: skemaPertumbuhan.optional(),
})

export const skemaModul = z.object({
  judul: z.string().min(1),
  urutan: z.number().int(),
  ringkasan: z.string().min(1),
})

const denganInput = { input: z.string().default('') }

export const skemaCek = z.discriminatedUnion('jenis', [
  z.object({ jenis: z.literal('output'), ...denganInput, harapan: z.string() }),
  z.object({ jenis: z.literal('outputMemuat'), ...denganInput, harapan: z.string() }),
  z.object({ jenis: z.literal('outputPola'), ...denganInput, pola: z.string() }),
  z.object({
    jenis: z.literal('variabel'),
    ...denganInput,
    nama: z.string(),
    tipe: z.string().optional(),
    /** Nilai akhir; objek class mahasiswa/Map ditulis sebagai objek `{field: nilai}`, List/Set/Queue sebagai array. */
    harapan: z.union([z.number(), z.string(), z.boolean(), z.null(), z.array(z.unknown()), z.record(z.string(), z.unknown())]),
  }),
  z.object({ jenis: z.literal('arrayTerurut'), ...denganInput, nama: z.string(), arah: z.enum(['naik', 'turun']).default('naik') }),
  z.object({ jenis: z.literal('harusMemakai'), konstruksi: z.string() }),
  z.object({ jenis: z.literal('dilarangMemakai'), konstruksi: z.string() }),
  z.object({ jenis: z.literal('tanpaError'), ...denganInput }),
  z.object({ jenis: z.literal('maksLangkah'), ...denganInput, batas: z.number().int().positive() }),
  z.object({
    jenis: z.literal('kompleksitas'),
    /** Kelas pertumbuhan terburuk yang masih diterima. */
    maks: skemaKelas,
    /** Nama seri yang diperiksa; bila kosong, semua seri harus memenuhi. */
    seri: z.string().optional(),
    /** Bila kosong, dipakai konfigurasi `pertumbuhan` pelajaran. */
    pertumbuhan: skemaPertumbuhan.optional(),
  }),
  z.object({
    jenis: z.literal('isiRantai'),
    ...denganInput,
    /** Jalur ke simpul pertama di akhir program, mis. `head`, `daftar.head`, atau field static. */
    kepala: z.string(),
    berikut: z.string().optional(),
    data: z.string().optional(),
    /** Isi rantai dari kepala sampai null, mis. [1, 2, 3]. */
    harapan: z.array(z.union([z.number(), z.string()])),
  }),
  z.object({
    jenis: z.literal('isiPohon'),
    ...denganInput,
    /** Jalur ke akar pohon di akhir program. */
    akar: z.string(),
    kiri: z.string().optional(),
    kanan: z.string().optional(),
    data: z.string().optional(),
    urutan: z.enum(['inorder', 'preorder', 'postorder']).default('inorder'),
    harapan: z.array(z.union([z.number(), z.string()])),
  }),
])

export const skemaTantangan = z.array(
  z.object({
    id: z.string().regex(/^[a-z0-9-]+$/, 'id hanya boleh huruf kecil, angka, dan tanda hubung'),
    judul: z.string().min(1),
    soal: z.string().min(1),
    cek: z.array(skemaCek).min(1),
    petunjuk: z.array(z.string()).default([]),
  }),
)

export type Frontmatter = z.infer<typeof skemaFrontmatter>
export type MetaModul = z.infer<typeof skemaModul>
export type Cek = z.infer<typeof skemaCek>
export type Tantangan = z.infer<typeof skemaTantangan>[number]
export type KonfigVisualPelajaran = z.infer<typeof skemaVisual>
export type KonfigPertumbuhanPelajaran = z.infer<typeof skemaPertumbuhan>
