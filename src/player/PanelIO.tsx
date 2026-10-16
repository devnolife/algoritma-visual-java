import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Diagnostik } from '@/engine'
import { labelKelas, type KonfigPertumbuhan } from '@/engine/pertumbuhan'
import { cn } from '@/lib/utils'
import { PanelPertumbuhan } from './PanelPertumbuhan'
import { usePemutar } from './store'
import { TeksSebaris } from './TeksSebaris'

function DaftarMasalah({ diagnostik, galat, simulator }: { diagnostik: Diagnostik[]; galat?: string; simulator?: string }) {
  if (diagnostik.length === 0 && !galat && !simulator) {
    return <p className="text-[13px] text-muted-foreground">Tidak ada masalah. Kode berhasil dikompilasi.</p>
  }
  return (
    <ol className="flex flex-col gap-3">
      {galat && (
        <li className="rounded-lg border border-galat/30 bg-galat-lembut px-3 py-2 text-[13px]">
          <b>Simulator:</b> {galat.split('\n')[0]}
        </li>
      )}
      {simulator && <li className="rounded-lg bg-banding-lembut px-3 py-2 text-[13px]">{simulator}</li>}
      {diagnostik.map((d, i) => (
        <li key={i} className="flex flex-col gap-1 rounded-lg border border-galat/25 bg-card px-3 py-2.5">
          <code className="font-mono text-[12px] leading-snug text-galat">
            Main.java:{d.baris}: error: {d.pesan}
            {d.detail.map((x, j) => (
              <span key={j} className="block pl-4 text-muted-foreground">
                {x}
              </span>
            ))}
          </code>
          <p className="text-[13.5px] leading-relaxed">
            <b>Artinya:</b> <TeksSebaris teks={d.artinya} />
          </p>
          {d.saran && (
            <p className="text-[13.5px] leading-relaxed">
              <b>Saran:</b> <TeksSebaris teks={d.saran} />
            </p>
          )}
        </li>
      ))}
    </ol>
  )
}

function Output() {
  const trace = usePemutar((s) => s.trace)
  const pembaca = usePemutar((s) => s.pembaca)
  const langkah = usePemutar((s) => s.langkah)
  if (!trace || !pembaca) return <p className="text-[13px] text-muted-foreground">Output akan muncul di sini.</p>
  const output = pembaca.outputDi(langkah)
  if (output.length === 0) {
    const baris = trace.langkah.findIndex((l) => l.peristiwa.some((p) => p.k === 'cetak'))
    return (
      <p className="text-[13px] text-muted-foreground">
        Belum ada output pada langkah ini.
        {baris > langkah && ` Perintah cetak pertama dijalankan di baris ${trace.langkah[baris].baris}.`}
      </p>
    )
  }
  const bagian: { teks: string; err: boolean }[] = []
  let i = 0
  while (i < output.length) {
    const err = trace.rentangErr.some(([a, b]) => i >= a && i < b)
    let j = i + 1
    while (j < output.length && trace.rentangErr.some(([a, b]) => j >= a && j < b) === err) j++
    bagian.push({ teks: output.slice(i, j), err })
    i = j
  }
  return (
    <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed">
      {bagian.map((b, k) => (
        <span key={k} className={cn(b.err && 'text-galat')}>
          {b.teks}
        </span>
      ))}
    </pre>
  )
}

export function PanelIO({ pertumbuhan }: { pertumbuhan?: KonfigPertumbuhan }) {
  const hasil = usePemutar((s) => s.hasil)
  const trace = usePemutar((s) => s.trace)
  const stdin = usePemutar((s) => s.stdin)
  const kelasPertumbuhan = usePemutar((s) => s.pertumbuhan?.seri[0]?.kelas)
  const diagnostik = hasil && !hasil.ok ? hasil.diagnostik : []
  const galat = hasil && !hasil.ok && hasil.galat ? hasil.galat : undefined
  const jumlahMasalah = diagnostik.length + (galat ? 1 : 0)
  const [tab, setTab] = useState('output')
  // Pindah otomatis ke tab Masalah saat error muncul, dan kembali saat error hilang.
  const [masalahSebelum, setMasalahSebelum] = useState(jumlahMasalah)
  if (jumlahMasalah !== masalahSebelum) {
    setMasalahSebelum(jumlahMasalah)
    if (jumlahMasalah > 0 && masalahSebelum === 0) setTab('masalah')
    else if (jumlahMasalah === 0 && tab === 'masalah') setTab('output')
  }

  return (
    <Tabs value={tab} onValueChange={setTab} className="flex h-full min-h-0 flex-col gap-0">
      <div className="border-b px-3 py-1.5">
        <TabsList>
          <TabsTrigger value="output">Output</TabsTrigger>
          <TabsTrigger value="input">Input</TabsTrigger>
          <TabsTrigger value="masalah">
            Masalah
            <span
              className={cn(
                'ml-1 rounded-full px-1.5 text-[11px] tabular-nums',
                jumlahMasalah > 0 ? 'bg-galat-lembut text-galat' : 'bg-muted text-muted-foreground',
              )}
            >
              {jumlahMasalah}
            </span>
          </TabsTrigger>
          {pertumbuhan && (
            <TabsTrigger value="pertumbuhan">
              Pertumbuhan
              {kelasPertumbuhan && <span className="ml-1 rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground">{labelKelas(kelasPertumbuhan)}</span>}
            </TabsTrigger>
          )}
        </TabsList>
      </div>
      <TabsContent value="output" className="min-h-0 flex-1 overflow-auto px-4 py-3">
        <Output />
      </TabsContent>
      <TabsContent value="input" className="flex min-h-0 flex-1 flex-col gap-1.5 px-4 py-3">
        <label htmlFor="isian-input" className="text-[12px] text-muted-foreground">
          Teks yang akan dibaca <code className="kode-sebaris">Scanner</code>, satu nilai per baris atau dipisah spasi.
        </label>
        <textarea
          id="isian-input"
          value={stdin}
          onChange={(e) => usePemutar.getState().setStdin(e.target.value)}
          spellCheck={false}
          className="min-h-0 flex-1 resize-none rounded-lg border bg-background px-3 py-2 font-mono text-[13px] outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          placeholder={'Contoh:\n20\nBudi'}
        />
      </TabsContent>
      <TabsContent value="masalah" className="min-h-0 flex-1 overflow-auto px-4 py-3">
        <DaftarMasalah diagnostik={diagnostik} galat={galat} simulator={trace?.pesanSimulator} />
      </TabsContent>
      {pertumbuhan && (
        <TabsContent value="pertumbuhan" className="min-h-0 flex-1 overflow-hidden px-4 py-2.5">
          <PanelPertumbuhan konfig={pertumbuhan} />
        </TabsContent>
      )}
    </Tabs>
  )
}
