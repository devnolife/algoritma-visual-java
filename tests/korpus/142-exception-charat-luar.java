// StringIndexOutOfBoundsException dari charAt dengan indeks = panjang string
public class Main {
    static String eja(String kata) {
        String hasil = "";
        for (int i = 0; i < kata.length(); i++) {
            hasil += kata.charAt(i) + (i < kata.length() - 1 ? "-" : "");
        }
        return hasil;
    }

    public static void main(String[] args) {
        String kata = "halo";
        System.out.println("Ejaan: " + eja(kata));
        for (int i = 0; i <= kata.length(); i++) {
            System.out.println(i + ": " + kata.charAt(i));
        }
    }
}
