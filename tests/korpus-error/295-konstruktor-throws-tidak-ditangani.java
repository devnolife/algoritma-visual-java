// Error: konstruktor mendeklarasikan throws exception checked tetapi objek dibuat tanpa try-catch (unreported exception FormatSalahException; must be caught or declared to be thrown)
public class Main {
    public static void main(String[] args) {
        Tanggal t = new Tanggal("2024-13-01");
        System.out.println(t.bulan);
    }
}

class FormatSalahException extends Exception {
    FormatSalahException(String pesan) {
        super(pesan);
    }
}

class Tanggal {
    int bulan;

    Tanggal(String teks) throws FormatSalahException {
        bulan = Integer.parseInt(teks.substring(5, 7));
        if (bulan < 1 || bulan > 12) {
            throw new FormatSalahException("bulan " + bulan + " tidak valid");
        }
    }
}
