// Error: kata return ditulis pada lambda berbentuk ekspresi tanpa kurung kurawal (illegal start of expression)
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> data = new ArrayList<>();
        data.add(9);
        data.add(3);
        data.sort((a, b) -> return a - b);
        System.out.println(data);
    }
}
