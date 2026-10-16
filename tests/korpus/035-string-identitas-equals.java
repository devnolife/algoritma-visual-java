// == vs equals pada String: literal, konstanta waktu kompilasi, final, new String, concat
public class Main {
    static final String SALAM = "halo";

    public static void main(String[] args) {
        String a = "halo";
        String b = "halo";
        String c = "ha" + "lo";
        final String depan = "ha";
        String d = depan + "lo";
        String belakang = "lo";
        String e = "ha" + belakang;
        char[] huruf = {'h', 'a', 'l', 'o'};
        String f = new String(huruf);
        String g = String.valueOf(huruf);
        System.out.println("a == b       : " + (a == b));
        System.out.println("a == c       : " + (a == c));
        System.out.println("a == d       : " + (a == d));
        System.out.println("a == e       : " + (a == e));
        System.out.println("a == f       : " + (a == f));
        System.out.println("a == g       : " + (a == g));
        System.out.println("a == SALAM   : " + (a == SALAM));
        System.out.println("a.equals(e)  : " + a.equals(e));
        System.out.println("a.equals(f)  : " + a.equals(f));
        System.out.println("f.equals(g)  : " + f.equals(g));
        String h = a;
        System.out.println("h == a       : " + (h == a));
        String i = a.trim();
        System.out.println("a.trim() == a: " + (i == a));
        String j = a.concat("");
        System.out.println("a.concat(\"\") == a: " + (j == a));
        String kosong = "";
        System.out.println("kosong + kosong == \"\" : " + (kosong + kosong == ""));
        String m = "1" + 2;
        System.out.println("\"1\" + 2 == \"12\" : " + (m == "12"));
        int n = 2;
        String o = "1" + n;
        System.out.println("\"1\" + n == \"12\" : " + (o == "12"));
        System.out.println("o.equals(\"12\") : " + o.equals("12"));
        String jawaban = "YA";
        if (jawaban.equals("ya")) {
            System.out.println("equals: cocok");
        } else if (jawaban.equalsIgnoreCase("ya")) {
            System.out.println("equalsIgnoreCase: cocok");
        }
        String nol = null;
        System.out.println("\"halo\".equals(null) : " + "halo".equals(nol));
        System.out.println("nol == null : " + (nol == null));
    }
}
