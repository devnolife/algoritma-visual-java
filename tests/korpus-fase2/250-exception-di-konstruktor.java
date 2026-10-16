// Exception di dalam konstruktor: objek tidak jadi dibuat (variabel tetap null); rantai this(...) ikut tercetak di stack trace
public class Main {
    static class Pecahan {
        int atas;
        int bawah;

        Pecahan(int atas, int bawah) {
            if (bawah == 0) {
                throw new ArithmeticException("penyebut tidak boleh nol");
            }
            this.atas = atas;
            this.bawah = bawah;
        }

        Pecahan(int bulat) {
            this(bulat, 1);
        }

        Pecahan(String teks) {
            this(Integer.parseInt(teks.substring(0, teks.indexOf('/'))), Integer.parseInt(teks.substring(teks.indexOf('/') + 1)));
        }

        @Override
        public String toString() {
            return atas + "/" + bawah;
        }
    }

    public static void main(String[] args) {
        Pecahan p = null;
        try {
            p = new Pecahan(3, 0);
        } catch (ArithmeticException e) {
            System.out.println("gagal: " + e.getMessage() + ", p = " + p);
        }
        p = new Pecahan(5);
        System.out.println("p = " + p);
        String[] teks = {"2/3", "7/x", "4/0"};
        for (String t : teks) {
            try {
                System.out.println(t + " -> " + new Pecahan(t));
            } catch (NumberFormatException e) {
                System.out.println(t + " -> format salah: " + e.getMessage());
            } catch (ArithmeticException e) {
                System.out.println(t + " -> " + e.getMessage());
            }
        }
        Pecahan q = new Pecahan("9/0");
        System.out.println("tidak tercetak " + q);
    }
}
