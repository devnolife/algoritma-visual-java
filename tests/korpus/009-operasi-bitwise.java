// Operator bitwise & | ^ ~ pada int dan boolean, serta masker bit izin
public class Main {
    public static void main(String[] args) {
        int a = 0b1100;
        int b = 0b1010;
        System.out.println("a & b = " + (a & b) + " (" + Integer.toBinaryString(a & b) + ")");
        System.out.println("a | b = " + (a | b) + " (" + Integer.toBinaryString(a | b) + ")");
        System.out.println("a ^ b = " + (a ^ b) + " (" + Integer.toBinaryString(a ^ b) + ")");
        System.out.println("~a    = " + (~a));
        System.out.println("~0    = " + (~0));
        System.out.println("~-1   = " + (~-1));
        System.out.println("~5L   = " + (~5L));
        int izin = 0;
        final int BACA = 1;
        final int TULIS = 2;
        final int EKSEKUSI = 4;
        izin |= BACA;
        izin |= EKSEKUSI;
        System.out.println("Izin = " + izin);
        System.out.println("Bisa baca?  " + ((izin & BACA) != 0));
        System.out.println("Bisa tulis? " + ((izin & TULIS) != 0));
        izin ^= EKSEKUSI;
        System.out.println("Setelah toggle eksekusi: " + izin);
        izin &= ~BACA;
        System.out.println("Setelah cabut baca: " + izin);
        int angka = 0x7F3A;
        System.out.println("Byte rendah: " + (angka & 0xFF));
        System.out.println("Byte tinggi: " + ((angka >> 8) & 0xFF));
        int x = 13, y = 7;
        x ^= y;
        y ^= x;
        x ^= y;
        System.out.println("Tukar dengan XOR: x = " + x + ", y = " + y);
        boolean p = true, q = false;
        System.out.println("p & q = " + (p & q) + ", p | q = " + (p | q) + ", p ^ q = " + (p ^ q));
        System.out.println("42 genap? " + ((42 & 1) == 0));
        System.out.println("64 pangkat dua? " + ((64 & (64 - 1)) == 0));
        System.out.println("Hex a ^ 0xFFFF: " + Integer.toHexString(a ^ 0xFFFF));
        System.out.println("Bit menyala di 255: " + Integer.bitCount(255));
        System.out.println("-8 & 0xFF = " + (-8 & 0xFF));
        System.out.println("6 & 3 | 8 ^ 1 = " + (6 & 3 | 8 ^ 1));
        long mask = 1L << 40 | 1;
        System.out.println("mask long = " + mask);
    }
}
