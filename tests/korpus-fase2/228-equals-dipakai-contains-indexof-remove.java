// equals(Object) yang di-override dipakai contains, indexOf, lastIndexOf, remove(Object), dan List.equals; cetakan menunjukkan siapa memanggil siapa
import java.util.ArrayList;

public class Main {
    static class Kartu {
        String nim;
        String nama;

        Kartu(String nim, String nama) {
            this.nim = nim;
            this.nama = nama;
        }

        @Override
        public boolean equals(Object o) {
            if (o == null) {
                System.out.println("    " + nama + ".equals(null)");
                return false;
            }
            Kartu lain = (Kartu) o;
            System.out.println("    " + nama + ".equals(" + lain.nama + ")");
            return nim.equals(lain.nim);
        }

        @Override
        public int hashCode() {
            return nim.hashCode();
        }

        @Override
        public String toString() {
            return nama;
        }
    }

    public static void main(String[] args) {
        ArrayList<Kartu> antrian = new ArrayList<>();
        antrian.add(new Kartu("101", "Ani"));
        antrian.add(new Kartu("102", "Budi"));
        antrian.add(null);
        antrian.add(new Kartu("103", "Cici"));
        antrian.add(new Kartu("102", "Budi-lagi"));
        Kartu dicari = new Kartu("102", "Kunci");
        System.out.println("contains:");
        System.out.println("  hasil " + antrian.contains(dicari));
        System.out.println("indexOf:");
        System.out.println("  hasil " + antrian.indexOf(dicari));
        System.out.println("lastIndexOf:");
        System.out.println("  hasil " + antrian.lastIndexOf(dicari));
        System.out.println("indexOf kartu yang tidak ada:");
        System.out.println("  hasil " + antrian.indexOf(new Kartu("999", "Hantu")));
        System.out.println("indexOf(null): " + antrian.indexOf(null));
        System.out.println("remove(Object):");
        System.out.println("  hasil " + antrian.remove(dicari) + ", sekarang " + antrian);
        System.out.println("equals antar list:");
        ArrayList<Kartu> salinan = new ArrayList<>(antrian);
        salinan.set(0, new Kartu("101", "Ani-baru"));
        System.out.println("  hasil " + antrian.equals(salinan));
    }
}
