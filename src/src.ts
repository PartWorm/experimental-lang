/* eslint-disable quotes */
/* eslint-disable indent */

const values_test = [
`(print-title 'value test'`,
`(def some-atom (# this is comment.) :ok`,
`(def some-number 42`,
`(def some-string 'Hello world!'`,
`(def some-vector [1 :ok 3`,
];

const pattern_matching_test = [
`(print-title 'pattern matching test'`,
`(if-let [a] [] 'bad' 'ok'`,
`(if-let [] [1] 'bad' 'ok'`,
`(if-let [a b] [1 2] (str a ' ' b) 'bad'`,
`(if-let [a b .. e] [1 2 3 4 5 6] (str a ' ' b ' ' e) 'bad'`,
`(if-let [a b c d .. e] [1 2 3] 'bad' 'ok'`,
`(def some-ok [:ok 123`,
`(def some-err [:err 456`,
`
(def ok-or-err
  (fn (v
    (case v (# pattern matching example
      ([:ok x] (str 'ok value: ' x
      ([:err x] (str 'error value: ' x
`,
`(ok-or-err some-ok`,
`(ok-or-err some-err`,
];

const example_put_star = [
`(print-title 'example: put-star'`,
`
(def repeat
  (fn (s n
    (if (== n 0
      ''
      (str s (repeat s (- n 1
`,
`
(def put-star-rec
  (fn (n i
    (if (> i n) :nil
                (do (print (repeat '*' i
                    (put-star-rec n (+ i 1
`,
`
(def put-star
  (fn (n) (put-star-rec n 1
`,
`(put-star 5)`,
];

const example_store = [
`(print-title 'example: store'`,
`
(def store
  (defer (let (value 0
           (fn (cmd arg1
             (case cmd (:get value
                       (:set (= value arg1
`,
`(def s (store`,
`(s :set 3`,
`(s :get`,
];

const example_stream = [
`(print-title 'example: stream'`,
`
(def stream
  (fn (begin step
    [begin
     (defer (stream (+ begin step) step
`,
'(def nat (stream 1 1',
`
(def print-stream
  (fn (stream
    (case stream
      ([] :nil
      ([head tail] (do (print head
                       (print-stream (tail
`,
`
(def collect
  (fn (stream n
    (if (== n 0) []
                 (case stream
                   ([] []
                   ([head tail] [head
                                 (defer (collect (tail
                                          (- n 1
`,
`(def nat-10 (collect nat 10`,
`(print-stream nat-10`,
`
(def map
  (fn (stream fn
    (case stream
      ([] []
      ([head tail] [(fn head
                    (defer (map (tail) fn
`,
`(def nat-10-3 (map nat-10 (fn (x) (* x 3`,
`(print-stream nat-10-3`,
`
(def zip
  (fn (s t
    (case [s t
      ([[] _] []
      ([_ []] []
      ([[shead stail] [thead ttail]] [[shead thead]
                                      (defer (zip (stail) (ttail
`,
`(print-stream (zip nat-10 nat-10-3`,
`
(def filter
  (fn (stream fn
    (case stream
      ([] []
      ([head tail
       (let (new-tail (defer (filter (tail) fn
         (if (fn head
           [head new-tail
           (new-tail
`,
`(print-stream (filter nat-10 (fn (x) (== (% x 4) 0`,
];

const example_hanoi = [
`(print-title 'example: hanoi'`,
`
(def print-hanoi
  (fn (from to) (print (str from '->' to
`,
`
(def hanoi
  (fn (n from to
    (if (== n 1) (print-hanoi from to
                 (let (discs-above (- n 1
                      (mid (- 6 (+ from to
                   (do (hanoi discs-above from mid
                       (print-hanoi from to
                       (hanoi discs-above mid to
`,
`(hanoi 3 1 3`,
];

export const srcs = [
`
(def print-title
  (fn (title
    (print (str '\\n### ' title ' ###\\n'
`,
...values_test,
...pattern_matching_test,
...example_put_star,
...example_store,
...example_stream,
...example_hanoi,
];
