import { describe, expect, it } from 'vitest'
import { doubleKeString, floatKeString, formatE, formatF } from '@/engine/format'
import { aritmetika, geser, konversiPrimitif, INT_MAX, INT_MIN, LemparanJava, tambahSatu } from '@/engine/nilai'
import { Sumber } from '@/engine/sumber'
import { cekAssign, T, teksTipe, tipeArray } from '@/engine/tipe'

// Nilai harapan diambil dari keluaran JDK 21 (Temurin) asli.
describe('Double.toString', () => {
  const kasus: [number, string][] = [
    [0.1, '0.1'],
    [0.1 + 0.2, '0.30000000000000004'],
    [1.0, '1.0'],
    [100.0, '100.0'],
    [1234567.0, '1234567.0'],
    [12345678.0, '1.2345678E7'],
    [1e7, '1.0E7'],
    [0.001, '0.001'],
    [0.0001, '1.0E-4'],
    [-2.5, '-2.5'],
    [1 / 3, '0.3333333333333333'],
    [1e23, '1.0E23'],
    [123456789.123, '1.23456789123E8'],
    [Number.MIN_VALUE, '4.9E-324'],
    [Number.MAX_VALUE, '1.7976931348623157E308'],
    [999999.9999, '999999.9999'],
    [-0.0, '-0.0'],
    [5e-5, '5.0E-5'],
    [NaN, 'NaN'],
    [Infinity, 'Infinity'],
  ]
  it.each(kasus)('%s → %s', (x, harapan) => expect(doubleKeString(x)).toBe(harapan))
})

describe('Float.toString', () => {
  const f = Math.fround
  const kasus: [number, string][] = [
    [f(0.1), '0.1'],
    [f(1.1), '1.1'],
    [f(1e10), '1.0E10'],
    [f(f(1) / f(3)), '0.33333334'],
    [f(16777217), '1.6777216E7'],
    [f(123456.79), '123456.79'],
    [f(1.4e-45), '1.4E-45'],
    [f(f(0.7) + f(0.1)), '0.8'],
  ]
  it.each(kasus)('%s → %s', (x, harapan) => expect(floatKeString(x)).toBe(harapan))
})

describe('printf %f dan %e', () => {
  const kasus: [number, string, string, string, string][] = [
    [3.14159, '3.14', '3', '3.141590', '3.142e+00'],
    [1.005, '1.01', '1', '1.005000', '1.005e+00'],
    [0.125, '0.13', '0', '0.125000', '1.250e-01'],
    [9.999, '10.00', '10', '9.999000', '9.999e+00'],
    [1e10, '10000000000.00', '10000000000', '10000000000.000000', '1.000e+10'],
    [0.005, '0.01', '0', '0.005000', '5.000e-03'],
    [-2.675, '-2.68', '-3', '-2.675000', '-2.675e+00'],
    [81.66666666666667, '81.67', '82', '81.666667', '8.167e+01'],
    [0.0, '0.00', '0', '0.000000', '0.000e+00'],
  ]
  it.each(kasus)('%s', (x, f2, f0, f6, e3) => {
    expect(formatF(x, 2)).toBe(f2)
    expect(formatF(x, 0)).toBe(f0)
    expect(formatF(x, 6)).toBe(f6)
    expect(formatE(x, 3)).toBe(e3)
  })
})

describe('aritmetika int/long', () => {
  const ar = (op: '+' | '-' | '*' | '/' | '%', a: number, b: number) => aritmetika(op, a, b, 'int')
  it('overflow membungkus 32-bit dan dilaporkan', () => {
    expect(ar('+', INT_MAX, 1)).toEqual({ nilai: INT_MIN, overflow: '2147483648' })
    expect(ar('*', INT_MAX, 2).nilai).toBe(-2)
    expect(ar('/', INT_MIN, -1).nilai).toBe(INT_MIN)
  })
  it('pembagian bulat memotong ke arah nol', () => {
    expect(ar('/', -7, 2).nilai).toBe(-3)
    expect(ar('%', -7, 2).nilai).toBe(-1)
    expect(ar('%', 7, -2).nilai).toBe(1)
    expect(ar('/', 7, 2)).toEqual({ nilai: 3 })
  })
  it('pembagian dengan nol melempar ArithmeticException', () => {
    expect(() => ar('/', 1, 0)).toThrow(LemparanJava)
    expect(() => aritmetika('%', 1n, 0n, 'long')).toThrow('/ by zero')
    expect(aritmetika('/', 1, 0, 'double').nilai).toBe(Infinity)
  })
  it('long 64-bit', () => {
    expect(aritmetika('+', 9223372036854775807n, 1n, 'long').nilai).toBe(-9223372036854775808n)
    expect(geser('<<', 1n, 63, 'long')).toBe(-9223372036854775808n)
    expect(geser('>>>', -1n, 60, 'long')).toBe(15n)
  })
  it('shift int', () => {
    expect(geser('>>>', -1, 28, 'int')).toBe(15)
    expect(geser('<<', 1, 33, 'int')).toBe(2)
  })
  it('++ pada char dan byte', () => {
    expect(tambahSatu(65, 'char', 1)).toBe(66)
    expect(tambahSatu(127, 'byte', 1)).toBe(-128)
  })
})

describe('casting', () => {
  it('double → int dipotong dan dibatasi', () => {
    expect(konversiPrimitif(3.99, 'double', 'int')).toBe(3)
    expect(konversiPrimitif(-3.99, 'double', 'int')).toBe(-3)
    expect(konversiPrimitif(NaN, 'double', 'int')).toBe(0)
    expect(konversiPrimitif(1e20, 'double', 'int')).toBe(INT_MAX)
    expect(konversiPrimitif(1e30, 'double', 'long')).toBe(9223372036854775807n)
  })
  it('penyempitan int', () => {
    expect(konversiPrimitif(200, 'int', 'byte')).toBe(-56)
    expect(konversiPrimitif(70000, 'int', 'short')).toBe(4464)
    expect(konversiPrimitif(65, 'int', 'char')).toBe(65)
  })
  it('widening', () => {
    expect(konversiPrimitif(5, 'int', 'long')).toBe(5n)
    expect(konversiPrimitif(5n, 'long', 'double')).toBe(5)
    expect(konversiPrimitif(0.1, 'double', 'float')).toBe(Math.fround(0.1))
  })
})

describe('tipe', () => {
  it('nama tipe gaya javac', () => {
    expect(teksTipe(tipeArray(T.double, 2))).toBe('double[][]')
    expect(teksTipe(T.null)).toBe('<null>')
  })
  it('aturan assignment', () => {
    expect(cekAssign(T.int, T.double)).toBe('ok')
    expect(cekAssign(T.double, T.int)).toBe('lossy')
    expect(cekAssign(T.int, T.byte, 10)).toBe('ok')
    expect(cekAssign(T.int, T.byte, 200)).toBe('lossy')
    expect(cekAssign(T.int, T.byte)).toBe('lossy')
    expect(cekAssign(T.String, T.int)).toBe('tidak-cocok')
    expect(cekAssign(T.int, T.boolean)).toBe('tidak-cocok')
    expect(cekAssign(T.null, T.String)).toBe('ok')
    expect(cekAssign(T.char, T.int)).toBe('ok')
  })
})

describe('Sumber', () => {
  it('baris dan kolom', () => {
    const s = new Sumber('ab\ncd\r\nef')
    expect(s.baris(0)).toBe(1)
    expect(s.baris(3)).toBe(2)
    expect(s.kolom(4)).toBe(2)
    expect(s.baris(7)).toBe(3)
    expect(s.teksBaris(2)).toBe('cd')
    expect(s.jumlahBaris).toBe(3)
  })
})
