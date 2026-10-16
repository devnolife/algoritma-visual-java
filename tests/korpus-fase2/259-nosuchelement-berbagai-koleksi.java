// NoSuchElementException dari Iterator.next yang kebablasan, removeFirst/getFirst pada deque kosong, firstKey TreeMap kosong, dan pop ArrayDeque
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.NoSuchElementException;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> menu = new ArrayList<>();
        menu.add("soto");
        menu.add("rawon");
        Iterator<String> it = menu.iterator();
        System.out.println(it.next() + ", " + it.next() + ", masih ada? " + it.hasNext());
        try {
            it.next();
        } catch (NoSuchElementException e) {
            System.out.println("iterator: " + e);
        }
        ArrayDeque<Integer> antrian = new ArrayDeque<>();
        System.out.println("poll pada deque kosong = " + antrian.poll() + ", peek = " + antrian.peek());
        try {
            antrian.removeFirst();
        } catch (NoSuchElementException e) {
            System.out.println("removeFirst: " + e);
        }
        LinkedList<Integer> daftar = new LinkedList<>();
        try {
            daftar.getFirst();
        } catch (NoSuchElementException e) {
            System.out.println("getFirst: " + e);
        }
        TreeMap<String, Integer> peringkat = new TreeMap<>();
        try {
            peringkat.firstKey();
        } catch (NoSuchElementException e) {
            System.out.println("firstKey: " + e);
        }
        antrian.add(1);
        System.out.println("pop " + antrian.pop());
        System.out.println("pop lagi " + antrian.pop());
    }
}
