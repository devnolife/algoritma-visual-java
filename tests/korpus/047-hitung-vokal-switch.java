// Menghitung vokal dan konsonan dengan switch char (fall-through untuk beberapa case)
public class Main {
    static boolean vokal(char c) {
        switch (Character.toLowerCase(c)) {
            case 'a':
            case 'i':
            case 'u':
            case 'e':
            case 'o':
                return true;
            default:
                return false;
        }
    }

    public static void main(String[] args) {
        String kalimat = "Belajar Algoritma Itu Asyik dan Menantang";
        int jumlahVokal = 0;
        int jumlahKonsonan = 0;
        int[] perVokal = new int[5];
        String daftarVokal = "aiueo";
        for (int i = 0; i < kalimat.length(); i++) {
            char c = kalimat.charAt(i);
            if (!Character.isLetter(c)) {
                continue;
            }
            if (vokal(c)) {
                jumlahVokal++;
                perVokal[daftarVokal.indexOf(Character.toLowerCase(c))]++;
            } else {
                jumlahKonsonan++;
            }
        }
        System.out.println("Kalimat  : " + kalimat);
        System.out.println("Vokal    : " + jumlahVokal);
        System.out.println("Konsonan : " + jumlahKonsonan);
        for (int i = 0; i < 5; i++) {
            System.out.println("  " + daftarVokal.charAt(i) + " = " + perVokal[i]);
        }
    }
}
