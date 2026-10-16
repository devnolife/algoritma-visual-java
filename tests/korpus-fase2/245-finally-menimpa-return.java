// return di finally menimpa return dari try dan menelan exception; mengubah variabel di finally tidak mengubah nilai yang sudah dihitung untuk return
public class Main {
    static int angka() {
        try {
            return 1;
        } finally {
            return 2;
        }
    }

    static int telan() {
        try {
            throw new IllegalStateException("hilang");
        } finally {
            return 99;
        }
    }

    static int nilaiTersimpan() {
        int x = 10;
        try {
            return x;
        } finally {
            x = 20;
            System.out.println("  finally: x diubah menjadi " + x);
        }
    }

    static StringBuilder objekTersimpan() {
        StringBuilder sb = new StringBuilder("awal");
        try {
            return sb;
        } finally {
            sb.append(" + diubah di finally");
        }
    }

    static String urutan() {
        String s = "try";
        try {
            return s + "-kembali";
        } finally {
            s = "finally";
            System.out.println("  finally berjalan setelah ekspresi return dihitung, s = " + s);
        }
    }

    public static void main(String[] args) {
        System.out.println("angka() = " + angka());
        System.out.println("telan() = " + telan());
        System.out.println("nilaiTersimpan() = " + nilaiTersimpan());
        System.out.println("objekTersimpan() = " + objekTersimpan());
        System.out.println("urutan() = " + urutan());
    }
}
