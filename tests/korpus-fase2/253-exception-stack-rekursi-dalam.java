// Exception di ujung rekursi sedalam 25 tingkat tidak ditangkap: stack trace memuat setiap frame pemanggilan
public class Main {
    static int kedalamanMaks = 25;

    static int telusuri(int[] jalur, int tingkat) {
        if (tingkat == kedalamanMaks) {
            return jalur[tingkat];
        }
        jalur[tingkat] = tingkat * tingkat;
        return jalur[tingkat] + telusuri(jalur, tingkat + 1);
    }

    static int mulai(int ukuran) {
        int[] jalur = new int[ukuran];
        System.out.println("menelusuri dengan array berukuran " + ukuran);
        return telusuri(jalur, 0);
    }

    public static void main(String[] args) {
        System.out.println("hasil = " + mulai(30));
        System.out.println("hasil = " + mulai(25));
    }
}
