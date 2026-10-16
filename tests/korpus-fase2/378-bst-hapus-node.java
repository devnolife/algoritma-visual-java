// Hapus node pada BST untuk tiga kasus (daun, satu anak, dua anak dengan penerus inorder); struktur pohon dicetak setiap langkah
public class Main {
    static class Node {
        int kunci;
        Node kiri;
        Node kanan;

        Node(int kunci) {
            this.kunci = kunci;
        }
    }

    static Node sisip(Node n, int k) {
        if (n == null) {
            return new Node(k);
        }
        if (k < n.kunci) {
            n.kiri = sisip(n.kiri, k);
        } else {
            n.kanan = sisip(n.kanan, k);
        }
        return n;
    }

    static Node hapus(Node n, int k) {
        if (n == null) {
            System.out.println("  " + k + " tidak ditemukan");
            return null;
        }
        if (k < n.kunci) {
            n.kiri = hapus(n.kiri, k);
        } else if (k > n.kunci) {
            n.kanan = hapus(n.kanan, k);
        } else {
            if (n.kiri == null) {
                return n.kanan;
            }
            if (n.kanan == null) {
                return n.kiri;
            }
            Node penerus = n.kanan;
            while (penerus.kiri != null) {
                penerus = penerus.kiri;
            }
            System.out.println("  " + k + " punya dua anak, diganti penerus " + penerus.kunci);
            n.kunci = penerus.kunci;
            n.kanan = hapus(n.kanan, penerus.kunci);
        }
        return n;
    }

    static String struktur(Node n) {
        if (n == null) {
            return "-";
        }
        if (n.kiri == null && n.kanan == null) {
            return "" + n.kunci;
        }
        return n.kunci + "(" + struktur(n.kiri) + " " + struktur(n.kanan) + ")";
    }

    public static void main(String[] args) {
        Node akar = null;
        for (int k : new int[] {50, 30, 70, 20, 40, 60, 80, 65, 75, 85}) {
            akar = sisip(akar, k);
        }
        System.out.println("awal      : " + struktur(akar));
        int[] dihapus = {20, 30, 70, 50, 99, 65};
        for (int k : dihapus) {
            System.out.println("hapus " + k + ":");
            akar = hapus(akar, k);
            System.out.println("  hasil   : " + struktur(akar));
        }
    }
}
