import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'

const URL_PELAJARAN = '/#/modul/modul-1-dasar/11-array-1-dimensi'
const DIR = 'content/modul-1-dasar/11-array-1-dimensi'
const KODE_AWAL = readFileSync(`${DIR}/Main.java`, 'utf8').replace(/\r\n/g, '\n')

/** Ganti seluruh isi editor (tanpa auto-indent/auto-kurung dari CodeMirror). */
async function gantiKode(page: Page, kode: string): Promise<void> {
  await page.locator('.cm-content').click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText(kode)
}

const slider = (page: Page) => page.getByRole('slider', { name: 'Langkah' })
const kartu = (page: Page) => page.getByRole('region', { name: /^Penjelasan langkah/ })
const output = (page: Page) => page.getByRole('tabpanel', { name: 'Output' })

/** Tunggu sampai trace untuk kode terbaru diterima (jumlah langkah = n). */
async function tungguLangkah(page: Page, n: number): Promise<void> {
  await expect(slider(page)).toHaveAttribute('aria-valuemax', String(n - 1))
}

test.describe('Pemutar pelajaran', () => {
  test('tombol, slider, sorotan baris, dan penjelasan tetap sinkron', async ({ page }) => {
    await page.goto(URL_PELAJARAN)
    await tungguLangkah(page, 20)
    await expect(kartu(page)).toContainText('Program dimulai')

    await page.getByRole('button', { name: 'Langkah berikutnya' }).click()
    await expect(kartu(page)).toContainText('baris 3')
    await expect(page.locator('.cm-baris-jalan')).toContainText('int[] nilai')
    await expect(page.getByRole('list', { name: 'Isi array nilai' })).toBeVisible()

    // Pintasan keyboard → maju satu langkah.
    await page.locator('main').click({ position: { x: 5, y: 5 } })
    await page.keyboard.press('ArrowRight')
    await expect(kartu(page)).toContainText('baris 4')
    await expect(page.locator('.cm-baris-jalan')).toContainText('int maks')

    // Slider lewat keyboard: End → langkah terakhir.
    await slider(page).focus()
    await page.keyboard.press('End')
    await expect(slider(page)).toHaveAttribute('aria-valuenow', '19')
    await expect(output(page)).toContainText('Nilai terbesar: 9')

    // Klik nomor baris 7 → lompat ke langkah yang menjalankan baris itu.
    await page.keyboard.press('Home')
    await page.locator('.cm-lineNumbers .cm-gutterElement', { hasText: /^7$/ }).click()
    await expect(kartu(page)).toContainText('baris 7')
  })

  test('menghapus baris mengubah animasi, output, dan hasil tantangan', async ({ page }) => {
    await page.goto(URL_PELAJARAN)
    await tungguLangkah(page, 20)
    await gantiKode(page, KODE_AWAL.replace('                maks = nilai[i];\n', ''))
    await tungguLangkah(page, 19)
    await page.getByRole('button', { name: 'Ke langkah terakhir' }).click()
    await expect(output(page)).toContainText('Nilai terbesar: 4')
    await expect(page.getByText(/Dijalankan ulang · 19 langkah/)).toBeVisible()

    await page.getByRole('tab', { name: /Tantangan/ }).click()
    await page.getByRole('button', { name: 'Periksa' }).first().click()
    await expect(page.getByText(/dari 3 cek terpenuhi/)).toBeVisible()
    await expect(page.getByText('Output belum sesuai.')).toBeVisible()
  })

  test('error tipe: pesan javac + penjelasan, animasi dijeda, lalu pulih', async ({ page }) => {
    await page.goto(URL_PELAJARAN)
    await tungguLangkah(page, 20)
    await gantiKode(page, KODE_AWAL.replace('int maks = nilai[0];', 'int maks = 3.5;'))
    await expect(page.getByRole('status').filter({ hasText: 'Animasi dijeda sampai error di baris 4 diperbaiki' })).toBeVisible()
    const masalah = page.getByRole('tabpanel', { name: /Masalah/ })
    await expect(masalah).toContainText('incompatible types: possible lossy conversion from double to int')
    await expect(masalah).toContainText('Artinya')
    await expect(masalah).toContainText('(int) 3.5')

    await gantiKode(page, KODE_AWAL)
    await expect(page.getByRole('status').filter({ hasText: 'Animasi dijeda' })).toHaveCount(0)
    await tungguLangkah(page, 20)
  })

  test('perulangan tak berujung dihentikan oleh batas langkah (tetap di langkah terakhir)', async ({ page }) => {
    await page.goto(URL_PELAJARAN)
    await tungguLangkah(page, 20)
    await page.getByRole('button', { name: 'Ke langkah terakhir' }).click()
    await gantiKode(page, KODE_AWAL.replace('i < nilai.length; i++', 'i < nilai.length; i = i'))
    await expect(kartu(page)).toContainText('20.000 langkah', { timeout: 15_000 })
    await expect(slider(page)).not.toHaveAttribute('aria-valuemax', '19')
  })

  test('indeks di luar batas → ArrayIndexOutOfBoundsException dengan sel bayangan', async ({ page }) => {
    await page.goto(URL_PELAJARAN)
    await tungguLangkah(page, 20)
    await gantiKode(page, KODE_AWAL.replace('i < nilai.length', 'i <= nilai.length'))
    await tungguLangkah(page, 19)
    await page.getByRole('button', { name: 'Ke langkah terakhir' }).click()
    await expect(kartu(page)).toContainText('ArrayIndexOutOfBoundsException')
    await expect(page.getByRole('listitem', { name: 'indeks 5 berada di luar array' })).toBeVisible()
    await expect(output(page)).toContainText('Index 5 out of bounds for length 5')
  })

  test('tantangan lulus dan progres tetap ada setelah dimuat ulang', async ({ page }) => {
    await page.goto(URL_PELAJARAN)
    await tungguLangkah(page, 20)
    const solusi = readFileSync(`${DIR}/solusi/nilai-terkecil.java`, 'utf8').replace(/\r\n/g, '\n')
    await gantiKode(page, solusi)
    await page.getByRole('tab', { name: /Tantangan/ }).click()
    await page.getByRole('button', { name: 'Periksa' }).first().click()
    await expect(page.getByText('Semua cek terpenuhi. Kerja bagus!')).toBeVisible()
    await expect(page.getByRole('tab', { name: /Tantangan/ })).toContainText('1/2')

    await page.waitForTimeout(700) // kode disimpan otomatis setelah jeda singkat
    await page.reload()
    await expect(page.getByRole('tab', { name: /Tantangan/ })).toContainText('1/2')
    await expect(page.locator('.cm-content')).toContainText('int min')
    await page.getByRole('tab', { name: /Tantangan/ }).click()
    await expect(page.getByText('Lulus', { exact: true })).toBeVisible()
  })
})

test.describe('Halaman lain', () => {
  test('Beranda → modul → pelajaran', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Mulai Modul 1/ }).click()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Modul 1')
    await page.getByRole('link', { name: /Array 1 dimensi/ }).click()
    await expect(page.getByRole('heading', { name: 'Array 1 dimensi', level: 1 })).toBeVisible()
  })

  test('Ruang Coba menjalankan kode bebas dengan input Scanner', async ({ page }) => {
    await page.goto('/#/ruang-coba')
    await expect(slider(page)).not.toHaveAttribute('aria-valuemax', '0')
    await gantiKode(
      page,
      `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int a = in.nextInt();
        int b = in.nextInt();
        System.out.println("Jumlah = " + (a + b));
    }
}
`,
    )
    await page.getByRole('tab', { name: 'Input' }).click()
    await page.getByLabel(/Teks yang akan dibaca/).fill('20 22')
    await page.getByRole('tab', { name: 'Output' }).click()
    await page.getByRole('button', { name: 'Ke langkah terakhir' }).click()
    await expect(output(page)).toContainText('Jumlah = 42')
  })

  test('tema gelap bisa diaktifkan dan diingat', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Pakai tema gelap' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)
  })
})
