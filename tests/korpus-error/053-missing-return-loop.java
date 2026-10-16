// Error: return hanya di dalam loop for (missing return statement)
public class Main {
    static int cariIndeks(int[] data, int target) {
        for (int i = 0; i < data.length; i++) {
            if (data[i] == target) {
                return i;
            }
        }
    }

    public static void main(String[] args) {
        int[] data = {3, 1, 4};
        System.out.println(cariIndeks(data, 4));
    }
}
