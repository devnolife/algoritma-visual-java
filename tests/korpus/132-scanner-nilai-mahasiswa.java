// Scanner: membaca n pasangan nama dan nilai, menentukan predikat dan nilai tertinggi
import java.util.Scanner;

public class Main {
    static String predikat(int nilai) {
        if (nilai >= 80) {
            return "A";
        } else if (nilai >= 70) {
            return "B";
        } else if (nilai >= 60) {
            return "C";
        } else if (nilai >= 50) {
            return "D";
        }
        return "E";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        String[] nama = new String[n];
        int[] nilai = new int[n];
        for (int i = 0; i < n; i++) {
            nama[i] = sc.next();
            nilai[i] = sc.nextInt();
        }
        int idxTerbaik = 0;
        int lulus = 0;
        for (int i = 0; i < n; i++) {
            String p = predikat(nilai[i]);
            System.out.printf("%-8s %3d  %s%n", nama[i], nilai[i], p);
            if (nilai[i] > nilai[idxTerbaik]) {
                idxTerbaik = i;
            }
            if (!p.equals("E") && !p.equals("D")) {
                lulus++;
            }
        }
        System.out.println("Nilai tertinggi: " + nama[idxTerbaik] + " (" + nilai[idxTerbaik] + ")");
        System.out.println("Lulus: " + lulus + " dari " + n);
    }
}
