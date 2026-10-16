// Metode Character: isDigit, isLetter, isWhitespace, toUpperCase, getNumericValue, compare
public class Main {
    public static void main(String[] args) {
        char[] contoh = {'a', 'Z', '5', ' ', '\t', '_', '$', '\n'};
        for (char c : contoh) {
            System.out.println("kode " + (int) c
                    + " digit=" + Character.isDigit(c)
                    + " huruf=" + Character.isLetter(c)
                    + " hurufDigit=" + Character.isLetterOrDigit(c)
                    + " besar=" + Character.isUpperCase(c)
                    + " kecil=" + Character.isLowerCase(c)
                    + " whitespace=" + Character.isWhitespace(c)
                    + " spaceChar=" + Character.isSpaceChar(c)
                    + " alfabet=" + Character.isAlphabetic(c));
        }
        System.out.println("toUpperCase('q') = " + Character.toUpperCase('q'));
        System.out.println("toLowerCase('Q') = " + Character.toLowerCase('Q'));
        System.out.println("toUpperCase('7') = " + Character.toUpperCase('7'));
        char c = 'a';
        System.out.println("toUpperCase(c + 1) = " + Character.toUpperCase(c + 1));
        System.out.println("getNumericValue('7') = " + Character.getNumericValue('7'));
        System.out.println("getNumericValue('a') = " + Character.getNumericValue('a'));
        System.out.println("getNumericValue('Z') = " + Character.getNumericValue('Z'));
        System.out.println("getNumericValue('-') = " + Character.getNumericValue('-'));
        System.out.println("Character.toString('x') = " + Character.toString('x'));
        char v = Character.valueOf('y');
        System.out.println("Character.valueOf('y') = " + v);
        System.out.println("compare('a', 'b') = " + Character.compare('a', 'b'));
        System.out.println("compare('a', 'd') = " + Character.compare('a', 'd'));
        System.out.println("compare('b', 'a') = " + Character.compare('b', 'a'));
        System.out.println("MIN_VALUE = " + (int) Character.MIN_VALUE + ", MAX_VALUE = " + (int) Character.MAX_VALUE);
        String kalimat = "Halo Dunia 2024!";
        int huruf = 0, angka = 0, spasi = 0, lain = 0;
        for (char ch : kalimat.toCharArray()) {
            if (Character.isLetter(ch)) {
                huruf++;
            } else if (Character.isDigit(ch)) {
                angka++;
            } else if (Character.isWhitespace(ch)) {
                spasi++;
            } else {
                lain++;
            }
        }
        System.out.println("Huruf=" + huruf + " angka=" + angka + " spasi=" + spasi + " lain=" + lain);
    }
}
