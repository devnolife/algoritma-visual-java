// switch pada char: konversi nilai huruf ke bobot dan rentang karakter
public class Main {
    public static void main(String[] args) {
        char[] nilaiHuruf = {'A', 'B', 'C', 'D', 'E', 'b', 'X'};
        int[] sks = {3, 2, 4, 3, 2, 3, 1};
        double totalBobot = 0;
        int totalSks = 0;
        for (int i = 0; i < nilaiHuruf.length; i++) {
            char n = nilaiHuruf[i];
            double bobot;
            switch (Character.toUpperCase(n)) {
                case 'A':
                    bobot = 4.0;
                    break;
                case 'B':
                    bobot = 3.0;
                    break;
                case 'C':
                    bobot = 2.0;
                    break;
                case 'D':
                    bobot = 1.0;
                    break;
                case 'E':
                    bobot = 0.0;
                    break;
                default:
                    System.out.println("Nilai '" + n + "' tidak valid, dilewati");
                    continue;
            }
            totalBobot += bobot * sks[i];
            totalSks += sks[i];
            System.out.println(n + " (" + sks[i] + " sks) -> " + bobot);
        }
        System.out.printf("IPK = %.2f dari %d sks%n", totalBobot / totalSks, totalSks);
        String kode = "a1-B?";
        for (char c : kode.toCharArray()) {
            switch (c) {
                case '0': case '1': case '2': case '3': case '4':
                case '5': case '6': case '7': case '8': case '9':
                    System.out.println(c + " digit");
                    break;
                case '-':
                case '?':
                    System.out.println(c + " simbol");
                    break;
                default:
                    System.out.println(c + (Character.isUpperCase(c) ? " huruf besar" : " huruf kecil"));
            }
        }
    }
}
