public class Main {
    public static void main(String[] args) {
        int umur;
        umur = 19;
        String nama = "Rina";
        System.out.println(nama + ", " + umur + " tahun");
        int gelasA = 5;
        int gelasB = 8;
        int sementara = gelasA;
        gelasA = gelasB;
        gelasB = sementara;
        System.out.println("gelasA = " + gelasA + ", gelasB = " + gelasB);
    }
}
