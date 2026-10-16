import { expect, test, type Page } from '@playwright/test'

const sliderDemo = (page: Page) => page.getByRole('slider', { name: 'Langkah demo' })
const isiArray = (page: Page) => page.getByRole('list', { name: 'Isi array data' }).getByRole('listitem')
const demo = (page: Page) => page.locator('main section').first()
/** Lebar dokumen; lebih dari lebar layar berarti ada geser horizontal. (Ekspresi string: tsconfig e2e tanpa lib DOM.) */
const lebarDokumen = (page: Page) => page.evaluate<number>('document.documentElement.scrollWidth')

test.describe('Beranda', () => {
  test.describe('tanpa animasi otomatis (prefers-reduced-motion)', () => {
    test.use({ reducedMotion: 'reduce' })

    test('demo menjalankan program sungguhan; menghapus baris 9 mengubah hasil akhirnya', async ({ page }) => {
      await page.goto('/')
      // Diam di perbandingan pertama: baris 6 disorot dan narasinya menjelaskan kondisi.
      await expect(sliderDemo(page)).toHaveAttribute('aria-valuetext', /baris 6$/)
      await expect(demo(page)).toContainText('Cek kondisi')
      const awal = await sliderDemo(page).getAttribute('aria-valuenow')
      await page.waitForTimeout(1200)
      await expect(sliderDemo(page)).toHaveAttribute('aria-valuenow', awal!)

      await page.getByRole('button', { name: 'Hapus baris 9' }).click()
      await expect(page.getByRole('button', { name: 'Kembalikan baris 9' })).toBeVisible()
      // Tanpa `data[j + 1] = tmp;` angka 5, 8, dan 2 hilang: hasil akhirnya {1, 1, 1, 1, 4}.
      await expect(isiArray(page).nth(4)).toHaveText('4[4]')
      await expect(isiArray(page).nth(3)).toHaveText('1[3]')
      await expect(demo(page)).toContainText('Program selesai')
      // Tinggi batang tetap sebanding nilainya walau animasi dimatikan (batang 4 empat kali batang 1).
      const tinggi = async (i: number) => (await isiArray(page).nth(i).locator('[style*="scaleY"]').boundingBox())!.height
      expect((await tinggi(4)) / (await tinggi(0))).toBeCloseTo(4, 0)

      await page.getByRole('button', { name: 'Kembalikan baris 9' }).click()
      await expect(isiArray(page).nth(4)).toHaveText('8[4]')
      await expect(isiArray(page).nth(0)).toHaveText('1[0]')
    })
  })

  test('demo berputar otomatis dan bisa dijeda', async ({ page }) => {
    await page.goto('/')
    await expect(sliderDemo(page)).not.toHaveAttribute('aria-valuemax', '0')
    const a = Number(await sliderDemo(page).getAttribute('aria-valuenow'))
    await expect.poll(async () => Number(await sliderDemo(page).getAttribute('aria-valuenow')), { timeout: 4000 }).toBeGreaterThan(a)
    await page.getByRole('button', { name: 'Jeda demo' }).click()
    const b = await sliderDemo(page).getAttribute('aria-valuenow')
    await page.waitForTimeout(1200)
    await expect(sliderDemo(page)).toHaveAttribute('aria-valuenow', b!)
    await expect(page.getByRole('button', { name: 'Putar demo' })).toBeVisible()
  })

  test('contoh error memakai pesan javac asli beserta penjelasannya', async ({ page }) => {
    await page.goto('/')
    const bagian = page.getByRole('region', { name: 'Pesan error persis seperti javac' })
    await expect(bagian).toContainText('Main.java:4: error: incompatible types: possible lossy conversion from double to int')
    await expect(bagian).toContainText('Artinya:')
  })

  test('di ponsel Beranda dan daftar modul bisa dibaca; pemberitahuan layar lebar hanya di pemutar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('alertdialog')).toHaveCount(0)
    expect(await lebarDokumen(page)).toBeLessThanOrEqual(390)

    await page.getByRole('link', { name: 'Modul 3: Strategi Algoritma' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Modul 3')
    await expect(page.getByRole('alertdialog')).toHaveCount(0)
    expect(await lebarDokumen(page)).toBeLessThanOrEqual(390)

    await page.getByRole('link', { name: 'Bubble sort' }).click()
    await expect(page.getByRole('alertdialog', { name: 'Gunakan layar yang lebih lebar' })).toBeVisible()
  })
})
