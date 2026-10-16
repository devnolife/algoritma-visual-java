// try-finally tanpa catch: finally berjalan di setiap tingkat saat exception merambat, lalu program berhenti dengan stack trace
public class Main {
    static int dalam = 0;

    static void turun(int n) {
        dalam++;
        try {
            System.out.println("masuk tingkat " + n);
            if (n == 0) {
                Object o = "tiga";
                Integer x = (Integer) o;
                System.out.println("tidak tercetak " + x);
            }
            turun(n - 1);
        } finally {
            System.out.println("finally tingkat " + n);
        }
    }

    public static void main(String[] args) {
        try {
            turun(3);
        } finally {
            System.out.println("finally main, dalam = " + dalam);
        }
    }
}
