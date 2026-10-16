// Error: menangkap exception checked buatan yang tidak mungkin dilempar oleh isi try (exception DataRusakException is never thrown in body of corresponding try statement)
public class Main {
    static class DataRusakException extends Exception {
        DataRusakException(String pesan) {
            super(pesan);
        }
    }

    static int hitung(int a, int b) {
        return a * b;
    }

    public static void main(String[] args) {
        try {
            System.out.println(hitung(6, 7));
        } catch (DataRusakException e) {
            System.out.println("rusak: " + e.getMessage());
        }
    }
}
