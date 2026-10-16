// Error: kelas public kedua ditulis di Main.java (class Node is public, should be declared in a file named Node.java)
public class Main {
    public static void main(String[] args) {
        Node n = new Node(4);
        System.out.println(n.data);
    }
}

public class Node {
    int data;

    Node(int data) {
        this.data = data;
    }
}
