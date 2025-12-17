(;
  Memory management:
    - memory.size: get current memory size in pages (64 KiB per page)
    - memory.grow: grow memory by a number of pages, returns previous size

  Task:
    Request 1 page of memory.
    Implement and export:
      - getPages: returns current number of pages via memory.size
      - growBy: takes (param $pages i32), grows memory by that many pages,
                and returns the previous page count
;)

(module
  ;; one page of memory to start
  (memory 1)

  ;; TODO: implement getPages and growBy as described
  (func (export "getPages") (result i32)
    ;; (memory.size)
  )

  (func (export "growBy") (param $pages i32) (result i32)
    ;; (memory.grow (local.get $pages))
  )
)


