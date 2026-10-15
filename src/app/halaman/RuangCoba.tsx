import { useEffect } from 'react'
import { Pemutar } from '@/player/Pemutar'
import { usePemutar } from '@/player/store'
import type { KonfigVisual } from '@/viz/Panggung'
import { Kepala, Remah } from '../komponen/Kepala'
import { useSimpanKode } from '../komponen/useSimpanKode'
import { kodeTersimpan } from '../progres'

const KODE_AWAL = `public class Main {
    public static void main(String[] args) {
        // Tulis kodemu di sini, lalu geser slider untuk melihat langkahnya.
        int angka = 7;
        int[] data = {3, 1, 4, 1, 5};
        int jumlah = 0;
        for (int i = 0; i < data.length; i++) {
            jumlah += data[i];
        }
        System.out.println("Jumlah = " + jumlah + ", angka = " + angka);
    }
}
`

const VISUAL: KonfigVisual[] = [{ jenis: 'evaluasi' }, { jenis: 'memori' }, { jenis: 'konsol' }]
const KUNCI = 'ruang-coba'

export function RuangCoba() {
  useEffect(() => {
    usePemutar.getState().muat(kodeTersimpan.ambil(KUNCI) ?? KODE_AWAL, '')
    document.title = 'Ruang Coba · Algoritma & Pemrograman Java'
  }, [])
  useSimpanKode(KUNCI, KODE_AWAL)
  return (
    <div className="flex h-dvh flex-col">
      <Kepala>
        <Remah>Ruang Coba</Remah>
        <span className="hidden text-[13px] xl:inline">· tulis kode Java apa saja dan lihat langkahnya</span>
      </Kepala>
      <div className="flex min-h-0 flex-1">
        <Pemutar kodeAwal={KODE_AWAL} konfigVisual={VISUAL} />
      </div>
    </div>
  )
}
