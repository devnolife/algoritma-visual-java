import java.util.*;

public class Main {
    public static void main(String[] args) {
        Comparator<Integer> balik = Collections.reverseOrder();
        System.out.println(Collections.reverseOrder() == balik);
    }
}
