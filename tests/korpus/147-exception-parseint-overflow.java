// NumberFormatException: Integer.parseInt("2147483648") melebihi Integer.MAX_VALUE
public class Main {
    public static void main(String[] args) {
        String maks = "2147483647";
        String min = "-2147483648";
        System.out.println("Integer.MAX_VALUE = " + Integer.MAX_VALUE);
        System.out.println("parseInt(MAX) = " + Integer.parseInt(maks));
        System.out.println("parseInt(MIN) = " + Integer.parseInt(min));
        System.out.println("parseLong(\"2147483648\") = " + Long.parseLong("2147483648"));
        System.out.println("parseDouble(\"2147483648\") = " + Double.parseDouble("2147483648"));
        String lewat = "2147483648";
        int nilai = Integer.parseInt(lewat);
        System.out.println("tidak tercetak " + nilai);
    }
}
