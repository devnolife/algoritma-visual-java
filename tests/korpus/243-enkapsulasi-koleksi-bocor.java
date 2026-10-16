// Getter yang mengembalikan ArrayList internal membocorkan isi kelas; mengembalikan salinan menjaga enkapsulasi
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        Kelas a = new Kelas("A");
        a.tambah("Ani");
        a.tambah("Budi");
        System.out.println("Kelas " + a.getNama() + ": " + a.getPesertaSalinan());
        ArrayList<String> bocor = a.getPesertaLangsung();
        bocor.add("Penyusup");
        bocor.remove("Ani");
        System.out.println("Setelah list dari getter diubah: " + a.getPesertaSalinan() + ", jumlah " + a.jumlah());
        ArrayList<String> salinan = a.getPesertaSalinan();
        salinan.clear();
        System.out.println("Setelah salinan dikosongkan: " + a.getPesertaSalinan() + ", salinan " + salinan);
        System.out.println("tambah Budi lagi: " + a.tambah("Budi"));
        System.out.println("tambah Cici: " + a.tambah("Cici"));
        System.out.println("Akhir: " + a.getPesertaSalinan());
        System.out.println("bocor == list internal? " + (bocor == a.getPesertaLangsung()) + ", salinan baru tiap panggilan? " + (a.getPesertaSalinan() != a.getPesertaSalinan()));
    }
}

class Kelas {
    private final String nama;
    private final ArrayList<String> peserta = new ArrayList<>();

    Kelas(String nama) {
        this.nama = nama;
    }

    boolean tambah(String mhs) {
        if (peserta.contains(mhs)) {
            return false;
        }
        return peserta.add(mhs);
    }

    int jumlah() {
        return peserta.size();
    }

    String getNama() {
        return nama;
    }

    ArrayList<String> getPesertaLangsung() {
        return peserta;
    }

    ArrayList<String> getPesertaSalinan() {
        return new ArrayList<>(peserta);
    }
}
