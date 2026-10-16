// Exception tingkat rendah ditangkap lalu dilempar ulang sebagai exception buatan dengan pesan yang lebih jelas; yang terakhir tidak ditangkap
public class Main {
    static class ImporGagalException extends RuntimeException {
        ImporGagalException(String pesan) {
            super(pesan);
        }
    }

    static int[] parseBaris(String baris, int nomor) {
        String[] bagian = baris.split(",");
        int[] hasil = new int[3];
        try {
            for (int i = 0; i < 3; i++) {
                hasil[i] = Integer.parseInt(bagian[i].trim());
            }
        } catch (NumberFormatException e) {
            throw new ImporGagalException("baris " + nomor + ": angka tidak valid (" + e.getMessage() + ")");
        } catch (ArrayIndexOutOfBoundsException e) {
            throw new ImporGagalException("baris " + nomor + ": kolom kurang (" + e.getMessage() + ")");
        }
        return hasil;
    }

    public static void main(String[] args) {
        String[] csv = {"10, 20, 30", "4,5", "7, x, 9", "1,2,3,4", "8 ,9,10"};
        int total = 0;
        for (int i = 0; i < csv.length; i++) {
            try {
                int[] b = parseBaris(csv[i], i + 1);
                total += b[0] + b[1] + b[2];
                System.out.println("baris " + (i + 1) + " ok, total " + total);
            } catch (ImporGagalException e) {
                System.out.println("lewati -> " + e.getMessage());
            }
        }
        parseBaris("", 99);
    }
}
