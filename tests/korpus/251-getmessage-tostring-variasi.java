// getMessage dan toString berbagai exception: pesan null, pesan kosong, exception buatan, dan exception bawaan JDK
public class Main {
    static class GagalValidasi extends Exception {
        GagalValidasi(String pesan) {
            super(pesan);
        }
    }

    static class TanpaPesan extends RuntimeException {
    }

    static void tampil(Exception e) {
        System.out.println("toString  : " + e);
        System.out.println("getMessage: " + e.getMessage());
        System.out.println("---");
    }

    public static void main(String[] args) {
        tampil(new RuntimeException());
        tampil(new RuntimeException(""));
        tampil(new Exception("gagal membaca berkas"));
        tampil(new IllegalArgumentException("umur negatif"));
        tampil(new GagalValidasi("NIM harus 10 digit"));
        tampil(new TanpaPesan());
        try {
            Object o = "teks";
            Integer i = (Integer) o;
            System.out.println(i);
        } catch (ClassCastException e) {
            tampil(e);
        }
        try {
            Integer.parseInt("12a");
        } catch (NumberFormatException e) {
            tampil(e);
        }
        try {
            "abc".charAt(5);
        } catch (StringIndexOutOfBoundsException e) {
            tampil(e);
        }
        try {
            int[] a = new int[-2];
            System.out.println(a.length);
        } catch (NegativeArraySizeException e) {
            tampil(e);
        }
        try {
            throw new UnsupportedOperationException("belum dibuat");
        } catch (UnsupportedOperationException e) {
            tampil(e);
        }
    }
}
