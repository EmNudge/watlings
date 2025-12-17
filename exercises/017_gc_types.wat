(;
  WebAssembly GC allows the host to manage memory for us.

  Define a struct type:
    (type $type_name (struct (field $field_name1 i32) (field $field_name2 i32)))

  Create a struct instance:
    (struct.new $type_name (FIELD_VALUE1) (FIELD_VALUE2))

  Read a field:
    (struct.get $type_name $field_name (STRUCT_REF))

  Implement:
    - $make_point: creates a point with the given x and y values
    - $get_x: extracts the x field from a point
    - $get_y: extracts the y field from a point
;)

(module
  (type $point (struct (field $x i32) (field $y i32)))

  (func $make_point (param $x i32) (param $y i32) (result (ref $point))
    ;; TODO: create and return a new point
  )

  (func $get_x (param $p (ref $point)) (result i32)
    ;; TODO: return the x field
  )

  (func $get_y (param $p (ref $point)) (result i32)
    ;; TODO: return the y field
  )

  (export "makePoint" (func $make_point))
  (export "getX" (func $get_x))
  (export "getY" (func $get_y))
)
