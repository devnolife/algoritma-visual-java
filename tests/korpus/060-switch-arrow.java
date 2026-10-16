// switch bentuk panah (case X ->) sebagai statement: int, String, char, beberapa label
public class Main {
    public static void main(String[] args) {
        for (int hari = 1; hari <= 8; hari++) {
            switch (hari) {
                case 1, 7 -> System.out.println(hari + ": akhir pekan");
                case 2, 3, 4, 5 -> {
                    String jenis = hari == 5 ? "kerja (Kamis)" : "kerja";
                    System.out.println(hari + ": " + jenis);
                }
                case 6 -> System.out.println(hari + ": Jumat");
                default -> System.out.println(hari + ": hari tidak valid");
            }
        }
        String[] status = {"lulus", "gagal", "tunda", "LULUS"};
        for (String s : status) {
            switch (s) {
                case "lulus" -> System.out.println(s + " -> selamat!");
                case "gagal" -> {
                    System.out.println(s + " -> coba lagi");
                    System.out.println("   (tidak ada fall-through pada bentuk panah)");
                }
                default -> System.out.println(s + " -> status lain");
            }
        }
        char op = '*';
        int a = 6, b = 4;
        int hasil = 0;
        switch (op) {
            case '+' -> hasil = a + b;
            case '-' -> hasil = a - b;
            case '*' -> hasil = a * b;
            case '/' -> hasil = a / b;
        }
        System.out.println(a + " " + op + " " + b + " = " + hasil);
        int skor = 0;
        for (char c : "AABCA".toCharArray()) {
            switch (c) {
                case 'A' -> skor += 3;
                case 'B' -> skor += 2;
                default -> skor++;
            }
        }
        System.out.println("Skor = " + skor);
    }
}
