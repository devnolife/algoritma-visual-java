/**
 * Model koleksi java.util (Fase 2): koleksi sebagai objek heap dengan field privat JDK 21 persis.
 * Mengimpor berkas ini mendaftarkan semua model ke registri (lihat `ModelKoleksi` di registri.ts).
 */
export {
  BelumDidukung,
  teksKoleksi,
  type HeapKoleksi,
  type IteratorLokal,
  type LogikaIterator,
  type OperasiElemen,
  type Wadah,
} from './heap'
export {
  adalahKoleksi,
  adalahList,
  adalahMap,
  adalahSet,
  cariModel,
  cariModelMap,
  daftarkanKoleksi,
  daftarkanMap,
  iterasi,
  keArray,
  modelDari,
  modelMapDari,
  ukuranKoleksi,
  type IteratorDaftarLokal,
  type ModelKoleksi,
  type ModelMap,
  type OperasiDaftar,
} from './registri'
export { urutkan } from './urut'
export { ArrayListItr, ArrayListModel, KELAS_ARRAYLIST } from './arrayList'
export { KELAS_LINKEDLIST, KELAS_NODE, LinkedListItr, LinkedListModel } from './linkedList'
export { ArrayDequeItr, ArrayDequeModel, KELAS_ARRAYDEQUE } from './arrayDeque'
export { KELAS_STACK, KELAS_VECTOR, StackModel, VectorItr, VectorModel } from './vector'
export { KELAS_PRIORITYQUEUE, PriorityQueueItr, PriorityQueueModel } from './priorityQueue'
export {
  ArraysAsListItr,
  ArraysAsListModel,
  KELAS_ARRAYS_ARRAYLIST,
  KELAS_LISTN,
  ListOfItr,
  ListOfModel,
} from './daftarTetap'
export { CollectionsModel } from './collections'
export {
  adalahEntri,
  EntriModel,
  KELAS_ENTRI_IMUT,
  KELAS_ENTRI_LINKED,
  KELAS_ENTRI_TREE,
  KELAS_NODE_HASH,
} from './entri'
export {
  HashMapItr,
  HashMapModel,
  hashKunci,
  KELAS_HASHMAP,
  KELAS_LINKEDHASHMAP,
  LinkedHashMapModel,
  TampilanHashMapModel,
} from './hashMap'
export { HashSetModel, KELAS_HASHSET, KELAS_LINKEDHASHSET, LinkedHashSetModel } from './hashSet'
export { KELAS_TREEMAP, TampilanTreeMapModel, TreeMapItr, TreeMapModel } from './treeMap'
export { KELAS_TREESET, TreeSetModel } from './treeSet'
