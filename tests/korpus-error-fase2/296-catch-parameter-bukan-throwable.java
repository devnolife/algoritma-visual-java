// Error: parameter catch bertipe String, bukan Throwable (incompatible types: String cannot be converted to Throwable)
public class Main {
    public static void main(String[] args) {
        try {
            int x = Integer.parseInt("abc");
            System.out.println(x);
        } catch (String pesan) {
            System.out.println(pesan);
        }
    }
}
