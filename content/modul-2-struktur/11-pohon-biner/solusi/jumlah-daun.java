class Node {
    int data;
    Node left;
    Node right;

    Node(int data) {
        this.data = data;
    }
}

public class Main {
    public static void main(String[] args) {
        Node root = new Node(8);
        root.left = new Node(5);   // #sambung
        root.right = new Node(4);
        root.left.left = new Node(2);
        root.left.right = new Node(9);
        root.right.right = new Node(6);
        root.right.right.left = new Node(3);

        System.out.print("Preorder :");
        preorder(root);
        System.out.println();
        System.out.print("Inorder  :");
        inorder(root);
        System.out.println();
        System.out.print("Postorder:");
        postorder(root);
        System.out.println();
        System.out.println("Jumlah simpul: " + jumlahSimpul(root));
        System.out.println("Tinggi: " + tinggi(root));
        int daun = jumlahDaun(root);
        System.out.println("Jumlah daun: " + daun);
    }

    static void preorder(Node node) {
        if (node == null) return;   // #dasar
        System.out.print(" " + node.data);
        preorder(node.left);
        preorder(node.right);
    }

    static void inorder(Node node) {
        if (node == null) return;
        inorder(node.left);
        System.out.print(" " + node.data);
        inorder(node.right);
    }

    static void postorder(Node node) {
        if (node == null) return;
        postorder(node.left);
        postorder(node.right);
        System.out.print(" " + node.data);
    }

    static int jumlahSimpul(Node node) {
        if (node == null) return 0;
        return 1 + jumlahSimpul(node.left) + jumlahSimpul(node.right);
    }

    static int tinggi(Node node) {
        if (node == null) return 0;
        int kiri = tinggi(node.left);
        int kanan = tinggi(node.right);
        return 1 + Math.max(kiri, kanan);   // #tinggi
    }

    static int jumlahDaun(Node node) {
        if (node == null) return 0;
        if (node.left == null && node.right == null) return 1;
        return jumlahDaun(node.left) + jumlahDaun(node.right);
    }
}
