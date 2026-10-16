// Error: kelas bersarang private dipakai dari kelas top-level lain (Rahasia has private access in Main)
public class Main {
    private static class Rahasia {
        String isi = "kode 1234";
    }

    public static void main(String[] args) {
        System.out.println(Pengintip.intip());
    }
}

class Pengintip {
    static String intip() {
        return new Main.Rahasia().isi;
    }
}
