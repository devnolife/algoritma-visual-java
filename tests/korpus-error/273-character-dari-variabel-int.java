// Error: variabel int (bukan konstanta) disimpan ke Character; Character c = 65 justru sah karena konstanta muat di char (incompatible types: int cannot be converted to Character)
public class Main {
    public static void main(String[] args) {
        Character huruf = 65;
        System.out.println("konstanta: " + huruf);
        int kode = 66;
        Character berikut = kode;
        System.out.println(berikut);
    }
}
