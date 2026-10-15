import { Laptop } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

const LEBAR_MINIMUM = 1100

/** Aplikasi dirancang untuk laptop/desktop; beri tahu bila layarnya terlalu sempit. */
export function PemberitahuanLayar() {
  const [sempit, setSempit] = useState(() => window.innerWidth < LEBAR_MINIMUM)
  const [abaikan, setAbaikan] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${LEBAR_MINIMUM - 1}px)`)
    const ubah = () => setSempit(mq.matches)
    mq.addEventListener('change', ubah)
    return () => mq.removeEventListener('change', ubah)
  }, [])
  if (!sempit || abaikan) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/95 p-6" role="alertdialog" aria-labelledby="judul-layar" aria-describedby="isi-layar">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <Laptop className="size-10 text-muted-foreground" aria-hidden="true" />
        <h2 id="judul-layar" className="text-2xl">
          Gunakan layar yang lebih lebar
        </h2>
        <p id="isi-layar" className="text-muted-foreground">
          Visualisasi, kode, dan slider langkah perlu tampil berdampingan. Buka di laptop atau desktop, atau perlebar jendela browser (minimal {LEBAR_MINIMUM} px).
        </p>
        <Button variant="outline" onClick={() => setAbaikan(true)}>
          Tetap lanjutkan
        </Button>
      </div>
    </div>
  )
}
