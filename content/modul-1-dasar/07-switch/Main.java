public class Main {
    public static void main(String[] args) {
        int pilihan = 2;
        int harga = 0;

        switch (pilihan) {                    // #lompat
            case 1:
                System.out.println("Nasi goreng");
                harga = 15000;
                break;
            case 2:
                System.out.println("Mie ayam");
                harga = 12000;
                break;                        // #putus
            case 3:
                System.out.println("Es teh");
                harga = 5000;
                break;
            default:
                System.out.println("Menu tidak ada");
        }
        System.out.println("Harga: " + harga);

        String hari = "Sabtu";
        System.out.print("Kantin hari " + hari + ": ");
        switch (hari) {                       // #panah
            case "Sabtu", "Minggu" -> System.out.println("tutup");
            default -> System.out.println("buka");
        }
    }
}
