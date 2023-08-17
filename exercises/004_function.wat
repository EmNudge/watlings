(;
  Functions can define parameters and return types.

  A return type is defined with a `(result TYPE)` expression, such as:
    (func $get_num (result i32) (i32.const 42))

  Parameters are defined with `(param TYPE)` or `(param $param_name TYPE)`
    (func $log_wasm (param i32) (call $log_num (local.get 0)))
    (func $log_wasm (param $a i32) (call $log_num (local.get $a)))

  A parameter can be retrieved with (local.get $param_name)
  If the parameter was not given a name, it can be 0-indexed
  i.e. (local.get 0) is the 1st param

  Implement the $sub and $mul functions using i32.sub and i32.mul
;)

(module
  ;; A function that returns the number 42
  (func $get_num (result i32) (i32.const 42))
  ;; A function that returns the number it's given
  (func $get_num_2 (param i32) (result i32) 
    (local.get 0)
  )

  ;; A function that adds 2 numbers, a and b
  (func $add
    (param $a i32) (param $b i32)
    (result i32)

    ;; The last stack value is the return value
    (i32.add (local.get $a) (local.get $b))
  )

  ;; TODO: fill in the blanks!
  (func $sub)
  (func $mul)

  (export "add" (func $add))
  (export "sub" (func $sub))
  (export "mul" (func $mul))
)