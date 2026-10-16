// Enkapsulasi: field private hanya bisa diubah lewat setter yang memvalidasi; nilai lama dipertahankan bila input ditolak
public class Main {
    public static void main(String[] args) {
        Mahasiswa m = new Mahasiswa("Rudi", "H071211001");
        System.out.println(m.getNama() + " " + m.getNim() + ", ipk " + m.getIpk() + ", semester " + m.getSemester());
        m.setIpk(3.45);
        m.setIpk(4.5);
        m.setIpk(-1);
        m.setSemester(3);
        m.setSemester(0);
        m.setSemester(15);
        m.setNama("  ");
        m.setNama("  Rudi Hartono ");
        System.out.println(m.getNama() + " " + m.getNim() + ", ipk " + m.getIpk() + ", semester " + m.getSemester());
        System.out.println("Ditolak " + m.getJumlahDitolak() + " kali");
        System.out.println("Predikat: " + m.predikat());
        m.setIpk(3.8);
        System.out.println("Predikat setelah ipk 3.8: " + m.predikat());
    }
}

class Mahasiswa {
    private String nama;
    private final String nim;
    private double ipk;
    private int semester = 1;
    private int jumlahDitolak;

    Mahasiswa(String nama, String nim) {
        this.nama = nama;
        this.nim = nim;
    }

    public String getNama() {
        return nama;
    }

    public String getNim() {
        return nim;
    }

    public double getIpk() {
        return ipk;
    }

    public int getSemester() {
        return semester;
    }

    public int getJumlahDitolak() {
        return jumlahDitolak;
    }

    public void setNama(String nama) {
        if (nama == null || nama.trim().isEmpty()) {
            tolak("nama kosong");
            return;
        }
        this.nama = nama.trim();
    }

    public void setIpk(double ipk) {
        if (ipk < 0 || ipk > 4) {
            tolak("ipk " + ipk + " di luar 0..4");
            return;
        }
        this.ipk = ipk;
    }

    public void setSemester(int semester) {
        if (semester < 1 || semester > 14) {
            tolak("semester " + semester + " tidak valid");
            return;
        }
        this.semester = semester;
    }

    private void tolak(String alasan) {
        jumlahDitolak++;
        System.out.println("  ditolak: " + alasan);
    }

    public String predikat() {
        if (ipk >= 3.5) {
            return "cum laude";
        }
        return ipk >= 3.0 ? "sangat memuaskan" : "memuaskan";
    }
}
