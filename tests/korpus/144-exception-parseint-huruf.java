// NumberFormatException: Integer.parseInt pada teks huruf "abc"
public class Main {
    public static void main(String[] args) {
        String[] data = {"10", "-25", "+3", "abc", "7"};
        System.out.println("Banyak data: " + data.length);
        System.out.println("Gabungan: " + String.join(",", data));
        int total = 0;
        for (String d : data) {
            int x = Integer.parseInt(d);
            total += x;
            System.out.println("baca " + d + " -> total " + total);
        }
        System.out.println("Total akhir " + total);
    }
}
