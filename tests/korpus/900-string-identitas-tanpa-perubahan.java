// Identitas String: method yang tidak mengubah isi mengembalikan objek yang sama
public class Main {
    public static void main(String[] args) {
        String b = "KASUR";
        String k = "kasur";
        String s = "banana";
        System.out.println("upper sama: " + (b.toUpperCase() == b));
        System.out.println("lower sama: " + (k.toLowerCase() == k));
        System.out.println("upper beda: " + (k.toUpperCase() == k));
        System.out.println("substring(0): " + (s.substring(0) == s));
        System.out.println("substring(0,len): " + (s.substring(0, s.length()) == s));
        System.out.println("substring(1): " + (s.substring(1) == s));
        System.out.println("replace char tak ada: " + (s.replace('x', 'y') == s));
        System.out.println("replace char sama: " + (s.replace('a', 'a') == s));
        System.out.println("replace str tak ada: " + (s.replace("xy", "z") == s));
        System.out.println("replace str 1-1 sama: " + (s.replace("a", "a") == s));
        System.out.println("replace str 2-2 sama: " + (s.replace("an", "an") == s));
        System.out.println("valueOf: " + (String.valueOf(s) == s));
        System.out.println("toString: " + (s.toString() == s));
        System.out.println("trim: " + (s.trim() == s));
        System.out.println("strip: " + (s.strip() == s));
        System.out.println("repeat 1: " + (s.repeat(1) == s));
        System.out.println("concat kosong: " + (s.concat("") == s));
        String kosong = "";
        System.out.println("concat ke kosong: " + (kosong.concat(s) == s));
    }
}
