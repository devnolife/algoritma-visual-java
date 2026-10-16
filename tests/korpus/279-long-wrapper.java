// Wrapper Long: cache -128..127, equals dengan Integer selalu false, dan jebakan HashMap<Long, ...> yang dicari memakai kunci int
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        Long a = 127L;
        Long b = 127L;
        Long c = 128L;
        Long d = 128L;
        System.out.println("127L == 127L : " + (a == b) + ", 128L == 128L : " + (c == d) + ", equals : " + c.equals(d));
        Long besar = Long.MAX_VALUE;
        System.out.println("MAX_VALUE = " + besar + ", + 1 = " + (besar + 1));
        long faktorial = 1;
        for (int i = 1; i <= 20; i++) {
            faktorial *= i;
        }
        Long f = faktorial;
        System.out.println("20! = " + f + ", intValue() = " + f.intValue());
        System.out.println("Long.parseLong(\"9000000000\") = " + Long.parseLong("9000000000") + ", valueOf = " + Long.valueOf(42));
        HashMap<Long, String> mahasiswa = new HashMap<>();
        mahasiswa.put(2021001L, "Ani");
        mahasiswa.put(2021002L, "Budi");
        long nim = 2021001;
        System.out.println("get(nim long) = " + mahasiswa.get(nim));
        System.out.println("get(2021002) dengan literal int = " + mahasiswa.get(2021002));
        System.out.println("containsKey(2021002) = " + mahasiswa.containsKey(2021002) + ", containsKey(2021002L) = " + mahasiswa.containsKey(2021002L));
        Long l1 = 5L;
        Integer i1 = 5;
        System.out.println("l1.equals(i1) = " + l1.equals(i1) + ", l1 == 5 = " + (l1 == 5) + ", l1.compareTo(4L) = " + l1.compareTo(4L));
        System.out.println("hashCode(2^32 + 7) = " + Long.valueOf(4294967303L).hashCode() + ", hashCode(-1L) = " + Long.valueOf(-1L).hashCode());
    }
}
