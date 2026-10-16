// Error: nama field salah ketik pada objek (cannot find symbol, location: variable n of type Node)
public class Main {
    static class Node {
        int nilai;
        Node next;
    }

    public static void main(String[] args) {
        Node n = new Node();
        n.nilai = 10;
        System.out.println(n.nilia);
    }
}
