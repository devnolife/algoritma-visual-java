// Error: multi-catch menggabungkan exception dengan kelas induknya sendiri (Alternatives in a multi-catch statement cannot be related by subclassing)
public class Main {
    public static void main(String[] args) {
        String[] data = {"5", "x"};
        try {
            int a = Integer.parseInt(data[1]);
            System.out.println(a);
        } catch (NumberFormatException | IllegalArgumentException e) {
            System.out.println("format salah: " + e.getMessage());
        }
    }
}
