// Error: continue di dalam switch yang tidak berada dalam loop (continue outside of loop)
public class Main {
    public static void main(String[] args) {
        int pilihan = 2;
        switch (pilihan) {
            case 1:
                System.out.println("satu");
                break;
            case 2:
                continue;
            default:
                System.out.println("lainnya");
        }
    }
}
