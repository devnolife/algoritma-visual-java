import { cn } from '@/lib/utils'
import { tokenJava, type JenisToken } from './sorotJava'

/** Warna token, sama dengan editor (EditorJava): tipe Java memakai warna tipenya dan tebal 600. */
const WARNA: Record<JenisToken, string> = {
  kunci: 'text-[var(--kode-kunci)]',
  angka: 'text-[var(--kode-angka)]',
  teks: 'text-tipe-string',
  komentar: 'italic text-[var(--kode-komentar)]',
  fungsi: 'text-[var(--kode-fungsi)]',
  int: 'font-semibold text-tipe-int',
  pecahan: 'font-semibold text-tipe-pecahan',
  char: 'font-semibold text-tipe-char',
  boolean: 'font-semibold text-tipe-boolean',
  string: 'font-semibold text-tipe-string',
  biasa: '',
}

/**
 * Cuplikan kode Java hanya-baca dengan nomor baris, sorotan baris yang sedang dijalankan, baris error
 * (lengkap dengan caret gaya javac), dan baris yang dihapus. Dipakai demo di Beranda.
 */
export function KodeMini({
  kode,
  label,
  aktif,
  galat,
  dihapus,
  className,
}: {
  kode: string
  /** Nama aksesibel untuk blok kode. */
  label: string
  /** Baris yang baru dijalankan (1-based). */
  aktif?: number
  /** Baris error dan kolom caret (1-based), seperti keluaran javac. */
  galat?: { baris: number; kolom?: number }
  /** Baris yang ditampilkan tercoret karena dihapus dari program. */
  dihapus?: number
  className?: string
}) {
  const baris = kode.replace(/\n$/, '').split('\n')
  return (
    <pre aria-label={label} className={cn('overflow-x-auto font-mono text-[12.5px] leading-[1.55]', className)}>
      <code className="inline-block min-w-full py-2">
        {baris.map((isi, i) => {
          const no = i + 1
          const isAktif = no === aktif
          const isGalat = galat?.baris === no
          const isHapus = no === dihapus
          return (
            <span key={no} className="contents">
              <span
                className={cn(
                  'flex transition-colors duration-200',
                  isAktif && 'bg-baris-aktif',
                  isGalat && 'bg-galat-lembut shadow-[inset_3px_0_0_var(--galat)]',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn('relative w-10 shrink-0 select-none pr-3 text-right text-muted-foreground', (isAktif || isGalat) && 'font-bold text-foreground')}
                >
                  {isAktif && <span className="absolute left-2 top-0 text-[9px] text-banding-teks">▶</span>}
                  {no}
                </span>
                <span className={cn('whitespace-pre pr-4', isHapus && 'text-muted-foreground line-through decoration-galat decoration-[1.5px]')}>
                  {isHapus
                    ? isi
                    : tokenJava(isi).map((t, j) => (
                        <span key={j} className={WARNA[t.jenis]}>
                          {t.teks}
                        </span>
                      ))}
                  {isAktif && <span className="sr-only"> (baris yang sedang dijalankan)</span>}
                  {isHapus && <span className="sr-only"> (baris ini dihapus)</span>}
                  {isGalat && <span className="sr-only"> (baris yang error)</span>}
                </span>
              </span>
              {isGalat && galat?.kolom !== undefined && (
                <span aria-hidden="true" className="flex">
                  <span className="w-10 shrink-0" />
                  <span className="whitespace-pre font-bold text-galat">{' '.repeat(Math.max(0, galat.kolom - 1))}^</span>
                </span>
              )}
            </span>
          )
        })}
      </code>
    </pre>
  )
}
