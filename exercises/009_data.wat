;;
;; We can inline data by using utf-8 strings and the `data` instruction:
;;  (data (i32.const OFFSET) "TEXT DATA")
;;
;; This can be regular string data or binary blobs (via escape sequences)
;;
;; Inlining data requires memory, which we can request using `(memory NUMBER)`
;;
;; Export a function called $log_data that logs any 3 different strings.
;;

(module
  ;; function that logs strings using start index and length
  (import "env" "log_string" (func $log_string (param i32) (param i32)))

  ;; request 1 page (64KB) of memory, call it $mem
  (memory 1)

  (data (i32.const 0) "Hello, World!\n") ;; inline 14 bytes at offset 0
  (data (i32.const 20) "Woah, radical!\n") ;; inline 15 bytes at offset 20

  ;; TODO: export a function $log_data that logs 3 different strings
  ;; It shoukd make calls to $log_string

  (export "logData" (func $log_data))
  (export "mem" (memory 0))
)