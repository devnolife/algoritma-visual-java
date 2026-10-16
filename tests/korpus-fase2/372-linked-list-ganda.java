// Linked list ganda (prev dan next) dengan kelas top-level: sisip di kedua ujung, hapus node di awal/tengah/akhir, cetak maju dan mundur
public class Main {
    public static void main(String[] args) {
        DaftarGanda d = new DaftarGanda();
        d.tambahBelakang("B");
        d.tambahBelakang("C");
        d.tambahDepan("A");
        d.tambahBelakang("D");
        d.cetak();
        d.hapus("C");
        d.cetak();
        d.hapus("A");
        d.cetak();
        d.hapus("D");
        d.cetak();
        d.tambahDepan("Z");
        d.hapus("Q");
        d.cetak();
        d.hapus("B");
        d.hapus("Z");
        d.cetak();
    }
}

class SimpulGanda {
    String data;
    SimpulGanda prev;
    SimpulGanda next;

    SimpulGanda(String data) {
        this.data = data;
    }
}

class DaftarGanda {
    SimpulGanda head;
    SimpulGanda tail;
    int size;

    void tambahDepan(String x) {
        SimpulGanda s = new SimpulGanda(x);
        if (head == null) {
            head = tail = s;
        } else {
            s.next = head;
            head.prev = s;
            head = s;
        }
        size++;
    }

    void tambahBelakang(String x) {
        SimpulGanda s = new SimpulGanda(x);
        if (tail == null) {
            head = tail = s;
        } else {
            s.prev = tail;
            tail.next = s;
            tail = s;
        }
        size++;
    }

    void hapus(String x) {
        SimpulGanda s = head;
        while (s != null && !s.data.equals(x)) {
            s = s.next;
        }
        if (s == null) {
            System.out.println("hapus " + x + ": tidak ditemukan");
            return;
        }
        if (s.prev == null) {
            head = s.next;
        } else {
            s.prev.next = s.next;
        }
        if (s.next == null) {
            tail = s.prev;
        } else {
            s.next.prev = s.prev;
        }
        size--;
        System.out.println("hapus " + x);
    }

    void cetak() {
        StringBuilder maju = new StringBuilder();
        for (SimpulGanda s = head; s != null; s = s.next) {
            maju.append(s.data).append(s.next == null ? "" : " <-> ");
        }
        StringBuilder mundur = new StringBuilder();
        for (SimpulGanda s = tail; s != null; s = s.prev) {
            mundur.append(s.data).append(s.prev == null ? "" : " <-> ");
        }
        System.out.println("  maju [" + maju + "] mundur [" + mundur + "] size " + size
            + ", head " + (head == null ? "null" : head.data) + ", tail " + (tail == null ? "null" : tail.data));
    }
}
