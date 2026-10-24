class Node {
    int data;
    Node left;
    Node right;

    Node(int data) {
        this.data = data;
    }
}

public class Main {
    static int perbandingan = 0;

    public static void main(String[] args) {
        int n = 7;
        boolean terurut = false;   // true: kunci masuk sudah terurut
        Node root = null;
        for (int i = 0; i < n; i++) {
            int kunci = terurut ? (i + 1) * 10 : (i * 79 + 64) % 128;
            root = sisip(root, kunci);
        }
        System.out.println("Perbandingan saat menyisipkan: " + perbandingan);
        System.out.print("Inorder:");
        inorder(root);
        System.out.println();
        System.out.println("Terkecil: " + terkecil(root));
        System.out.println("Ada 45? " + cari(root, 45));
        System.out.println("Ada 80? " + cari(root, 80));
    }

    static Node sisip(Node node, int x) {
        if (node == null) {
            return new Node(x);   // #baru
        }
        perbandingan++;
        if (x < node.data) {   // #arah
            node.left = sisip(node.left, x);   // #sambung
        } else {
            node.right = sisip(node.right, x);   // #sambung
        }
        return node;
    }

    static void inorder(Node node) {
        if (node == null) return;
        inorder(node.left);
        System.out.print(" " + node.data);
        inorder(node.right);
    }

    static int terkecil(Node root) {
        Node curr = root;
        while (curr.left != null) {
            curr = curr.left;
        }
        return curr.data;
    }

    static boolean cari(Node root, int x) {
        Node curr = root;
        while (curr != null) {
            if (x == curr.data) return true;
            if (x < curr.data) curr = curr.left;
            else curr = curr.right;
        }
        return false;
    }
}
