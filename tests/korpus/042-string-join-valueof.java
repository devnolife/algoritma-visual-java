// String.join dengan array dan varargs, String.valueOf berbagai tipe
public class Main {
    public static void main(String[] args) {
        String[] hari = {"Senin", "Selasa", "Rabu"};
        System.out.println(String.join(", ", hari));
        System.out.println(String.join("-", "a", "b", "c"));
        System.out.println(String.join("", hari));
        System.out.println("[" + String.join(", ", new String[0]) + "]");
        System.out.println(String.join(" | ", "satu"));
        System.out.println(String.valueOf(42) + 1);
        System.out.println(String.valueOf(3.0) + "|" + String.valueOf(2.5f) + "|" + String.valueOf(7L));
        System.out.println(String.valueOf('x') + String.valueOf(true));
        char[] cs = {'o', 'k'};
        System.out.println(String.valueOf(cs) + "!");
        String angka = "" + 12 + 3.5;
        System.out.println(angka);
        System.out.println(Integer.toString(255) + Double.toString(0.5));
        String[] tanggal = {"17", "08", "1945"};
        String gabung = String.join("/", tanggal);
        System.out.println("Tanggal: " + gabung + " (" + gabung.length() + " karakter)");
        String kosong = null;
        System.out.println(String.valueOf(kosong));
        String[] campur = {"a", null, "c"};
        System.out.println(String.join("+", campur));
        System.out.println("abc".toString() + "def".concat("g"));
    }
}
