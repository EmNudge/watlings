(;
  br_table allows jump tables (like a switch) by branching to labels by index.
  General pattern:
    (block $default
      (block $case2
        (block $case1
          (block $case0
            (br_table $case0 $case1 $case2 $default (local.get $idx))
          )
          ;; case 0 body ...
        )
        ;; case 1 body ...
      )
      ;; case 2 body ...
    )

  Task:
    Implement (export "pick") that returns:
      - 10 when $idx == 0
      - 20 when $idx == 1
      - 30 when $idx == 2
      - 99 otherwise
    Use br_table to select which constant to return.
;)

(module
  ;; TODO: implement pick with br_table
  (func (export "pick") (param $idx i32) (result i32)
    ;; Suggested structure with nested blocks and a final constant per arm.
  )
)


