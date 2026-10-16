// Error: memakai indeks pada variabel int biasa (array required, but int found)
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        int nilai = 5;
        nilai[0] = 10;
        System.out.println(nilai);
    }
}
