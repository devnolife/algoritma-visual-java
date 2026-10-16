// Urutan evaluasi: operand kiri dulu, indeks array sebelum ruas kanan, compound assignment sekali evaluasi
import java.util.Arrays;

public class Main {
    static int langkah = 0;

    static int catat(String label, int nilai) {
        langkah++;
        System.out.println("  " + langkah + ". evaluasi " + label + " = " + nilai);
        return nilai;
    }

    static int[] ambilArray(int[] a) {
        System.out.println("  ambil array");
        return a;
    }

    public static void main(String[] args) {
        System.out.println("Operand dievaluasi kiri ke kanan:");
        int hasil = catat("a", 1) + catat("b", 2) * catat("c", 3);
        System.out.println("hasil = " + hasil);
        int[] arr = {10, 20, 30};
        int i = 0;
        arr[i] = i = 2;
        System.out.println("arr[i] = i = 2 -> " + Arrays.toString(arr) + ", i = " + i);
        int j = 0;
        arr[j++] += 5;
        System.out.println("arr[j++] += 5 -> " + Arrays.toString(arr) + ", j = " + j);
        System.out.println("ambilArray(arr)[catat] = catat:");
        ambilArray(arr)[catat("indeks", 2)] = catat("nilai", 99);
        System.out.println("  " + Arrays.toString(arr));
        String s = "a";
        s += s += "b";
        System.out.println("s += s += \"b\" -> " + s);
        int x = 5;
        x = x++ * 2 + x;
        System.out.println("x = x++ * 2 + x -> " + x);
        int y = 10;
        y += y++ + ++y;
        System.out.println("y += y++ + ++y -> " + y);
        int k = 1;
        int m = k + (k = 5) * k;
        System.out.println("k + (k = 5) * k = " + m + ", k = " + k);
        int[] data = {1, 2, 3};
        int idx = 0;
        data[idx] = idx = data[idx] + 10;
        System.out.println("data[idx] = idx = data[idx] + 10 -> " + Arrays.toString(data) + ", idx = " + idx);
        System.out.println("Ternary hanya mengevaluasi satu cabang:");
        int t = catat("kondisi", 1) > 0 ? catat("benar", 7) : catat("salah", 8);
        System.out.println("t = " + t);
        System.out.println("Argumen method:");
        System.out.println("max = " + Math.max(catat("p", 4), catat("q", 9)));
    }
}
