// Error: method bernilai kembali tidak mengembalikan apa pun bila blok catch yang berjalan (missing return statement)
public class Main {
    static int keAngka(String s) {
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException e) {
            System.out.println("bukan angka: " + s);
        }
    }

    public static void main(String[] args) {
        System.out.println(keAngka("12"));
    }
}
