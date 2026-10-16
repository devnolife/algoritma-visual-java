// split dengan " ", ",", "\\s+", "" dan perilaku string kosong di akhir
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        String kalimat = "saya belajar java";
        String[] kata = kalimat.split(" ");
        System.out.println(kata.length + " " + Arrays.toString(kata));
        String csv = "a,b,,c,,";
        String[] bagian = csv.split(",");
        System.out.println(bagian.length + " " + Arrays.toString(bagian));
        String awalKoma = ",x,y";
        System.out.println(awalKoma.split(",").length + " " + Arrays.toString(awalKoma.split(",")));
        String spasiBanyak = "  satu   dua\tTiga  ";
        String[] token = spasiBanyak.split("\\s+");
        System.out.println(token.length + " " + Arrays.toString(token));
        String[] tokenTrim = spasiBanyak.trim().split("\\s+");
        System.out.println(tokenTrim.length + " " + Arrays.toString(tokenTrim));
        String[] huruf = "halo".split("");
        System.out.println(huruf.length + " " + Arrays.toString(huruf));
        String[] kosong = "".split(",");
        System.out.println(kosong.length + " " + Arrays.toString(kosong) + " panjang elemen 0 = " + kosong[0].length());
        String[] hanyaKoma = ",,,".split(",");
        System.out.println(hanyaKoma.length + " " + Arrays.toString(hanyaKoma));
        String[] spasiTunggal = "a  b".split(" ");
        System.out.println(spasiTunggal.length + " " + Arrays.toString(spasiTunggal));
        String data = "Budi;20;3.75";
        String[] kolom = data.split(";");
        String nama = kolom[0];
        int umur = Integer.parseInt(kolom[1]);
        double ipk = Double.parseDouble(kolom[2]);
        System.out.println(nama + " berumur " + umur + " dengan IPK " + ipk);
        String tanggal = "2024-08-17";
        String[] t = tanggal.split("-");
        System.out.println("Hari " + t[2] + ", bulan " + t[1] + ", tahun " + t[0]);
        String[] tanpaPemisah = "abc".split(",");
        System.out.println(tanpaPemisah.length + " " + tanpaPemisah[0]);
        int total = 0;
        for (String angka : "10,20,30,40".split(",")) {
            total += Integer.parseInt(angka);
        }
        System.out.println("Total = " + total);
    }
}
