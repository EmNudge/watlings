(;
  SIMD (Single Instruction, Multiple Data) processes multiple values at once.

  The v128 type holds 128 bits, interpretable as:
    4 x i32, 8 x i16, 16 x i8, 2 x i64, 4 x f32, 2 x f64

  Load a vector from memory:
    (v128.load (i32.const OFFSET))

  Add two vectors (lane-wise):
    (i32x4.add (V1) (V2))

  Extract a single lane:
    (i32x4.extract_lane 0 (VEC))

  Implement $sum_lanes which loads a v128 of 4 i32s from memory offset 0
  and returns their sum.
;)

(module
  (memory (export "memory") 1)

  (func $sum_lanes (result i32)
    ;; TODO: load v128 from offset 0, extract all 4 lanes and add them
  )

  (export "sumLanes" (func $sum_lanes))
)
