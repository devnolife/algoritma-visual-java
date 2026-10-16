// Overflow int: MAX_VALUE + 1, MIN_VALUE - 1, -MIN_VALUE, dan MIN / -1
public class Main {
    public static void main(String[] args) {
        int maks = Integer.MAX_VALUE;
        int min = Integer.MIN_VALUE;
        System.out.println("Maks int      : " + maks);
        System.out.println("Maks + 1      : " + (maks + 1));
        System.out.println("Min int       : " + min);
        System.out.println("Min - 1       : " + (min - 1));
        System.out.println("-Min          : " + (-min));
        System.out.println("Math.abs(Min) : " + Math.abs(min));
        System.out.println("Maks * 2      : " + (maks * 2));
        System.out.println("Min * -1      : " + (min * -1));
        System.out.println("Min / -1      : " + (min / -1));
        System.out.println("Min % -1      : " + (min % -1));
        int saldo = 2_000_000_000;
        saldo += 500_000_000;
        System.out.println("Saldo setelah tambah: " + saldo);
        int hitung = maks;
        hitung++;
        System.out.println("maks++ menjadi : " + hitung);
        hitung--;
        System.out.println("lalu -- menjadi: " + hitung);
        long aman = (long) maks + 1;
        System.out.println("Pakai long     : " + aman);
        long salah = maks + 1;
        System.out.println("Cast terlambat : " + salah);
    }
}
