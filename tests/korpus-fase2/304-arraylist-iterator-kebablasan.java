// Iterator manual: hasNext/next dipakai berpasangan; memanggil next() dua kali per putaran membuat iterator kebablasan (NoSuchElementException)
import java.util.ArrayList;
import java.util.Iterator;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> kartu = new ArrayList<>();
        String[] isi = {"As", "Raja", "Ratu", "Jack", "Sepuluh"};
        for (String s : isi) {
            kartu.add(s);
        }
        Iterator<String> it = kartu.iterator();
        while (it.hasNext()) {
            String k = it.next();
            System.out.println("kartu: " + k + " (" + k.length() + " huruf)");
        }
        System.out.println("hasNext setelah habis: " + it.hasNext());
        Iterator<String> pasangan = kartu.iterator();
        while (pasangan.hasNext()) {
            String pertama = pasangan.next();
            String kedua = pasangan.next();
            System.out.println("pasangan: " + pertama + " & " + kedua);
        }
        System.out.println("tidak tercetak");
    }
}
