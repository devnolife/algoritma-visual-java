// Scanner: nextBoolean tidak peka huruf besar/kecil, lalu nextInt dan next
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int benar = 0;
        for (int i = 1; i <= 4; i++) {
            boolean jawaban = sc.nextBoolean();
            System.out.println("Jawaban " + i + ": " + jawaban);
            if (jawaban) {
                benar++;
            }
        }
        int bonus = sc.nextInt();
        String nama = sc.next();
        System.out.println(nama + " menjawab benar " + benar + " soal, skor = " + (benar * 25 + bonus));
        System.out.println("Ada token lagi? " + sc.hasNext());
    }
}
