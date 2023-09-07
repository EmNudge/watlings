(;
  In addition to the 4 number types, we also have 2 "ref" types: 
    - externref: any reference or null
    - funcref: a reference to a function or null

  We can't view or modify the underlying values, but we can pass them around!

  This brings us to 3 new operations:
    - (ref.func $func_id): make a reference from a local function (only valid if function is in a table)
    - (ref.null extern/func): make a null reference for an extern or func
    - (ref.is_null $id): check if reference is currently null
  
  NOTE: You may come across "anyfunc" or "anyref" in the future. These are deprecated - ignore them. 

  Call $send_extern_ref and $send_func_ref in $main
;)

(module
  (import "env" "sendFuncRef" (func $send_func_ref (param funcref)))
  (import "env" "sendExternRef" (func $send_extern_ref (param externref)))

  ;; import non-mutable externref and name it $global_extern_ref
  (import "env" "globalExternRef" (global $global_extern_ref externref))
  
  ;; declare global funcref with initial value of null
  (global $global_func_ref funcref (ref.func $send_func_ref))

  (func $main
    ;; TODO: call $send_func_ref and $send_extern_ref with correct params
  )

  (export "main" (func $main))
)
