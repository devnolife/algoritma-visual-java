import java.util.LinkedList;

class Node {
    int data;
    Node prev;   // simpul sebelumnya
    Node next;   // simpul sesudahnya

    Node(int data) {
        this.data = data;
    }
}

public class Main {
    static Node head;   // simpul pertama
    static Node tail;   // simpul terakhir

    static void tambahBelakang(int x) {
        Node baru = new Node(x);
        if (tail == null) {
            head = baru;
        } else {
            tail.next = baru;   // #maju
            baru.prev = tail;   // #mundur
        }
        tail = baru;
    }

    static void tambahDepan(int x) {
        Node baru = new Node(x);
        if (head == null) {
            tail = baru;
        } else {
            baru.next = head;
            head.prev = baru;
        }
        head = baru;
    }

    static void hapus(Node n) {
        if (n.prev == null) head = n.next;
        else n.prev.next = n.next;   // #lepas
        if (n.next == null) tail = n.prev;
        else n.next.prev = n.prev;
    }

    // Membalik list di tempat: setiap simpul menukar prev dan next-nya, lalu head dan tail ditukar.
    static void balik() {
        Node curr = head;
        while (curr != null) {
            Node lanjut = curr.next;
            curr.next = curr.prev;
            curr.prev = lanjut;
            curr = lanjut;
        }
        Node t = head;
        head = tail;
        tail = t;
    }

    public static void main(String[] args) {
        tambahBelakang(20);
        tambahBelakang(30);
        tambahBelakang(40);
        tambahDepan(10);
        hapus(head.next.next);   // simpul 30
        balik();

        System.out.print("Maju:");
        for (Node curr = head; curr != null; curr = curr.next) {
            System.out.print(" " + curr.data);
        }
        System.out.print("\nMundur:");
        for (Node curr = tail; curr != null; curr = curr.prev) {
            System.out.print(" " + curr.data);
        }
        System.out.println();

        LinkedList<Integer> daftar = new LinkedList<>();
        daftar.addLast(20);
        daftar.addLast(40);
        daftar.addFirst(10);
        System.out.println("LinkedList: " + daftar + ", getFirst() = " + daftar.getFirst());
        daftar.removeFirst();
        daftar.removeLast();
        System.out.println("Setelah removeFirst dan removeLast: " + daftar);
    }
}
