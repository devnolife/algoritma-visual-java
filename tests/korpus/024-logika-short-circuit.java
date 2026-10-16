// Evaluasi short-circuit && || dibanding & | dengan efek samping
public class Main {
    static int panggilan = 0;

    static boolean cek(String nama, boolean hasil) {
        panggilan++;
        System.out.println("  cek " + nama + " -> " + hasil);
        return hasil;
    }

    public static void main(String[] args) {
        System.out.println("false && ...");
        boolean a = cek("A", false) && cek("B", true);
        System.out.println("hasil = " + a);
        System.out.println("true || ...");
        boolean b = cek("C", true) || cek("D", false);
        System.out.println("hasil = " + b);
        System.out.println("false & ...");
        boolean c = cek("E", false) & cek("F", true);
        System.out.println("hasil = " + c);
        System.out.println("true | ...");
        boolean d = cek("G", true) | cek("H", false);
        System.out.println("hasil = " + d);
        System.out.println("true ^ true = " + (true ^ true));
        System.out.println("Jumlah panggilan = " + panggilan);
        int x = 0;
        boolean aman = x != 0 && 10 / x > 1;
        System.out.println("Aman dari pembagian nol: " + aman);
        int i = 0;
        boolean e = (i++ > 0) && (i++ > 0);
        System.out.println("i setelah && = " + i + ", e = " + e);
        int j = 0;
        boolean f = (j++ > 0) & (j++ > 0);
        System.out.println("j setelah &  = " + j + ", f = " + f);
        boolean p = true, q = false, r = true;
        System.out.println("p || q && false   = " + (p || q && false));
        System.out.println("(p || q) && false = " + ((p || q) && false));
        System.out.println("!(p && q) == (!p || !q) : " + (!(p && q) == (!p || !q)));
        System.out.println("!p ^ r = " + (!p ^ r));
        boolean flag = false;
        flag |= true;
        flag &= r;
        flag ^= true;
        System.out.println("flag = " + flag);
        if (cek("I", true) || cek("J", true) && cek("K", false)) {
            System.out.println("cabang if dijalankan");
        }
    }
}
