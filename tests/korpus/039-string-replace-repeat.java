// replace karakter dan teks, repeat, concat, toUpperCase, toLowerCase
public class Main {
    public static void main(String[] args) {
        String s = "banana";
        System.out.println(s.replace('a', 'o'));
        System.out.println(s.replace("an", "AN"));
        System.out.println(s.replace("na", ""));
        System.out.println("aaa".replace("aa", "b"));
        System.out.println(s.replace("x", "y"));
        System.out.println(s.replace("", "-"));
        System.out.println("asli tidak berubah: " + s);
        System.out.println("[" + "ab".repeat(3) + "]");
        System.out.println("[" + "ab".repeat(0) + "]");
        System.out.println("=".repeat(20));
        String nama = "budi";
        String sapaan = "Halo, ".concat(nama).concat("!");
        System.out.println(sapaan);
        System.out.println(sapaan.toUpperCase());
        System.out.println("JAVA Itu Seru".toLowerCase());
        String kalimat = "Saya suka kopi. Kopi itu enak. kopi!";
        System.out.println(kalimat.replace("kopi", "teh"));
        String nomor = "0812-3456-7890";
        System.out.println(nomor.replace("-", ""));
        System.out.println(nomor.replace('-', ' '));
        String jalur = "a.b.c";
        System.out.println(jalur.replace(".", "/"));
        for (int i = 1; i <= 4; i++) {
            System.out.println(" ".repeat(4 - i) + "*".repeat(2 * i - 1));
        }
        String kata = "Mississippi";
        int sebelum = kata.length();
        int sesudah = kata.replace("s", "").length();
        System.out.println("Jumlah huruf s = " + (sebelum - sesudah));
        String judul = "pemrograman dasar";
        String kapital = judul.substring(0, 1).toUpperCase() + judul.substring(1);
        System.out.println(kapital);
    }
}
