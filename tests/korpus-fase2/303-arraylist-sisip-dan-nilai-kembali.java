// add(index, e) menggeser elemen ke kanan, set mengembalikan nilai lama, dan remove(index) mengembalikan elemen yang dihapus
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> playlist = new ArrayList<>();
        playlist.add("Lagu A");
        playlist.add("Lagu C");
        System.out.println(playlist);
        playlist.add(1, "Lagu B");
        System.out.println("add(1, B): " + playlist);
        playlist.add(0, "Intro");
        System.out.println("add(0, Intro): " + playlist);
        playlist.add(playlist.size(), "Outro");
        System.out.println("add(size, Outro): " + playlist);
        String diganti = playlist.set(2, "Lagu B (remix)");
        System.out.println("set(2) mengganti \"" + diganti + "\": " + playlist);
        String keluar = playlist.remove(playlist.size() - 1);
        System.out.println("remove(terakhir) = \"" + keluar + "\": " + playlist);
        for (int i = 0; i < playlist.size(); i += 2) {
            playlist.add(i, "*");
            i++;
        }
        System.out.println("sisip * berselang: " + playlist);
        while (playlist.contains("*")) {
            playlist.remove("*");
        }
        System.out.println("hapus semua *: " + playlist + ", indexOf(Lagu C) = " + playlist.indexOf("Lagu C"));
        int posisi = playlist.indexOf("Lagu B (remix)");
        playlist.add(posisi + 1, playlist.get(posisi));
        System.out.println("duplikat setelah posisinya: " + playlist);
    }
}
