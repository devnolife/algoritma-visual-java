// Menghitung kata, kalimat, dan karakter tanpa spasi pada sebuah paragraf
public class Main {
    public static void main(String[] args) {
        String paragraf = "Java adalah bahasa pemrograman. Java banyak dipakai! Apakah kamu suka Java?";
        String[] kata = paragraf.split("\\s+");
        System.out.println("Jumlah kata: " + kata.length);
        int kalimat = 0;
        int tanpaSpasi = 0;
        for (int i = 0; i < paragraf.length(); i++) {
            char c = paragraf.charAt(i);
            if (c == '.' || c == '!' || c == '?') {
                kalimat++;
            }
            if (c != ' ') {
                tanpaSpasi++;
            }
        }
        System.out.println("Jumlah kalimat: " + kalimat);
        System.out.println("Karakter tanpa spasi: " + tanpaSpasi);
        int java = 0;
        for (String k : kata) {
            String bersih = k.replace(".", "").replace("!", "").replace("?", "");
            if (bersih.equals("Java")) {
                java++;
            }
        }
        System.out.println("Kata 'Java' muncul " + java + " kali");
        String[] kalimatList = paragraf.split("[.!?]");
        System.out.println("Potongan kalimat: " + kalimatList.length);
        for (String k : kalimatList) {
            System.out.println("- [" + k.trim() + "]");
        }
    }
}
