// Trie untuk kamus kata: node dengan array anak berukuran 26, sisip, cari kata utuh, cek awalan, dan hitung kata berawalan tertentu
public class Main {
    static class NodeTrie {
        NodeTrie[] anak = new NodeTrie[26];
        boolean akhirKata;
        int lewat;
    }

    static NodeTrie akar = new NodeTrie();
    static int jumlahNode = 1;

    static void sisip(String kata) {
        NodeTrie n = akar;
        for (char c : kata.toCharArray()) {
            int i = c - 'a';
            if (n.anak[i] == null) {
                n.anak[i] = new NodeTrie();
                jumlahNode++;
            }
            n = n.anak[i];
            n.lewat++;
        }
        n.akhirKata = true;
    }

    static NodeTrie telusuri(String s) {
        NodeTrie n = akar;
        for (char c : s.toCharArray()) {
            n = n.anak[c - 'a'];
            if (n == null) {
                return null;
            }
        }
        return n;
    }

    public static void main(String[] args) {
        String[] kamus = {"kopi", "kopiah", "kota", "kotak", "kodok", "kuda", "kudapan", "sapi"};
        for (String k : kamus) {
            sisip(k);
        }
        System.out.println(kamus.length + " kata, " + jumlahNode + " node");
        String[] cari = {"kota", "kot", "kudapan", "kuda", "kupu", "sapi", "s"};
        for (String c : cari) {
            NodeTrie n = telusuri(c);
            boolean kata = n != null && n.akhirKata;
            int awalan = n == null ? 0 : n.lewat;
            System.out.println(c + ": kata utuh? " + kata + ", jumlah kata berawalan ini " + awalan);
        }
    }
}
