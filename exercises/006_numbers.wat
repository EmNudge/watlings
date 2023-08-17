(;
  Numbers can be of type: i32, i64, f32, f64
  Choosing a type has ergonomic consequences. It is very difficult to change later down the line.
  The memory layout and maximum value of a f32 is very different from an i32.

  We cannot use an i32.add on an f32 without first converting it. There is no implicit conversion.

  When converting, we must also be aware of whether our ints are signed. An op will end with `_s` or `_u` if it is sign-aware.
    i32.trunc_f32_s -> f32 to i32 (signed)
    f32.convert_i32_s -> i32 to f32 (signed)

  You can see all the conversion operations on https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/Numeric#conversion

  Implement double_init by using double_float (and converting between types twice)
;)

(module
  ;; do not edit this
  (func $double_float (param $float_num f32) (result f32)
    (f32.mul (local.get $float_num) (f32.const 2))
  )

  ;; do not edit the header
  (func $double_int (param $num i32) (result i32)
    ;; TODO: double the value using double_float
  )

  (export "doubleInt" (func $double_int))
  (export "doubleFloat" (func $double_float))
)