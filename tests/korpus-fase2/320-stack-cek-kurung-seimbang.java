// Memeriksa kurung seimbang dengan Stack<Character>: setiap penutup harus cocok dengan pembuka di puncak stack
import java.util.Stack;

public class Main {
    static String periksa(String ekspresi) {
        Stack<Character> stack = new Stack<>();
        for (int i = 0; i < ekspresi.length(); i++) {
            char c = ekspresi.charAt(i);
            if (c == '(' || c == '[' || c == '{') {
                stack.push(c);
            } else if (c == ')' || c == ']' || c == '}') {
                if (stack.isEmpty()) {
                    return "tidak seimbang: '" + c + "' di posisi " + i + " tanpa pembuka";
                }
                char buka = stack.pop();
                if ((buka == '(' && c != ')') || (buka == '[' && c != ']') || (buka == '{' && c != '}')) {
                    return "tidak seimbang: '" + buka + "' ditutup dengan '" + c + "' di posisi " + i;
                }
            }
        }
        if (!stack.isEmpty()) {
            return "tidak seimbang: sisa pembuka " + stack;
        }
        return "seimbang";
    }

    public static void main(String[] args) {
        String[] uji = {"(a + b) * [c - {d / e}]", "((x)", "{[()]}()", "(]", "a + b)", "", "if (x[0] > 0) { y = (1 + 2); }"};
        for (String u : uji) {
            System.out.println("\"" + u + "\" -> " + periksa(u));
        }
    }
}
