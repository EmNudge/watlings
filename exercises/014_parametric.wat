(;
  Parametric and trap basics:
    - drop: remove the top stack value
    - nop: no operation
    - unreachable: immediately trap (program error)

  Tasks:
    1) Implement (export "ping") to return 1.
       Before returning, push any number and then remove it with `drop`,
       and include a `nop` for good measure.

    2) Implement (export "safeDiv") which divides $a by $b and returns the result.
       If $b == 0, it must trap using `unreachable`.
       Hint: use (if (then ...) (else ...)) around an equality check on $b.
;)

(module
  ;; TODO: implement ping as described
  (func (export "ping") (result i32)
    ;; push junk, drop it, then return 1
    ;; (i32.const 999)
    ;; drop
    ;; nop
    ;; (i32.const 1)
  )

  ;; TODO: implement safeDiv as described
  (func (export "safeDiv") (param $a i32) (param $b i32) (result i32)
    ;; if $b == 0 -> unreachable
    ;; else -> (i32.div_s (local.get $a) (local.get $b))
  )
)


