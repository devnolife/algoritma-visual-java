import { describe, expect, it } from 'vitest'
import { adalahChecked, argumenSebagai, namaLengkapPustaka, namaSederhana, rantaiException, subtipePustaka } from '@/engine/hierarki'

describe('hierarki tipe pustaka', () => {
  it('memandang tipe generik sebagai supertipenya dengan substitusi argumen', () => {
    expect(argumenSebagai('ArrayList', ['Integer'], 'Iterable')).toEqual(['Integer'])
    expect(argumenSebagai('HashMap', ['String', 'Integer'], 'Map')).toEqual(['String', 'Integer'])
    expect(argumenSebagai('LinkedHashMap', ['String', 'Long'], 'Map')).toEqual(['String', 'Long'])
    expect(argumenSebagai('LinkedList', ['Node'], 'Queue')).toEqual(['Node'])
    expect(argumenSebagai('LinkedHashSet', ['Character'], 'Collection')).toEqual(['Character'])
    expect(argumenSebagai('Integer', [], 'Comparable')).toEqual(['Integer'])
    expect(argumenSebagai('ArrayList', ['Integer'], 'Set')).toBeNull()
  })

  it('subtipe dan nama lengkap', () => {
    expect(subtipePustaka('ArrayDeque', 'Deque')).toBe(true)
    expect(subtipePustaka('ArrayDeque', 'List')).toBe(false)
    expect(subtipePustaka('Stack', 'Collection')).toBe(true)
    expect(namaLengkapPustaka('TreeMap')).toBe('java.util.TreeMap')
    expect(namaLengkapPustaka('EmptyStackException')).toBe('java.util.EmptyStackException')
    expect(namaSederhana('java.util.Map$Entry')).toBe('Map.Entry')
  })
})

describe('hierarki exception', () => {
  it('rantai leluhur dan checked/unchecked', () => {
    expect(rantaiException('InputMismatchException')).toEqual(['InputMismatchException', 'NoSuchElementException', 'RuntimeException', 'Exception', 'Throwable'])
    expect(adalahChecked(rantaiException('Exception'))).toBe(true)
    expect(adalahChecked(rantaiException('InterruptedException'))).toBe(true)
    expect(adalahChecked(rantaiException('ArithmeticException'))).toBe(false)
    expect(adalahChecked(rantaiException('StackOverflowError'))).toBe(false)
    expect(adalahChecked(['SaldoKurangException', ...rantaiException('Exception')])).toBe(true)
  })
})
