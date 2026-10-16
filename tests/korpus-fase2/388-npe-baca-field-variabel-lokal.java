// NPE saat membaca field dari variabel lokal null (curr.data) dan dari rantai field (p.next.next) ketika menelusuri linked list melewati ujungnya
public class Main {
    static class Node {
        int data;
        Node next;

        Node(int data, Node next) {
            this.data = data;
            this.next = next;
        }
    }

    public static void main(String[] args) {
        Node head = new Node(1, new Node(2, new Node(3, null)));
        Node curr = head;
        int langkah = 0;
        while (langkah < 3) {
            System.out.println("langkah " + langkah + ": data " + curr.data);
            curr = curr.next;
            langkah++;
        }
        System.out.println("curr sekarang " + curr);
        try {
            int x = curr.data;
            System.out.println(x);
        } catch (NullPointerException e) {
            System.out.println("baca curr.data: " + e.getMessage());
        }
        Node p = head;
        for (int i = 0; i < 5; i++) {
            System.out.println("posisi " + i + " berisi " + p.data);
            p = p.next.next;
        }
    }
}
