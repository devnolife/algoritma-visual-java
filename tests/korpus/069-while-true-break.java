// while(true) dengan break, continue pada while, dan akumulasi sampai melewati batas
public class Main {
    public static void main(String[] args) {
        int tabungan = 0;
        int minggu = 0;
        while (true) {
            minggu++;
            tabungan += 15000 + minggu * 1000;
            if (tabungan >= 150000) {
                break;
            }
        }
        System.out.println("Tabungan " + tabungan + " tercapai pada minggu ke-" + minggu);
        int i = 0;
        int jumlahKelipatan3 = 0;
        while (i < 20) {
            i++;
            if (i % 3 != 0) {
                continue;
            }
            jumlahKelipatan3 += i;
            System.out.print(i + " ");
        }
        System.out.println("-> jumlah " + jumlahKelipatan3);
        int angka = 1;
        int pangkat = 0;
        while (angka <= 1_000_000) {
            angka *= 7;
            pangkat++;
        }
        System.out.println("7^" + pangkat + " = " + angka + " adalah pangkat 7 pertama > 1000000");
        int a = 48, b = 18;
        while (b != 0) {
            int sisa = a % b;
            a = b;
            b = sisa;
        }
        System.out.println("FPB 48 dan 18 = " + a);
        int hitungMundur = 5;
        while (hitungMundur-- > 0) {
            System.out.print(hitungMundur + " ");
        }
        System.out.println("| setelah loop: " + hitungMundur);
    }
}
