// Error: blok try berdiri sendiri tanpa catch atau finally ('try' without 'catch', 'finally' or resource declarations)
public class Main {
    public static void main(String[] args) {
        String teks = "42";
        try {
            int angka = Integer.parseInt(teks);
            System.out.println(angka * 2);
        }
        System.out.println("selesai");
    }
}
