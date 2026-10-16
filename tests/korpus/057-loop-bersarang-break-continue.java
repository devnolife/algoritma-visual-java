// Loop bersarang dengan break dan continue (hanya memengaruhi loop terdalam)
public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 4; i++) {
            for (int j = 1; j <= 4; j++) {
                if (j == i) {
                    continue;
                }
                if (i * j > 8) {
                    break;
                }
                System.out.print(i + "x" + j + "=" + (i * j) + " ");
            }
            System.out.println("| akhir baris " + i);
        }
        int target = 24;
        boolean ketemu = false;
        int a = 0, b = 0;
        for (int x = 1; x <= 9 && !ketemu; x++) {
            for (int y = x; y <= 9; y++) {
                if (x * y == target && x + y == 10) {
                    a = x;
                    b = y;
                    ketemu = true;
                    break;
                }
            }
        }
        System.out.println("Pasangan: " + a + " dan " + b + " (ketemu=" + ketemu + ")");
        int jumlahGanjil = 0;
        for (int i = 1; i <= 20; i++) {
            if (i % 2 == 0) {
                continue;
            }
            if (i > 15) {
                break;
            }
            jumlahGanjil += i;
        }
        System.out.println("Jumlah ganjil sampai 15 = " + jumlahGanjil);
        int baris = 0;
        while (baris < 3) {
            baris++;
            int kolom = 0;
            while (true) {
                kolom++;
                if (kolom > baris) {
                    break;
                }
                System.out.print("#");
            }
            System.out.println();
        }
    }
}
