// Matriks: jumlah diagonal utama dan sekunder, segitiga atas, dan pemeriksaan identitas
public class Main {
    static boolean identitas(int[][] m) {
        for (int i = 0; i < m.length; i++) {
            for (int j = 0; j < m[i].length; j++) {
                int harap = i == j ? 1 : 0;
                if (m[i][j] != harap) {
                    return false;
                }
            }
        }
        return true;
    }

    public static void main(String[] args) {
        int[][] m = {
            {4, 9, 2},
            {3, 5, 7},
            {8, 1, 6}
        };
        int utama = 0, sekunder = 0;
        for (int i = 0; i < m.length; i++) {
            utama += m[i][i];
            sekunder += m[i][m.length - 1 - i];
        }
        System.out.println("Diagonal utama = " + utama + ", sekunder = " + sekunder);
        boolean ajaib = true;
        for (int i = 0; i < 3; i++) {
            int baris = 0, kolom = 0;
            for (int j = 0; j < 3; j++) {
                baris += m[i][j];
                kolom += m[j][i];
            }
            if (baris != utama || kolom != utama) {
                ajaib = false;
            }
        }
        System.out.println("Persegi ajaib? " + (ajaib && utama == sekunder));
        int atas = 0;
        for (int i = 0; i < 3; i++) {
            for (int j = i + 1; j < 3; j++) {
                atas += m[i][j];
            }
        }
        System.out.println("Jumlah di atas diagonal = " + atas);
        int[][] id = {{1, 0, 0}, {0, 1, 0}, {0, 0, 1}};
        System.out.println("m identitas? " + identitas(m) + ", id identitas? " + identitas(id));
        id[2][0] = 5;
        System.out.println("setelah id[2][0] = 5: " + identitas(id));
    }
}
