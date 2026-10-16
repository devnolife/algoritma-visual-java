// Error: memanggil method pada nilai char (char cannot be dereferenced)
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        String kata = "java";
        char awal = kata.charAt(0);
        char besar = awal.toUpperCase();
        System.out.println(besar);
    }
}
