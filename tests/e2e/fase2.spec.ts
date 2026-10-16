import { expect, test, type Page } from '@playwright/test'

/** Ganti seluruh isi editor (tanpa auto-indent/auto-kurung dari CodeMirror). */
async function gantiKode(page: Page, kode: string): Promise<void> {
  await page.locator('.cm-content').click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.insertText(kode)
}

const slider = (page: Page) => page.getByRole('slider', { name: 'Langkah' })
const kartu = (page: Page) => page.getByRole('region', { name: /^Penjelasan langkah/ })
const output = (page: Page) => page.getByRole('tabpanel', { name: 'Output' })

async function bukaRuangCoba(page: Page, kode: string): Promise<void> {
  await page.goto('/#/ruang-coba')
  await expect(slider(page)).not.toHaveAttribute('aria-valuemax', '0')
  await gantiKode(page, kode)
}

async function keAkhir(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Ke langkah terakhir' }).click()
}

/** Klik nomor baris → lompat ke langkah pertama yang menjalankan baris itu. */
async function keBaris(page: Page, n: number): Promise<void> {
  await page.locator('.cm-lineNumbers .cm-gutterElement', { hasText: new RegExp(`^${n}$`) }).click()
}

const RANTAI = `public class Main {
    static class Node {
        int data;
        Node next;

        Node(int data) {
            this.data = data;
        }
    }

    public static void main(String[] args) {
        Node head = new Node(3);
        head.next = new Node(5);
        head.next.next = new Node(8);
        int jumlah = 0;
        Node curr = head;
        while (curr != null) {
            jumlah += curr.data;
            curr = curr.next;
        }
        System.out.println("Jumlah = " + jumlah);
    }
}
`

test.describe('Fase 2: objek, exception, wrapper, koleksi', () => {
  test('linked list berjalan, lalu NPE helpful saat baris penyambung dihapus', async ({ page }) => {
    await bukaRuangCoba(page, RANTAI)
    await keAkhir(page)
    await expect(output(page)).toContainText('Jumlah = 16')

    // Pemutar sudah di langkah terakhir, dan tetap di sana setelah kode berubah.
    await gantiKode(page, RANTAI.replace('        head.next = new Node(5);\n', ''))
    await expect(output(page)).toContainText('Cannot assign field "next" because "head.next" is null')
    await expect(kartu(page)).toContainText('NullPointerException')
  })

  test('kondisi loop diganti true: javac menolak println sesudahnya sebagai unreachable statement', async ({ page }) => {
    await bukaRuangCoba(page, RANTAI.replace('while (curr != null)', 'while (true)'))
    await expect(page.getByRole('status').filter({ hasText: 'Animasi dijeda sampai error di baris 21 diperbaiki' })).toBeVisible()
    await expect(page.getByRole('tabpanel', { name: /Masalah/ })).toContainText('unreachable statement')
  })

  test('menghapus curr = curr.next membuat perulangan tak berujung dihentikan simulator', async ({ page }) => {
    await bukaRuangCoba(page, RANTAI.replace('            curr = curr.next;\n', ''))
    await keAkhir(page)
    await expect(kartu(page)).toContainText('perulangan tak berujung')
  })

  test('exception merambat dari method ke catch di main, lalu finally dijalankan', async ({ page }) => {
    await bukaRuangCoba(
      page,
      `public class Main {
    static int bagi(int a, int b) {
        if (b == 0) {
            throw new IllegalArgumentException("pembagi nol");
        }
        return a / b;
    }

    public static void main(String[] args) {
        try {
            System.out.println(bagi(10, 2));
            System.out.println(bagi(1, 0));
        } catch (IllegalArgumentException e) {
            System.out.println("Ditangkap: " + e.getMessage());
        } finally {
            System.out.println("finally");
        }
    }
}
`,
    )
    await keAkhir(page)
    await expect(output(page)).toContainText('5\nDitangkap: pembagi nol\nfinally')
    await keBaris(page, 13)
    await expect(kartu(page)).toContainText('ditangkap oleh')
  })

  test('cache Integer: == true untuk 127 tetapi false untuk 128', async ({ page }) => {
    await bukaRuangCoba(
      page,
      `public class Main {
    public static void main(String[] args) {
        Integer a = 127, b = 127;
        Integer c = 128, d = 128;
        System.out.println((a == b) + " " + (c == d) + " " + c.equals(d));
    }
}
`,
    )
    await keAkhir(page)
    await expect(output(page)).toContainText('true false true')
  })

  test('koleksi: tampilan abstrak dan tombol "Lihat isi dalam"', async ({ page }) => {
    await bukaRuangCoba(
      page,
      `import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> daftar = new ArrayList<>();
        for (int i = 1; i <= 11; i++) {
            daftar.add(i * 10);
        }
        System.out.println(daftar);
    }
}
`,
    )
    await keAkhir(page)
    await expect(output(page)).toContainText('[10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110]')
    const tombol = page.getByRole('button', { name: /Lihat isi dalam/ }).first()
    await tombol.click()
    await expect(tombol).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText('elementData').first()).toBeVisible()
  })

  test('Deque yang dipakai lewat push/pop otomatis digambar sebagai tumpukan', async ({ page }) => {
    await bukaRuangCoba(
      page,
      `import java.util.ArrayDeque;
import java.util.Deque;

public class Main {
    public static void main(String[] args) {
        Deque<Integer> tumpukan = new ArrayDeque<>();
        tumpukan.push(1);
        tumpukan.push(2);
        tumpukan.push(3);
        System.out.println(tumpukan.pop() + " " + tumpukan);
    }
}
`,
    )
    await keAkhir(page)
    await expect(output(page)).toContainText('3 [2, 1]')
    await expect(page.getByText('dipakai sebagai tumpukan')).toBeVisible()
    await expect(page.getByRole('img', { name: /tumpukan dipakai sebagai tumpukan, 2 elemen dari puncak: 2, 1/ })).toBeVisible()
  })
})
