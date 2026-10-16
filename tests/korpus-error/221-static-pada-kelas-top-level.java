// Error: modifier static pada kelas top-level (modifier static not allowed here)
public class Main {
    public static void main(String[] args) {
        System.out.println(Pembantu.kuadrat(5));
    }
}

static class Pembantu {
    static int kuadrat(int x) {
        return x * x;
    }
}
