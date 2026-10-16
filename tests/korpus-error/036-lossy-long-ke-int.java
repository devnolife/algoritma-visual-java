// Error: ekspresi long disimpan ke int (possible lossy conversion from long to int)
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        long jarak = 4000000000L;
        int dua = 2;
        int pulangPergi = jarak * dua;
        System.out.println(pulangPergi);
    }
}
