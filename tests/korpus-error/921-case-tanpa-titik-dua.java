// Probe javac: case-tanpa-titik-dua
public class Main {
    public static void main(String[] args) {
        int k = 1;
        switch (k) {
            case 1
                System.out.println(1);
                break;
        }
    }
}
