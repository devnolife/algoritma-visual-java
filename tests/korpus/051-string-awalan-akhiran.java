// startsWith, endsWith, equalsIgnoreCase untuk memeriksa nama berkas dan kode
public class Main {
    public static void main(String[] args) {
        String[] berkas = {"laporan.PDF", "foto_liburan.jpg", "tugas1.java", "Main.JAVA", "catatan.txt", "data.csv.bak", "README"};
        int jumlahJava = 0;
        for (String b : berkas) {
            String kecil = b.toLowerCase();
            String jenis;
            if (kecil.endsWith(".java")) {
                jenis = "kode Java";
                jumlahJava++;
            } else if (kecil.endsWith(".pdf") || kecil.endsWith(".txt")) {
                jenis = "dokumen";
            } else if (kecil.endsWith(".jpg")) {
                jenis = "gambar";
            } else if (!b.contains(".")) {
                jenis = "tanpa ekstensi";
            } else {
                jenis = "lainnya (" + b.substring(b.lastIndexOf('.') + 1) + ")";
            }
            System.out.printf("%-18s : %s%n", b, jenis);
        }
        System.out.println("Berkas Java: " + jumlahJava);
        String[] kode = {"MK-101", "mk-202", "TI-303", "MK303", "MK-"};
        for (String k : kode) {
            boolean valid = k.startsWith("MK-") && k.length() == 6;
            System.out.println(k + " valid? " + valid + ", diawali mk (abaikan kapital)? "
                    + k.substring(0, 2).equalsIgnoreCase("mk"));
        }
        String url = "https://kampus.ac.id/jadwal";
        System.out.println("Aman? " + url.startsWith("https://"));
        System.out.println("Domain kampus? " + url.substring(8).startsWith("kampus"));
    }
}
