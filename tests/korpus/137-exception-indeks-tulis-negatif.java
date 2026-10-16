// ArrayIndexOutOfBoundsException saat menulis ke indeks negatif
public class Main {
    public static void main(String[] args) {
        char[] huruf = new char[3];
        System.out.println("Panjang array huruf: " + huruf.length);
        int posisi = 2;
        int terisi = 0;
        while (true) {
            huruf[posisi] = (char) ('a' + posisi);
            terisi++;
            System.out.println("Isi indeks " + posisi + " dengan " + huruf[posisi] + " (terisi " + terisi + ")");
            posisi--;
        }
    }
}
