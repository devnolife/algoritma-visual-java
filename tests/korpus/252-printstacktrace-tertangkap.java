// printStackTrace mencetak ke stderr (nama exception, pesan, baris "at ..."), lalu program tetap berjalan dan selesai normal
public class Main {
    static class DataRusakException extends Exception {
        DataRusakException(String pesan) {
            super(pesan);
        }
    }

    static int parseNilai(String s) throws DataRusakException {
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException e) {
            throw new DataRusakException("nilai '" + s + "' bukan angka");
        }
    }

    static int rataRata(String[] data) throws DataRusakException {
        int total = 0;
        for (String d : data) {
            total += parseNilai(d);
        }
        return total / data.length;
    }

    public static void main(String[] args) {
        String[][] kelas = {{"80", "90", "70"}, {"85", "x", "95"}, {}};
        for (String[] k : kelas) {
            try {
                System.out.println("rata-rata = " + rataRata(k));
            } catch (DataRusakException e) {
                System.out.println("data rusak, lihat stderr");
                e.printStackTrace();
            } catch (ArithmeticException e) {
                System.out.println("kelas kosong");
                e.printStackTrace();
            }
        }
        System.out.println("program selesai normal");
    }
}
