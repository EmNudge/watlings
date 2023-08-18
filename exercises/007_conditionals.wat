(;
  With conditional operators (e.g. if and select), 0 is false and non-zero is true.

  `if` takes 2 or 3 arguments. We will be writing it like this:
    (if 
      (VALUE_FOR_CONDITIONAL)
      (then 
        ;; if non-zero
      )
      (else 
        ;; if-zero
      )
    )

  Note that we can also write it like this:
    (VALUE_FOR_CONDITIONAL)
    if
      ;; if non-zero
    else
      ;; if-zero
    end

  If we want a value instead of an action, try `select`:
    (select (NON_ZERO_VALUE) (ZERO_VALUE) (CONDITIONAL))

  It may be useful to use (return (VALUE)) at some point. 
  This allows for early termination of a function.

  Finish the `getNum` function.
;)

(module
  ;; Look ma, no boolean!
  (func $is_even (param $num i32) (result i32)
    ;; put on stack: $num % 2 === 0
    (i32.eqz (i32.rem_u (local.get $num) (i32.const 2)))
  )

  ;; build (select ...) using (if ...)
  (func $custom_select 
    (param $if_value i32) (param $else_value i32) (param $conditional i32)
    (result i32)

    (local $return_value i32)

    (if
      (local.get $conditional)
      (then 
        (local.set $return_value (local.get $if_value))
      )
      (else
        (local.set $return_value (local.get $else_value))
      )
    )

    (local.get $return_value)
  )

  (func (export "getNum") (param $num i32) (result i32)
    ;; TODO:
    ;; return 42 if even, 100 if odd
  )

  (export "isEven" (func $is_even))
)