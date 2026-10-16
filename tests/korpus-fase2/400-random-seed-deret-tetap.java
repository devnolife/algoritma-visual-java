// java.util.Random dengan seed tetap selalu menghasilkan deret yang sama: nextInt(100), nextInt(), nextDouble(), nextBoolean(), nextLong()
import java.util.Random;

public class Main {
    public static void main(String[] args) {
        Random r = new Random(42);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append(r.nextInt(100)).append(' ');
        }
        System.out.println("nextInt(100) x10: " + sb.toString().trim());
        System.out.println("nextInt()       : " + r.nextInt() + " " + r.nextInt() + " " + r.nextInt());
        System.out.println("nextDouble()    : " + r.nextDouble() + " " + r.nextDouble());
        System.out.println("nextBoolean()   : " + r.nextBoolean() + " " + r.nextBoolean() + " " + r.nextBoolean() + " " + r.nextBoolean());
        System.out.println("nextLong()      : " + r.nextLong() + " " + r.nextLong());
        Random a = new Random(2024);
        Random b = new Random(2024);
        boolean sama = true;
        for (int i = 0; i < 20; i++) {
            if (a.nextInt(1000) != b.nextInt(1000)) {
                sama = false;
            }
        }
        System.out.println("dua Random dengan seed 2024 menghasilkan deret sama: " + sama);
        Random c = new Random(0);
        System.out.println("seed 0: " + c.nextInt(10) + " " + c.nextInt(10) + " " + c.nextInt(10) + ", nextInt(1) selalu " + c.nextInt(1));
        Random d = new Random(-7);
        System.out.println("seed -7: nextInt(6)+1 = " + (d.nextInt(6) + 1) + ", nextDouble*100 = " + d.nextDouble() * 100);
    }
}
