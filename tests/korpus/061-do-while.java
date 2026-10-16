// do-while: badan dijalankan minimal sekali, membalik digit, dan simulasi menu
public class Main {
    public static void main(String[] args) {
        int x = 100;
        do {
            System.out.println("Dijalankan walau kondisi salah, x = " + x);
            x++;
        } while (x < 50);
        int angka = 907150;
        int terbalik = 0;
        int digit = 0;
        do {
            terbalik = terbalik * 10 + angka % 10;
            angka /= 10;
            digit++;
        } while (angka > 0);
        System.out.println("Terbalik = " + terbalik + ", banyak digit = " + digit);
        int nol = 0;
        int hitungDigit = 0;
        do {
            hitungDigit++;
            nol /= 10;
        } while (nol != 0);
        System.out.println("Banyak digit dari 0 = " + hitungDigit);
        int[] pilihan = {2, 1, 3, 9, 0, 1};
        int idx = 0;
        int saldo = 100;
        int menu;
        do {
            menu = pilihan[idx++];
            switch (menu) {
                case 1:
                    saldo += 50;
                    System.out.println("Setor 50, saldo " + saldo);
                    break;
                case 2:
                    saldo -= 30;
                    System.out.println("Tarik 30, saldo " + saldo);
                    break;
                case 3:
                    System.out.println("Cek saldo: " + saldo);
                    break;
                case 0:
                    System.out.println("Keluar");
                    break;
                default:
                    System.out.println("Menu " + menu + " tidak ada");
            }
        } while (menu != 0);
        System.out.println("Sisa pilihan tidak diproses: " + (pilihan.length - idx));
        int n = 1;
        do n *= 3; while (n < 100);
        System.out.println("Pangkat 3 pertama >= 100: " + n);
    }
}
