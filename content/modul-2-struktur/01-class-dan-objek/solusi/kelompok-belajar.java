class Mahasiswa {
    String nama;
    int umur;
    double ipk;
    boolean aktif;
}

public class Main {
    public static void main(String[] args) {
        Mahasiswa ani = new Mahasiswa();   // #baru
        System.out.println(ani.nama + " " + ani.umur + " " + ani.ipk + " " + ani.aktif);
        ani.nama = "Ani";
        ani.umur = 19;
        ani.ipk = 3.5;
        ani.aktif = true;

        Mahasiswa budi = new Mahasiswa();
        budi.nama = "Budi";
        budi.umur = 20;

        int umurBudi = budi.umur;
        umurBudi = 21;
        System.out.println("umurBudi = " + umurBudi + ", budi.umur = " + budi.umur);

        Mahasiswa ketua = ani;   // #alias
        ketua.ipk = 3.9;
        System.out.println(ani.nama + ": IPK " + ani.ipk);
        System.out.println("ketua == ani? " + (ketua == ani));

        Mahasiswa wakil = null;   // #null
        if (wakil != null) {
            System.out.println("Wakil: " + wakil.nama);
        } else {
            System.out.println("Wakil belum dipilih");
        }

        Mahasiswa[] kelompok = new Mahasiswa[3];
        kelompok[0] = ani;
        kelompok[1] = budi;
        for (int i = 0; i < kelompok.length; i++) {
            if (kelompok[i] != null) {
                System.out.println("Anggota " + (i + 1) + ": " + kelompok[i].nama);
            } else {
                System.out.println("Anggota " + (i + 1) + ": (kosong)");
            }
        }
    }
}
