// Inisialisasi field static kelas lain terjadi saat kelas itu pertama kali dipakai; konstanta static final tidak memicunya
public class Main {
    static int hitungan = log("Main.hitungan", 1);

    static int log(String nama, int nilai) {
        System.out.println("  inisialisasi " + nama + " = " + nilai);
        return nilai;
    }

    public static void main(String[] args) {
        System.out.println("main mulai");
        System.out.println("Konstanta Pengaturan.VERSI = " + Pengaturan.VERSI);
        System.out.println("sebelum memakai Pengaturan.batas");
        System.out.println("batas = " + Pengaturan.batas);
        System.out.println("batas lagi = " + Pengaturan.batas + ", nama = " + Pengaturan.nama);
        System.out.println("sebelum new Penghitung()");
        Penghitung a = new Penghitung();
        Penghitung b = new Penghitung();
        System.out.println("id a = " + a.id + ", id b = " + b.id + ", total = " + Penghitung.total);
    }
}

class Pengaturan {
    static final int VERSI = 3;
    static int batas = Main.log("Pengaturan.batas", 100);
    static String nama = Main.log("Pengaturan.nama", 7) + " item";
}

class Penghitung {
    static int total = Main.log("Penghitung.total", 0);
    int id = Main.log("Penghitung.id (instance)", total + 1);

    Penghitung() {
        total++;
        System.out.println("  konstruktor Penghitung, total = " + total);
    }
}
