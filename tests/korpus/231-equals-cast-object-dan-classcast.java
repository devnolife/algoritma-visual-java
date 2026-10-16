// equals(Object) dengan cast ke kelas sendiri: aman untuk null, tetapi objek kelas lain memicu ClassCastException
public class Main {
    static class Rupiah {
        long nilai;

        Rupiah(long nilai) {
            this.nilai = nilai;
        }

        @Override
        public boolean equals(Object o) {
            if (o == this) {
                return true;
            }
            if (o == null) {
                return false;
            }
            Rupiah r = (Rupiah) o;
            return nilai == r.nilai;
        }

        @Override
        public int hashCode() {
            return (int) (nilai ^ (nilai >>> 32));
        }
    }

    static class Dolar {
        long nilai;

        Dolar(long nilai) {
            this.nilai = nilai;
        }
    }

    public static void main(String[] args) {
        Rupiah a = new Rupiah(5000);
        Rupiah b = new Rupiah(5000);
        Rupiah c = new Rupiah(7500);
        System.out.println("a.equals(b) = " + a.equals(b));
        System.out.println("b.equals(a) = " + b.equals(a));
        System.out.println("a.equals(c) = " + a.equals(c));
        System.out.println("a.equals(a) = " + a.equals(a));
        System.out.println("a.equals(null) = " + a.equals(null));
        System.out.println("hash a = " + a.hashCode() + ", hash c = " + c.hashCode());
        System.out.println("hash besar = " + new Rupiah(10000000000L).hashCode() + ", hash negatif = " + new Rupiah(-1).hashCode());
        Object o = new Dolar(5000);
        System.out.println("o.equals(a) = " + o.equals(a));
        try {
            System.out.println("a.equals(dolar) = " + a.equals(o));
        } catch (ClassCastException e) {
            System.out.println("ClassCastException: " + e.getMessage());
        }
        try {
            System.out.println("a.equals(\"5000\") = " + a.equals("5000"));
        } catch (ClassCastException e) {
            System.out.println("ClassCastException: " + e.getMessage());
        }
        Object p = b;
        Rupiah kembali = (Rupiah) p;
        System.out.println("cast Object ke Rupiah: " + kembali.nilai + ", sama dengan b? " + (kembali == b));
    }
}
