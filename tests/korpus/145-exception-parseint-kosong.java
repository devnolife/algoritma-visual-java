// NumberFormatException: Integer.parseInt pada string kosong hasil split data CSV
public class Main {
    public static void main(String[] args) {
        String baris = "12,,7";
        System.out.println("Data mentah: " + baris);
        String[] kolom = baris.split(",");
        System.out.println("Banyak kolom: " + kolom.length);
        int total = 0;
        for (int i = 0; i < kolom.length; i++) {
            System.out.println("Kolom " + i + ": [" + kolom[i] + "]");
            total += Integer.parseInt(kolom[i]);
        }
        System.out.println("Total " + total);
    }
}
