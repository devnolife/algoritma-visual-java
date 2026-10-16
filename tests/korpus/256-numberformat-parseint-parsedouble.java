// NumberFormatException dari Integer.parseInt dan Double.parseDouble untuk berbagai teks; yang terakhir tidak ditangkap
public class Main {
    public static void main(String[] args) {
        String[] masukan = {"42", "-17", "+8", "abc", "", " 5", "3.5", "2147483648", "0x1F", "007"};
        int total = 0;
        for (String m : masukan) {
            try {
                int n = Integer.parseInt(m);
                total += n;
                System.out.println("\"" + m + "\" -> " + n);
            } catch (NumberFormatException e) {
                System.out.println("\"" + m + "\" ditolak: " + e.getMessage());
            }
        }
        System.out.println("total = " + total);
        String[] pecahan = {"3.5", "1e3", "abc", "-0.0", " 2.5 "};
        for (String p : pecahan) {
            try {
                System.out.println(p + " -> " + Double.parseDouble(p));
            } catch (NumberFormatException e) {
                System.out.println(p + " ditolak: " + e);
            }
        }
        int umur = Integer.parseInt("dua puluh");
        System.out.println("tidak tercetak " + umur);
    }
}
