// Error: blok catch tanpa try sebelumnya ('catch' without 'try')
public class Main {
    public static void main(String[] args) {
        int[] nilai = {80, 90};
        System.out.println(nilai[2]);
        catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("indeks salah");
        }
    }
}
