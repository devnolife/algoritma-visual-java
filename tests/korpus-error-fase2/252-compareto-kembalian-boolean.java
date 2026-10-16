// Error: compareTo mengembalikan boolean, padahal Comparable mewajibkan int; javac lebih dulu melaporkan kelasnya di baris deklarasi kelas (Skor is not abstract and does not override abstract method compareTo(Skor) in Comparable)
public class Main {
    public static void main(String[] args) {
        Skor a = new Skor(70);
        Skor b = new Skor(85);
        System.out.println(a.compareTo(b));
    }
}

class Skor implements Comparable<Skor> {
    int nilai;

    Skor(int nilai) {
        this.nilai = nilai;
    }

    public boolean compareTo(Skor lain) {
        return nilai < lain.nilai;
    }
}
