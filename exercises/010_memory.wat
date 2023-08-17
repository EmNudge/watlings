(;
  How do we return arrays? How do we quickly generate data?
  Instead of just returning a number, what about sharing some block of memory?
  The host can write some input, call us, and then read the result.

  While we only have 32 and 64 bit numbers, we often deal in "bytes"
  We store and retrieve bytes from our global memory block by using 
    (i32.store8 (INDEX) (VALUE)) and (i32.load8_u (INDEX))

  Implement $double_data which doubles every integer in the memory range provided
;)

(module
  ;; Get from host via import instead of exporting our own
  (import "env" "mem" (memory 1)) ;; 1 page = 1KB

  (func $increment_data (param $start i32) (param $end i32)
    (local $index i32)
    (local $cur_num i32)

    ;; $index = $start
    (local.set $index (local.get $start))

    (loop $loop_name
      ;; mem[$index] = mem[$index] + 1
      (i32.store8 
        (local.get $index)
        (i32.add 
          (i32.load8_u (local.get $index)) ;; mem[$index]
          (i32.const 1)
        )
      )

      ;; $index = $index + 1
      (local.set $index (i32.add (local.get $index) (i32.const 1)))

      ;; loop if $index < $end
      (i32.lt_u (local.get $index) (local.get $end))
      (br_if $loop_name)
    )
  )

  (func $double_data (param $start i32) (param $end i32)
    ;; double all the values within the index range [$start, $end]
  )

  (export "incrementData" (func $increment_data))
  (export "doubleData" (func $double_data))
)