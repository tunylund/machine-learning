import * as assert from 'assert'

class Matrix {

  readonly values: Float32Array
  readonly ySize: number
  readonly xSize: number

  constructor (ySize: number, xSize: number, values: number[]|Float32Array) {
    this.values = Float32Array.from(values)
    this.ySize = ySize
    this.xSize = xSize
  }

  static builder (y: number, x: number): (...args: number[]) => Matrix {
    return function (...args: number[]): Matrix {
      return new Matrix(y, x, args)
    }
  }

  static identity (size: number) {
    let values = new Array(size * size).fill(0)
    for (let i = 0; i < size; i++) {
      values[i * size + i] = 1
    }
    return new Matrix(size, size, values)
  }

  static scalar (ySize: number, xSize: number, value: number) {
    return new Matrix(ySize, xSize,
      new Array(ySize * xSize).fill(value))
  }

  static vector (values: number[]) {
    return new Matrix(values.length, 1, values)
  }

  get (y: number, x: number): number {
    return this.values[y * this.xSize + x]
  }

  eq (b: Matrix): boolean {
    if (this.xSize !== b.xSize || this.ySize !== b.ySize) return false
    for (let i = 0; i < this.values.length; i++) {
      if (this.values[i] !== b.values[i]) return false
    }
    return true
  }

  transpose (): Matrix {
    let result = new Array(this.xSize * this.ySize)
    for (let y = 0; y < this.ySize; y++) {
      for (let x = 0; x < this.xSize; x++) {
        result[y + x * this.ySize] = this.values[y * this.xSize + x]
      }
    }
    return new Matrix(this.xSize, this.ySize, result)
  }

  rotate (): Matrix {
    let result = []
    for (let x = 0; x < this.xSize; x++) {
      for (let y = this.ySize - 1; y >= 0; y--) {
        result.push(this.values[y * this.xSize + x])
      }
    }
    return new Matrix(this.xSize, this.ySize, result)
  }

  determinant (): number {
    if (this.xSize !== this.ySize) throw new Error(`${this} is not square and has no determinant.`)

    if (this.xSize === 2 && this.ySize === 2) {
      return this.get(0, 0) * this.get(1, 1) - this.get(0, 1) * this.get(1, 0)
    } else {
      let sum = 0
      for (let x = 0; x < this.xSize; x++) {
        sum += this.values[x] * this.minor(0, x).determinant() * Math.pow(-1, x)
      }
      return sum
    }
  }

  minor (y: number, x: number): Matrix {
    let values = []
    let sourceix = -1
    for (let iy = 0; iy < this.ySize; iy++) {
      for (let ix = 0; ix < this.xSize; ix++) {
        sourceix = iy * this.xSize + ix
        if ((sourceix % this.xSize) !== x && Math.floor(sourceix / this.xSize) !== y) {
          values.push(this.values[sourceix])
        }
      }
    }
    return new Matrix(this.ySize - 1, this.xSize - 1, values)
  }

  minors (): Matrix[] {
    let result = []
    for (let y = 0; y < this.ySize; y++) {
      for (let x = 0; x < this.xSize; x++) {
        result.push(this.minor(y, x))
      }
    }
    return result
  }

  inverse (): Matrix {
    const determinant = this.determinant()
    if (determinant === 0) throw new Error(`${this} has no inverse matrix`)
    return this.adjugate().map(x => x / determinant)
  }

  adjugate (): Matrix {
    return new Matrix(this.ySize, this.xSize, this
      .transpose()
      .minors()
      .map((minor, ix) => minor.determinant() * Math.pow(-1, ix)))
  }

  mirror (): Matrix {
    let result: number[] = []
    for (let y = 0; y < this.ySize; y++) {
      let slice = this.values.slice(y * this.xSize, y * this.xSize + this.xSize)
      result = result.concat(Array.from(slice.reverse()))
    }
    return new Matrix(this.ySize, this.xSize, result)
  }

  multiply (multiplier: number|Matrix): Matrix {
    if (typeof multiplier === 'number') {
      multiplier = Matrix
        .identity(this.xSize)
        .map(x => x * (multiplier as number))
    } else {
      multiplier = multiplier
    }

    let result = new Array(this.ySize * multiplier.xSize).fill(0)
    for (let y = 0; y < this.ySize; y++) {
      for (let x = 0; x < multiplier.xSize; x++) {
        for (let z = 0; z < this.xSize; z++) {
          result[x + y * multiplier.xSize] +=
            this.get(y, z) * multiplier.get(z, x)
        }
      }
    }
    return new Matrix(this.ySize, multiplier.xSize, result)
  }

  col (x: number): Matrix {
    let result = []
    for (let y = 0; y < this.ySize; y++) {
      result.push(this.values[x + y * this.xSize])
    }
    return new Matrix(this.ySize, 1, result)
  }

  row (y: number): Matrix {
    let result = this.values.slice(y * this.xSize, y * this.xSize + this.xSize)
    return new Matrix(1, this.xSize, result)
  }

  map (fn: (x: number) => number): Matrix {
    return new Matrix(this.ySize, this.xSize, this.values.map(fn))
  }

  reduce (fn: (memo: number, value: number) => number, initial: number): number {
    return this.values.reduce(fn, initial)
  }

}

const vector = Matrix.vector
const matrix = Matrix.builder
const identity = Matrix.identity
const scalar = Matrix.scalar

export default Matrix
export { vector, matrix, identity, scalar }

// What's all this then?
// Because it's a javascript module
// We can define that it works in unit level
// all within the definition of the module
// -> unit tests alongside the source

const m31 = matrix(3, 1)(1,
                         2,
                         3)
const m32 = matrix(3, 2)(1, 2,
                         3, 4,
                         5, 6)
const m33 = matrix(3, 3)(1, 2, 3,
                         4, 5, 6,
                         7, 8, 9)

assert(m32.eq(m32))
assert(!m32.eq(m33))

assert.equal(m32.get(0, 0), 1)
assert.equal(m32.get(1, 1), 4)

assert.deepEqual(m32.row(0), matrix(1, 2)(1, 2))
assert.deepEqual(m32.row(1), matrix(1, 2)(3, 4))
assert.deepEqual(m32.row(2), matrix(1, 2)(5, 6))

assert.deepEqual(m32.col(0), matrix(3, 1)(1,
                                          3,
                                          5))
assert.deepEqual(m32.col(1), matrix(3, 1)(2,
                                          4,
                                          6))

assert.deepEqual(m32.rotate(), matrix(2, 3)(5, 3, 1,
                                            6, 4, 2))

assert.deepEqual(m32.mirror(), matrix(3, 2)(2, 1,
                                            4, 3,
                                            6, 5))

assert.deepEqual(m32.transpose(), matrix(2, 3)(1, 3, 5,
                                               2, 4, 6))

assert.deepEqual(identity(3), matrix(3, 3)(1, 0, 0,
                                           0, 1, 0,
                                           0, 0, 1))

assert.deepEqual(scalar(3, 3, 1), matrix(3, 3)(1, 1, 1,
                                               1, 1, 1,
                                               1, 1, 1))

assert.deepEqual(vector([1, 2, 3]), matrix(3, 1)(1,
                                                 2,
                                                 3))

assert.deepEqual(m32.multiply(2), matrix(3, 2)(2, 4,
                                               6, 8,
                                               10, 12))
assert.deepEqual(m32.multiply(matrix(2, 1)(1,
                                           2)), matrix(3, 1)(5,
                                                             11,
                                                             17))
assert.deepEqual(m31.multiply(matrix(1, 2)(1, 2)), matrix(3, 2)(1, 2,
                                                                2, 4,
                                                                3, 6))

assert.deepEqual(m32.mirror(), matrix(3, 2)(2, 1,
                                            4, 3,
                                            6, 5))

assert.deepEqual(m33.minor(0, 0), matrix(2, 2)(5, 6,
                                               8, 9))
assert.deepEqual(m33.minor(1, 1), matrix(2, 2)(1, 3,
                                               7, 9))
assert.deepEqual(m33.minor(2, 2), matrix(2, 2)(1, 2,
                                               4, 5))
assert.deepEqual(m33.minors(), [
  matrix(2, 2)(5, 6,
               8, 9),
  matrix(2, 2)(4, 6,
               7, 9),
  matrix(2, 2)(4, 5,
               7, 8),
  matrix(2, 2)(2, 3,
               8, 9),
  matrix(2, 2)(1, 3,
               7, 9),
  matrix(2, 2)(1, 2,
               7, 8),
  matrix(2, 2)(2, 3,
               5, 6),
  matrix(2, 2)(1, 3,
               4, 6),
  matrix(2, 2)(1, 2,
               4, 5)
])

assert.deepEqual(matrix(3, 3)(1, 5, 3,
                              2, 4, 7,
                              4, 6, 2).determinant(), 74)

const minvertable = matrix(3, 3)(1, 2, 3,
                                 0, 1, 4,
                                 5, 6, 0)

assert.deepEqual(minvertable.adjugate(), matrix(3, 3)(-24, 18, 5,
                                                       20, -15, -4,
                                                       -5, 4, 1))
assert.deepEqual(minvertable.determinant(), 1)

assert.deepEqual(minvertable.inverse(), matrix(3, 3)(-24, 18, 5,
                                                      20, -15, -4,
                                                      -5, 4, 1))
assert.deepEqual(minvertable.inverse().multiply(minvertable), identity(3))
