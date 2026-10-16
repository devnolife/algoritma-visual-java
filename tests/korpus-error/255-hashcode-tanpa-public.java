// Error: hashCode di-override tanpa public (hashCode() in Kunci cannot override hashCode() in Object)
import java.util.HashSet;

public class Main {
    public static void main(String[] args) {
        HashSet<Kunci> set = new HashSet<>();
        set.add(new Kunci(7));
        System.out.println(set.size());
    }
}

class Kunci {
    int id;

    Kunci(int id) {
        this.id = id;
    }

    int hashCode() {
        return id;
    }
}
