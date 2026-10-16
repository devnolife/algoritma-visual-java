// Linked list tunggal buatan sendiri dengan kelas Node: sisip depan/belakang, cari, hapus nilai, balik iteratif, dan cetak setiap langkah
public class Main {
    static class Node {
        int data;
        Node next;

        Node(int data) {
            this.data = data;
        }
    }

    static class DaftarBerantai {
        Node head;
        int size;

        void sisipDepan(int x) {
            Node baru = new Node(x);
            baru.next = head;
            head = baru;
            size++;
        }

        void sisipBelakang(int x) {
            Node baru = new Node(x);
            if (head == null) {
                head = baru;
            } else {
                Node curr = head;
                while (curr.next != null) {
                    curr = curr.next;
                }
                curr.next = baru;
            }
            size++;
        }

        boolean hapus(int x) {
            if (head == null) {
                return false;
            }
            if (head.data == x) {
                head = head.next;
                size--;
                return true;
            }
            Node prev = head;
            while (prev.next != null && prev.next.data != x) {
                prev = prev.next;
            }
            if (prev.next == null) {
                return false;
            }
            prev.next = prev.next.next;
            size--;
            return true;
        }

        void balik() {
            Node prev = null;
            Node curr = head;
            while (curr != null) {
                Node berikut = curr.next;
                curr.next = prev;
                prev = curr;
                curr = berikut;
            }
            head = prev;
        }

        int cari(int x) {
            int i = 0;
            for (Node n = head; n != null; n = n.next) {
                if (n.data == x) {
                    return i;
                }
                i++;
            }
            return -1;
        }

        @Override
        public String toString() {
            StringBuilder sb = new StringBuilder();
            for (Node n = head; n != null; n = n.next) {
                sb.append(n.data).append(" -> ");
            }
            return sb.append("null (size ").append(size).append(")").toString();
        }
    }

    public static void main(String[] args) {
        DaftarBerantai d = new DaftarBerantai();
        System.out.println("kosong: " + d);
        d.sisipBelakang(10);
        d.sisipBelakang(20);
        d.sisipDepan(5);
        d.sisipBelakang(30);
        d.sisipDepan(1);
        System.out.println("setelah sisip: " + d);
        System.out.println("cari 20 -> indeks " + d.cari(20) + ", cari 99 -> " + d.cari(99));
        System.out.println("hapus 1 " + d.hapus(1) + ": " + d);
        System.out.println("hapus 20 " + d.hapus(20) + ": " + d);
        System.out.println("hapus 99 " + d.hapus(99) + ": " + d);
        d.balik();
        System.out.println("dibalik: " + d);
        System.out.println("hapus 30 " + d.hapus(30) + ", hapus 5 " + d.hapus(5) + ", hapus 10 " + d.hapus(10) + ": " + d);
        d.balik();
        System.out.println("balik list kosong: " + d);
    }
}
