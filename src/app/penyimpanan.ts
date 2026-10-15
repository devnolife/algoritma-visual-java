const AWALAN = 'algojava:v1:'

export function baca<T>(kunci: string, bawaan: T): T {
  try {
    const mentah = localStorage.getItem(AWALAN + kunci)
    return mentah === null ? bawaan : (JSON.parse(mentah) as T)
  } catch {
    return bawaan
  }
}

export function simpan(kunci: string, nilai: unknown): void {
  try {
    localStorage.setItem(AWALAN + kunci, JSON.stringify(nilai))
  } catch {
    // Penyimpanan penuh atau diblokir: progres tetap berjalan di memori.
  }
}

export function hapus(kunci: string): void {
  try {
    localStorage.removeItem(AWALAN + kunci)
  } catch {
    // abaikan
  }
}
