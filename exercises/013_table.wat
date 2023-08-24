(;
  Tables can hold references. They use the syntax:
    (table $NAME SIZE funcref/externref)
  Elements are defined with
    (elem $table_id (START_INDEX) val1 val2 val3 ...)

  We can index into a table with (table.get) and store with (table.set).
  
  If our table contains funcrefs, we can call functions stored in the table directly with `call_indirect` using the syntax:
    (call_indirect $table_id (type $func_type) (TABLE_INDEX) arg1 ...)

  Finish $call_func by calling the right function based off of the index.
;)

(module
  ;; Define custom type $custom_func_type to equal () => i32
  (type $custom_func_type (func (result i32)))

  ;; import 4 functions of the same shape
  (import "env" "func1" (func $func1 (result i32)))
  (import "env" "func2" (func $func2 (result i32)))
  (import "env" "func3" (func $func3 (result i32)))
  (import "env" "func4" (func $func4 (result i32)))

  ;; (table $name MIN_SIZE [MAX_SIZE] funcref/externref)
  (table $internal_funcs_table 4 funcref)
  (elem $internal_funcs_table (i32.const 0) $func1 $func2 $func3 $func4)

  (func $call_func (param $table_index i32) (result i32)
    ;; TODO: Call the function indexed by $table_index in the table
    (call_indirect $internal_funcs_table (type $custom_func_type) 
      (local.get $table_index)
    )
  )

  (export "callFunc" (func $call_func))
)