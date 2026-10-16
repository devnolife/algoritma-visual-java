// Error: membuat array dari tipe generik untuk daftar ketetanggaan graf (generic array creation)
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        int n = 4;
        ArrayList<Integer>[] adj = new ArrayList<Integer>[n];
        for (int i = 0; i < n; i++) {
            adj[i] = new ArrayList<>();
        }
        adj[0].add(1);
        System.out.println(adj[0]);
    }
}
