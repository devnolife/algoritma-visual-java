import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Kepala } from '../komponen/Kepala'

export function TidakDitemukan() {
  return (
    <div className="flex h-dvh flex-col">
      <Kepala />
      <main className="grid flex-1 place-items-center p-8">
        <div className="flex max-w-md flex-col items-center gap-3 text-center">
          <p className="font-mono text-sm text-muted-foreground">404</p>
          <h1 className="text-3xl">Halaman tidak ditemukan</h1>
          <p className="text-muted-foreground">Alamat ini tidak cocok dengan modul atau pelajaran mana pun.</p>
          <Button asChild>
            <Link to="/">Kembali ke beranda</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
