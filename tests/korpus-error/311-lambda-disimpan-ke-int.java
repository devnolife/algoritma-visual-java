// Error: lambda disimpan ke variabel int (incompatible types: int is not a functional interface)
public class Main {
    public static void main(String[] args) {
        int bandingkan = (a, b) -> a - b;
        System.out.println(bandingkan);
    }
}
