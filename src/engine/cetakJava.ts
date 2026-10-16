/**
 * Cetak ulang ekspresi dan pernyataan seperti `Pretty` milik javac. Dipakai di pesan error untuk argumen yang
 * tipenya ditunda (lambda, ekspresi kondisional), mis. `no suitable method found for sort(List<String>,(x)->0)`.
 * Bentuknya meniru javac: parameter lambda implisit `(a,b)->`, operator biner berspasi, literal ditulis menurut
 * nilainya (`0x1F` → `31`, `1e10` → `1.0E10`, `1.5f` → `1.5F`), dan blok diratakan menjadi satu baris.
 */
import type * as A from './ast'
import { primitifKeString } from './format'

/** Panjang maksimum teks ringkas javac (`Pretty.toSimpleString`); teks sepanjang ini atau lebih dipotong. */
const PANJANG_RINGKAS = 20
const POTONGAN = '[...]'

/** Teks ringkas satu baris seperti `Pretty.toSimpleString` javac (dipotong menjadi `awal[...]akhir`). */
export function teksRingkas(e: A.Ekspresi): string {
  const teks = cetakEkspresi(e).trim().replace(/\s+/g, ' ')
  if (teks.length < PANJANG_RINGKAS) return teks
  const kepala = Math.floor(((PANJANG_RINGKAS - POTONGAN.length) * 2) / 3)
  const ekor = PANJANG_RINGKAS - POTONGAN.length - kepala
  return teks.slice(0, kepala) + POTONGAN + teks.slice(teks.length - ekor)
}

/** `Convert.quote` javac: escape karakter khusus, selain ASCII tercetak menjadi `\uXXXX`. */
function kutip(s: string): string {
  let hasil = ''
  for (const c of s) {
    for (let i = 0; i < c.length; i++) {
      const kode = c.charCodeAt(i)
      const ch = c[i]
      if (ch === '\b') hasil += '\\b'
      else if (ch === '\f') hasil += '\\f'
      else if (ch === '\n') hasil += '\\n'
      else if (ch === '\r') hasil += '\\r'
      else if (ch === '\t') hasil += '\\t'
      else if (ch === "'") hasil += "\\'"
      else if (ch === '"') hasil += '\\"'
      else if (ch === '\\') hasil += '\\\\'
      else if (kode >= 0x20 && kode <= 0x7e) hasil += ch
      else hasil += `\\u${kode.toString(16).padStart(4, '0')}`
    }
  }
  return hasil
}

export function cetakTipe(t: A.NodeTipe): string {
  switch (t.jenis) {
    case 'TipePrimitif':
      return t.nama
    case 'TipeNama':
      return t.argumen ? `${t.nama}<${t.argumen.map(cetakTipe).join(', ')}>` : t.nama
    case 'TipeArray':
      return `${cetakTipe(t.elemen)}[]`
    case 'TipeWildcard':
      return t.batas && t.tipe ? `? ${t.batas} ${cetakTipe(t.tipe)}` : '?'
  }
}

function literal(e: A.Literal): string {
  const v = e.nilai
  switch (e.jenisLiteral) {
    case 'int':
      return String(v)
    case 'long':
      return `${String(v)}L`
    case 'float':
      return `${primitifKeString(v as number, 'float')}F`
    case 'double':
      return primitifKeString(v as number, 'double')
    case 'char':
      return `'${kutip(String.fromCharCode(v as number))}'`
    case 'boolean':
      return v ? 'true' : 'false'
    case 'null':
      return 'null'
    case 'string':
      return `"${kutip(v as string)}"`
  }
}

function daftar(xs: A.Ekspresi[]): string {
  return xs.map(cetakEkspresi).join(', ')
}

export function cetakEkspresi(e: A.Ekspresi): string {
  const inti = cetakInti(e)
  const n = e.kurung ?? 0
  return '('.repeat(n) + inti + ')'.repeat(n)
}

function cetakInti(e: A.Ekspresi): string {
  switch (e.jenis) {
    case 'Literal':
      return literal(e)
    case 'Nama':
      return e.nama
    case 'AksesField':
      return `${cetakEkspresi(e.objek)}.${e.nama}`
    case 'AksesArray':
      return `${cetakEkspresi(e.array)}[${cetakEkspresi(e.indeks)}]`
    case 'PanggilMethod':
      return `${e.objek ? `${cetakEkspresi(e.objek)}.` : ''}${e.nama}(${daftar(e.argumen)})`
    case 'InisialisasiArray':
      return `{${daftar(e.elemen)}}`
    case 'BaruArray': {
      let dasar = e.elemen
      let kurungTipe = 0
      while (dasar.jenis === 'TipeArray') {
        dasar = dasar.elemen
        kurungTipe++
      }
      const dimensi = e.dimensi.map((d) => `[${cetakEkspresi(d)}]`).join('')
      return `new ${cetakTipe(dasar)}${dimensi}${'[]'.repeat(e.dimensiKosong + kurungTipe)}${e.init ? cetakInti(e.init) : ''}`
    }
    case 'BaruObjek':
      return `new ${cetakTipe(e.tipeNode)}(${daftar(e.argumen)})`
    case 'Unary':
      // `-2147483648`: javac menyimpannya sebagai satu literal negatif.
      if (e.op === '-' && e.operand.jenis === 'Literal' && e.operand.perluMinus && !e.operand.kurung) return literal(e.operand)
      return `${e.op}${cetakEkspresi(e.operand)}`
    case 'IncDec':
      return e.prefix ? `${e.op}${cetakEkspresi(e.target)}` : `${cetakEkspresi(e.target)}${e.op}`
    case 'Biner':
      return `${cetakEkspresi(e.kiri)} ${e.op} ${cetakEkspresi(e.kanan)}`
    case 'Assign':
      return `${cetakEkspresi(e.target)} ${e.op} ${cetakEkspresi(e.nilai)}`
    case 'Kondisional':
      return `${cetakEkspresi(e.kondisi)} ? ${cetakEkspresi(e.ya)} : ${cetakEkspresi(e.tidak)}`
    case 'Cast':
      return `(${cetakTipe(e.tipeNode)})${cetakEkspresi(e.ekspresi)}`
    case 'This':
      return e.kualifier ? `${e.kualifier}.this` : 'this'
    case 'Lambda': {
      const eksplisit = e.parameter.length > 0 && e.parameter.every((p) => p.tipeNode)
      const param = eksplisit ? e.parameter.map((p) => `${cetakTipe(p.tipeNode!)} ${p.nama}`).join(', ') : e.parameter.map((p) => p.nama).join(',')
      return `(${param})->${e.badan.jenis === 'Blok' ? cetakPernyataan(e.badan) : cetakEkspresi(e.badan)}`
    }
    case 'PanggilKonstruktor':
      return `${e.bentuk}(${daftar(e.argumen)})`
  }
}

/** Deklarasi variabel lokal: javac memecah `int a = 1, b;` menjadi dua deklarasi. */
function deklarasi(final: boolean, tipeNode: A.NodeTipe, d: A.Deklarator): string {
  const tipe = cetakTipe(tipeNode) + '[]'.repeat(d.dimensiTambahan)
  return `${final ? 'final ' : ''}${tipe} ${d.nama}${d.init ? ` = ${cetakEkspresi(d.init)}` : ''}`
}

function kondisiKurung(e: A.Ekspresi): string {
  return `(${cetakEkspresi(e)})`
}

function cetakBlok(pernyataan: A.Pernyataan[]): string {
  return pernyataan.length ? `{ ${pernyataan.map(cetakPernyataan).join(' ')} }` : '{ }'
}

export function cetakPernyataan(p: A.Pernyataan): string {
  switch (p.jenis) {
    case 'Blok':
      return cetakBlok(p.pernyataan)
    case 'DeklarasiLokal':
      return p.deklarator.map((d) => `${deklarasi(p.final, p.tipeNode, d)};`).join(' ')
    case 'PernyataanEkspresi':
      return `${cetakEkspresi(p.ekspresi)};`
    case 'If':
      return `if ${kondisiKurung(p.kondisi)} ${cetakPernyataan(p.maka)}${p.lain ? ` else ${cetakPernyataan(p.lain)}` : ''}`
    case 'While':
      return `while ${kondisiKurung(p.kondisi)} ${cetakPernyataan(p.badan)}`
    case 'DoWhile':
      return `do ${cetakPernyataan(p.badan)} while ${kondisiKurung(p.kondisi)};`
    case 'For': {
      let init: string
      const [pertama] = p.init
      if (pertama?.jenis === 'DeklarasiLokal') {
        const [d0, ...sisa] = pertama.deklarator
        init = deklarasi(pertama.final, pertama.tipeNode, d0) + sisa.map((d) => `, ${d.nama}${d.init ? ` = ${cetakEkspresi(d.init)}` : ''}`).join('')
      } else init = p.init.map((x) => cetakEkspresi((x as A.PernyataanEkspresi).ekspresi)).join(', ')
      return `for (${init}; ${p.kondisi ? cetakEkspresi(p.kondisi) : ''}; ${daftar(p.update)}) ${cetakPernyataan(p.badan)}`
    }
    case 'ForEach':
      return `for (${p.final ? 'final ' : ''}${cetakTipe(p.tipeNode)} ${p.nama} : ${cetakEkspresi(p.iterable)}) ${cetakPernyataan(p.badan)}`
    case 'Switch': {
      const kasus = p.grup.map((g) => {
        const label = g.label.length === 1 && g.label[0] === 'default' ? 'default' : `case ${g.label.map((l) => (l === 'default' ? 'default' : cetakEkspresi(l))).join(', ')}`
        if (!p.panah) return `${label}:${g.pernyataan.map((s) => ` ${cetakPernyataan(s)}`).join('')}`
        return `${label} -> ${g.pernyataan.length === 1 ? cetakPernyataan(g.pernyataan[0]) : cetakBlok(g.pernyataan)}`
      })
      return `switch ${kondisiKurung(p.selektor)} {${kasus.map((k) => ` ${k}`).join('')} }`
    }
    case 'Break':
      return 'break;'
    case 'Continue':
      return 'continue;'
    case 'Return':
      return p.ekspresi ? `return ${cetakEkspresi(p.ekspresi)};` : 'return;'
    case 'Kosong':
      return ';'
    case 'Throw':
      return `throw ${cetakEkspresi(p.ekspresi)};`
    case 'Try': {
      const tangkap = p.tangkap.map((t) => ` catch (${t.final ? 'final ' : ''}${t.tipe.map(cetakTipe).join(' | ')} ${t.nama}) ${cetakPernyataan(t.badan)}`)
      return `try ${cetakPernyataan(p.blok)}${tangkap.join('')}${p.akhirnya ? ` finally ${cetakPernyataan(p.akhirnya)}` : ''}`
    }
  }
}
