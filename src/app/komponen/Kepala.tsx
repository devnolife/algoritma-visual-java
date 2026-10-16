import { FlaskConical, Moon, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { useTema } from '../tema'

export function Kepala({ children }: { children?: ReactNode }) {
  const tema = useTema((s) => s.tema)
  const alih = useTema((s) => s.alih)
  return (
    <header className="flex h-[52px] shrink-0 items-center gap-6 border-b bg-card px-4 sm:px-5">
      <Link to="/" className="flex shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
        <span className="grid size-7 place-items-center rounded-md bg-foreground font-mono text-[12px] font-bold text-background" aria-hidden="true">
          {'{ }'}
        </span>
        <span className="whitespace-nowrap font-heading text-[17px] font-bold tracking-tight">Algoritma &amp; Pemrograman</span>
        <span className="hidden text-[14px] text-muted-foreground sm:inline">· Java</span>
      </Link>
      {children && (
        <nav aria-label="Lokasi" className="flex min-w-0 items-center gap-2 text-[14px] text-muted-foreground">
          {children}
        </nav>
      )}
      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="outline" size="sm" asChild>
          <Link to="/ruang-coba">
            <FlaskConical data-icon="inline-start" />
            <span className="sr-only sm:not-sr-only">Ruang Coba</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon" onClick={alih} aria-label={tema === 'terang' ? 'Pakai tema gelap' : 'Pakai tema terang'}>
          {tema === 'terang' ? <Moon /> : <Sun />}
        </Button>
      </div>
    </header>
  )
}

export function Remah({ ke, children }: { ke?: string; children: ReactNode }) {
  return ke ? (
    <Link to={ke} className="truncate hover:text-foreground">
      {children}
    </Link>
  ) : (
    <span className="truncate font-medium text-foreground" aria-current="page">
      {children}
    </span>
  )
}

export const Pemisah = () => (
  <span className="text-muted-foreground/50" aria-hidden="true">
    ›
  </span>
)
