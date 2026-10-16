// Error: compareTo ditulis tanpa public sehingga aksesnya lebih sempit dari Comparable (compareTo(Nilai) in Nilai cannot implement compareTo(T) in Comparable)
public class Main {
    public static void main(String[] args) {
        Nilai a = new Nilai(70);
        Nilai b = new Nilai(85);
        System.out.println(a.compareTo(b));
    }
}

class Nilai implements Comparable<Nilai> {
    int angka;

    Nilai(int angka) {
        this.angka = angka;
    }

    int compareTo(Nilai lain) {
        return Integer.compare(angka, lain.angka);
    }
}
