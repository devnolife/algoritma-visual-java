// NumberFormatException: Double.parseDouble pada teks "x"
public class Main {
    public static void main(String[] args) {
        String[] masukan = {"3.5", "1e2", "-0.25", "x", "4"};
        System.out.println("parseDouble(\" 7.5 \") = " + Double.parseDouble(" 7.5 "));
        System.out.println("parseDouble(\"-Infinity\") = " + Double.parseDouble("-Infinity"));
        double total = 0;
        for (String m : masukan) {
            double d = Double.parseDouble(m);
            total += d;
            System.out.println(m + " -> " + d + ", total " + total);
        }
        System.out.println("tidak tercetak");
    }
}
