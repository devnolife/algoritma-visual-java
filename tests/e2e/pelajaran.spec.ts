import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test, type Page } from '@playwright/test'

const DIR_MODUL = 'content/modul-1-dasar'
const pelajaran = readdirSync(DIR_MODUL)
  .filter((d) => statSync(join(DIR_MODUL, d)).isDirectory())
  .sort()

const slider = (page: Page) => page.getByRole('slider', { name: 'Langkah' })

test.describe('Semua pelajaran Modul 1', () => {
  for (const slug of pelajaran) {
    test(`${slug}: termuat, program berjalan, tanpa error di konsol`, async ({ page }) => {
      const galat: string[] = []
      page.on('console', (m) => m.type() === 'error' && galat.push(m.text()))
      page.on('pageerror', (e) => galat.push(e.message))

      await page.goto(`/#/modul/modul-1-dasar/${slug}`)
      const judul = /^judul:\s*(.+)$/m.exec(readFileSync(join(DIR_MODUL, slug, 'pelajaran.md'), 'utf8'))![1].replace(/^"|"$/g, '')
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(judul)
      // Program berjalan: slider punya lebih dari satu langkah dan tidak ada pesan "belum bisa dijalankan".
      await expect(slider(page)).not.toHaveAttribute('aria-valuemax', '0')
      await expect(page.getByText('Kode belum bisa dijalankan')).toHaveCount(0)

      // Melompat ke akhir lalu kembali ke awal tidak menimbulkan error render.
      await page.getByRole('button', { name: 'Ke langkah terakhir' }).click()
      await expect(page.getByRole('region', { name: /^Penjelasan langkah/ })).toBeVisible()
      await page.getByRole('button', { name: 'Ke langkah pertama' }).click()
      await expect(page.getByRole('region', { name: /^Penjelasan langkah/ })).toContainText('Program dimulai')

      // Tab tantangan berisi kartu tantangan.
      await page.getByRole('tab', { name: /Tantangan/ }).click()
      await expect(page.getByRole('button', { name: 'Periksa' }).first()).toBeVisible()
      expect(galat).toEqual([])
    })
  }
})

test.describe('Ketahanan visual terhadap edit', () => {
  test('variabel visual yang diganti nama: pesan jelas, array tetap terlihat di memori', async ({ page }) => {
    await page.goto('/#/modul/modul-1-dasar/11-array-1-dimensi')
    await expect(slider(page)).toHaveAttribute('aria-valuemax', '19')
    const kode = readFileSync(`${DIR_MODUL}/11-array-1-dimensi/Main.java`, 'utf8').replace(/\r\n/g, '\n').replaceAll('nilai', 'angka')
    await page.locator('.cm-content').click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.insertText(kode)
    await expect(page.getByText(/tidak ditemukan di kodemu/)).toBeVisible()
    await page.getByRole('button', { name: 'Ke langkah terakhir' }).click()
    await expect(page.getByText('Heap', { exact: true })).toBeVisible()
  })

  test('Acak ulang hanya muncul untuk program dengan Math.random dan mengganti hasilnya', async ({ page }) => {
    await page.goto('/#/ruang-coba')
    await expect(slider(page)).not.toHaveAttribute('aria-valuemax', '0')
    await expect(page.getByRole('button', { name: 'Acak ulang' })).toHaveCount(0)
    await page.locator('.cm-content').click()
    await page.keyboard.press('ControlOrMeta+a')
    await page.keyboard.insertText(`public class Main {
    public static void main(String[] args) {
        for (int i = 0; i < 5; i++) {
            System.out.print((int) (Math.random() * 100) + " ");
        }
    }
}
`)
    const tombol = page.getByRole('button', { name: 'Acak ulang' })
    await expect(tombol).toBeVisible()
    await page.getByRole('button', { name: 'Ke langkah terakhir' }).click()
    const output = page.getByRole('tabpanel', { name: 'Output' })
    await expect(output).toHaveText(/\d+ \d+ \d+ \d+ \d+/)
    const awal = await output.innerText()
    await tombol.click()
    await expect(output).not.toHaveText(awal)
  })
})
