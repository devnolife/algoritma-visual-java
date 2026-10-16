// FizzBuzz 1 sampai 30 dengan if-else dan operator modulo
public class Main {
    public static void main(String[] args) {
        int fizz = 0, buzz = 0, fizzBuzz = 0;
        for (int i = 1; i <= 30; i++) {
            if (i % 15 == 0) {
                System.out.println("FizzBuzz");
                fizzBuzz++;
            } else if (i % 3 == 0) {
                System.out.println("Fizz");
                fizz++;
            } else if (i % 5 == 0) {
                System.out.println("Buzz");
                buzz++;
            } else {
                System.out.println(i);
            }
        }
        System.out.println("Fizz=" + fizz + " Buzz=" + buzz + " FizzBuzz=" + fizzBuzz);
        String baris = "";
        for (int i = 1; i <= 15; i++) {
            String kata = (i % 3 == 0 ? "Fizz" : "") + (i % 5 == 0 ? "Buzz" : "");
            baris += (kata.isEmpty() ? String.valueOf(i) : kata) + (i < 15 ? "," : "");
        }
        System.out.println(baris);
    }
}
