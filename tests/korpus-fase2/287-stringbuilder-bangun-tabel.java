// Membangun keluaran besar dengan StringBuilder di dalam loop: tabel perkalian rata kanan dan pola segitiga, dicetak sekali di akhir
public class Main {
    static String rataKanan(int nilai, int lebar) {
        StringBuilder sb = new StringBuilder();
        String s = String.valueOf(nilai);
        for (int i = s.length(); i < lebar; i++) {
            sb.append(' ');
        }
        return sb.append(s).toString();
    }

    public static void main(String[] args) {
        int n = 6;
        StringBuilder tabel = new StringBuilder();
        tabel.append("   x");
        for (int j = 1; j <= n; j++) {
            tabel.append(rataKanan(j, 4));
        }
        tabel.append('\n').append("----".repeat(n + 1)).append('\n');
        for (int i = 1; i <= n; i++) {
            tabel.append(rataKanan(i, 4));
            for (int j = 1; j <= n; j++) {
                tabel.append(rataKanan(i * j, 4));
            }
            tabel.append('\n');
        }
        System.out.print(tabel);
        StringBuilder pola = new StringBuilder();
        for (int i = 1; i <= 5; i++) {
            for (int s = 0; s < 5 - i; s++) {
                pola.append(' ');
            }
            for (int k = 0; k < 2 * i - 1; k++) {
                pola.append(k % 2 == 0 ? '*' : '-');
            }
            pola.append('\n');
        }
        System.out.print(pola);
        System.out.println("panjang tabel " + tabel.length() + ", panjang pola " + pola.length());
    }
}
