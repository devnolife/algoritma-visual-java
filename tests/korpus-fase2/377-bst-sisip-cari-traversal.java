// Binary search tree: sisip rekursif, cari iteratif, traversal inorder/preorder/postorder, tinggi, jumlah node, minimum, dan maksimum
public class Main {
    static class Node {
        int kunci;
        Node kiri;
        Node kanan;

        Node(int kunci) {
            this.kunci = kunci;
        }
    }

    static Node sisip(Node akar, int k) {
        if (akar == null) {
            return new Node(k);
        }
        if (k < akar.kunci) {
            akar.kiri = sisip(akar.kiri, k);
        } else if (k > akar.kunci) {
            akar.kanan = sisip(akar.kanan, k);
        }
        return akar;
    }

    static boolean cari(Node akar, int k) {
        Node n = akar;
        int langkah = 0;
        while (n != null) {
            langkah++;
            if (k == n.kunci) {
                System.out.println("  cari " + k + ": ketemu dalam " + langkah + " langkah");
                return true;
            }
            n = k < n.kunci ? n.kiri : n.kanan;
        }
        System.out.println("  cari " + k + ": tidak ada (" + langkah + " langkah)");
        return false;
    }

    static void inorder(Node n, StringBuilder sb) {
        if (n == null) {
            return;
        }
        inorder(n.kiri, sb);
        sb.append(n.kunci).append(' ');
        inorder(n.kanan, sb);
    }

    static void preorder(Node n, StringBuilder sb) {
        if (n != null) {
            sb.append(n.kunci).append(' ');
            preorder(n.kiri, sb);
            preorder(n.kanan, sb);
        }
    }

    static void postorder(Node n, StringBuilder sb) {
        if (n != null) {
            postorder(n.kiri, sb);
            postorder(n.kanan, sb);
            sb.append(n.kunci).append(' ');
        }
    }

    static int tinggi(Node n) {
        if (n == null) {
            return 0;
        }
        return 1 + Math.max(tinggi(n.kiri), tinggi(n.kanan));
    }

    static int hitung(Node n) {
        return n == null ? 0 : 1 + hitung(n.kiri) + hitung(n.kanan);
    }

    public static void main(String[] args) {
        int[] data = {50, 30, 70, 20, 40, 60, 80, 35, 45, 65, 30};
        Node akar = null;
        for (int d : data) {
            akar = sisip(akar, d);
        }
        StringBuilder in = new StringBuilder();
        StringBuilder pre = new StringBuilder();
        StringBuilder post = new StringBuilder();
        inorder(akar, in);
        preorder(akar, pre);
        postorder(akar, post);
        System.out.println("inorder  : " + in.toString().trim());
        System.out.println("preorder : " + pre.toString().trim());
        System.out.println("postorder: " + post.toString().trim());
        System.out.println("tinggi " + tinggi(akar) + ", jumlah node " + hitung(akar));
        Node min = akar;
        while (min.kiri != null) {
            min = min.kiri;
        }
        Node maks = akar;
        while (maks.kanan != null) {
            maks = maks.kanan;
        }
        System.out.println("min " + min.kunci + ", maks " + maks.kunci);
        cari(akar, 45);
        cari(akar, 55);
        cari(akar, 50);
        Node miring = null;
        for (int i = 1; i <= 8; i++) {
            miring = sisip(miring, i);
        }
        System.out.println("pohon miring 1..8: tinggi " + tinggi(miring));
    }
}
