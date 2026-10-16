// Multi-catch (A | B) menangani beberapa jenis exception dengan satu blok; jenis lain jatuh ke catch berikutnya
public class Main {
    static int ambil(String[] perintah, int i) {
        String p = perintah[i];
        int angka = Integer.parseInt(p.substring(1));
        int[] tabel = {10, 20, 30};
        switch (p.charAt(0)) {
            case 'b':
                return 60 / angka;
            case 't':
                return tabel[angka];
            case 'n':
                String s = null;
                return s.length();
            default:
                throw new IllegalStateException("perintah tidak dikenal: " + p);
        }
    }

    public static void main(String[] args) {
        String[] perintah = {"b3", "b0", "t2", "t5", "xq", "n1", "z1", "t-1"};
        for (int i = 0; i <= perintah.length; i++) {
            try {
                System.out.println("perintah " + i + " -> " + ambil(perintah, i));
            } catch (ArithmeticException | ArrayIndexOutOfBoundsException e) {
                System.out.println("perintah " + i + " gagal hitung: " + e);
            } catch (NumberFormatException | NullPointerException e) {
                System.out.println("perintah " + i + " gagal baca: " + e.getMessage());
            } catch (RuntimeException e) {
                System.out.println("perintah " + i + " lainnya: " + e);
            }
        }
    }
}
