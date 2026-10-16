/**
 * Pembangkit fixture fidelitas koleksi: `pnpm exec tsx scripts/fixture-koleksi.ts` (butuh JDK 21).
 *
 * 1. Membangkitkan FixtureKoleksi.java dari skenario di tests/engine/koleksi/skenario.ts, menjalankannya
 *    dengan `--add-opens java.base/java.util=ALL-UNNAMED`, lalu mencatat per langkah: nilai kembali atau
 *    exception, log pemanggilan equals/hashCode/compareTo/compare/toString, toString() koleksi, dan state
 *    internal lewat refleksi (array penopang lengkap dengan kapasitas & slot null, size/modCount/head/tail,
 *    rantai simpul LinkedList beserta konsistensi prev, field iterator).
 * 2. Menjalankan UrutKoleksi.java untuk kasus pengurutan (TimSort/ComparableTimSort) dengan pencatat setiap
 *    perbandingan.
 * Hasil ditulis ke tests/engine/koleksi/fixture/*.json agar unit test tidak membutuhkan JDK.
 */
import { spawn } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  buatMasukan,
  KASUS_URUT,
  SKENARIO,
  type Arg,
  type Langkah,
  type Skenario,
  type TipeElemen,
} from '../tests/engine/koleksi/skenario'

const DIR_KERJA = join('node_modules', '.cache', 'fixture-koleksi')
const DIR_FIXTURE = join('tests', 'engine', 'koleksi', 'fixture')

const HARNESS_AWAL = String.raw`import java.lang.reflect.*;
import java.util.*;
import java.util.concurrent.Callable;

@SuppressWarnings({"unchecked", "rawtypes"})
public class FixtureKoleksi {
  static final Object VOID = new Object();
  static boolean catatAktif = false;
  static final ArrayList<String> LOG = new ArrayList<>();
  static final ArrayList<String> LANGKAH = new ArrayList<>();
  static Object c, d;
  static Collection w;
  static Map.Entry e;
  static Iterator it;
  static Object[] arr;

  static void catat(String s) { if (catatAktif) LOG.add(s); }

  static final class K implements Comparable<K> {
    static int seri = 0;
    final int v; final int s;
    K(int v) { this.v = v; this.s = ++seri; }
    String nama() { return "K" + v + "#" + s; }
    @Override public boolean equals(Object o) { catat("eq " + nama() + " " + FixtureKoleksi.nama(o)); return o instanceof K && ((K) o).v == v; }
    @Override public int hashCode() { catat("hash " + nama()); return v; }
    @Override public int compareTo(K o) { catat("cmp " + nama() + " " + FixtureKoleksi.nama(o)); return Integer.compare(v, o.v); }
    @Override public String toString() { catat("str " + nama()); return "K" + v; }
  }

  static final class Orang { @Override public String toString() { return "Orang"; } }

  /** Kunci pencatat dengan hashCode = v / 10: H10..H19 bertabrakan (hash sama, equals berbeda). */
  static final class H implements Comparable<H> {
    static int seri = 0;
    final int v; final int s;
    H(int v) { this.v = v; this.s = ++seri; }
    String nama() { return "H" + v + "#" + s; }
    @Override public boolean equals(Object o) { catat("eq " + nama() + " " + FixtureKoleksi.nama(o)); return o instanceof H && ((H) o).v == v; }
    @Override public int hashCode() { catat("hash " + nama()); return v / 10; }
    @Override public int compareTo(H o) { catat("cmp " + nama() + " " + FixtureKoleksi.nama(o)); return Integer.compare(v, o.v); }
    @Override public String toString() { catat("str " + nama()); return "H" + v; }
  }

  static final Object PRESENT_HS = f(null, HashSet.class, "PRESENT");
  static final Object PRESENT_TS = f(null, TreeSet.class, "PRESENT");

  static String nama(Object x) {
    if (x == null) return "null";
    if (x instanceof K) return ((K) x).nama();
    if (x instanceof H) return ((H) x).nama();
    if (x == PRESENT_HS || x == PRESENT_TS) return "PRESENT";
    if (x instanceof Integer || x instanceof String) return String.valueOf(x);
    if (x instanceof Orang) return "Orang";
    return "?";
  }

  static int nilai(Object x) { return x instanceof K ? ((K) x).v : x instanceof H ? ((H) x).v : (Integer) x; }

  static final Comparator CMP_LOG = (x, y) -> { catat("cmpr " + nama(x) + " " + nama(y)); return Integer.compare(nilai(x), nilai(y)); };
  static final Comparator CMP_TERBALIK = Collections.reverseOrder();
  static boolean sudahUbah;
  static final Comparator CMP_UBAH = (x, y) -> { if (!sudahUbah) { sudahUbah = true; ((Collection) c).add(Integer.valueOf(99)); } return Integer.compare(nilai(x), nilai(y)); };

  static String js(String s) {
    if (s == null) return "null";
    StringBuilder b = new StringBuilder("\"");
    for (char ch : s.toCharArray()) {
      if (ch == '"') b.append("\\\"");
      else if (ch == '\\') b.append("\\\\");
      else if (ch == '\n') b.append("\\n");
      else if (ch < 0x20) b.append(String.format("\\u%04x", (int) ch));
      else b.append(ch);
    }
    return b.append('"').toString();
  }

  static String elemJson(Object x) {
    if (x == null) return "null";
    if (x instanceof Integer || x instanceof Boolean) return x.toString();
    if (x instanceof String) return js((String) x);
    if (x == PRESENT_HS || x == PRESENT_TS) return js("PRESENT");
    if (x instanceof Map.Entry) {
      Map.Entry en = (Map.Entry) x;
      return "{\"entri\":[" + elemJson(en.getKey()) + "," + elemJson(en.getValue()) + "],\"kelas\":" + js(x.getClass().getName()) + "}";
    }
    if (x instanceof Map) return js("@peta");
    if (x instanceof Collection) return js("@koleksi");
    if (x instanceof K) return js("K" + ((K) x).v);
    if (x instanceof H) return js("H" + ((H) x).v);
    if (x instanceof Orang) return js("Orang");
    return js("?" + x.getClass().getName());
  }

  static String arrJson(Object[] a) {
    StringBuilder b = new StringBuilder("[");
    for (int i = 0; i < a.length; i++) { if (i > 0) b.append(','); b.append(elemJson(a[i])); }
    return b.append(']').toString();
  }

  static Object f(Object o, Class<?> k, String n) {
    try { Field fl = k.getDeclaredField(n); fl.setAccessible(true); return fl.get(o); }
    catch (Exception e) { throw new RuntimeException(e); }
  }

  static Class<?> kelas(String n) {
    try { return Class.forName(n); } catch (Exception e) { throw new RuntimeException(e); }
  }

  static final Class<?> NODE = kelas("java.util.LinkedList$Node");
  static final Class<?> HNODE = kelas("java.util.HashMap$Node");
  static final Class<?> LENTRY = kelas("java.util.LinkedHashMap$Entry");
  static final Class<?> TENTRY = kelas("java.util.TreeMap$Entry");

  /** HashMap/LinkedHashMap: tabel lengkap (slot null + rantai [hash, key, value]), size, threshold, modCount. */
  static String hashJson(Object m) {
    Object[] tab = (Object[]) f(m, HashMap.class, "table");
    StringBuilder b = new StringBuilder("{\"table\":");
    if (tab == null) b.append("null");
    else {
      b.append('[');
      for (int i = 0; i < tab.length; i++) {
        if (i > 0) b.append(',');
        if (tab[i] == null) { b.append("null"); continue; }
        if (tab[i].getClass().getName().equals("java.util.HashMap$TreeNode")) b.append("\"POHON\",");
        b.append('[');
        boolean pertama = true;
        for (Object n = tab[i]; n != null; n = f(n, HNODE, "next")) {
          if (!pertama) b.append(',');
          pertama = false;
          b.append('[').append(f(n, HNODE, "hash")).append(',').append(elemJson(f(n, HNODE, "key"))).append(',').append(elemJson(f(n, HNODE, "value"))).append(']');
        }
        b.append(']');
      }
      b.append(']');
    }
    b.append(",\"size\":").append(f(m, HashMap.class, "size")).append(",\"threshold\":").append(f(m, HashMap.class, "threshold"))
      .append(",\"modCount\":").append(f(m, HashMap.class, "modCount")).append(",\"loadFactor\":").append(f(m, HashMap.class, "loadFactor"))
      .append(",\"view\":").append(cacheJson(m));
    if (m instanceof LinkedHashMap) {
      boolean ok = true;
      Object prev = null;
      int n = 0;
      StringBuilder t = new StringBuilder("[");
      for (Object x = f(m, LinkedHashMap.class, "head"); x != null && n < 10000; x = f(x, LENTRY, "after"), n++) {
        if (f(x, LENTRY, "before") != prev) ok = false;
        if (!diTabel(tab, x)) ok = false;
        prev = x;
        if (n > 0) t.append(',');
        t.append('[').append(elemJson(f(x, HNODE, "key"))).append(',').append(elemJson(f(x, HNODE, "value"))).append(']');
      }
      if (f(m, LinkedHashMap.class, "tail") != prev || n != (Integer) f(m, HashMap.class, "size")) ok = false;
      b.append(",\"tautan\":").append(t).append("],\"tautanOk\":").append(ok);
    }
    return b.append('}').toString();
  }

  static boolean diTabel(Object[] tab, Object x) {
    if (tab == null) return false;
    for (Object n : tab) for (; n != null; n = f(n, HNODE, "next")) if (n == x) return true;
    return false;
  }

  /** Field cache view milik map (dibuat malas oleh keySet()/values()/entrySet()/navigableKeySet()). */
  static final String[] CACHE_HM = { "entrySet", "keySet", "values" };
  static final String[] CACHE_TM = { "entrySet", "navigableKeySet", "descendingMap", "keySet", "values" };

  static String[] namaCache(Object m) { return m instanceof TreeMap ? CACHE_TM : CACHE_HM; }

  static Field fieldCache(Object m, String n) {
    Class<?> k = n.equals("keySet") || n.equals("values") ? AbstractMap.class : m instanceof TreeMap ? TreeMap.class : HashMap.class;
    try { Field fl = k.getDeclaredField(n); fl.setAccessible(true); return fl; } catch (Exception e) { throw new RuntimeException(e); }
  }

  /** Nama view yang sudah dibuat dan disimpan map, mis. "entrySet,keySet". */
  static String cacheJson(Object m) {
    StringJoiner j = new StringJoiner(",");
    try { for (String n : namaCache(m)) if (fieldCache(m, n).get(m) != null) j.add(n); } catch (Exception e) { throw new RuntimeException(e); }
    return js(j.toString());
  }

  /** Map yang cache view-nya ikut dicatat: HashMap/TreeMap, atau map penopang HashSet/TreeSet. */
  static Object petaCache(Object x) {
    Object m = petaAkar(x);
    return m instanceof HashMap || m instanceof TreeMap ? m : null;
  }

  /** toString() di dump mengisi cache view; nilai field disimpan lalu dipulihkan agar dump tanpa efek samping. */
  static Object[] simpanCache(Object x) {
    Object m = x == null ? null : petaCache(x);
    if (m == null) return null;
    String[] nama = namaCache(m);
    Object[] r = new Object[nama.length + 1];
    r[0] = m;
    try { for (int i = 0; i < nama.length; i++) r[i + 1] = fieldCache(m, nama[i]).get(m); } catch (Exception e) { throw new RuntimeException(e); }
    return r;
  }

  static void pulihkanCache(Object[] r) {
    if (r == null) return;
    String[] nama = namaCache(r[0]);
    try { for (int i = 0; i < nama.length; i++) fieldCache(r[0], nama[i]).set(r[0], r[i + 1]); } catch (Exception e) { throw new RuntimeException(e); }
  }

  /** TreeMap: bentuk pohon {k, v, w(arna), l, r}; parentOk memeriksa setiap tautan parent. */
  static String pohonJson(Object x, Object induk, boolean[] ok) {
    if (x == null) return "null";
    if (f(x, TENTRY, "parent") != induk) ok[0] = false;
    String k = elemJson(f(x, TENTRY, "key")), v = elemJson(f(x, TENTRY, "value"));
    String w = ((Boolean) f(x, TENTRY, "color")) ? "B" : "R";
    String l = pohonJson(f(x, TENTRY, "left"), x, ok), r = pohonJson(f(x, TENTRY, "right"), x, ok);
    return "{\"k\":" + k + ",\"v\":" + v + ",\"w\":\"" + w + "\",\"l\":" + l + ",\"r\":" + r + "}";
  }

  static String treeJson(Object m) {
    boolean[] ok = { true };
    String root = pohonJson(f(m, TreeMap.class, "root"), null, ok);
    return "{\"root\":" + root + ",\"parentOk\":" + ok[0] + ",\"size\":" + f(m, TreeMap.class, "size") + ",\"modCount\":"
      + f(m, TreeMap.class, "modCount") + ",\"comparator\":" + (f(m, TreeMap.class, "comparator") == null ? "null" : js("ada"))
      + ",\"view\":" + cacheJson(m) + "}";
  }

  static boolean diPohon(Object x, Object cari) {
    if (x == null) return false;
    return x == cari || diPohon(f(x, TENTRY, "left"), cari) || diPohon(f(x, TENTRY, "right"), cari);
  }

  /** Map penopang dari koleksi/map apa pun (untuk memeriksa apakah simpul masih terpasang). */
  static Object petaAkar(Object k) {
    if (k instanceof HashSet) return f(k, HashSet.class, "map");
    if (k instanceof TreeSet) return f(k, TreeSet.class, "m");
    return k;
  }

  static String entriRefJson(Object node, Object koleksi) {
    Object m = petaAkar(koleksi);
    boolean pasang = m instanceof HashMap ? diTabel((Object[]) f(m, HashMap.class, "table"), node)
      : m instanceof TreeMap ? diPohon(f(m, TreeMap.class, "root"), node) : false;
    Map.Entry en = (Map.Entry) node;
    return js((pasang ? "N:" : "lepas:") + nama(en.getKey()) + "=" + nama(en.getValue()));
  }

  static List<Object> rantai(Object x) {
    ArrayList<Object> r = new ArrayList<>();
    if (!(x instanceof LinkedList)) return r;
    for (Object s = f(x, LinkedList.class, "first"); s != null && r.size() < 10000; s = f(s, NODE, "next")) r.add(s);
    return r;
  }

  static String dalam(Object x) {
    String n = x.getClass().getName();
    switch (n) {
      case "java.util.ArrayList": {
        Object[] ed = (Object[]) f(x, ArrayList.class, "elementData");
        String bersama = ed == f(null, ArrayList.class, "DEFAULTCAPACITY_EMPTY_ELEMENTDATA") ? js("DEFAULTCAPACITY_EMPTY_ELEMENTDATA")
          : ed == f(null, ArrayList.class, "EMPTY_ELEMENTDATA") ? js("EMPTY_ELEMENTDATA") : "null";
        return "{\"elementData\":" + arrJson(ed) + ",\"bersama\":" + bersama + ",\"size\":" + f(x, ArrayList.class, "size")
          + ",\"modCount\":" + f(x, AbstractList.class, "modCount") + "}";
      }
      case "java.util.LinkedList": {
        List<Object> simpul = rantai(x);
        boolean ok = true;
        Object prev = null;
        StringBuilder isi = new StringBuilder("[");
        for (int i = 0; i < simpul.size(); i++) {
          Object s = simpul.get(i);
          if (f(s, NODE, "prev") != prev) ok = false;
          prev = s;
          if (i > 0) isi.append(',');
          isi.append(elemJson(f(s, NODE, "item")));
        }
        if (f(x, LinkedList.class, "last") != prev) ok = false;
        return "{\"isi\":" + isi + "],\"prevOk\":" + ok + ",\"size\":" + f(x, LinkedList.class, "size")
          + ",\"modCount\":" + f(x, AbstractList.class, "modCount") + "}";
      }
      case "java.util.ArrayDeque":
        return "{\"elements\":" + arrJson((Object[]) f(x, ArrayDeque.class, "elements")) + ",\"head\":" + f(x, ArrayDeque.class, "head")
          + ",\"tail\":" + f(x, ArrayDeque.class, "tail") + "}";
      case "java.util.Stack":
      case "java.util.Vector":
        return "{\"elementData\":" + arrJson((Object[]) f(x, Vector.class, "elementData")) + ",\"elementCount\":" + f(x, Vector.class, "elementCount")
          + ",\"capacityIncrement\":" + f(x, Vector.class, "capacityIncrement") + ",\"modCount\":" + f(x, AbstractList.class, "modCount") + "}";
      case "java.util.PriorityQueue":
        return "{\"queue\":" + arrJson((Object[]) f(x, PriorityQueue.class, "queue")) + ",\"size\":" + f(x, PriorityQueue.class, "size")
          + ",\"modCount\":" + f(x, PriorityQueue.class, "modCount") + ",\"comparator\":"
          + (f(x, PriorityQueue.class, "comparator") == null ? "null" : js("ada")) + "}";
      case "java.util.Arrays$ArrayList":
        return "{\"a\":" + arrJson((Object[]) f(x, kelas(n), "a")) + ",\"modCount\":" + f(x, AbstractList.class, "modCount") + "}";
      case "java.util.ImmutableCollections$ListN":
      case "java.util.ImmutableCollections$List12":
        return "{\"isi\":" + arrJson(((List) x).toArray()) + "}";
      case "java.util.HashMap":
      case "java.util.LinkedHashMap":
        return hashJson(x);
      case "java.util.TreeMap":
        return treeJson(x);
      case "java.util.HashSet":
      case "java.util.LinkedHashSet":
        return "{\"map\":" + hashJson(f(x, HashSet.class, "map")) + "}";
      case "java.util.TreeSet":
        return "{\"m\":" + treeJson(f(x, TreeSet.class, "m")) + "}";
      case "java.util.HashMap$KeySet": case "java.util.HashMap$Values": case "java.util.HashMap$EntrySet":
      case "java.util.LinkedHashMap$LinkedKeySet": case "java.util.LinkedHashMap$LinkedValues": case "java.util.LinkedHashMap$LinkedEntrySet":
      case "java.util.TreeMap$KeySet": case "java.util.TreeMap$Values": case "java.util.TreeMap$EntrySet":
        return js(n);
      default:
        return js("?" + n);
    }
  }

  static String simpulJson(Object node, Object koleksi) {
    if (node == null) return "null";
    List<Object> r = rantai(koleksi);
    for (int i = 0; i < r.size(); i++) if (r.get(i) == node) return String.valueOf(i);
    return js("lepas:" + nama(f(node, NODE, "item")) + (f(node, NODE, "next") == null ? "" : ">") + (f(node, NODE, "prev") == null ? "" : "<"));
  }

  static String itJson(Object iter, Object koleksi) {
    StringBuilder b = new StringBuilder("{");
    boolean pertama = true;
    for (Class<?> k = iter.getClass(); k != null && k != Object.class; k = k.getSuperclass()) {
      for (Field fl : k.getDeclaredFields()) {
        if (Modifier.isStatic(fl.getModifiers()) || fl.isSynthetic()) continue;
        Object v;
        try { fl.setAccessible(true); v = fl.get(iter); } catch (Exception e) { throw new RuntimeException(e); }
        if (v != null && (v.getClass().isArray() || v == koleksi)) continue;
        String nilai;
        if (fl.getType() == int.class || fl.getType() == boolean.class) nilai = String.valueOf(v);
        else if (v == null) nilai = "null";
        else if (v.getClass() == NODE) nilai = simpulJson(v, koleksi);
        else if (v instanceof Map.Entry) nilai = entriRefJson(v, koleksi);
        else if (v instanceof ArrayDeque) nilai = js(String.valueOf(v));
        else nilai = elemJson(v);
        if (!pertama) b.append(',');
        pertama = false;
        b.append(js(fl.getName())).append(':').append(nilai);
      }
    }
    return b.append('}').toString();
  }

  static String teksAman(Object x) {
    try { return js(String.valueOf(x)); } catch (Throwable t) { return js("!" + t.getClass().getName()); }
  }

  static String koleksiJson(String teks, String dalam) {
    return "{\"teks\":" + teks + ",\"dalam\":" + dalam + "}";
  }

  static void langkah(String op, Callable<Object> fungsi) {
    LOG.clear();
    catatAktif = true;
    Object hasil = null;
    Throwable galat = null;
    try { hasil = fungsi.call(); } catch (Throwable t) { galat = t; }
    catatAktif = false;
    StringBuilder b = new StringBuilder("{\"op\":").append(op);
    if (galat != null) {
      b.append(",\"galat\":{\"kelas\":").append(js(galat.getClass().getName())).append(",\"pesan\":").append(js(galat.getMessage())).append('}');
    } else if (hasil != VOID) {
      b.append(",\"hasil\":").append(elemJson(hasil));
    }
    b.append(",\"log\":[");
    for (int i = 0; i < LOG.size(); i++) { if (i > 0) b.append(','); b.append(js(LOG.get(i))); }
    b.append(']');
    // Isi dalam (refleksi murni) dulu; toString() dump bisa mengisi cache view, jadi cache dipulihkan sesudahnya.
    String dc = c == null ? null : dalam(c), dd = d == null ? null : dalam(d), dw = w == null ? null : dalam(w);
    Object[] sc = simpanCache(c), sd = simpanCache(d);
    String tc = c == null ? null : teksAman(c), td = d == null ? null : teksAman(d), tw = w == null ? null : teksAman(w);
    pulihkanCache(sc);
    pulihkanCache(sd);
    if (c != null) b.append(",\"c\":").append(koleksiJson(tc, dc));
    if (d != null) b.append(",\"d\":").append(koleksiJson(td, dd));
    if (it != null) b.append(",\"it\":").append(itJson(it, c));
    if (arr != null) b.append(",\"arr\":").append(arrJson(arr));
    if (w != null) b.append(",\"w\":").append(koleksiJson(tw, dw));
    if (e != null) b.append(",\"e\":").append(elemJson(e));
    LANGKAH.add(b.append('}').toString());
  }

  static void mulai() { c = null; d = null; w = null; e = null; it = null; arr = null; K.seri = 0; H.seri = 0; sudahUbah = false; LANGKAH.clear(); }

  static void selesai(String nama) {
    System.out.println("{\"nama\":" + js(nama) + ",\"langkah\":[" + String.join(",", LANGKAH) + "]}");
  }
`

const URUT_JAVA = String.raw`import java.io.*;
import java.util.*;

public class UrutKoleksi {
  static final int BATAS_CATAT = 200;
  static int jumlah, hash, nCatat, acak;
  static int[] catat = new int[2 * BATAS_CATAT];

  static final class S implements Comparable<S> {
    final int v, i;
    S(int v, int i) { this.v = v; this.i = i; }
    @Override public int compareTo(S o) { rekam(i, o.i); return Integer.compare(v, o.v); }
  }

  static void rekam(int a, int b) {
    jumlah++;
    hash = 31 * hash + a;
    hash = 31 * hash + b;
    if (nCatat < 2 * BATAS_CATAT) { catat[nCatat++] = a; catat[nCatat++] = b; }
  }

  static int berikutAcak() { acak = acak * 1103515245 + 12345; return (acak >>> 16) & 0x7fff; }

  static String js(String s) { return s == null ? "null" : "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\""; }

  public static void main(String[] args) throws Exception {
    BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
    String baris;
    while ((baris = in.readLine()) != null) {
      if (baris.isBlank()) continue;
      String[] t = baris.trim().split(" ");
      String mode = t[0];
      int n = Integer.parseInt(t[1]), dari = Integer.parseInt(t[2]), sampai = Integer.parseInt(t[3]);
      acak = Integer.parseInt(t[4]);
      S[] a = new S[n];
      int hashMasukan = 0;
      for (int i = 0; i < n; i++) { a[i] = new S(Integer.parseInt(t[5 + i]), i); hashMasukan = 31 * hashMasukan + a[i].v; }
      jumlah = 0; hash = 0; nCatat = 0;
      Comparator<S> cmp = mode.equals("comparator") ? (x, y) -> { rekam(x.i, y.i); return Integer.compare(x.v, y.v); }
        : mode.equals("kacau") ? (x, y) -> { rekam(x.i, y.i); return berikutAcak() % 3 - 1; } : null;
      String galat = null;
      try {
        if (cmp == null) Arrays.sort(a, dari, sampai); else Arrays.sort(a, dari, sampai, cmp);
      } catch (Throwable e) {
        galat = "{\"kelas\":" + js(e.getClass().getName()) + ",\"pesan\":" + js(e.getMessage()) + "}";
      }
      int hashHasil = 0;
      StringBuilder hasil = new StringBuilder("[");
      for (int i = 0; i < n; i++) { hashHasil = 31 * hashHasil + a[i].i; if (i > 0) hasil.append(','); hasil.append(a[i].i); }
      StringBuilder b = new StringBuilder("{\"hashMasukan\":" + hashMasukan + ",\"jumlah\":" + jumlah + ",\"hash\":" + hash + ",\"hashHasil\":" + hashHasil);
      if (jumlah <= BATAS_CATAT) {
        b.append(",\"banding\":[");
        for (int i = 0; i < nCatat; i++) { if (i > 0) b.append(','); b.append(catat[i]); }
        b.append(']');
      }
      if (n <= 64) b.append(",\"hasil\":").append(hasil).append(']');
      if (galat != null) b.append(",\"galat\":").append(galat);
      System.out.println(b.append('}'));
    }
  }
}
`

// ---------- Pembangkitan kode Java dari skenario ----------
const KELAS_JAVA: Record<string, string> = {
  ArrayList: 'ArrayList',
  LinkedList: 'LinkedList',
  ArrayDeque: 'ArrayDeque',
  Stack: 'Stack',
  Vector: 'Vector',
  PriorityQueue: 'PriorityQueue',
  asList: 'List',
  listOf: 'List',
  HashMap: 'HashMap',
  LinkedHashMap: 'LinkedHashMap',
  TreeMap: 'TreeMap',
  HashSet: 'HashSet',
  LinkedHashSet: 'LinkedHashSet',
  TreeSet: 'TreeSet',
  view: 'Collection',
}

const KELAS_PETA = new Set(['HashMap', 'LinkedHashMap', 'TreeMap'])
/** Parameter generik konstruktor: map butuh dua. */
const generik = (kelas: string) => (KELAS_PETA.has(kelas) ? '<Object, Object>' : '<Object>')
/** Literal argumen konstruktor: bilangan pecahan → float (`0.5f`). */
const angkaJava = (x: number) => (Number.isInteger(x) ? String(x) : `${x}f`)

function elemenJava(a: Arg, tipe: TipeElemen): string {
  if (a === null) return 'null'
  if (typeof a === 'number')
    return tipe === 'K' ? `new K(${a})` : tipe === 'H' ? `new H(${a})` : `Integer.valueOf(${a})`
  if (a === '!orang') return 'new Orang()'
  if (a.startsWith('@')) return a.slice(1)
  return JSON.stringify(a)
}

/** Literal nilai map: angka → Integer (apa pun tipe elemen skenario), teks → String, '@x' → variabel. */
function nilaiJava(a: Arg): string {
  if (a === null) return 'null'
  if (typeof a === 'number') return `Integer.valueOf(${a})`
  if (a.startsWith('@')) return a.slice(1)
  return JSON.stringify(a)
}

const variabelJava = (a: Arg) => (a === null ? 'null' : String(a).slice(1))
const koleksiJava = (a: Arg) => `(Collection) ${variabelJava(a)}`
const pembandingJava = (a: Arg) =>
  a === '#log'
    ? 'CMP_LOG'
    : a === '#terbalik'
      ? 'CMP_TERBALIK'
      : a === '#ubah'
        ? 'CMP_UBAH'
        : '(Comparator) null'

type Pembentuk = (t: string, a: Arg[], el: (x: Arg) => string, nl: (x: Arg) => string) => string

/** Metode biasa: [jenis argumen, pembentuk ekspresi, void?]. `t` = target yang sudah di-cast. */
const METODE: Record<string, [Pembentuk, boolean?]> = {
  add: [(t, a, el) => `${t}.add(${el(a[0])})`],
  addIndeks: [(t, a, el) => `${t}.add(${a[0]}, ${el(a[1])})`, true],
  addAll: [(t, a) => `${t}.addAll(${koleksiJava(a[0])})`],
  addAllIndeks: [(t, a) => `${t}.addAll(${a[0]}, ${koleksiJava(a[1])})`],
  get: [(t, a) => `${t}.get(${a[0]})`],
  set: [(t, a, el) => `${t}.set(${a[0]}, ${el(a[1])})`],
  removeIndeks: [(t, a) => `${t}.remove(${a[0]})`],
  removeObjek: [(t, a, el) => `${t}.remove((Object) ${el(a[0])})`],
  indexOf: [(t, a, el) => `${t}.indexOf((Object) ${el(a[0])})`],
  lastIndexOf: [(t, a, el) => `${t}.lastIndexOf((Object) ${el(a[0])})`],
  contains: [(t, a, el) => `${t}.contains((Object) ${el(a[0])})`],
  containsElemen: [(t, a) => `${t}.contains(${t}.get(${a[0]}))`],
  size: [(t) => `${t}.size()`],
  isEmpty: [(t) => `${t}.isEmpty()`],
  clear: [(t) => `${t}.clear()`, true],
  addFirst: [(t, a, el) => `${t}.addFirst(${el(a[0])})`, true],
  addLast: [(t, a, el) => `${t}.addLast(${el(a[0])})`, true],
  offerFirst: [(t, a, el) => `${t}.offerFirst(${el(a[0])})`],
  offerLast: [(t, a, el) => `${t}.offerLast(${el(a[0])})`],
  offer: [(t, a, el) => `${t}.offer(${el(a[0])})`],
  removeFirst: [(t) => `${t}.removeFirst()`],
  removeLast: [(t) => `${t}.removeLast()`],
  pollFirst: [(t) => `${t}.pollFirst()`],
  pollLast: [(t) => `${t}.pollLast()`],
  getFirst: [(t) => `${t}.getFirst()`],
  getLast: [(t) => `${t}.getLast()`],
  peekFirst: [(t) => `${t}.peekFirst()`],
  peekLast: [(t) => `${t}.peekLast()`],
  pop: [(t) => `${t}.pop()`],
  peek: [(t) => `${t}.peek()`],
  poll: [(t) => `${t}.poll()`],
  element: [(t) => `${t}.element()`],
  remove: [(t) => `${t}.remove()`],
  empty: [(t) => `${t}.empty()`],
  search: [(t, a, el) => `${t}.search((Object) ${el(a[0])})`],
  trimToSize: [(t) => `${t}.trimToSize()`, true],
  ensureCapacity: [(t, a) => `${t}.ensureCapacity(${a[0]})`, true],
  removeFirstOccurrence: [(t, a, el) => `${t}.removeFirstOccurrence((Object) ${el(a[0])})`],
  removeLastOccurrence: [(t, a, el) => `${t}.removeLastOccurrence((Object) ${el(a[0])})`],
  toString: [(t: string) => `${t}.toString()`] as [Pembentuk],
  hashCode: [(t) => `${t}.hashCode()`],
  equals: [(t, a) => `${t}.equals((Object) ${variabelJava(a[0])})`],
  equalsSalinan: [(t, a) => `${t}.equals(new ${a[0]}((Collection) ${t}))`],
  sort: [(t, a) => `${t}.sort(${pembandingJava(a[0])})`, true],
  iterator: [(t) => `it = ${t}.iterator()`, true],
  put: [(t, a, el, nl) => `${t}.put(${el(a[0])}, ${nl(a[1])})`],
  mGet: [(t, a, el) => `${t}.get((Object) ${el(a[0])})`],
  getOrDefault: [(t, a, el, nl) => `${t}.getOrDefault((Object) ${el(a[0])}, ${nl(a[1])})`],
  containsKey: [(t, a, el) => `${t}.containsKey((Object) ${el(a[0])})`],
  containsValue: [(t, a, _el, nl) => `${t}.containsValue((Object) ${nl(a[0])})`],
  mRemove: [(t, a, el) => `${t}.remove((Object) ${el(a[0])})`],
  putIfAbsent: [(t, a, el, nl) => `${t}.putIfAbsent(${el(a[0])}, ${nl(a[1])})`],
  putAll: [(t, a) => `${t}.putAll((Map) ${variabelJava(a[0])})`, true],
  containsNilai: [(t, a, _el, nl) => `${t}.contains((Object) ${nl(a[0])})`],
  removeNilai: [(t, a, _el, nl) => `${t}.remove((Object) ${nl(a[0])})`],
  firstKey: [(t) => `${t}.firstKey()`],
  lastKey: [(t) => `${t}.lastKey()`],
  firstEntry: [(t) => `${t}.firstEntry()`],
  lastEntry: [(t) => `${t}.lastEntry()`],
  pollFirstEntry: [(t) => `${t}.pollFirstEntry()`],
  pollLastEntry: [(t) => `${t}.pollLastEntry()`],
  first: [(t) => `${t}.first()`],
  last: [(t) => `${t}.last()`],
  floorKey: [(t, a, el) => `${t}.floorKey(${el(a[0])})`],
  ceilingKey: [(t, a, el) => `${t}.ceilingKey(${el(a[0])})`],
  higherKey: [(t, a, el) => `${t}.higherKey(${el(a[0])})`],
  lowerKey: [(t, a, el) => `${t}.lowerKey(${el(a[0])})`],
  floorEntry: [(t, a, el) => `${t}.floorEntry(${el(a[0])})`],
  ceilingEntry: [(t, a, el) => `${t}.ceilingEntry(${el(a[0])})`],
  higherEntry: [(t, a, el) => `${t}.higherEntry(${el(a[0])})`],
  lowerEntry: [(t, a, el) => `${t}.lowerEntry(${el(a[0])})`],
  floor: [(t, a, el) => `${t}.floor(${el(a[0])})`],
  ceiling: [(t, a, el) => `${t}.ceiling(${el(a[0])})`],
  higher: [(t, a, el) => `${t}.higher(${el(a[0])})`],
  lower: [(t, a, el) => `${t}.lower(${el(a[0])})`],
  elementAt: [(t, a) => `${t}.elementAt(${a[0]})`],
  removeElementAt: [(t, a) => `${t}.removeElementAt(${a[0]})`, true],
  firstElement: [(t) => `${t}.firstElement()`],
  lastElement: [(t) => `${t}.lastElement()`],
  addElement: [(t, a, el) => `${t}.addElement(${el(a[0])})`, true],
  insertElementAt: [(t, a, el) => `${t}.insertElementAt(${el(a[0])}, ${a[1]})`, true],
  push: [(t, a, el) => `${t}.push(${el(a[0])})`],
}

const BATAS = 'if (++n > 100) return "batas";'

/** Makro iterasi: badan blok Java; `v` = variabel koleksi. */
const MAKRO: Record<string, (v: string, a: Arg[], el: (x: Arg) => string) => string> = {
  foreachHapusNilai: (v, a) =>
    `int n = 0; for (Object x : (Collection) ${v}) { ${BATAS} if (nilai(x) == ${a[0]}) ((Collection) ${v}).remove(x); } return VOID;`,
  foreachHapusGenap: (v) =>
    `int n = 0; for (Object x : (Collection) ${v}) { ${BATAS} if (nilai(x) % 2 == 0) ((Collection) ${v}).remove(x); } return VOID;`,
  foreachTambah: (v, a, el) =>
    `int n = 0; for (Object x : (Collection) ${v}) { ${BATAS} ((Collection) ${v}).add(${el(a[0])}); } return VOID;`,
  foreachKumpul: (v) =>
    `int n = 0; StringBuilder b = new StringBuilder(); for (Object x : (Collection) ${v}) { ${BATAS} b.append(nama(x)).append(' '); } return b.toString();`,
  foreachPollFirst: (v) =>
    `int n = 0; for (Object x : (Collection) ${v}) { ${BATAS} ((ArrayDeque) ${v}).pollFirst(); } return VOID;`,
  itHapusSemua: (v) =>
    `int n = 0; Iterator i = ((Collection) ${v}).iterator(); while (i.hasNext()) { ${BATAS} i.next(); i.remove(); } return VOID;`,
  itHapusGenap: (v) =>
    `int n = 0; Iterator i = ((Collection) ${v}).iterator(); while (i.hasNext()) { ${BATAS} if (nilai(i.next()) % 2 == 0) i.remove(); } return VOID;`,
}

/** Ekspresi Java satu langkah (dibungkus jadi lambda Callable). */
function badanLangkah(langkah: Langkah, s: Skenario, kelasVar: Record<string, string>): string {
  const [opPenuh, ...a] = langkah
  const tipe = s.elemen ?? 'Integer'
  const el = (x: Arg) => elemenJava(x, tipe)
  const awalan = /^([dw])\./.exec(opPenuh)
  const v = awalan ? awalan[1] : 'c'
  const op = awalan ? opPenuh.slice(2) : opPenuh
  const blok = (isi: string) => `{ ${isi} }`

  switch (op) {
    case 'baru': {
      const kelas = a[0] as string
      kelasVar[v] = kelas
      const argumen = a
        .slice(1)
        .map((x) =>
          x === '#NaN' ? 'Float.NaN' : typeof x === 'string' ? pembandingJava(x) : angkaJava(x as number),
        )
      return blok(`${v} = new ${kelas}${generik(kelas)}(${argumen.join(', ')}); return VOID;`)
    }
    case 'baruDari': {
      const kelas = a[0] as string
      kelasVar[v] = kelas
      const sumber = KELAS_PETA.has(kelas) ? `(Map) ${variabelJava(a[1])}` : koleksiJava(a[1])
      return blok(`${v} = new ${kelas}${generik(kelas)}(${sumber}); return VOID;`)
    }
    case 'baruDariSorted': {
      const kelas = a[0] as string
      kelasVar[v] = kelas
      const sumber = KELAS_PETA.has(kelas)
        ? `(SortedMap) ${variabelJava(a[1])}`
        : `(SortedSet) ${variabelJava(a[1])}`
      return blok(`${v} = new ${kelas}${generik(kelas)}(${sumber}); return VOID;`)
    }
    case 'lihatKunci':
    case 'lihatNilai':
    case 'lihatEntri': {
      kelasVar.w = 'view'
      const metode = op === 'lihatKunci' ? 'keySet' : op === 'lihatNilai' ? 'values' : 'entrySet'
      return blok(`w = ((Map) ${v}).${metode}(); return VOID;`)
    }
    case 'lihatKunciNav':
      kelasVar.w = 'view'
      return blok(`w = ((NavigableMap) ${v}).navigableKeySet(); return VOID;`)
    case 'itNextEntri':
      return blok('e = (Map.Entry) it.next(); return e;')
    // Langkah bersarang: `e` diisi hasil (entri) langkah lain, atau dibandingkan dengannya.
    case 'eAmbil':
      return blok(`e = (Map.Entry) ${badanLangkah([a[0] as string, ...a.slice(1)], s, kelasVar)}; return e;`)
    case 'eEqualsDari':
      return `e.equals((Object) ${badanLangkah([a[0] as string, ...a.slice(1)], s, kelasVar)})`
    case 'eSetValue':
      return `e.setValue(${nilaiJava(a[0])})`
    case 'eGetKey':
      return 'e.getKey()'
    case 'eGetValue':
      return 'e.getValue()'
    case 'eToString':
      return 'e.toString()'
    case 'eHashCode':
      return 'e.hashCode()'
    case 'eEquals':
      return `e.equals((Object) ${variabelJava(a[0])})`
    case 'asList':
      kelasVar[v] = 'asList'
      return blok(`arr = new Object[]{${a.map(el).join(', ')}}; ${v} = Arrays.asList(arr); return VOID;`)
    case 'listOf':
      kelasVar[v] = 'listOf'
      return blok(`${v} = List.<Object>of(${a.map((x) => `(Object) ${el(x)}`).join(', ')}); return VOID;`)
    case 'asListNull':
      return blok('Arrays.asList((Object[]) null); return VOID;')
    case 'listOfSama':
      return 'List.of() == List.of()'
    case 'arrSet':
      return blok(`arr[${a[0]}] = ${el(a[1])}; return VOID;`)
    case 'arrTeks':
      return 'Arrays.toString(arr)'
    case 'itHasNext':
      return 'it.hasNext()'
    case 'itNext':
      return 'it.next()'
    case 'itRemove':
      return blok('it.remove(); return VOID;')
    case 'Collections.sort':
      return blok(`Collections.sort((List) ${variabelJava(a[0])}); return VOID;`)
    case 'Collections.sortC':
      return blok(`Collections.sort((List) ${variabelJava(a[0])}, ${pembandingJava(a[1])}); return VOID;`)
    case 'Collections.reverse':
      return blok(`Collections.reverse((List) ${variabelJava(a[0])}); return VOID;`)
    case 'Collections.swap':
      return blok(`Collections.swap((List) ${variabelJava(a[0])}, ${a[1]}, ${a[2]}); return VOID;`)
    case 'Collections.max':
      return `Collections.max(${koleksiJava(a[0])})`
    case 'Collections.maxC':
      return `Collections.max(${koleksiJava(a[0])}, ${pembandingJava(a[1])})`
    case 'Collections.min':
      return `Collections.min(${koleksiJava(a[0])})`
    case 'Collections.minC':
      return `Collections.min(${koleksiJava(a[0])}, ${pembandingJava(a[1])})`
    case 'Collections.frequency':
      return `Collections.frequency(${koleksiJava(a[0])}, ${el(a[1])})`
    case 'Collections.addAllNull':
      return `Collections.addAll(${koleksiJava(a[0])}, (Object[]) null)`
    case 'Collections.addAll':
      return `Collections.addAll(${koleksiJava(a[0])}, new Object[]{${a.slice(1).map(el).join(', ')}})`
  }
  const makro = Object.hasOwn(MAKRO, op) ? MAKRO[op] : undefined
  if (makro) return blok(makro(v, a, el))
  const metode = Object.hasOwn(METODE, op) ? METODE[op] : undefined
  if (!metode) throw new Error(`Op tidak dikenal: ${opPenuh} (skenario ${s.nama})`)
  const kelas = kelasVar[v]
  if (!kelas) throw new Error(`Variabel ${v} belum dibuat sebelum ${opPenuh} (skenario ${s.nama})`)
  const t = `((${KELAS_JAVA[kelas]}) ${v})`
  const [bentuk, kosong] = metode
  // push milik Deque bertipe void; push milik Stack mengembalikan elemen.
  const tanpaNilai = kosong || (op === 'push' && kelas !== 'Stack')
  const ekspr = bentuk(t, a, el, nilaiJava)
  return tanpaNilai ? blok(`${ekspr}; return VOID;`) : ekspr
}

function programSkenario(daftar: Skenario[]): string {
  const bagian = [HARNESS_AWAL]
  daftar.forEach((s, i) => {
    const kelasVar: Record<string, string> = {}
    const baris = s.langkah.map((l) => {
      const label = JSON.stringify(JSON.stringify(l))
      return `    langkah(${label}, () -> ${badanLangkah(l, s, kelasVar)});`
    })
    bagian.push(
      `  static void s${i}() {\n    mulai();\n${baris.join('\n')}\n    selesai(${JSON.stringify(s.nama)});\n  }\n`,
    )
  })
  bagian.push(
    `  public static void main(String[] args) {\n${daftar.map((_, i) => `    s${i}();`).join('\n')}\n  }\n}\n`,
  )
  return bagian.join('\n')
}

// ---------- Menjalankan JDK ----------
interface HasilProses {
  stdout: string
  stderr: string
  kode: number | null
}

function proses(perintah: string, argumen: string[], cwd: string, stdin = ''): Promise<HasilProses> {
  return new Promise((resolve, reject) => {
    const p = spawn(perintah, argumen, { cwd, windowsHide: true })
    let stdout = ''
    let stderr = ''
    p.stdout.setEncoding('utf8').on('data', (d: string) => (stdout += d))
    p.stderr.setEncoding('utf8').on('data', (d: string) => (stderr += d))
    p.on('error', reject)
    p.on('close', (kode) => resolve({ stdout: stdout.replace(/\r\n/g, '\n'), stderr, kode }))
    p.stdin.end(stdin)
  })
}

const JAVAC = ['-J-Duser.language=en', '-J-Duser.country=US', '-encoding', 'UTF-8', '-nowarn', '-d', 'out']
const JAVA = [
  '-Duser.language=en',
  '-Duser.country=US',
  '-Dstdout.encoding=UTF-8',
  '--add-opens',
  'java.base/java.util=ALL-UNNAMED',
  '-cp',
  'out',
]

async function jalankanJava(nama: string, sumber: string, stdin = ''): Promise<string[]> {
  const dir = join(DIR_KERJA, nama)
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(join(dir, 'out'), { recursive: true })
  writeFileSync(join(dir, `${nama}.java`), sumber)
  const c = await proses('javac', [...JAVAC, `${nama}.java`], dir)
  if (c.kode !== 0) throw new Error(`javac gagal untuk ${nama}:\n${c.stderr}`)
  const r = await proses('java', [...JAVA, nama], dir, stdin)
  if (r.kode !== 0) throw new Error(`java gagal untuk ${nama} (kode ${r.kode}):\n${r.stderr}`)
  return r.stdout.split('\n').filter((b) => b.trim() !== '')
}

async function versiJdk(): Promise<string> {
  const r = await proses('java', ['-version'], '.')
  return /version "([^"]+)"/.exec(r.stderr)?.[1] ?? 'tidak diketahui'
}

/** JSON dengan satu langkah/kasus per baris: mudah dibaca dan ramah diff. */
function tulisFixture(
  berkas: string,
  kepala: Record<string, unknown>,
  kunci: string,
  isi: Record<string, unknown[]> | unknown[],
): void {
  const baris: string[] = ['{']
  for (const [k, v] of Object.entries(kepala)) baris.push(`  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
  if (Array.isArray(isi)) {
    baris.push(`  ${JSON.stringify(kunci)}: [`)
    baris.push(isi.map((x) => `    ${JSON.stringify(x)}`).join(',\n'))
    baris.push('  ]')
  } else {
    baris.push(`  ${JSON.stringify(kunci)}: {`)
    const bagian = Object.entries(isi).map(
      ([nama, langkah]) =>
        `    ${JSON.stringify(nama)}: [\n${langkah.map((x) => `      ${JSON.stringify(x)}`).join(',\n')}\n    ]`,
    )
    baris.push(bagian.join(',\n'))
    baris.push('  }')
  }
  baris.push('}')
  writeFileSync(join(DIR_FIXTURE, `${berkas}.json`), baris.join('\n') + '\n')
}

async function utama(): Promise<void> {
  const mulai = performance.now()
  const jdk = await versiJdk()
  if (!jdk.startsWith('21')) console.warn(`Peringatan: fixture dimaksudkan untuk JDK 21, terdeteksi ${jdk}.`)
  mkdirSync(DIR_FIXTURE, { recursive: true })

  const nama = new Set<string>()
  for (const s of SKENARIO) {
    if (nama.has(s.nama)) throw new Error(`Nama skenario ganda: ${s.nama}`)
    nama.add(s.nama)
  }
  const keluaran = await jalankanJava('FixtureKoleksi', programSkenario(SKENARIO))
  const hasil = new Map<string, unknown[]>()
  for (const b of keluaran) {
    const o = JSON.parse(b) as { nama: string; langkah: unknown[] }
    hasil.set(o.nama, o.langkah)
  }
  const perBerkas = new Map<string, Record<string, unknown[]>>()
  for (const s of SKENARIO) {
    const langkah = hasil.get(s.nama)
    if (!langkah) throw new Error(`Skenario ${s.nama} tidak menghasilkan keluaran`)
    const isi = perBerkas.get(s.berkas) ?? {}
    isi[s.nama] = langkah
    perBerkas.set(s.berkas, isi)
  }
  let jumlahLangkah = 0
  for (const [berkas, isi] of perBerkas) {
    tulisFixture(berkas, { jdk }, 'skenario', isi)
    const n = Object.values(isi).reduce((t, l) => t + l.length, 0)
    jumlahLangkah += n
    console.log(`  ${berkas}.json: ${Object.keys(isi).length} skenario, ${n} langkah`)
  }

  const masukan = KASUS_URUT.map((k) => {
    const v = buatMasukan(k.pola, k.n, k.benih)
    return [k.mode, k.n, k.dari, k.sampai, k.benihKacau, ...v].join(' ')
  })
  const hasilUrut = await jalankanJava('UrutKoleksi', URUT_JAVA, masukan.join('\n') + '\n')
  if (hasilUrut.length !== KASUS_URUT.length)
    throw new Error(`UrutKoleksi: ${hasilUrut.length}/${KASUS_URUT.length} kasus`)
  const kasus = KASUS_URUT.map((k, i) => ({ ...k, ...(JSON.parse(hasilUrut[i]) as object) }))
  tulisFixture('urut', { jdk }, 'kasus', kasus)
  console.log(`  urut.json: ${kasus.length} kasus pengurutan`)

  rmSync(DIR_KERJA, { recursive: true, force: true })
  const durasi = ((performance.now() - mulai) / 1000).toFixed(1)
  console.log(
    `Fixture JDK ${jdk}: ${SKENARIO.length} skenario (${jumlahLangkah} langkah) dalam ${durasi} dtk.`,
  )
}

void utama().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
