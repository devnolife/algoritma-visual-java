import { AnimatePresence, motion } from 'motion/react'
import { Fragment } from 'react'
import { tahapEvaluasi } from '@/engine/narasi'
import type { Langkah, StateMesin } from '@/engine'
import { cn } from '@/lib/utils'
import { cariVariabel, EASE_KELUAR } from './bersama'

const LABEL_KONTEKS: Record<string, string> = {
  if: 'Kondisi if',
  while: 'Kondisi while',
  for: 'Kondisi for',
  'do-while': 'Kondisi do-while',
  switch: 'Nilai switch',
  ternary: 'Kondisi ternary',
}

/** Menampilkan kondisi yang sedang dievaluasi, ditulis ulang bertahap sampai jadi true/false. */
export function Evaluasi({ langkah, instan }: { langkah: Langkah | undefined; instan: boolean }) {
  const ev = langkah?.peristiwa.find((p) => p.k === 'evaluasi')
  const cocok = langkah?.peristiwa.find((p) => p.k === 'cocok-case')
  return (
    <div className="flex min-h-11 items-center" aria-live="off">
      <AnimatePresence mode="wait" initial={false}>
        {ev && ev.k === 'evaluasi' ? (
          <motion.div
            key={`${ev.teks}-${langkah?.baris}`}
            className="gerak flex flex-wrap items-center gap-2 rounded-xl border-[1.5px] border-dashed border-banding bg-banding-lembut/60 px-3.5 py-2 font-mono text-[14px]"
            initial={{ opacity: 0, transform: 'translateY(4px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={{ opacity: 0 }}
            transition={instan ? { duration: 0 } : { duration: 0.16, ease: EASE_KELUAR }}
          >
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{LABEL_KONTEKS[ev.konteks]}</span>
            {ev.konteks === 'switch' ? (
              <>
                <span>{ev.teks}</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-semibold">{ev.hasil}</span>
                {cocok && cocok.k === 'cocok-case' && (
                  <>
                    <span className="text-muted-foreground">→</span>
                    <span className="rounded-md bg-card px-2 py-0.5 font-semibold">{cocok.label || 'tidak ada yang cocok'}</span>
                  </>
                )}
              </>
            ) : (
              tahapEvaluasi(ev.pohon).map((t, i, semua) => (
                <Fragment key={i}>
                  {i > 0 && <span className="text-muted-foreground">→</span>}
                  {i === semua.length - 1 ? (
                    <span
                      className={cn(
                        'rounded-md px-2 py-0.5 font-semibold',
                        t === 'true' ? 'bg-tulis-lembut text-tulis' : t === 'false' ? 'bg-galat-lembut text-galat' : 'bg-card',
                      )}
                    >
                      {t}
                    </span>
                  ) : (
                    <span className={i === 0 ? '' : 'text-foreground/85'}>{t}</span>
                  )}
                </Fragment>
              ))
            )}
          </motion.div>
        ) : (
          <motion.p key="kosong" className="text-[13px] text-muted-foreground/80" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: instan ? 0 : 0.12 }}>
            Kondisi if/perulangan akan ditampilkan di sini saat dicek.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Konsol besar: output program sampai langkah ini; teks yang baru dicetak disorot. */
export function Konsol({ output, langkah, rentangErr }: { output: string; langkah: Langkah | undefined; rentangErr: [number, number][] }) {
  const baru = (langkah?.peristiwa ?? []).filter((p) => p.k === 'cetak').reduce((n, p) => n + (p.k === 'cetak' ? p.teks.length : 0), 0)
  const batasBaru = output.length - baru
  const bagian: { teks: string; baru: boolean; err: boolean }[] = []
  let i = 0
  while (i < output.length) {
    const err = rentangErr.some(([a, b]) => i >= a && i < b)
    const isBaru = i >= batasBaru
    let j = i + 1
    while (j < output.length && rentangErr.some(([a, b]) => j >= a && j < b) === err && j >= batasBaru === isBaru) j++
    bagian.push({ teks: output.slice(i, j), baru: isBaru, err })
    i = j
  }
  return (
    <div className="rounded-xl border bg-foreground/[0.035] p-3">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Konsol</span>
      <pre className="min-h-16 whitespace-pre-wrap break-words font-mono text-[15px] leading-relaxed">
        {output.length === 0 ? (
          <span className="text-muted-foreground">(belum ada output)</span>
        ) : (
          bagian.map((b, k) => (
            <span key={k} className={cn(b.err && 'text-galat', b.baru && 'rounded-sm bg-tulis-lembut')}>
              {b.teks}
            </span>
          ))
        )}
        <span className="ml-px inline-block h-[1.1em] w-[7px] translate-y-[3px] bg-foreground/60" aria-hidden="true" />
      </pre>
    </div>
  )
}

/** Isi input (stdin): bagian yang sudah dibaca Scanner dipudarkan, token terakhir disorot. */
export function InputView({ stdin, state, langkah }: { stdin: string; state: StateMesin; langkah: Langkah | undefined }) {
  const scanner = Object.values(state.heap).find((o) => o.k === 'scanner')
  const posisi = scanner && scanner.k === 'scanner' ? scanner.posisi : 0
  const ev = langkah?.peristiwa.find((p) => p.k === 'scanner')
  const awalSorot = ev && ev.k === 'scanner' ? ev.posisiLama : posisi
  const terlihat = (s: string) => s.replace(/\n/g, '↵\n').replace(/ /g, '·')
  return (
    <div className="rounded-xl border bg-card/70 p-3">
      <span className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Input (System.in)
        <span className="font-normal normal-case tracking-normal">↵ = Enter, · = spasi</span>
      </span>
      {stdin.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">Input kosong. Isi di tab Input di bawah editor.</p>
      ) : (
        <pre className="whitespace-pre-wrap break-all font-mono text-[15px] leading-relaxed">
          <span className="text-muted-foreground/60 line-through decoration-muted-foreground/40">{terlihat(stdin.slice(0, awalSorot))}</span>
          <span className="rounded-sm bg-banding-lembut text-foreground ring-1 ring-banding">{terlihat(stdin.slice(awalSorot, posisi))}</span>
          <span className="relative">
            <span className="absolute -left-px top-0 h-full w-0.5 bg-primary" aria-hidden="true" />
            {terlihat(stdin.slice(posisi))}
          </span>
        </pre>
      )}
    </div>
  )
}

export interface KonfigString {
  jenis: 'string'
  variabel: string
}

/** Karakter String sebagai sel berindeks. */
export function StringView({ state, konfig }: { state: StateMesin; konfig: KonfigString }) {
  const hasil = cariVariabel(state, konfig.variabel)
  if (!hasil || hasil.v.tipe !== 'String' || typeof hasil.v.nilai !== 'number') {
    return (
      <p className="rounded-lg border border-dashed px-3 py-2 text-[13px] text-muted-foreground">
        String <code className="kode-sebaris">{konfig.variabel}</code> belum ada pada langkah ini.
      </p>
    )
  }
  const o = state.heap[hasil.v.nilai]
  const teks = o && o.k === 'string' ? o.nilai : ''
  return (
    <div className="inline-flex max-w-full flex-col gap-2">
      <div className="flex items-center gap-2 text-[13px]">
        <span className="rounded-[5px] bg-tipe-string/10 px-1.5 py-px font-mono text-[11px] font-semibold text-tipe-string">String</span>
        <span className="font-mono font-semibold">{konfig.variabel}</span>
        <span className="text-muted-foreground">· length() = {teks.length}</span>
      </div>
      <div className="flex max-w-full gap-1 overflow-x-auto pb-1">
        {[...teks].map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div className="flex size-10 items-center justify-center rounded-md border-[1.5px] border-input bg-card font-mono text-[16px] font-semibold">
              {c === ' ' ? '·' : c}
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">{i}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
