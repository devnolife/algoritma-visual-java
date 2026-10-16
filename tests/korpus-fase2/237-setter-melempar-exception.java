// Setter melempar IllegalArgumentException: pemanggil menangkapnya dan objek tetap pada nilai valid terakhir
public class Main {
    public static void main(String[] args) {
        Termostat t = new Termostat(22);
        int[] permintaan = {25, 35, 18, -5, 16, 30};
        for (int p : permintaan) {
            try {
                t.setTarget(p);
                System.out.println("target diubah ke " + t.getTarget());
            } catch (IllegalArgumentException e) {
                System.out.println("gagal: " + e.getMessage() + " (target tetap " + t.getTarget() + ")");
            }
        }
        System.out.println("riwayat perubahan: " + t.getRiwayat());
        try {
            t.setMode("turbo");
        } catch (IllegalArgumentException e) {
            System.out.println(e);
        }
        t.setMode("hemat");
        System.out.println("mode " + t.getMode() + ", target " + t.getTarget());
    }
}

class Termostat {
    private int target;
    private String mode = "normal";
    private final StringBuilder riwayat = new StringBuilder();

    Termostat(int target) {
        setTarget(target);
    }

    int getTarget() {
        return target;
    }

    String getMode() {
        return mode;
    }

    String getRiwayat() {
        return riwayat.toString();
    }

    void setTarget(int target) {
        if (target < 16 || target > 30) {
            throw new IllegalArgumentException("suhu " + target + " di luar rentang 16-30");
        }
        this.target = target;
        riwayat.append(target).append(' ');
    }

    void setMode(String mode) {
        if (!mode.equals("normal") && !mode.equals("hemat")) {
            throw new IllegalArgumentException("mode tidak dikenal: " + mode);
        }
        this.mode = mode;
        if (mode.equals("hemat") && target > 24) {
            target = 24;
        }
    }
}
