// Wrapper Character: autoboxing char, cache untuk kode <= 127, compareTo, ArrayList<Character>, dan jebakan remove('A') yang dianggap indeks 65
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        Character c1 = 'A';
        Character c2 = 'A';
        Character e1 = (char) 233;
        Character e2 = (char) 233;
        System.out.println("'A' == 'A' : " + (c1 == c2) + ", kode 233 == kode 233 : " + (e1 == e2) + ", equals : " + e1.equals(e2));
        System.out.println("compareTo('A', 'C') = " + c1.compareTo('C') + ", charValue = " + c1.charValue());
        int kode = c1 + 1;
        char berikut = (char) (c1 + 1);
        System.out.println("c1 + 1 = " + kode + ", sebagai char = " + berikut);
        ArrayList<Character> huruf = new ArrayList<>();
        String kalimat = "Java 21, Mantap!";
        for (char ch : kalimat.toCharArray()) {
            if (Character.isLetter(ch)) {
                huruf.add(Character.toUpperCase(ch));
            }
        }
        System.out.println("huruf besar: " + huruf);
        int vokal = 0;
        for (Character ch : huruf) {
            if ("AIUEO".indexOf(ch) >= 0) {
                vokal++;
            }
        }
        System.out.println("vokal = " + vokal + ", contains('M') = " + huruf.contains('M') + ", indexOf('T') = " + huruf.indexOf('T'));
        Character x = Character.valueOf('z');
        System.out.println("valueOf('z') = " + x + ", toString = " + x.toString() + ", hashCode = " + x.hashCode());
        huruf.remove(Character.valueOf('A'));
        System.out.println("setelah remove(Character.valueOf('A')): " + huruf);
        try {
            huruf.remove('A');
        } catch (IndexOutOfBoundsException e) {
            System.out.println("remove('A') memanggil remove(int 65): " + e.getMessage());
        }
    }
}
