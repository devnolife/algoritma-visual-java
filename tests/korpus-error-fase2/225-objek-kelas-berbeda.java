// Error: objek kelas lain disimpan ke variabel kelas berbeda (incompatible types: Anjing cannot be converted to Kucing)
public class Main {
    public static void main(String[] args) {
        Kucing k = new Anjing();
        System.out.println(k.nama);
    }
}

class Kucing {
    String nama = "Tom";
}

class Anjing {
    String nama = "Spike";
}
