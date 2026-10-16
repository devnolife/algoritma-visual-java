// Error: short ditambah int lalu disimpan ke short (possible lossy conversion from int to short)
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        short skor = 10;
        skor = skor + 1;
        System.out.println(skor);
    }
}
