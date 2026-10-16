// Indeks tidak valid pada StringBuilder melempar StringIndexOutOfBoundsException dengan pesan berbeda untuk tiap method
public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("halo!");
        String[] percobaan = {"charAt(10)", "deleteCharAt(5)", "setCharAt(-1)", "insert(9)", "delete(3, 1)", "substring(4, 2)", "replace(7, 8)", "delete(2, 99)"};
        for (String p : percobaan) {
            try {
                switch (p) {
                    case "charAt(10)":
                        sb.charAt(10);
                        break;
                    case "deleteCharAt(5)":
                        sb.deleteCharAt(5);
                        break;
                    case "setCharAt(-1)":
                        sb.setCharAt(-1, 'x');
                        break;
                    case "insert(9)":
                        sb.insert(9, "x");
                        break;
                    case "delete(3, 1)":
                        sb.delete(3, 1);
                        break;
                    case "substring(4, 2)":
                        sb.substring(4, 2);
                        break;
                    case "replace(7, 8)":
                        sb.replace(7, 8, "x");
                        break;
                    default:
                        sb.delete(2, 99);
                        break;
                }
                System.out.println(p + " berhasil: \"" + sb + "\"");
            } catch (IndexOutOfBoundsException e) {
                System.out.println(p + " -> " + e);
            }
        }
        sb.append("lo");
        System.out.println("sekarang \"" + sb + "\"");
        sb.insert(sb.length() + 1, '?');
    }
}
