// StringIndexOutOfBoundsException dari substring dengan indeks akhir melebihi panjang
public class Main {
    public static void main(String[] args) {
        String nim = "H071231045";
        System.out.println("Panjang NIM: " + nim.length());
        System.out.println("Kode fakultas: " + nim.substring(0, 1));
        System.out.println("Kode prodi: " + nim.substring(1, 4));
        System.out.println("Angkatan: " + nim.substring(4, 6));
        System.out.println("Sisa: [" + nim.substring(10) + "]");
        int awal = 7;
        int akhir = awal + 5;
        System.out.println("Mengambil indeks " + awal + " sampai " + akhir);
        System.out.println("Nomor urut: " + nim.substring(awal, akhir));
    }
}
