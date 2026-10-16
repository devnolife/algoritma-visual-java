// Error: field final tidak pernah diisi dan kelas tidak punya konstruktor (variable id not initialized in the default constructor)
public class Main {
    static class Pengguna {
        final int id;
        String nama;
    }

    public static void main(String[] args) {
        Pengguna p = new Pengguna();
        p.nama = "Ani";
        System.out.println(p.nama);
    }
}
