// HashMap<String, Double> dengan 60 kunci "M001".."M060": urutan iterasi sebelum dan sesudah tabel diperbesar, serta pencarian nilai
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        HashMap<String, Double> ipk = new HashMap<>();
        for (int i = 1; i <= 60; i++) {
            String nim = String.format("M%03d", i);
            double nilai = 2.0 + (i * 7 % 21) / 10.0;
            ipk.put(nim, nilai);
            if (i == 12 || i == 13 || i == 25 || i == 49 || i == 60) {
                System.out.println("size " + i + ": " + ipk.keySet());
            }
        }
        String terbaik = null;
        for (String k : ipk.keySet()) {
            if (terbaik == null || ipk.get(k) > ipk.get(terbaik)) {
                terbaik = k;
            }
        }
        System.out.println("IPK tertinggi pertama yang ditemukan: " + terbaik + " = " + ipk.get(terbaik));
        int diAtas3 = 0;
        for (double v : ipk.values()) {
            if (v >= 3.0) {
                diAtas3++;
            }
        }
        System.out.println(diAtas3 + " mahasiswa ber-IPK >= 3.0; M007 = " + ipk.get("M007") + ", M061 = " + ipk.get("M061"));
    }
}
