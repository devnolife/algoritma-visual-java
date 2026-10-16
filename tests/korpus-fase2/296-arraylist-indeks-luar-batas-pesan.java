// IndexOutOfBoundsException dari ArrayList: get, set, dan remove berformat "Index 5 out of bounds for length 3", sedangkan add(index, e) berformat "Index: 5, Size: 3"
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> rak = new ArrayList<>();
        rak.add("A");
        rak.add("B");
        rak.add("C");
        try {
            rak.get(5);
        } catch (IndexOutOfBoundsException e) {
            System.out.println("get(5)       -> " + e);
        }
        try {
            rak.get(-1);
        } catch (IndexOutOfBoundsException e) {
            System.out.println("get(-1)      -> " + e);
        }
        try {
            rak.set(3, "D");
        } catch (IndexOutOfBoundsException e) {
            System.out.println("set(3, D)    -> " + e);
        }
        try {
            rak.remove(4);
        } catch (IndexOutOfBoundsException e) {
            System.out.println("remove(4)    -> " + e);
        }
        try {
            rak.add(5, "E");
        } catch (IndexOutOfBoundsException e) {
            System.out.println("add(5, E)    -> " + e);
        }
        try {
            rak.add(-1, "E");
        } catch (IndexOutOfBoundsException e) {
            System.out.println("add(-1, E)   -> " + e);
        }
        rak.add(3, "D");
        System.out.println("add(3, D) di ujung boleh: " + rak);
        ArrayList<Integer> kosong = new ArrayList<>();
        try {
            kosong.get(0);
        } catch (IndexOutOfBoundsException e) {
            System.out.println("list kosong get(0) -> " + e.getMessage());
        }
        for (int i = 0; i <= rak.size(); i++) {
            System.out.println("rak.get(" + i + ") = " + rak.get(i));
        }
    }
}
