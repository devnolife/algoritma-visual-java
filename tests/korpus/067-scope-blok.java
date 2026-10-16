// Cakupan (scope) variabel: blok, nama sama di blok bersaudara, dan bayangan field static
public class Main {
    static int nilai = 100;
    static String nama = "global";

    static void tampil() {
        System.out.println("tampil(): nilai = " + nilai + ", nama = " + nama);
    }

    public static void main(String[] args) {
        System.out.println("Awal: nilai = " + nilai);
        int nilai = 5;
        System.out.println("Lokal menutupi field: nilai = " + nilai);
        System.out.println("Field lewat Main.nilai = " + Main.nilai);
        tampil();
        {
            int x = 10;
            System.out.println("Blok 1: x = " + x);
        }
        {
            int x = 20;
            System.out.println("Blok 2: x = " + x);
        }
        for (int i = 0; i < 2; i++) {
            int dalam = i * 100;
            System.out.println("Loop: i = " + i + ", dalam = " + dalam);
        }
        for (int i = 5; i < 7; i++) {
            System.out.println("Loop kedua: i = " + i);
        }
        int total = 0;
        if (nilai > 0) {
            int tambahan = 7;
            total = nilai + tambahan;
        }
        System.out.println("total = " + total);
        Main.nilai = 1;
        nama = "diubah";
        tampil();
        int a = 1, b = 2, c;
        c = a + b;
        {
            int d = c * 2;
            c = d;
        }
        System.out.println("a=" + a + " b=" + b + " c=" + c);
    }
}
