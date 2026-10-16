// LinkedList.get/set/remove/add dengan indeks tidak valid: pesan berformat "Index: 5, Size: 3", berbeda dengan ArrayList
import java.util.LinkedList;

public class Main {
    public static void main(String[] args) {
        LinkedList<String> rute = new LinkedList<>();
        rute.add("Makassar");
        rute.add("Maros");
        rute.add("Pangkep");
        System.out.println("rute " + rute);
        try {
            rute.get(5);
        } catch (IndexOutOfBoundsException e) {
            System.out.println("get(5)     -> " + e);
        }
        try {
            rute.set(-1, "Gowa");
        } catch (IndexOutOfBoundsException e) {
            System.out.println("set(-1)    -> " + e);
        }
        try {
            rute.remove(3);
        } catch (IndexOutOfBoundsException e) {
            System.out.println("remove(3)  -> " + e);
        }
        try {
            rute.add(4, "Barru");
        } catch (IndexOutOfBoundsException e) {
            System.out.println("add(4, ..) -> " + e);
        }
        rute.add(3, "Barru");
        System.out.println("add(3, Barru) boleh: " + rute);
        for (int i = rute.size() - 1; i >= -1; i--) {
            System.out.println("rute.get(" + i + ") = " + rute.get(i));
        }
    }
}
