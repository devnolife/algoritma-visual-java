public class Main {
    public static void main(String[] args) {
        int nilai = 78;
        int hadir = 12;
        String predikat;

        if (nilai >= 85) {                     // #rantai
            predikat = "Sangat baik";
        } else if (nilai >= 70) {
            predikat = "Baik";
        } else {
            predikat = "Kurang";
        }
        System.out.println("Predikat: " + predikat);

        if (nilai >= 60 && hadir >= 10) {      // #dan
            System.out.println("Status: Lulus");
        } else {
            System.out.println("Status: Tidak lulus");
            if (hadir < 10) {                  // #bersarang
                System.out.println("Sebab: kehadiran kurang");
            }
        }
    }
}
