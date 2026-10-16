// Wrapper Boolean: parseBoolean hanya mengenali "true" (huruf besar/kecil bebas), Boolean.TRUE dipakai ulang, dan Boolean null di if memicu NPE
public class Main {
    static Boolean cekLulus(int nilai) {
        if (nilai < 0) {
            return null;
        }
        return nilai >= 60;
    }

    public static void main(String[] args) {
        String[] teks = {"true", "TRUE", "True", "yes", "1", "", "false"};
        for (String t : teks) {
            System.out.println("parseBoolean(\"" + t + "\") = " + Boolean.parseBoolean(t) + ", valueOf = " + Boolean.valueOf(t));
        }
        Boolean a = true;
        Boolean b = Boolean.valueOf(true);
        System.out.println("a == Boolean.TRUE : " + (a == Boolean.TRUE) + ", b == a : " + (b == a));
        System.out.println("booleanValue " + a.booleanValue() + ", toString " + Boolean.toString(false) + ", compareTo(false) " + a.compareTo(false));
        System.out.println("logika: " + (a && !Boolean.FALSE) + " " + (a ^ b) + " " + (Boolean.TRUE | Boolean.FALSE));
        int[] nilai = {75, 40, -1};
        for (int n : nilai) {
            Boolean lulus = cekLulus(n);
            System.out.println("nilai " + n + " lulus? " + lulus);
        }
        int hitungLulus = 0;
        for (int n : nilai) {
            if (cekLulus(n)) {
                hitungLulus++;
            }
        }
        System.out.println("tidak tercetak " + hitungLulus);
    }
}
