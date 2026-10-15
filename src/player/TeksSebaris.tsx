import { Fragment, type ReactNode } from 'react'

/** Render teks sebaris sederhana: `kode` dan **tebal**. */
export function TeksSebaris({ teks }: { teks: string }) {
  const bagian: ReactNode[] = []
  const re = /`([^`]+)`|\*\*([^*]+)\*\*/g
  let terakhir = 0
  let m: RegExpExecArray | null
  let k = 0
  while ((m = re.exec(teks))) {
    if (m.index > terakhir) bagian.push(<Fragment key={k++}>{teks.slice(terakhir, m.index)}</Fragment>)
    if (m[1] !== undefined) {
      bagian.push(
        <code key={k++} className="kode-sebaris">
          {m[1]}
        </code>,
      )
    } else bagian.push(<strong key={k++}>{m[2]}</strong>)
    terakhir = re.lastIndex
  }
  if (terakhir < teks.length) bagian.push(<Fragment key={k}>{teks.slice(terakhir)}</Fragment>)
  return <>{bagian}</>
}
