// Error: dua kelas top-level bernama sama dalam satu berkas (duplicate class: Node)
public class Main {
    public static void main(String[] args) {
        Node n = new Node();
        System.out.println(n.data);
    }
}

class Node {
    int data;
}

class Node {
    int data;
    Node next;
}
