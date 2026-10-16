// Cache Integer: == bernilai true untuk -128..127 karena objeknya dipakai ulang, false di luar rentang itu; equals selalu membandingkan nilai
public class Main {
    public static void main(String[] args) {
        Integer a = 127;
        Integer b = 127;
        Integer c = 128;
        Integer d = 128;
        System.out.println("127 == 127 : " + (a == b));
        System.out.println("128 == 128 : " + (c == d));
        System.out.println("128 equals : " + c.equals(d));
        Integer e = -128;
        Integer f = -128;
        Integer g = -129;
        Integer h = -129;
        System.out.println("-128 == -128 : " + (e == f) + ", -129 == -129 : " + (g == h));
        Integer v1 = Integer.valueOf(100);
        Integer v2 = Integer.valueOf("100");
        Integer v3 = Integer.valueOf(1000);
        Integer v4 = Integer.valueOf(1000);
        System.out.println("valueOf(100) == valueOf(\"100\") : " + (v1 == v2));
        System.out.println("valueOf(1000) == valueOf(1000) : " + (v3 == v4));
        int primitif = 1000;
        System.out.println("Integer 1000 == int 1000 (unboxing) : " + (v3 == primitif));
        System.out.println("intValue: " + v3.intValue() + ", doubleValue: " + v3.doubleValue() + ", longValue: " + v3.longValue());
        int hitungSama = 0;
        for (int i = 120; i <= 135; i++) {
            Integer x = i;
            Integer y = i;
            if (x == y) {
                hitungSama++;
            } else {
                System.out.println("pertama kali == gagal di " + i);
                break;
            }
        }
        System.out.println("berhasil == sebanyak " + hitungSama + " kali");
        Integer total = 0;
        for (int i = 1; i <= 5; i++) {
            total += i;
        }
        System.out.println("total (Integer dengan +=) = " + total);
    }
}
