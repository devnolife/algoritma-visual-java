// Error: super(pesan) bukan pernyataan pertama di konstruktor exception buatan (call to super must be first statement in constructor)
public class Main {
    static class NilaiTidakValidException extends Exception {
        NilaiTidakValidException(int nilai) {
            String pesan = "nilai " + nilai + " tidak valid";
            super(pesan);
        }
    }

    public static void main(String[] args) {
        try {
            throw new NilaiTidakValidException(120);
        } catch (NilaiTidakValidException e) {
            System.out.println(e.getMessage());
        }
    }
}
