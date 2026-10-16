// Menghitung total belanja: diskon bertingkat, pajak, pembulatan, dan cast ke long
public class Main {
    public static void main(String[] args) {
        String[] barang = {"Buku tulis", "Pulpen", "Tas", "Kalkulator"};
        int[] harga = {4500, 2750, 189000, 125500};
        int[] jumlah = {12, 10, 1, 2};
        long subtotal = 0;
        for (int i = 0; i < barang.length; i++) {
            long total = (long) harga[i] * jumlah[i];
            subtotal += total;
            System.out.printf("%-12s %3d x %,9d = %,10d%n", barang[i], jumlah[i], harga[i], total);
        }
        double persenDiskon;
        if (subtotal >= 500000) {
            persenDiskon = 0.15;
        } else if (subtotal >= 250000) {
            persenDiskon = 0.10;
        } else if (subtotal >= 100000) {
            persenDiskon = 0.05;
        } else {
            persenDiskon = 0;
        }
        double diskon = subtotal * persenDiskon;
        double setelahDiskon = subtotal - diskon;
        double pajak = setelahDiskon * 0.11;
        double totalAkhir = setelahDiskon + pajak;
        System.out.println("Subtotal       : " + subtotal);
        System.out.println("Diskon " + (int) (persenDiskon * 100) + "%     : " + diskon);
        System.out.println("Setelah diskon : " + setelahDiskon);
        System.out.println("PPN 11%        : " + pajak);
        System.out.println("Total (double) : " + totalAkhir);
        System.out.println("Total (long)   : " + (long) totalAkhir);
        System.out.println("Total (round)  : " + Math.round(totalAkhir));
        long dibulatkanRatusan = Math.round(totalAkhir / 100) * 100;
        System.out.println("Bulat ratusan  : " + dibulatkanRatusan);
        System.out.printf("Total format   : Rp%,.2f%n", totalAkhir);
    }
}
