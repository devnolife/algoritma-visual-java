// Urutan catch dari yang paling spesifik ke umum: blok pertama yang cocok dijalankan, sisanya dilewati
public class Main {
    static void picu(int kode) throws Exception {
        switch (kode) {
            case 1:
                throw new ArrayIndexOutOfBoundsException("indeks 9");
            case 2:
                throw new StringIndexOutOfBoundsException("indeks huruf 4");
            case 3:
                throw new IndexOutOfBoundsException("indeks umum");
            case 4:
                throw new NumberFormatException("bukan angka");
            case 5:
                throw new IllegalArgumentException("argumen");
            case 6:
                throw new Exception("checked biasa");
            default:
                System.out.println("  kode " + kode + " aman");
        }
    }

    public static void main(String[] args) {
        for (int kode = 0; kode <= 6; kode++) {
            try {
                picu(kode);
            } catch (ArrayIndexOutOfBoundsException e) {
                System.out.println("  [AIOOBE] " + e.getMessage());
            } catch (IndexOutOfBoundsException e) {
                System.out.println("  [IOOBE] " + e);
            } catch (NumberFormatException e) {
                System.out.println("  [NFE] " + e.getMessage());
            } catch (RuntimeException e) {
                System.out.println("  [Runtime] " + e);
            } catch (Exception e) {
                System.out.println("  [Exception] " + e);
            } finally {
                System.out.println("selesai kode " + kode);
            }
        }
    }
}
