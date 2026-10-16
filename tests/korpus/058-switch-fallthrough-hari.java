// switch klasik dengan fall-through: jumlah hari per bulan dan default di tengah
public class Main {
    static int jumlahHari(int bulan, int tahun) {
        int hari;
        switch (bulan) {
            case 2:
                if (tahun % 4 == 0 && (tahun % 100 != 0 || tahun % 400 == 0)) {
                    hari = 29;
                } else {
                    hari = 28;
                }
                break;
            case 4:
            case 6:
            case 9:
            case 11:
                hari = 30;
                break;
            default:
                hari = 31;
        }
        return hari;
    }

    public static void main(String[] args) {
        int total = 0;
        for (int b = 1; b <= 12; b++) {
            int h = jumlahHari(b, 2024);
            total += h;
            System.out.print(h + " ");
        }
        System.out.println("-> total " + total);
        System.out.println("Februari 1900: " + jumlahHari(2, 1900) + ", Februari 2000: " + jumlahHari(2, 2000));
        for (int level = 0; level <= 4; level++) {
            System.out.print("Level " + level + ":");
            switch (level) {
                case 3:
                    System.out.print(" bonus");
                default:
                    System.out.print(" biasa");
                case 1:
                    System.out.print(" satu");
                    break;
                case 2:
                    System.out.print(" dua");
            }
            System.out.println();
        }
        int nilai = 7;
        switch (nilai % 3) {
            case 0:
                System.out.println("habis dibagi 3");
                break;
            case 1:
                System.out.println("sisa 1");
            case 2:
                System.out.println("sisa 1 atau 2");
        }
    }
}
