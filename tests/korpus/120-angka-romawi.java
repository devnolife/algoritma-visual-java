// Konversi bilangan ke angka Romawi dan sebaliknya
public class Main {
    static final int[] NILAI = {1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1};
    static final String[] SIMBOL = {"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"};

    static String keRomawi(int n) {
        String hasil = "";
        for (int i = 0; i < NILAI.length; i++) {
            while (n >= NILAI[i]) {
                hasil += SIMBOL[i];
                n -= NILAI[i];
            }
        }
        return hasil;
    }

    static int nilaiHuruf(char c) {
        switch (c) {
            case 'I': return 1;
            case 'V': return 5;
            case 'X': return 10;
            case 'L': return 50;
            case 'C': return 100;
            case 'D': return 500;
            case 'M': return 1000;
            default: return 0;
        }
    }

    static int dariRomawi(String s) {
        int total = 0;
        for (int i = 0; i < s.length(); i++) {
            int v = nilaiHuruf(s.charAt(i));
            if (i + 1 < s.length() && v < nilaiHuruf(s.charAt(i + 1))) {
                total -= v;
            } else {
                total += v;
            }
        }
        return total;
    }

    public static void main(String[] args) {
        int[] uji = {1, 4, 9, 14, 40, 90, 400, 1994, 2024, 3999};
        for (int u : uji) {
            String r = keRomawi(u);
            System.out.println(u + " = " + r + " -> kembali " + dariRomawi(r));
        }
        System.out.println("MCMXLV = " + dariRomawi("MCMXLV"));
    }
}
