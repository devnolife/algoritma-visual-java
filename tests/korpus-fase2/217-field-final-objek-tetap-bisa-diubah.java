// Field final tidak bisa diganti, tetapi objek yang ditunjuknya (array, StringBuilder) tetap bisa diubah isinya
public class Main {
    static final int MAKS_PESERTA = 3;
    static final String[] HARI = {"Senin", "Rabu", "Jumat"};

    static class Kelas {
        final String kode;
        final int kapasitas;
        final String[] peserta;
        final StringBuilder log = new StringBuilder();
        int terisi;

        Kelas(String kode, int kapasitas) {
            this.kode = kode;
            this.kapasitas = kapasitas;
            this.peserta = new String[kapasitas];
        }

        boolean daftar(String nama) {
            if (terisi == kapasitas) {
                log.append("tolak ").append(nama).append("; ");
                return false;
            }
            peserta[terisi] = nama;
            terisi++;
            log.append("terima ").append(nama).append("; ");
            return true;
        }
    }

    public static void main(String[] args) {
        Kelas k = new Kelas("IF-101", MAKS_PESERTA);
        String[] calon = {"Ali", "Beni", "Caca", "Dodi"};
        for (String c : calon) {
            System.out.println("daftar " + c + ": " + k.daftar(c));
        }
        System.out.println("kode " + k.kode + ", kapasitas " + k.kapasitas + ", terisi " + k.terisi);
        System.out.println("log: " + k.log);
        k.peserta[0] = "Ali Akbar";
        System.out.println("peserta[0] = " + k.peserta[0]);
        HARI[1] = "Kamis";
        System.out.println("jadwal: " + String.join(", ", HARI));
        k.log.replace(0, k.log.length(), "log dikosongkan");
        System.out.println(k.log);
    }
}
