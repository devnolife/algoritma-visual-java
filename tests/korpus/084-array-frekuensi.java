// Frekuensi dengan array int: lemparan dadu tetap, modus, dan histogram
public class Main {
    public static void main(String[] args) {
        int[] lemparan = {3, 6, 1, 3, 5, 6, 6, 2, 4, 3, 6, 1, 5, 6, 2, 3, 4, 6, 1, 3};
        int[] frekuensi = new int[7];
        for (int x : lemparan) {
            frekuensi[x]++;
        }
        int modus = 1;
        for (int sisi = 1; sisi <= 6; sisi++) {
            System.out.printf("%d: %-8s (%d)%n", sisi, "#".repeat(frekuensi[sisi]), frekuensi[sisi]);
            if (frekuensi[sisi] > frekuensi[modus]) {
                modus = sisi;
            }
        }
        System.out.println("Modus = " + modus);
        int[] nilai = {85, 72, 90, 65, 72, 88, 95, 72, 60, 85};
        int[] rentang = new int[5];
        String[] label = {"<60", "60-69", "70-79", "80-89", "90+"};
        for (int n : nilai) {
            int k;
            if (n < 60) {
                k = 0;
            } else if (n >= 90) {
                k = 4;
            } else {
                k = n / 10 - 5;
            }
            rentang[k]++;
        }
        for (int i = 0; i < rentang.length; i++) {
            System.out.println(label[i] + " : " + rentang[i]);
        }
        boolean[] pernahMuncul = new boolean[101];
        int unik = 0;
        for (int n : nilai) {
            if (!pernahMuncul[n]) {
                pernahMuncul[n] = true;
                unik++;
            }
        }
        System.out.println("Nilai unik: " + unik);
    }
}
