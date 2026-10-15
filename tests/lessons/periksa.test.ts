import { describe, expect, it } from 'vitest'
import { periksaTantangan, rapikanOutput } from '@/lessons/tantangan/periksa'
import { penjalanLangsung } from '@/lessons/tantangan/penjalanLangsung'
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
})
