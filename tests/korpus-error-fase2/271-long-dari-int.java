// Error: literal int disimpan ke Long; pelebaran int ke long lalu boxing tidak diizinkan (incompatible types: int cannot be converted to Long)
public class Main {
    public static void main(String[] args) {
        Long populasi = 5;
        System.out.println(populasi * 1000);
    }
}
