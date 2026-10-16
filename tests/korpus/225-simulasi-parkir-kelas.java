// Simulasi parkir: kelas Kendaraan dan TempatParkir dengan slot array, tarif per jam, dan pendapatan akhir
public class Main {
    public static void main(String[] args) {
        TempatParkir p = new TempatParkir(3);
        p.masuk(new Kendaraan("DD 1234 AB", "mobil", 8));
        p.masuk(new Kendaraan("DD 5678 CD", "motor", 9));
        p.masuk(new Kendaraan("DD 9012 EF", "mobil", 9));
        p.masuk(new Kendaraan("DD 3456 GH", "motor", 10));
        p.status();
        p.keluar("DD 5678 CD", 12);
        p.masuk(new Kendaraan("DD 3456 GH", "motor", 12));
        p.keluar("DD 0000 XX", 13);
        p.keluar("DD 1234 AB", 15);
        p.status();
        p.keluar("DD 9012 EF", 9);
        p.keluar("DD 3456 GH", 17);
        p.status();
        System.out.println("Pendapatan: " + p.pendapatan);
    }
}

class Kendaraan {
    String plat;
    String jenis;
    int jamMasuk;

    Kendaraan(String plat, String jenis, int jamMasuk) {
        this.plat = plat;
        this.jenis = jenis;
        this.jamMasuk = jamMasuk;
    }

    int tarifPerJam() {
        return jenis.equals("mobil") ? 5000 : 2000;
    }
}

class TempatParkir {
    Kendaraan[] slot;
    int pendapatan;

    TempatParkir(int kapasitas) {
        slot = new Kendaraan[kapasitas];
    }

    void masuk(Kendaraan k) {
        for (int i = 0; i < slot.length; i++) {
            if (slot[i] == null) {
                slot[i] = k;
                System.out.println(k.plat + " (" + k.jenis + ") masuk ke slot " + i + " jam " + k.jamMasuk);
                return;
            }
        }
        System.out.println(k.plat + " ditolak: parkir penuh");
    }

    void keluar(String plat, int jamKeluar) {
        for (int i = 0; i < slot.length; i++) {
            Kendaraan k = slot[i];
            if (k != null && k.plat.equals(plat)) {
                int lama = Math.max(1, jamKeluar - k.jamMasuk);
                int biaya = lama * k.tarifPerJam();
                pendapatan += biaya;
                slot[i] = null;
                System.out.println(plat + " keluar dari slot " + i + " setelah " + lama + " jam, bayar " + biaya);
                return;
            }
        }
        System.out.println(plat + " tidak ditemukan");
    }

    void status() {
        StringBuilder sb = new StringBuilder("Status:");
        for (int i = 0; i < slot.length; i++) {
            sb.append(" [").append(i).append(": ").append(slot[i] == null ? "kosong" : slot[i].plat).append(']');
        }
        System.out.println(sb);
    }
}
