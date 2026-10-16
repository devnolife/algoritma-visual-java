// String tidak bisa diubah sedangkan StringBuilder bisa: method yang menerima StringBuilder mengubah objek milik pemanggil
public class Main {
    static void tambahString(String s) {
        s += " dunia";
        System.out.println("  di dalam method: " + s);
    }

    static void tambahBuilder(StringBuilder sb) {
        sb.append(" dunia");
        System.out.println("  di dalam method: " + sb);
    }

    static void gantiBuilder(StringBuilder sb) {
        sb = new StringBuilder("baru");
        sb.append(" sekali");
    }

    public static void main(String[] args) {
        String s = "halo";
        tambahString(s);
        System.out.println("String setelah method: " + s);
        StringBuilder sb = new StringBuilder("halo");
        tambahBuilder(sb);
        System.out.println("StringBuilder setelah method: " + sb);
        gantiBuilder(sb);
        System.out.println("setelah gantiBuilder: " + sb);
        String potret = sb.toString();
        sb.append("!!!");
        System.out.println("potret toString tetap: " + potret + ", builder kini: " + sb);
        String t = "a";
        String u = t;
        t = t + "b";
        System.out.println("t = " + t + ", u = " + u);
        StringBuilder x = new StringBuilder("a");
        StringBuilder y = x;
        x.append("b");
        System.out.println("x = " + x + ", y = " + y + ", x == y: " + (x == y));
        String upper = s.toUpperCase();
        System.out.println("toUpperCase tidak mengubah s: " + s + " -> " + upper);
    }
}
