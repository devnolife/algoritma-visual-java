// toString() dipakai otomatis oleh println, konkatenasi, String.valueOf, StringBuilder.append, dan printf %s; referensi null tercetak "null"
public class Main {
    static class Uang {
        long sen;
        String mataUang;

        Uang(long sen, String mataUang) {
            this.sen = sen;
            this.mataUang = mataUang;
        }

        @Override
        public String toString() {
            return mataUang + " " + (sen / 100) + "." + (sen % 100 < 10 ? "0" : "") + (sen % 100);
        }
    }

    public static void main(String[] args) {
        Uang a = new Uang(125050, "IDR");
        Uang b = new Uang(905, "USD");
        Uang kosong = null;
        System.out.println(a);
        System.out.println("Saldo: " + b);
        System.out.println(a + " dan " + b);
        String s = String.valueOf(a);
        System.out.println("valueOf: " + s + " (panjang " + s.length() + ")");
        System.out.printf("printf: [%s] [%12s] [%-12s]%n", b, b, b);
        System.out.println("null: " + kosong);
        System.out.println(kosong);
        Object o = a;
        System.out.println("lewat Object: " + o.toString());
        StringBuilder sb = new StringBuilder();
        sb.append(a).append(" | ").append(b).append(" | ").append(kosong);
        System.out.println(sb);
        char[] huruf = {'o', 'k'};
        System.out.println(huruf);
        System.out.println("total " + 1 + 2 + " vs " + (1 + 2) + " " + a.sen);
    }
}
