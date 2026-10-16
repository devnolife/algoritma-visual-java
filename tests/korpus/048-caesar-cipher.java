// Caesar cipher: enkripsi dan dekripsi dengan aritmetika char dan modulo
public class Main {
    static String geser(String teks, int kunci) {
        String hasil = "";
        kunci = ((kunci % 26) + 26) % 26;
        for (char c : teks.toCharArray()) {
            if (c >= 'a' && c <= 'z') {
                hasil += (char) ('a' + (c - 'a' + kunci) % 26);
            } else if (c >= 'A' && c <= 'Z') {
                hasil += (char) ('A' + (c - 'A' + kunci) % 26);
            } else {
                hasil += c;
            }
        }
        return hasil;
    }

    public static void main(String[] args) {
        String pesan = "Serang Benteng Pukul 9, Zona X!";
        int kunci = 3;
        String sandi = geser(pesan, kunci);
        String asli = geser(sandi, -kunci);
        System.out.println("Pesan   : " + pesan);
        System.out.println("Sandi   : " + sandi);
        System.out.println("Dekripsi: " + asli);
        System.out.println("Sama?   : " + pesan.equals(asli));
        System.out.println("ROT13   : " + geser("Halo Dunia", 13));
        System.out.println("ROT13x2 : " + geser(geser("Halo Dunia", 13), 13));
        System.out.println("Kunci 29: " + geser("abc xyz", 29));
        System.out.println("Kunci -1: " + geser("abc", -1));
    }
}
