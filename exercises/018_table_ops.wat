(;
  Direct table operations:
    - table.get: read a reference from a table slot
    - table.set: write a reference into a table slot
    - We can observe effects by calling via call_indirect after modifying slots.

  Task:
    - Import two functions of type () => i32 from the host.
    - Create a funcref table of size 2 with those functions at indices 0 and 1.
    - Export call0 and call1 that call through the table at indices 0 and 1 via call_indirect.
    - Export swap that swaps the two table entries using table.get and table.set.
;)

(module
  (type $t (func (result i32)))

  (import "env" "a" (func $a (type $t)))
  (import "env" "b" (func $b (type $t)))

  (table $t0 2 funcref)
  (elem $t0 (i32.const 0) $a $b)

  (func (export "call0") (result i32)
    (call_indirect $t0 (type $t) (i32.const 0))
  )
  (func (export "call1") (result i32)
    (call_indirect $t0 (type $t) (i32.const 1))
  )

  ;; TODO: implement swap using table.get and table.set
  (func (export "swap")
    ;; swap indices 0 and 1
    ;; Hint:
    ;;   (local $tmp funcref)
    ;;   (local.set $tmp (table.get $t0 (i32.const 0)))
    ;;   (table.set $t0 (i32.const 0) (table.get $t0 (i32.const 1)))
    ;;   (table.set $t0 (i32.const 1) (local.get $tmp))
  )
)


