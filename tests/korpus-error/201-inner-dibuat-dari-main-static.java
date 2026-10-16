// Error: kelas inner (non-static) dibuat langsung dari main yang static (non-static variable this cannot be referenced from a static context)
public class Main {
    class Simpul {
        int data;
        Simpul next;

        Simpul(int data) {
            this.data = data;
        }
    }

    public static void main(String[] args) {
        Simpul kepala = new Simpul(5);
        System.out.println(kepala.data);
    }
}
