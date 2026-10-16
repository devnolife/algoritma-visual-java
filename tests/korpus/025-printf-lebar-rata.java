// printf: lebar, rata kiri, isi nol, tanda +, spasi, pemisah ribuan, %x %o %c %b %%
public class Main {
    public static void main(String[] args) {
        int n = 42;
        System.out.printf("[%d]%n", n);
        System.out.printf("[%5d]%n", n);
        System.out.printf("[%-5d]%n", n);
        System.out.printf("[%05d]%n", n);
        System.out.printf("[%+d]%n", n);
        System.out.printf("[% d]%n", n);
        System.out.printf("[%+d]%n", -n);
        System.out.printf("[% d]%n", -n);
        System.out.printf("[%05d]%n", -n);
        System.out.printf("[%,d]%n", 1234567);
        System.out.printf("[%,d]%n", -9876543210L);
        System.out.printf("[%,15d]%n", 1234567890);
        System.out.printf("[%x] [%X] [%o]%n", 255, 255, 8);
        System.out.printf("[%08X]%n", 48879);
        System.out.printf("[%s] [%10s] [%-10s]%n", "Java", "Java", "Java");
        System.out.printf("[%S]%n", "huruf besar");
        System.out.printf("[%c] [%c] [%3c]%n", 'J', 65, 'z');
        System.out.printf("[%b] [%B] [%b]%n", true, false, 5 > 3);
        System.out.printf("Diskon 15%%%n");
        System.out.printf("%d + %d = %d%n", 2, 3, 2 + 3);
        System.out.printf("%s%n", 12.5);
        System.out.printf("[%3d] [%-3d] [%d]%n", 12345, 12345, 0);
        System.out.printf("[%d] [%d] [%d]%n", (byte) -5, (short) 300, 'A' + 0);
        System.out.printf("Tanpa argumen%n");
    }
}
