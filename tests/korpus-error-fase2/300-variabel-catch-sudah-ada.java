// Error: nama parameter catch sama dengan variabel lokal yang sudah ada (variable e is already defined in method main(String[]))
public class Main {
    public static void main(String[] args) {
        double e = 2.71828;
        try {
            int[] a = new int[2];
            a[3] = 1;
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("indeks salah");
        }
        System.out.println(e);
    }
}
