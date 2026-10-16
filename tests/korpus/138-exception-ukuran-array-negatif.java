// NegativeArraySizeException saat membuat array dengan ukuran negatif
public class Main {
    public static void main(String[] args) {
        int jumlah = 3;
        int[] a = new int[jumlah];
        System.out.println("Array pertama panjang " + a.length);
        int[] kosong = new int[0];
        System.out.println("Array ukuran 0 boleh, panjang " + kosong.length);
        double[][] tabel = new double[2][0];
        System.out.println("Array 2x0 juga boleh, baris " + tabel.length);
        jumlah -= 5;
        System.out.println("jumlah sekarang " + jumlah);
        int[] b = new int[jumlah];
        System.out.println("tidak tercetak " + b.length);
    }
}
