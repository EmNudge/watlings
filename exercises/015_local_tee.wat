(;
  local.tee stores a value into a local and also leaves that same value on the stack.
  This is useful when you want to both update a local and immediately use the value.

  Task:
    Implement (export "incTwice") which:
      - takes (param $n i32)
      - increments it once
      - returns (incremented value) + (incremented value)
    Hint: use a local and `local.tee` to avoid repeating the increment.
;)

(module
  ;; TODO: implement incTwice as described using local.tee
  (func (export "incTwice") (param $n i32) (result i32)
    ;; Suggested approach:
    ;; (local $x i32)
    ;; (local.set $x (local.get $n))
    ;; (i32.add
    ;;   (local.tee $x (i32.add (local.get $x) (i32.const 1)))
    ;;   (local.get $x)
    ;; )
  )
)


