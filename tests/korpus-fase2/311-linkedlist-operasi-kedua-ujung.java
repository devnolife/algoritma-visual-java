// LinkedList sebagai deque: add/addFirst/addLast/offer/push, removeFirst/removeLast/poll/pollLast/pop, getFirst/getLast/peek/peekLast
import java.util.LinkedList;

public class Main {
    public static void main(String[] args) {
        LinkedList<String> kereta = new LinkedList<>();
        kereta.add("B");
        kereta.addFirst("A");
        kereta.addLast("C");
        kereta.offer("D");
        kereta.addFirst("Loko");
        kereta.push("Depan");
        System.out.println("kereta " + kereta + ", size " + kereta.size());
        System.out.println("getFirst " + kereta.getFirst() + ", getLast " + kereta.getLast() + ", peek " + kereta.peek() + ", peekLast " + kereta.peekLast());
        System.out.println("removeFirst " + kereta.removeFirst() + " -> " + kereta);
        System.out.println("removeLast " + kereta.removeLast() + " -> " + kereta);
        System.out.println("poll " + kereta.poll() + " -> " + kereta);
        System.out.println("pollLast " + kereta.pollLast() + " -> " + kereta);
        System.out.println("pop " + kereta.pop() + " -> " + kereta);
        kereta.add(1, "X");
        System.out.println("add(1, X) -> " + kereta + ", get(1) " + kereta.get(1) + ", indexOf(B) " + kereta.indexOf("B"));
        kereta.set(0, "A2");
        System.out.println("set(0, A2) -> " + kereta);
        System.out.println("remove(\"X\") " + kereta.remove("X") + " -> " + kereta + ", contains(B) " + kereta.contains("B"));
    }
}
