// Pemeriksaan palindrom kata dan kalimat (abaikan spasi dan huruf besar)
public class Main {
    static boolean palindrom(String teks) {
        int kiri = 0;
        int kanan = teks.length() - 1;
        while (kiri < kanan) {
            if (teks.charAt(kiri) != teks.charAt(kanan)) {
                return false;
            }
            kiri++;
            kanan--;
        }
        return true;
    }

    static String bersihkan(String teks) {
        String hasil = "";
        for (int i = 0; i < teks.length(); i++) {
            char c = Character.toLowerCase(teks.charAt(i));
            if (Character.isLetterOrDigit(c)) {
                hasil += c;
            }
        }
        return hasil;
    }

    public static void main(String[] args) {
        String[] kata = {"katak", "kodok", "malam", "Ira", "", "a", "level", "java"};
        for (String k : kata) {
            System.out.println("\"" + k + "\" palindrom? " + palindrom(k));
        }
        String kalimat = "Kasur ini rusak";
        String bersih = bersihkan(kalimat);
        System.out.println("Bersih: " + bersih + " -> " + palindrom(bersih));
        String kalimat2 = "Never odd or even!";
        System.out.println(kalimat2 + " -> " + palindrom(bersihkan(kalimat2)));
        int angka = 12321;
        System.out.println(angka + " palindrom? " + palindrom(String.valueOf(angka)));
    }
}
