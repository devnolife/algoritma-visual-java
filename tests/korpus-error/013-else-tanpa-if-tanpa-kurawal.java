// Error: dua pernyataan di cabang if tanpa kurung kurawal ('else' without 'if')
public class Main {
    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        int x = 3;
        int hitung = 0;
        if (x > 0)
            System.out.println("positif");
            hitung++;
        else
            System.out.println("bukan positif");
        System.out.println(hitung);
    }
}
