// Operator ++ dan -- di dalam ekspresi: i++ + ++i, j = j++, dan indeks array
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int i = 5;
        int hasil = i++ + ++i;
        System.out.println("i++ + ++i = " + hasil + ", i = " + i);
        int j = 5;
        j = j++;
        System.out.println("j = j++   -> j = " + j);
        int k = 5;
        k = ++k + k++;
        System.out.println("k = ++k + k++ -> k = " + k);
        int m = 10;
        int n = m-- - --m;
        System.out.println("m-- - --m = " + n + ", m = " + m);
        int a = 3;
        int b = a++ * a--;
        System.out.println("a++ * a-- = " + b + ", a = " + a);
        int c = 2;
        c += c++;
        System.out.println("c += c++  -> c = " + c);
        int d = 1;
        d = d++ + d++;
        System.out.println("d = d++ + d++ -> d = " + d);
        int e = 0;
        e += ++e + e++;
        System.out.println("e += ++e + e++ -> e = " + e);
        int[] arr = new int[5];
        int idx = 0;
        arr[idx++] = idx;
        arr[idx++] = idx * 10;
        arr[++idx] = idx + 100;
        System.out.println("arr = " + Arrays.toString(arr) + ", idx = " + idx);
        int p = 7;
        System.out.println(p++ + " " + p + " " + --p + " " + p--);
        char ch = 'x';
        System.out.println(ch++ + " " + ch);
        long big = Long.MAX_VALUE;
        big++;
        System.out.println("Long.MAX_VALUE++ = " + big);
        double dd = 1.5;
        dd++;
        System.out.println("1.5++ = " + dd);
        int x = 10;
        int y = -x++ + -(--x);
        System.out.println("-x++ + -(--x) = " + y + ", x = " + x);
        int[] hitung = {0, 0};
        hitung[0]++;
        ++hitung[1];
        hitung[1]++;
        System.out.println("hitung = " + Arrays.toString(hitung));
    }
}
