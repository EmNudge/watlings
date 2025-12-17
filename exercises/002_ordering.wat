(;
  WASM supports S-expressions and regular stack-based parameter handling.

  If we wish, we can write WAT like this:
    i32.const 2   ;; push 2_i32 to the stack
    i32.const 18  ;; push 18_i32 to the stack
    i32.sub       ;; subtract the last 2 numbers and put it back on the stack (-16)
    i32.const 6   ;; push 6_i32 to the stack
    i32.sub       ;; subtract the last 2 numbers and put it back on the stack (-22)
    call $log_num ;; call $log_num with the last number on the stack

  For clarity, we can instead write it like
    (call $log_num
      (i32.sub
        (i32.sub (i32.const 2) (i32.const 18))
        (i32.const 6))
    )

  Call log_nums with the arguments (in order) of 1, 2, 3. Try it both ways!
;)

(module
  (import "env" "log" (func $log_nums (param i32) (param i32) (param i32)))

  (func $main
      ;; TODO: call $log_nums here
  )

  (start $main)
)