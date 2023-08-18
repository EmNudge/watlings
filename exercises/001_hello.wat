(;
  We often export and import when writing WASM. 
  Here we import a function called $log_num that takes in one i32 as its only parameter
  We import it from the namespace "env" under the name "log" and then call it $log_num

  Calling a function uses the syntax (call $func_name (param1) (param2) ...)
  Number literals use the form: (TYPE.const NUMBER)
  e.g. (f64.const 1093.31) or (i32.const -3029)

  Call $log_num with the 32-bit integer 42.
;)

(module
  (import "env" "log" (func $log_num (param i32)))

  (func $main
    ;; TODO: call $log_num here
  )

  (start $main)
)