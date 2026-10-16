// Error: lupa kata kunci new saat membuat objek (cannot find symbol, symbol: method Node(int))
public class Main {
    static class Node {
        int data;
        Node next;

        Node(int data) {
            this.data = data;
        }
    }

    public static void main(String[] args) {
        Node kepala = new Node(1);
        kepala.next = Node(2);
        System.out.println(kepala.next.data);
    }
}
