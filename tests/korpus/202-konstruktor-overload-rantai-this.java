// Konstruktor overload dan rantai this(...): urutan cetak menunjukkan konstruktor mana yang selesai lebih dulu
public class Main {
    public static void main(String[] args) {
        System.out.println("== new Waktu() ==");
        Waktu a = new Waktu();
        System.out.println("== new Waktu(7) ==");
        Waktu b = new Waktu(7);
        System.out.println("== new Waktu(9, 30) ==");
        Waktu c = new Waktu(9, 30);
        System.out.println("== new Waktu(23, 59, 59) ==");
        Waktu d = new Waktu(23, 59, 59);
        System.out.println(a.format() + " | " + b.format() + " | " + c.format() + " | " + d.format());
        System.out.println("Total detik d = " + d.totalDetik());
    }
}

class Waktu {
    int jam;
    int menit;
    int detik;

    Waktu() {
        this(0);
        System.out.println("  Waktu() selesai");
    }

    Waktu(int jam) {
        this(jam, 0);
        System.out.println("  Waktu(int) selesai");
    }

    Waktu(int jam, int menit) {
        this(jam, menit, 0);
        System.out.println("  Waktu(int, int) selesai");
    }

    Waktu(int jam, int menit, int detik) {
        System.out.println("  Waktu(int, int, int) mulai: " + jam + ":" + menit + ":" + detik);
        this.jam = jam;
        this.menit = menit;
        this.detik = detik;
    }

    String format() {
        return String.format("%02d:%02d:%02d", jam, menit, detik);
    }

    int totalDetik() {
        return jam * 3600 + menit * 60 + detik;
    }
}
