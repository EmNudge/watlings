(;
  Our $main function is being called automatically. This might not be desirable.

  We can export a function using the syntax:
    (export "exportName" (func $func_name))

  If we don't need to call our function internally, we can export it while defining:
    (func (export "exportName")
      (call $log_num (i32.const 42))
    )

  Export our $main function instead of calling it immediately.
;)

(module
  (import "env" "log" (func $log_num (param i32)))

  (func $main
    (call $log_num (i32.const 42))
  )

  ;; TODO: replace this with an export
  (start $main)
)