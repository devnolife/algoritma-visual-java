// Error: label case yang sama muncul dua kali (duplicate case label)
public class Main {
    public static void main(String[] args) {
        int hari = 3;
        switch (hari) {
            case 1:
                System.out.println("Senin");
                break;
            case 2:
                System.out.println("Selasa");
                break;
            case 1:
                System.out.println("Rabu");
                break;
        }
    }
}
