;;
;; This exercise just exists to get better at interop between the host environment and wasm.
;;
;; There is nothing you must edit here, but feel free to play around!
;;
;; You will find more detailed comments in the associated JS file.
;;

(module
  (import "env" "memory" (memory 1))
  (import "env" "log" (func $log (param i32)))

  (func $square_num (param i32) (result i32)
    (i32.mul (local.get 0) (local.get 0))
  )

  (func $log_some_numbers 
    (call $log (i32.const 1))
    (call $log (i32.const 42))
    (call $log (i32.const 88))
  )

  (func $edit_memory
    (local $index i32)
    (local $end i32)

    (local.set $index (i32.const 0))
    (local.set $end (i32.const 500))

    (loop $loop_name
      (i32.store8
        (local.get $index)
        (i32.mul
          (i32.load8_u (local.get $index))
          (i32.const 2)
        )
      )

      (local.set $index (i32.add (local.get $index) (i32.const 1)))
      (i32.lt_u (local.get $index) (local.get $end))
      (br_if $loop_name)
    )
  )

  (export "squareNum" (func $square_num))
  (export "logSomeNumbers" (func $log_some_numbers))
  (export "editMemory" (func $edit_memory))
)