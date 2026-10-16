// Probe javac: void-digabung-string
public class Main {
    static void sapa() { }
    public static void main(String[] args) {
        String s = "a" + sapa();
    }
}
