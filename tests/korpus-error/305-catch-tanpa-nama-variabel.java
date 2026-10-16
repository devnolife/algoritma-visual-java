// Error: parameter catch ditulis tanpa nama variabel (<identifier> expected)
public class Main {
    public static void main(String[] args) {
        try {
            String s = "Java";
            System.out.println(s.charAt(10));
        } catch (StringIndexOutOfBoundsException) {
            System.out.println("indeks huruf salah");
        }
    }
}
