// Error: catch Exception ditulis sebelum catch ArithmeticException sehingga yang kedua tidak pernah tercapai (exception ArithmeticException has already been caught)
public class Main {
    public static void main(String[] args) {
        int[] data = {10, 0, 5};
        try {
            System.out.println(data[0] / data[1]);
        } catch (Exception e) {
            System.out.println("kesalahan umum: " + e);
        } catch (ArithmeticException e) {
            System.out.println("pembagian nol");
        }
    }
}
