// StringBuilder insert, delete, deleteCharAt, setCharAt, dan replace dengan isi dan panjang dicetak setelah tiap operasi
public class Main {
    static void cetak(String operasi, StringBuilder sb) {
        System.out.printf("%-26s -> \"%s\" (panjang %d)%n", operasi, sb, sb.length());
    }

    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("algoritma");
        cetak("awal", sb);
        sb.insert(0, "dasar ");
        cetak("insert(0, \"dasar \")", sb);
        sb.insert(sb.length(), '!');
        cetak("insert(length, '!')", sb);
        sb.insert(6, 2024);
        cetak("insert(6, 2024)", sb);
        sb.delete(6, 10);
        cetak("delete(6, 10)", sb);
        sb.deleteCharAt(sb.length() - 1);
        cetak("deleteCharAt(terakhir)", sb);
        sb.setCharAt(0, 'D');
        cetak("setCharAt(0, 'D')", sb);
        sb.replace(6, 15, "pemrograman");
        cetak("replace(6, 15, ...)", sb);
        sb.replace(0, 5, "");
        cetak("replace(0, 5, \"\")", sb);
        sb.delete(3, 100);
        cetak("delete(3, 100)", sb);
        sb.insert(1, true).insert(0, 3.5);
        cetak("insert boolean dan double", sb);
        for (int i = sb.length() - 1; i >= 0; i--) {
            if (sb.charAt(i) == 'e' || sb.charAt(i) == '.') {
                sb.deleteCharAt(i);
            }
        }
        cetak("hapus semua 'e' dan '.'", sb);
    }
}
