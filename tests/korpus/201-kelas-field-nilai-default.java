// Nilai default field objek: angka 0, boolean false, char '\u0000', referensi null, termasuk elemen array objek
public class Main {
    static class Mahasiswa {
        String nama;
        int umur;
        double ipk;
        boolean aktif;
        char golongan;
        long nim;
        int[] nilai;
        Mahasiswa sahabat;
    }

    public static void main(String[] args) {
        Mahasiswa m = new Mahasiswa();
        System.out.println("nama    = " + m.nama);
        System.out.println("umur    = " + m.umur);
        System.out.println("ipk     = " + m.ipk);
        System.out.println("aktif   = " + m.aktif);
        System.out.println("golongan (kode) = " + (int) m.golongan);
        System.out.println("nim     = " + m.nim);
        System.out.println("nilai   = " + m.nilai);
        System.out.println("sahabat = " + m.sahabat);
        System.out.println("nama == null? " + (m.nama == null));
        m.nama = "Sari";
        m.umur = 19;
        m.ipk = 3.75;
        m.aktif = true;
        m.golongan = 'B';
        m.nilai = new int[3];
        System.out.println("Setelah diisi: " + m.nama + ", " + m.umur + ", " + m.ipk + ", " + m.aktif + ", " + m.golongan);
        System.out.println("panjang nilai = " + m.nilai.length + ", nilai[0] = " + m.nilai[0]);
        Mahasiswa[] kelas = new Mahasiswa[3];
        kelas[1] = m;
        for (int i = 0; i < kelas.length; i++) {
            if (kelas[i] == null) {
                System.out.println("kelas[" + i + "] = null");
            } else {
                System.out.println("kelas[" + i + "] = " + kelas[i].nama);
            }
        }
        double[] berat = new double[2];
        boolean[] hadir = new boolean[2];
        String[] kota = new String[2];
        System.out.println(berat[0] + " " + hadir[1] + " " + kota[0]);
    }
}
