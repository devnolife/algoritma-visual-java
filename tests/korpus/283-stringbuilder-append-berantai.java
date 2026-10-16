// StringBuilder.append berantai untuk berbagai tipe: int, char, double, boolean, long, float, null, char[], dan objek dengan toString
public class Main {
    static class Suhu {
        double c;

        Suhu(double c) {
            this.c = c;
        }

        @Override
        public String toString() {
            return c + "C";
        }
    }

    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        sb.append("int:").append(42).append(' ').append("char:").append('x').append(' ');
        sb.append("double:").append(3.0).append(' ').append("boolean:").append(true);
        System.out.println(sb);
        System.out.println("panjang " + sb.length());
        StringBuilder sb2 = new StringBuilder("awal");
        String kosong = null;
        sb2.append(kosong).append('|').append(10L).append('|').append(1.5f).append('|').append(new Suhu(36.6));
        char[] huruf = {'a', 'b', 'c'};
        Suhu tidakAda = null;
        sb2.append('|').append(huruf).append('|').append(tidakAda);
        System.out.println(sb2);
        StringBuilder angka = new StringBuilder();
        angka.append(1 + 2).append(" vs ").append("" + 1 + 2).append(" vs ").append('1' + 2).append(" vs ").append((char) ('1' + 2));
        System.out.println(angka);
        StringBuilder sama = sb.append("!");
        System.out.println("append mengembalikan objek yang sama: " + (sama == sb));
        StringBuilder deret = new StringBuilder();
        for (int i = 1; i <= 10; i++) {
            deret.append(i);
            if (i < 10) {
                deret.append(i % 3 == 0 ? " | " : ", ");
            }
        }
        System.out.println(deret + " (panjang " + deret.length() + ")");
        StringBuilder campur = new StringBuilder().append(-0.0).append(' ').append(100.0 / 3).append(' ').append(1e10).append(' ').append(Integer.MIN_VALUE);
        System.out.println(campur);
    }
}
