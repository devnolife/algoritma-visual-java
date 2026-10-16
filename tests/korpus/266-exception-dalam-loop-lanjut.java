// Memproses daftar perintah kalkulator: perintah yang gagal ditangkap di dalam loop sehingga perintah berikutnya tetap dijalankan
public class Main {
    static int hitung(String perintah) {
        String[] t = perintah.split(" ");
        int a = Integer.parseInt(t[1]);
        int b = Integer.parseInt(t[2]);
        switch (t[0]) {
            case "tambah":
                return a + b;
            case "kali":
                return a * b;
            case "bagi":
                return a / b;
            case "sisa":
                return a % b;
            default:
                throw new UnsupportedOperationException("operasi " + t[0]);
        }
    }

    public static void main(String[] args) {
        String[] perintah = {
            "tambah 2 3", "bagi 10 0", "kali 70000 70000", "pangkat 2 8", "sisa 17 5",
            "tambah 2147483647 1", "kali 4", "bagi 9 x", "sisa -7 3", "sisa 7 0"
        };
        int ok = 0;
        int gagal = 0;
        for (String p : perintah) {
            try {
                int h = hitung(p);
                ok++;
                System.out.println(p + " = " + h);
            } catch (ArithmeticException e) {
                gagal++;
                System.out.println(p + " -> aritmetika: " + e.getMessage());
            } catch (RuntimeException e) {
                gagal++;
                System.out.println(p + " -> " + e);
            }
        }
        System.out.println(ok + " berhasil, " + gagal + " gagal");
    }
}
