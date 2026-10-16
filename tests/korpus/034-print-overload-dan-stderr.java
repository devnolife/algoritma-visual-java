// Overload print/println (char[], null, berbagai tipe) dan System.err tidak masuk stdout
public class Main {
    public static void main(String[] args) {
        System.out.print("Halo");
        System.out.print(", ");
        System.out.print("dunia");
        System.out.println();
        System.out.print(1);
        System.out.print('+');
        System.out.print(2.5);
        System.out.print(true);
        System.out.print(' ');
        System.out.print(10L);
        System.out.print(1.5f);
        System.out.println();
        System.err.println("Pesan ini ke stderr");
        System.out.format("Nilai %d dan %s%n", 10, "teks");
        System.out.println("Baris setelah stderr");
        System.err.print("galat tanpa newline");
        System.err.printf(" dan printf ke err %d%n", 5);
        char[] huruf = {'J', 'a', 'v', 'a'};
        System.out.println(huruf);
        System.out.print(huruf);
        System.out.println();
        String kosong = null;
        System.out.println(kosong);
        System.out.print(kosong);
        System.out.println();
        System.out.println("" + null);
        System.out.println((char) 74);
        System.out.println((byte) 300);
        System.out.println((short) -1);
        System.out.println(7 / 2.0f);
        System.out.println(Long.MIN_VALUE);
        System.out.println("tamat");
    }
}
