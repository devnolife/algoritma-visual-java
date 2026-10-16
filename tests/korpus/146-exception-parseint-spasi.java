// NumberFormatException: Integer.parseInt(" 12") karena spasi tidak dibuang otomatis
public class Main {
    public static void main(String[] args) {
        String data = "5, 12, 30";
        String[] bagian = data.split(",");
        System.out.println("Banyak bagian: " + bagian.length + ", bagian[1] = [" + bagian[1] + "]");
        System.out.println("Dengan trim: " + Integer.parseInt(bagian[1].trim()));
        System.out.println("Double.parseDouble membuang spasi: " + Double.parseDouble(bagian[1]));
        int jumlah = 0;
        for (String b : bagian) {
            jumlah += Integer.parseInt(b);
            System.out.println("jumlah sementara " + jumlah);
        }
    }
}
