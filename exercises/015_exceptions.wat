(;
  WebAssembly supports structured exception handling.

  Define an exception tag:
    (tag $my_error (param i32))

  Throw an exception:
    (throw $my_error (VALUE))

  Handle exceptions with try_table:
    (block $catch_label (result i32)
      (try_table (result i32) (catch $my_error $catch_label)
        ... ;; code that might throw
      )
    )
  When an exception is caught, control branches to $catch_label with the
  exception payload on the stack.

  Implement $safe_div which divides $a by $b, but throws error code 400
  if $b is zero. The catch should return the error code.
;)

(module
  (tag $div_error (param i32))

  (func $safe_div (param $a i32) (param $b i32) (result i32)
    ;; TODO: return a/b, or throw+catch error 400 if b is zero
  )

  (export "safeDiv" (func $safe_div))
)
