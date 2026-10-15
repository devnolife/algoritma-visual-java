import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  galat: Error | null
}

/** Menangkap error tak terduga agar pengguna melihat pesan yang jelas, bukan halaman kosong. */
export class BatasGalat extends Component<{ children: ReactNode }, State> {
  state: State = { galat: null }

  static getDerivedStateFromError(galat: Error): State {
    return { galat }
  }

  componentDidCatch(galat: Error, info: ErrorInfo) {
    console.error('Galat aplikasi:', galat, info.componentStack)
  }

  render() {
    if (!this.state.galat) return this.props.children
    return (
      <div className="grid min-h-dvh place-items-center p-8">
        <div className="flex max-w-lg flex-col gap-3">
          <h1 className="text-3xl">Terjadi kesalahan pada aplikasi</h1>
          <p className="text-muted-foreground">
            Ini adalah bug pada simulator, bukan pada kodemu. Kode yang sedang kamu kerjakan sudah tersimpan otomatis di browser.
          </p>
          <pre className="overflow-auto rounded-lg border bg-card p-3 font-mono text-[12px]">{this.state.galat.message}</pre>
          <button
            type="button"
            className="w-fit rounded-lg bg-primary px-4 py-2 text-[14px] font-medium text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            onClick={() => location.reload()}
          >
            Muat ulang halaman
          </button>
        </div>
      </div>
    )
  }
}
