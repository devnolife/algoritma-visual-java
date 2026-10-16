// Error: equals(Object) di-override dengan tipe kembalian int (equals(Object) in Pecahan cannot override equals(Object) in Object)
public class Main {
    public static void main(String[] args) {
        Pecahan a = new Pecahan(1, 2);
        Pecahan b = new Pecahan(2, 4);
        System.out.println(a.equals(b));
    }
}

class Pecahan {
    int atas;
    int bawah;

    Pecahan(int atas, int bawah) {
        this.atas = atas;
        this.bawah = bawah;
    }

    public int equals(Object o) {
        Pecahan p = (Pecahan) o;
        return atas * p.bawah - p.atas * bawah;
    }
}
