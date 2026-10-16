// Error: exception buatan tanpa konstruktor (String) dibuat dengan pesan (constructor StokHabisException in class StokHabisException cannot be applied to given types;)
public class Main {
    static class StokHabisException extends RuntimeException {
    }

    static int ambil(int stok) {
        if (stok == 0) {
            throw new StokHabisException("stok habis");
        }
        return stok - 1;
    }

    public static void main(String[] args) {
        System.out.println(ambil(3));
    }
}
