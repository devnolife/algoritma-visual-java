import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { java } from '@codemirror/lang-java'
import { bracketMatching, HighlightStyle, indentOnInput, syntaxHighlighting, syntaxTree } from '@codemirror/language'
import { setDiagnostics, type Diagnostic } from '@codemirror/lint'
import { EditorState, RangeSet, RangeSetBuilder, StateEffect, StateField, type Extension } from '@codemirror/state'
import {
  Decoration, drawSelection, EditorView, gutterLineClass, GutterMarker, highlightSpecialChars, keymap, lineNumbers,
  MatchDecorator, ViewPlugin, type DecorationSet, type ViewUpdate,
} from '@codemirror/view'
import { tags as t } from '@lezer/highlight'
import { useEffect, useLayoutEffect, useRef } from 'react'
import type { Diagnostik } from '@/engine'

// ---------- Baris aktif (yang baru saja dijalankan) ----------
interface InfoAktif {
  baris: number
  jenis: string
}

const setBarisAktif = StateEffect.define<InfoAktif | null>()
const setBarisPudar = StateEffect.define<Set<number> | null>()

const tandaAktif = new (class extends GutterMarker {
  elementClass = 'cm-gutter-aktif'
})()

const tandaAktifGalat = new (class extends GutterMarker {
  elementClass = 'cm-gutter-aktif cm-gutter-galat'
})()

const medanAktif = StateField.define<InfoAktif | null>({
  create: () => null,
  update(nilai, tr) {
    for (const e of tr.effects) if (e.is(setBarisAktif)) return e.value
    return nilai
  },
})

const dekorasiAktif = EditorView.decorations.compute([medanAktif], (state) => {
  const aktif = state.field(medanAktif)
  if (!aktif || aktif.baris < 1 || aktif.baris > state.doc.lines) return Decoration.none
  const baris = state.doc.line(aktif.baris)
  return Decoration.set([Decoration.line({ class: `cm-baris-jalan cm-baris-jalan-${aktif.jenis}` }).range(baris.from)])
})

const gutterAktif = gutterLineClass.compute([medanAktif], (state) => {
  const aktif = state.field(medanAktif)
  if (!aktif || aktif.baris < 1 || aktif.baris > state.doc.lines) return RangeSet.empty
  const tanda = aktif.jenis === 'exception' || aktif.jenis === 'batas' ? tandaAktifGalat : tandaAktif
  return RangeSet.of([tanda.range(state.doc.line(aktif.baris).from)])
})

// ---------- Baris yang tidak pernah dijalankan ----------
const medanPudar = StateField.define<Set<number> | null>({
  create: () => null,
  update(nilai, tr) {
    for (const e of tr.effects) if (e.is(setBarisPudar)) return e.value
    // Saat kode diubah, nomor baris bergeser: hapus peredupan sampai hasil run berikutnya tiba.
    return tr.docChanged ? null : nilai
  },
})

const dekorasiTakJalan = EditorView.decorations.compute([medanPudar], (state) => {
  const pudar = state.field(medanPudar)
  if (!pudar || pudar.size === 0) return Decoration.none
  const b = new RangeSetBuilder<Decoration>()
  const dekorasi = Decoration.line({ class: 'cm-baris-tak-jalan' })
  for (const i of [...pudar].sort((x, y) => x - y)) {
    if (i < 1 || i > state.doc.lines) continue
    b.add(state.doc.line(i).from, state.doc.line(i).from, dekorasi)
  }
  return b.finish()
})

// ---------- Warna tipe Java (sama dengan badge di visualisasi) ----------
const KELAS_TIPE: Record<string, string> = {
  int: 'cm-tipe-int',
  long: 'cm-tipe-int',
  short: 'cm-tipe-int',
  byte: 'cm-tipe-int',
  double: 'cm-tipe-pecahan',
  float: 'cm-tipe-pecahan',
  char: 'cm-tipe-char',
  boolean: 'cm-tipe-boolean',
  String: 'cm-tipe-string',
}

function dekorasiTipe(view: EditorView): DecorationSet {
  const b = new RangeSetBuilder<Decoration>()
  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (n) => {
        if (n.name !== 'PrimitiveType' && n.name !== 'TypeName') return
        const teks = view.state.doc.sliceString(n.from, n.to)
        const kelas = KELAS_TIPE[teks]
        if (kelas) b.add(n.from, n.to, Decoration.mark({ class: kelas }))
      },
    })
  }
  return b.finish()
}

const pluginTipe = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    constructor(view: EditorView) {
      this.decorations = dekorasiTipe(view)
    }
    update(u: ViewUpdate) {
      if (u.docChanged || u.viewportChanged || syntaxTree(u.startState) !== syntaxTree(u.state)) this.decorations = dekorasiTipe(u.view)
    }
  },
  { decorations: (v) => v.decorations },
)

// ---------- Chip penanda catatan dosen `// #nama` ----------
const pencocokPenanda = new MatchDecorator({
  regexp: /(?<=\/\/\s*)#[\p{L}\p{N}_-]+/gu,
  decoration: Decoration.mark({ class: 'cm-penanda' }),
})

const pluginPenanda = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet
    constructor(view: EditorView) {
      this.decorations = pencocokPenanda.createDeco(view)
    }
    update(u: ViewUpdate) {
      this.decorations = pencocokPenanda.updateDeco(u, this.decorations)
    }
  },
  { decorations: (v) => v.decorations },
)

const gayaSintaks = HighlightStyle.define([
  { tag: [t.keyword, t.modifier, t.controlKeyword, t.definitionKeyword, t.operatorKeyword], color: 'var(--kode-kunci)' },
  { tag: [t.string, t.special(t.string)], color: 'var(--tipe-string)' },
  { tag: [t.number, t.bool, t.null], color: 'var(--kode-angka)' },
  { tag: [t.lineComment, t.blockComment], color: 'var(--kode-komentar)', fontStyle: 'italic' },
  { tag: t.typeName, color: 'var(--foreground)' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: 'var(--kode-fungsi)' },
])

const temaEditor = EditorView.theme({
  '&': { height: '100%', fontSize: 'clamp(12.5px, 0.95vw, 13.5px)', backgroundColor: 'transparent', color: 'var(--foreground)' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.75', paddingBlock: '10px' },
  '.cm-content': { caretColor: 'var(--primary)', paddingRight: '8px' },
  '&.cm-focused': { outline: 'none' },
  '.cm-gutters': { backgroundColor: 'transparent', border: 'none', color: 'var(--muted-foreground)' },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 10px 0 12px', minWidth: '38px', cursor: 'pointer', position: 'relative' },
  '.cm-lineNumbers .cm-gutterElement:hover': { color: 'var(--foreground)' },
  '.cm-gutterElement.cm-gutter-aktif': { color: 'var(--foreground)', fontWeight: '700' },
  '.cm-gutterElement.cm-gutter-aktif::before': {
    content: '"▶"',
    position: 'absolute',
    left: '3px',
    fontSize: '9px',
    color: 'var(--banding-teks)',
  },
  '.cm-baris-jalan': { backgroundColor: 'var(--baris-aktif)' },
  '.cm-baris-jalan-exception, .cm-baris-jalan-batas': { backgroundColor: 'var(--galat-lembut)', boxShadow: 'inset 3px 0 0 var(--galat)' },
  '.cm-gutterElement.cm-gutter-aktif.cm-gutter-galat::before': { color: 'var(--galat)' },
  '.cm-baris-tak-jalan': { opacity: '0.42' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'color-mix(in oklch, var(--primary) 22%, transparent) !important',
  },
  '.cm-cursor': { borderLeftColor: 'var(--primary)', borderLeftWidth: '2px' },
  '.cm-matchingBracket': { backgroundColor: 'color-mix(in oklch, var(--primary) 16%, transparent)', outline: 'none' },
  '.cm-tipe-int': { color: 'var(--tipe-int)', fontWeight: '600' },
  '.cm-tipe-pecahan': { color: 'var(--tipe-pecahan)', fontWeight: '600' },
  '.cm-tipe-char': { color: 'var(--tipe-char)', fontWeight: '600' },
  '.cm-tipe-boolean': { color: 'var(--tipe-boolean)', fontWeight: '600' },
  '.cm-tipe-string': { color: 'var(--tipe-string)', fontWeight: '600' },
  '.cm-penanda': {
    fontStyle: 'normal',
    fontSize: '11px',
    padding: '1px 6px',
    borderRadius: '5px',
    backgroundColor: 'var(--muted)',
    color: 'var(--muted-foreground)',
  },
  // Isi chip mewarisi warna chip, bukan warna komentar (kontras komentar di atas latar chip terlalu rendah).
  '.cm-penanda *': { color: 'inherit', fontStyle: 'normal' },
  '.cm-diagnostic': { fontFamily: 'var(--font-sans)', fontSize: '13px', padding: '6px 10px' },
  '.cm-lintRange-error': {
    backgroundImage: 'none',
    textDecoration: 'underline wavy var(--galat)',
    textUnderlineOffset: '4px',
    textDecorationSkipInk: 'none',
  },
  '.cm-tooltip': { border: '1px solid var(--border)', backgroundColor: 'var(--popover)', borderRadius: '8px' },
})

export interface PropsEditorJava {
  nilai: string
  onUbah: (nilai: string) => void
  aktif?: InfoAktif | null
  diagnostik?: Diagnostik[]
  /** Baris yang bisa dijalankan tetapi tidak pernah dijalankan (ditampilkan pudar). */
  barisPudar?: Set<number> | null
  onKlikNomorBaris?: (baris: number) => void
  onPintasan?: (arah: -1 | 1) => void
  label?: string
}

function keDiagnosticCm(d: Diagnostik[], panjang: number): Diagnostic[] {
  return d.map((x) => {
    const from = Math.min(x.span.awal, panjang)
    const to = Math.min(Math.max(x.span.akhir, from + 1), panjang)
    return {
      from: from === to && from > 0 ? from - 1 : from,
      to,
      severity: 'error' as const,
      message: `${x.pesan}\n${x.artinya}${x.saran ? `\nSaran: ${x.saran}` : ''}`,
    }
  })
}

export function EditorJava({ nilai, onUbah, aktif, diagnostik, barisPudar, onKlikNomorBaris, onPintasan, label }: PropsEditorJava) {
  const wadah = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const callback = useRef({ onUbah, onKlikNomorBaris, onPintasan })
  useLayoutEffect(() => {
    callback.current = { onUbah, onKlikNomorBaris, onPintasan }
  })

  useEffect(() => {
    const ekstensi: Extension[] = [
      lineNumbers({
        domEventHandlers: {
          mousedown: (v, line) => {
            callback.current.onKlikNomorBaris?.(v.state.doc.lineAt(line.from).number)
            return true
          },
        },
      }),
      highlightSpecialChars(),
      history(),
      drawSelection(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      java(),
      syntaxHighlighting(gayaSintaks),
      pluginTipe,
      pluginPenanda,
      medanAktif,
      dekorasiAktif,
      gutterAktif,
      medanPudar,
      dekorasiTakJalan,
      EditorState.tabSize.of(4),
      keymap.of([
        { key: 'Alt-ArrowLeft', run: () => (callback.current.onPintasan?.(-1), true) },
        { key: 'Alt-ArrowRight', run: () => (callback.current.onPintasan?.(1), true) },
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        indentWithTab,
      ]),
      EditorView.updateListener.of((u) => {
        if (u.docChanged) callback.current.onUbah(u.state.doc.toString())
      }),
      EditorView.contentAttributes.of({ 'aria-label': label ?? 'Kode Java', spellcheck: 'false', autocorrect: 'off', autocapitalize: 'off' }),
      temaEditor,
    ]
    const v = new EditorView({ parent: wadah.current!, state: EditorState.create({ doc: nilai, extensions: ekstensi }) })
    view.current = v
    return () => {
      v.destroy()
      view.current = null
    }
    // Editor dibuat sekali; perubahan nilai dari luar ditangani efek di bawah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const v = view.current
    if (!v) return
    const sekarang = v.state.doc.toString()
    if (sekarang !== nilai) v.dispatch({ changes: { from: 0, to: sekarang.length, insert: nilai } })
  }, [nilai])

  useEffect(() => {
    view.current?.dispatch({ effects: setBarisAktif.of(aktif ?? null) })
  }, [aktif?.baris, aktif?.jenis]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    view.current?.dispatch({ effects: setBarisPudar.of(barisPudar ?? null) })
  }, [barisPudar])

  useEffect(() => {
    const v = view.current
    if (!v) return
    v.dispatch(setDiagnostics(v.state, keDiagnosticCm(diagnostik ?? [], v.state.doc.length)))
  }, [diagnostik])

  return <div ref={wadah} className="editor-java h-full min-h-0 overflow-hidden" />
}
