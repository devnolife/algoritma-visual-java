// Error: try dan catch sama-sama return sehingga pernyataan sesudahnya tidak pernah tercapai (unreachable statement)
public class Main {
    static int keAngka(String s) {
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException e) {
            return -1;
        }
        System.out.println("selesai konversi");
    }

    public static void main(String[] args) {
        System.out.println(keAngka("8"));
    }
}
