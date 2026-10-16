// Evaluasi ekspresi postfix dengan Stack<Integer> (isi stack dicetak per token); ekspresi rusak berakhir dengan EmptyStackException
import java.util.Stack;

public class Main {
    static int evaluasi(String postfix) {
        Stack<Integer> stack = new Stack<>();
        for (String token : postfix.split(" ")) {
            if (token.equals("+") || token.equals("-") || token.equals("*") || token.equals("/")) {
                int b = stack.pop();
                int a = stack.pop();
                int hasil;
                switch (token) {
                    case "+":
                        hasil = a + b;
                        break;
                    case "-":
                        hasil = a - b;
                        break;
                    case "*":
                        hasil = a * b;
                        break;
                    default:
                        hasil = a / b;
                        break;
                }
                stack.push(hasil);
            } else {
                stack.push(Integer.parseInt(token));
            }
            System.out.println("  " + token + " -> " + stack);
        }
        return stack.pop();
    }

    public static void main(String[] args) {
        String[] ekspresi = {"3 4 + 2 *", "5 1 2 + 4 * + 3 -", "20 3 / 4 2 - *"};
        for (String e : ekspresi) {
            System.out.println(e);
            System.out.println("= " + evaluasi(e));
        }
        System.out.println("2 +");
        System.out.println("= " + evaluasi("2 +"));
    }
}
