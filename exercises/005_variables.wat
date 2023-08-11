;;
;; Variables must be declared before use. They can either be global or local.
;; 
;; Syntax:
;;  (global/local $var_name TYPE init_expr)
;;  (global/local.get $var_name)
;;  (global/local.set $var_name (VALUE))
;;
;; Global variables must be marked as (mut TYPE) if we want them to be editable
;;
;; Finish the doubleGlobal function
;;

(module
  (import "env" "global_num" (global $global_num_import (mut i32)))

  (global $local_global (mut i32) (i32.const 0))

  (func (export "incGlobal") (result i32)
    ;; $local_global = $local_global + 1
    (global.set $local_global (i32.add (global.get $local_global) (i32.const 1)))

    (global.get $local_global)
  )

  (func (export "doubleGlobal") (result i32)
    ;; all variables must be declared first before any other ops
    (local $local_num i32)

    ;; TODO: set $local_num to be double the value of $global_num_import

    (local.get $local_num)
  )
)