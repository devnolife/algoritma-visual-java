import { describe, expect, it } from 'vitest'
import type { KonfigPertumbuhan } from '@/engine/pertumbuhan'
import { periksaTantangan, rapikanOutput } from '@/lessons/tantangan/periksa'
import { pengukurLangsung, penjalanLangsung } from '@/lessons/tantangan/penjalanLangsung'
import type { Tantangan } from '@/lessons/skema'

const jalan = penjalanLangsung()

const program = (badan: string, atas = '') => `${atas}public class Main {\n    public static void main(String[] args) {\n${badan}\n    }\n}\n`

const tantangan = (cek: Tantangan['cek']): Tantangan => ({ id: 'uji', judul: 'Uji', soal: 'Uji', cek, petunjuk: [] })

describe('periksaTantangan', () => {
  it('output persis: lulus dan gagal dengan rincian baris yang berbeda', async () => {
    const t = tantangan([{ jenis: 'output', input: '', harapan: 'Halo\nDunia' }])
    expect((await periksaTantangan(t, program('System.out.println("Halo");\nSystem.out.println("Dunia");'), jalan)).lulus).toBe(true)
    const gagal = await periksaTantangan(t, program('System.out.println("Halo");\nSystem.out.println("dunia");'), jalan)
    expect(gagal.lulus).toBe(false)
    expect(gagal.butir[0].rincian).toContain('Baris ke-2')
    expect(gagal.butir[0].rincian).toContain('"dunia"')
  })

  it('mengabaikan spasi di ujung baris dan baris kosong di akhir', async () => {
    expect(rapikanOutput('a  \r\nb\n\n')).toBe('a\nb')
    const t = tantangan([{ jenis: 'output', input: '', harapan: 'x' }])
    expect((await periksaTantangan(t, program('System.out.println("x   ");\nSystem.out.println();'), jalan)).lulus).toBe(true)
  })

  it('output dari stderr (pesan exception) tidak ikut dibandingkan, tetapi alasan berhenti disebut', async () => {
    const t = tantangan([{ jenis: 'output', input: '', harapan: 'a\nb' }])
    const h = await periksaTantangan(t, program('System.out.println("a");\nint[] x = new int[1];\nx[2] = 1;'), jalan)
    expect(h.lulus).toBe(false)
    expect(h.butir[0].rincian).toContain('ArrayIndexOutOfBoundsException')
    expect(h.butir[0].rincian).toContain('(tidak ada baris lagi)')
  })

  it('menjalankan program sekali per input uji yang berbeda', async () => {
    const kode = program('Scanner in = new Scanner(System.in);\nint a = in.nextInt();\nSystem.out.println(a * 2);', 'import java.util.Scanner;\n\n')
    let jumlahJalan = 0
    const hitung: typeof jalan = (s, i) => {
      jumlahJalan++
      return jalan(s, i)
    }
    const t = tantangan([
      { jenis: 'output', input: '3', harapan: '6' },
      { jenis: 'output', input: '10', harapan: '20' },
      { jenis: 'outputMemuat', input: '3', harapan: '6' },
      { jenis: 'harusMemakai', konstruksi: 'scanner' },
    ])
    const h = await periksaTantangan(t, kode, hitung)
    expect(h.lulus).toBe(true)
    expect(jumlahJalan).toBe(2)
  })

  it('cek variabel: nilai, tipe, toleransi double, array', async () => {
    const kode = program('int min = 2;\ndouble rata = 0.1 + 0.2;\nchar c = \'A\';\nint[] a = {3, 1, 2};\nString s = "hai";')
    const t = tantangan([
      { jenis: 'variabel', input: '', nama: 'min', tipe: 'int', harapan: 2 },
      { jenis: 'variabel', input: '', nama: 'rata', tipe: 'double', harapan: 0.3 },
      { jenis: 'variabel', input: '', nama: 'c', harapan: 'A' },
      { jenis: 'variabel', input: '', nama: 'a', harapan: [3, 1, 2] },
      { jenis: 'variabel', input: '', nama: 's', harapan: 'hai' },
    ])
    const h = await periksaTantangan(t, kode, jalan)
    expect(h.butir.map((b) => b.lulus)).toEqual([true, true, true, true, true])

    const salahTipe = await periksaTantangan(tantangan([{ jenis: 'variabel', input: '', nama: 'rata', tipe: 'int', harapan: 0.3 }]), kode, jalan)
    expect(salahTipe.butir[0].pesan).toContain('harus bertipe `int`')
    const tidakAda = await periksaTantangan(tantangan([{ jenis: 'variabel', input: '', nama: 'maks', harapan: 1 }]), kode, jalan)
    expect(tidakAda.butir[0].pesan).toContain('tidak ditemukan')
  })

  it('harusMemakai, dilarangMemakai, rekursi, method', async () => {
    const kode = `public class Main {
    static int f(int n) {
        if (n <= 1) return 1;
        return n * f(n - 1);
    }
    public static void main(String[] args) {
        System.out.println(f(5));
    }
}
`
    const t = tantangan([
      { jenis: 'harusMemakai', konstruksi: 'rekursi' },
      { jenis: 'harusMemakai', konstruksi: 'method:f' },
      { jenis: 'dilarangMemakai', konstruksi: 'for' },
      { jenis: 'dilarangMemakai', konstruksi: 'if' },
    ])
    const h = await periksaTantangan(t, kode, jalan)
    expect(h.butir.map((b) => b.lulus)).toEqual([true, true, true, false])
    expect(h.butir[3].pesan).toContain('tanpa memakai percabangan `if`')
  })

  it('kode yang tidak bisa dikompilasi menggagalkan semua cek dengan pesan yang jelas', async () => {
    const t = tantangan([
      { jenis: 'output', input: '', harapan: 'x' },
      { jenis: 'harusMemakai', konstruksi: 'for' },
    ])
    const h = await periksaTantangan(t, program('int x = 3.5;'), jalan)
    expect(h.lulus).toBe(false)
    expect(h.butir.every((b) => b.pesan.includes('belum bisa dikompilasi'))).toBe(true)
    expect(h.butir[0].rincian).toContain('possible lossy conversion')
  })

  it('arrayTerurut, tanpaError, maksLangkah, outputPola', async () => {
    const kode = program('int[] a = {1, 2, 2, 5};\nSystem.out.println("Nama: Budi");')
    const t = tantangan([
      { jenis: 'arrayTerurut', input: '', nama: 'a', arah: 'naik' },
      { jenis: 'arrayTerurut', input: '', nama: 'a', arah: 'turun' },
      { jenis: 'tanpaError', input: '' },
      { jenis: 'maksLangkah', input: '', batas: 100 },
      { jenis: 'maksLangkah', input: '', batas: 2 },
      { jenis: 'outputPola', input: '', pola: '^Nama: \\w+$' },
    ])
    const h = await periksaTantangan(t, kode, jalan)
    expect(h.butir.map((b) => b.lulus)).toEqual([true, false, true, true, false, true])
  })

  it('perulangan tak berujung: tanpaError gagal karena batas langkah', async () => {
    const h = await periksaTantangan(tantangan([{ jenis: 'tanpaError', input: '' }]), program('int i = 0;\nwhile (i < 10) {\n    i = i;\n}'), penjalanLangsung(500))
    expect(h.lulus).toBe(false)
    expect(h.butir[0].rincian).toContain('batas langkah')
  })

  it('batasLangkah undefined memakai batas bawaan (tidak berjalan selamanya)', async () => {
    const h = await periksaTantangan(tantangan([{ jenis: 'tanpaError', input: '' }]), program('int i = 0;\nwhile (i < 10) {\n    i = i;\n}'), penjalanLangsung(undefined))
    expect(h.butir[0].rincian).toContain('batas langkah')
  })

  it('nilai double ditampilkan seperti Java (7.0), char dengan tanda kutip tunggal', async () => {
    const kode = program('double rata = 7;\nchar c = \'B\';')
    const h = await periksaTantangan(
      tantangan([
        { jenis: 'variabel', input: '', nama: 'rata', harapan: 7.5 },
        { jenis: 'variabel', input: '', nama: 'c', harapan: 'A' },
      ]),
      kode,
      jalan,
    )
    expect(h.butir[0].rincian).toBe('Diharapkan 7.5, ternyata 7.0.')
    expect(h.butir[1].rincian).toBe("Diharapkan 'A', ternyata 'B'.")
  })
})

describe('cek kompleksitas', () => {
  const konfig: KonfigPertumbuhan = {
    variabel: 'n',
    nilai: [8, 16, 32, 64, 128],
    ukur: 'perbandingan',
    seri: [
      { nama: 'acak', ganti: {} },
      { nama: 'terurut', ganti: { terurut: true } },
    ],
  }
  const bubble = (berhentiDini: boolean) =>
    program(`        int n = 8;
        boolean terurut = false;
        int[] data = new int[n];
        for (int i = 0; i < n; i++) data[i] = terurut ? i : (i * 37 + 11) % n;
        int perbandingan = 0;
        for (int i = 0; i < n - 1; i++) {
            boolean tukar = false;
            for (int j = 0; j < n - 1 - i; j++) {
                perbandingan++;
                if (data[j] > data[j + 1]) {
                    int t = data[j]; data[j] = data[j + 1]; data[j + 1] = t;
                    tukar = true;
                }
            }
            ${berhentiDini ? 'if (!tukar) break;' : ''}
        }`)
  const opsi = { ukur: pengukurLangsung(), pertumbuhan: konfig }

  it('lulus bila seri yang diminta tidak lebih buruk dari batas', async () => {
    const t = tantangan([{ jenis: 'kompleksitas', maks: 'n', seri: 'terurut' }])
    const lulus = await periksaTantangan(t, bubble(true), jalan, opsi)
    expect(lulus.lulus).toBe(true)
    expect(lulus.butir[0].pesan).toBe('Pertumbuhannya O(n), tidak lebih buruk dari O(n).')
    const gagal = await periksaTantangan(t, bubble(false), jalan, opsi)
    expect(gagal.lulus).toBe(false)
    expect(gagal.butir[0].pesan).toBe('Pertumbuhannya masih O(n²); yang diminta paling buruk O(n).')
    expect(gagal.butir[0].rincian).toMatch(/naik 4×/)
  })

  it('tanpa nama seri, semua seri harus memenuhi', async () => {
    const t = tantangan([{ jenis: 'kompleksitas', maks: 'n' }])
    const h = await periksaTantangan(t, bubble(true), jalan, opsi)
    expect(h.lulus).toBe(false)
    expect(h.butir[0].pesan).toMatch(/O\(n²\) \(seri acak\)/)
    expect((await periksaTantangan(tantangan([{ jenis: 'kompleksitas', maks: 'n^2' }]), bubble(true), jalan, opsi)).lulus).toBe(true)
  })

  it('melaporkan konfigurasi yang hilang dan variabel yang dihapus', async () => {
    const t = tantangan([{ jenis: 'kompleksitas', maks: 'n' }])
    expect((await periksaTantangan(t, bubble(true), jalan)).butir[0].pesan).toMatch(/belum dikonfigurasi/)
    const tanpaN = bubble(true).replace('int n = 8;', 'int n = 8 + 0 * 1;').replace(/\bn\b/g, 'ukuran')
    const h = await periksaTantangan(t, tanpaN, jalan, opsi)
    expect(h.butir[0].pesan).toBe('Pertumbuhan program belum bisa diukur.')
    expect(h.butir[0].rincian).toMatch(/`n` tidak ditemukan/)
  })
})
