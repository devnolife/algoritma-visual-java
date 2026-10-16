// NPE saat memanggil method String pada referensi null (length, equals, charAt, toUpperCase, trim); konkatenasi dan "x".equals(null) justru aman
public class Main {
    static String cariNama(String[] data, String awalan) {
        for (String d : data) {
            if (d.startsWith(awalan)) {
                return d;
            }
        }
        return null;
    }

    public static void main(String[] args) {
        String nama = null;
        System.out.println("konkatenasi aman: " + nama + "!" + ", valueOf: " + String.valueOf(nama));
        System.out.println("bandingkan aman: " + "Budi".equals(nama));
        try {
            System.out.println(nama.length());
        } catch (NullPointerException e) {
            System.out.println("length: " + e.getMessage());
        }
        try {
            System.out.println(nama.equals("Budi"));
        } catch (NullPointerException e) {
            System.out.println("equals: " + e.getMessage());
        }
        try {
            System.out.println(nama.charAt(0));
        } catch (NullPointerException e) {
            System.out.println("charAt: " + e.getMessage());
        }
        String[] data = {"Ani", "Budi", "Cici"};
        try {
            System.out.println(cariNama(data, "Z").toUpperCase());
        } catch (NullPointerException e) {
            System.out.println("toUpperCase: " + e.getMessage());
        }
        String[] kosong = new String[2];
        System.out.println("elemen array String default: " + kosong[0]);
        String hasil = cariNama(data, "D");
        System.out.println("panjang hasil: " + hasil.trim().length());
    }
}
