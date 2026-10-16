// trim, strip, isEmpty, isBlank pada string berisi spasi, tab, dan newline
public class Main {
    public static void main(String[] args) {
        String[] data = {"", "   ", " \t halo dunia \n ", "teks", "\t"};
        for (String s : data) {
            System.out.println("[" + s.trim() + "] trim=" + s.trim().length()
                    + " strip=" + s.strip().length()
                    + " asli=" + s.length()
                    + " isEmpty=" + s.isEmpty()
                    + " isBlank=" + s.isBlank());
        }
        String masukan = "   Budi Santoso   ";
        String bersih = masukan.trim();
        System.out.println("Sebelum: [" + masukan + "] (" + masukan.length() + ")");
        System.out.println("Sesudah: [" + bersih + "] (" + bersih.length() + ")");
        System.out.println("Kosong setelah trim? " + "    ".trim().isEmpty());
        String kode = "  ab12  ".trim().toUpperCase();
        System.out.println("Kode: " + kode);
        String tengah = "a   b";
        System.out.println("trim tidak menghapus spasi tengah: [" + tengah.trim() + "]");
        String[] isian = {"Andi", "  ", "", "Sari "};
        int valid = 0;
        for (String nama : isian) {
            if (!nama.isBlank()) {
                valid++;
                System.out.println("Nama valid: [" + nama.strip() + "]");
            }
        }
        System.out.println("Jumlah valid: " + valid);
    }
}
