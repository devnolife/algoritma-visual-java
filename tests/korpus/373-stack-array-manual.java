// Stack berbasis array buatan sendiri dengan exception unchecked buatan untuk overflow dan underflow; underflow terakhir tidak ditangkap
public class Main {
    static class StackPenuhException extends RuntimeException {
        StackPenuhException(String pesan) {
            super(pesan);
        }
    }

    static class StackKosongException extends RuntimeException {
        StackKosongException(String pesan) {
            super(pesan);
        }
    }

    static class StackArray {
        private final int[] data;
        private int top = -1;

        StackArray(int kapasitas) {
            data = new int[kapasitas];
        }

        void push(int x) {
            if (top == data.length - 1) {
                throw new StackPenuhException("kapasitas " + data.length + " penuh saat push " + x);
            }
            data[++top] = x;
        }

        int pop() {
            if (top < 0) {
                throw new StackKosongException("pop pada stack kosong");
            }
            return data[top--];
        }

        int peek() {
            if (top < 0) {
                throw new StackKosongException("peek pada stack kosong");
            }
            return data[top];
        }

        boolean kosong() {
            return top < 0;
        }

        @Override
        public String toString() {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i <= top; i++) {
                sb.append(data[i]).append(i < top ? ", " : "");
            }
            return sb.append("] top=").append(top).toString();
        }
    }

    public static void main(String[] args) {
        StackArray s = new StackArray(4);
        for (int i = 1; i <= 5; i++) {
            try {
                s.push(i * 10);
                System.out.println("push " + i * 10 + " -> " + s);
            } catch (StackPenuhException e) {
                System.out.println("gagal: " + e.getMessage());
            }
        }
        System.out.println("peek " + s.peek());
        while (!s.kosong()) {
            System.out.println("pop " + s.pop() + " -> " + s);
        }
        try {
            s.peek();
        } catch (StackKosongException e) {
            System.out.println("gagal: " + e);
        }
        s.push(7);
        System.out.println("pop " + s.pop() + ", pop lagi?");
        s.pop();
    }
}
