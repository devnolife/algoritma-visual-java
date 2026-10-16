// Stack trace dari method kelas bersarang static (Main$Gudang) dan kelas inner di dalamnya (Main$Gudang$Rak)
public class Main {
    static class Gudang {
        String nama;
        Rak[] rak = new Rak[2];

        Gudang(String nama) {
            this.nama = nama;
            rak[0] = new Rak(3);
            rak[1] = new Rak(1);
        }

        class Rak {
            int[] isi;

            Rak(int kapasitas) {
                isi = new int[kapasitas];
            }

            int ambil(int posisi) {
                System.out.println("  " + nama + ": ambil posisi " + posisi + " dari rak berkapasitas " + isi.length);
                return isi[posisi];
            }
        }

        int ambil(int r, int posisi) {
            return rak[r].ambil(posisi);
        }
    }

    public static void main(String[] args) {
        Gudang g = new Gudang("Gudang Utama");
        g.rak[0].isi[2] = 42;
        System.out.println("hasil " + g.ambil(0, 2));
        System.out.println("hasil " + g.ambil(1, 0));
        System.out.println("hasil " + g.ambil(1, 1));
    }
}
