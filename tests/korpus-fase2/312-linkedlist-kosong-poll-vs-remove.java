// LinkedList kosong: poll/peek mengembalikan null, sedangkan getFirst/getLast/removeFirst/removeLast/pop/remove() melempar NoSuchElementException
import java.util.LinkedList;
import java.util.NoSuchElementException;

public class Main {
    public static void main(String[] args) {
        LinkedList<Integer> antrian = new LinkedList<>();
        System.out.println("peek " + antrian.peek() + ", poll " + antrian.poll() + ", peekLast " + antrian.peekLast() + ", pollLast " + antrian.pollLast());
        String[] operasi = {"getFirst", "getLast", "removeFirst", "removeLast", "pop", "remove()"};
        for (String op : operasi) {
            try {
                switch (op) {
                    case "getFirst":
                        antrian.getFirst();
                        break;
                    case "getLast":
                        antrian.getLast();
                        break;
                    case "removeFirst":
                        antrian.removeFirst();
                        break;
                    case "removeLast":
                        antrian.removeLast();
                        break;
                    case "pop":
                        antrian.pop();
                        break;
                    default:
                        antrian.remove();
                        break;
                }
            } catch (NoSuchElementException e) {
                System.out.println(op + " -> " + e + ", pesan " + e.getMessage());
            }
        }
        antrian.offer(10);
        antrian.offer(20);
        while (!antrian.isEmpty()) {
            System.out.println("layani " + antrian.poll() + ", sisa " + antrian);
        }
        System.out.println("poll saat kosong lagi: " + antrian.poll());
        int berikutnya = antrian.removeFirst();
        System.out.println("tidak tercetak " + berikutnya);
    }
}
