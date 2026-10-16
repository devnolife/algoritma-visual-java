// continue pada do-while (tetap memeriksa kondisi), for (tetap menjalankan update), dan while
public class Main {
    public static void main(String[] args) {
        int i = 0;
        System.out.print("do-while: ");
        do {
            i++;
            if (i % 2 == 0) {
                continue;
            }
            System.out.print(i + " ");
        } while (i < 7);
        System.out.println("| i = " + i);
        System.out.print("for     : ");
        int update = 0;
        for (int j = 0; j < 6; j++, update++) {
            if (j == 2 || j == 4) {
                continue;
            }
            System.out.print(j + " ");
        }
        System.out.println("| update dijalankan " + update + " kali");
        System.out.print("while   : ");
        int k = 0;
        while (k < 6) {
            k++;
            if (k == 3) {
                continue;
            }
            System.out.print(k + " ");
        }
        System.out.println();
        System.out.print("switch dalam loop: ");
        for (int n = 0; n < 5; n++) {
            switch (n) {
                case 1:
                    continue;
                case 3:
                    break;
                default:
                    System.out.print("[" + n + "]");
            }
            System.out.print(n + " ");
        }
        System.out.println();
        int berhenti = 0;
        do {
            berhenti++;
            if (berhenti == 3) {
                break;
            }
        } while (true);
        System.out.println("break dari do-while(true) pada " + berhenti);
    }
}
