// Kelas immutable: semua field private final tanpa setter; perubahan menghasilkan objek baru lewat method "dengan..."
public class Main {
    public static void main(String[] args) {
        Jadwal j1 = new Jadwal("Algoritma", "Senin", 8);
        Jadwal j2 = j1.denganHari("Rabu");
        Jadwal j3 = j2.denganJam(13).denganRuang("Lab 2");
        Jadwal j4 = new Jadwal("Kalkulus", "Kamis", 10, "R.301");
        System.out.println(j1.info());
        System.out.println(j2.info());
        System.out.println(j3.info());
        System.out.println(j4.info());
        System.out.println("j1 masih " + j1.getHari() + " jam " + j1.getJam());
        System.out.println("bentrok j2-j3? " + j2.bentrok(j3) + ", j1 dengan Fisika Senin 8? " + j1.bentrok(new Jadwal("Fisika", "Senin", 8)));
        System.out.println("objek berbeda: " + (j1 != j2) + " " + (j2 != j3));
        System.out.println("Jumlah objek Jadwal dibuat: " + Jadwal.getDibuat());
    }
}

class Jadwal {
    private static int dibuat = 0;
    private final String matkul;
    private final String hari;
    private final int jam;
    private final String ruang;

    Jadwal(String matkul, String hari, int jam) {
        this(matkul, hari, jam, "R.101");
    }

    Jadwal(String matkul, String hari, int jam, String ruang) {
        this.matkul = matkul;
        this.hari = hari;
        this.jam = jam;
        this.ruang = ruang;
        dibuat++;
    }

    static int getDibuat() {
        return dibuat;
    }

    String getHari() {
        return hari;
    }

    int getJam() {
        return jam;
    }

    Jadwal denganHari(String hariBaru) {
        return new Jadwal(matkul, hariBaru, jam, ruang);
    }

    Jadwal denganJam(int jamBaru) {
        return new Jadwal(matkul, hari, jamBaru, ruang);
    }

    Jadwal denganRuang(String ruangBaru) {
        return new Jadwal(matkul, hari, jam, ruangBaru);
    }

    boolean bentrok(Jadwal lain) {
        return hari.equals(lain.hari) && jam == lain.jam;
    }

    String info() {
        return matkul + " " + hari + " " + String.format("%02d.00", jam) + " di " + ruang;
    }
}
