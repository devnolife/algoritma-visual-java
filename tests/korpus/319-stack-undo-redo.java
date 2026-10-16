// Editor teks dengan dua Stack (undo dan redo): aksi baru mengosongkan redo, undo memindahkan aksi ke redo dan sebaliknya
import java.util.Stack;

public class Main {
    static StringBuilder dokumen = new StringBuilder();
    static Stack<String> undo = new Stack<>();
    static Stack<String> redo = new Stack<>();

    static void ketik(String teks) {
        dokumen.append(teks);
        undo.push(teks);
        redo.clear();
        tampil("ketik \"" + teks + "\"");
    }

    static void batal() {
        if (undo.isEmpty()) {
            tampil("undo (kosong)");
            return;
        }
        String terakhir = undo.pop();
        dokumen.delete(dokumen.length() - terakhir.length(), dokumen.length());
        redo.push(terakhir);
        tampil("undo \"" + terakhir + "\"");
    }

    static void ulang() {
        if (redo.isEmpty()) {
            tampil("redo (kosong)");
            return;
        }
        String t = redo.pop();
        dokumen.append(t);
        undo.push(t);
        tampil("redo \"" + t + "\"");
    }

    static void tampil(String aksi) {
        System.out.printf("%-14s dokumen=\"%s\" undo=%s redo=%s%n", aksi, dokumen, undo, redo);
    }

    public static void main(String[] args) {
        ketik("Halo");
        ketik(", ");
        ketik("dunia");
        batal();
        batal();
        ulang();
        ketik("semua");
        ulang();
        batal();
        batal();
        batal();
        batal();
        ulang();
    }
}
