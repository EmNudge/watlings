(;
  Loops can be created using labels and branching.

  Here is a quick infinite-loop (do not recreate):
    (loop $loop_name
      (br $loop_name) ;; jump to $loop_name label
    )

  Labels can be created using (loop $name ...) and (block $name ...)
  The only difference is that a branch to `loop` label goes back to the entry again,
  whereas a branch to `block` label goes forward to the exit.

    (block $block_name
      (br $block_name)
      (call $some_function) ;; this is never called
    )

  You can conditionally branch by placing a `br` inside an (if ...) or by using br_if

  Implement $count_even_until according to the comment.
;)

(module
  (import "env" "log" (func $log_num (param i32)))

  ;; example function
  (func $count_down (param $num i32)
    (loop $count_loop
      ;; $num = $num - 1
      (local.set $num 
        (i32.sub (local.get $num) (i32.const 1))
      )

      (call $log_num (local.get $num))

      ;; branch if: $num > 0
      (i32.gt_s (local.get $num) (i32.const 0))
      (br_if $count_loop)
    )
  )

  ;; example function
  (func $count_until (param $end i32)
    (local $num i32)
    (local.set $num (i32.const 0))

    (loop $count_loop
      (block $break_loop

        (call $log_num (local.get $num))
        
        ;; $num = $num + 1
        (local.set $num 
          (i32.add (local.get $num) (i32.const 1))
        )

        ;; exit early if $num === $end (do not log last number)
        (i32.eq (local.get $num) (local.get $end))
        (br_if $break_loop)
        
        ;; loop again
        (br $count_loop)
        ;; NOTE: We obviously did not need `block` here. We could just use br_if for $count_loop.
        ;; In fact, We never really need `block`, but it sometimes helps with ergonomics.
      )
    )
  )

  (func $count_even_until (param $end i32)
    ;; TODO: call $log_num for every even number starting at 0.
    ;; Log until $end exclusive (do not log $end)
  )

  (export "countDown" (func $count_down))
  (export "countUntil" (func $count_until))
  (export "countEvenUntil" (func $count_even_until))
)
