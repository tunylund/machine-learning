import * as assert from 'assert'

class Matrix {

  readonly values: number[]
  readonly ySize: number
  readonly xSize: number

  constructor(ySize: number, xSize: number, ...values: number[]) {
    this.values = values
    this.ySize = ySize
    this.xSize = xSize
  }

  static builder (y: number, x: number) : (...args: number[]) => Matrix {
    return function (...args: number[]) : Matrix {
      return new Matrix(y, x, ...args)
    }
  }

  static identity(ySize: number, xSize: number) {
    let values = []
    for (let y = 0; y < ySize; y++) {
      for (let x = 0; x < xSize; x++) {
        values.push(y === x ? 1 : 0)
      }
    }
    return new Matrix(ySize, xSize, ...values)
  }

  static scalar(ySize: number, xSize: number, value: number) {
    return new Matrix(ySize, xSize,
      ...new Array(ySize * xSize).fill(value))
  }

  get (y: number, x: number) : number {
    return this.values[y * this.xSize + x]
  }

  eq (b: Matrix) : boolean {
    for (let i = 0, l = this.values.length; i < l; i++) {
      if (this.values[i] != b.values[i]) return false
    }
    return true
  }

  transpose () : Matrix {
    return this.rotate().mirror()
  }

  rotate () : Matrix {
    let result = []
    for (let x = 0; x < this.xSize; x++) {
      for (let y = this.ySize - 1; y >= 0; y--) {
        result.push(this.values[y * this.xSize + x])
      }
    }
    return new Matrix(this.xSize, this.ySize, ...result)
  }

  determinant() : number {
    if (this.xSize != this.ySize) throw new Error(`${this} is not square and has no determinant.`)
    if (this.xSize === 2 && this.ySize === 2) {
      return this.get(0, 0) * this.get(1, 1) - this.get(0, 1) * this.get(1, 0)
    } else {
      return this.row(0).values.map((x, ix) => {
        let values = this.values.slice(this.xSize)
        for (let i = this.ySize - 1; i >= 0; i--) {
          values.splice(i * this.xSize + ix, 1)
        }
        return x * new Matrix(this.ySize - 1, this.xSize - 1, ...values).determinant()
      }).map((det, ix) => det * Math.pow(-1, ix))
        .reduce((sum, det) => sum + det, 0)
    }
  }

  minors() : Matrix[] {
    let result = []
    for (let y = 0; y < this.ySize; y++) {
      for (let x = 0; x < this.xSize; x++) {
        let values = this.values.slice()
        values.splice(y * this.xSize, this.xSize)
        for (let i = this.ySize - 1; i >= 0; i--) {
          values.splice(i * this.xSize + x, 1)
        }
        result.push(
          new Matrix(this.ySize - 1, this.xSize - 1, ...values))
      }
    }
    return result
  }
  
  inverse() : Matrix {
    const determinant = this.determinant()
    if (determinant === 0) throw new Error(`${this} has no inverse matrix`)
    return this.adjugate().map(x => x / determinant)
  }

  adjugate() : Matrix {
    return new Matrix(this.ySize, this.xSize, ...this
      .transpose()
      .minors()
      .map(minor => minor.determinant())
      .map((det, ix) => det * Math.pow(-1, ix)))
  }

  mirror () : Matrix {
    let result: number[] = []
    for (let y = 0; y < this.ySize; y++) {
      let slice = this.values.slice(y * this.xSize, y * this.xSize + this.xSize)
      result = result.concat(slice.reverse())
    }
    return new Matrix(this.ySize, this.xSize, ...result)
  }

  multiply (multiplier: number|Matrix) : Matrix {
    if (typeof multiplier === "number") {
      let values = Matrix.identity(this.xSize, this.xSize).values.map(x => x * (multiplier as number))
      multiplier = new Matrix(this.xSize, this.xSize, ...values)
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
    return new Matrix(this.ySize, multiplier.xSize, ...result)
  }

  col (x: number) : Matrix {
    let result = []
    for (let y = 0; y < this.ySize; y++) {
      result.push(this.values[x + y * this.xSize])
    }
    return new Matrix(this.ySize, 1, ...result)
  }

  row (y: number) : Matrix {
    let result = this.values.slice(y * this.xSize, y * this.xSize + this.xSize)
    return new Matrix(1, this.xSize, ...result)
  }

  map (fn: (x: number) => number) : Matrix {
    return new Matrix(this.ySize, this.xSize, ...this.values.map(fn))
  }

  reduce (fn: (memo: number, value: number) => number, initial: number) : number {
    return this.values.reduce(fn, initial)
  }

}

const matrix = Matrix.builder
const identity = Matrix.identity
const scalar = Matrix.scalar

export default Matrix
export { matrix, identity, scalar }

const m = matrix

const m31 = matrix(3, 1)(1,
                         2,
                         3)
const m32 = matrix(3, 2)(1, 2,
                         3, 4,
                         5, 6)
const m23 = matrix(2, 3)(1, 2, 3,
                         4, 5, 6)
const m22 = matrix(2, 2)(1, 2,
                         3, 4)
const m21 = matrix(2, 1)(1,
                         2)
const m12 = matrix(1, 2)(1, 2)

assert(m32.eq(m32))

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
                                    
assert.deepEqual(identity(3, 3), matrix(3, 3)(1, 0, 0,
                                              0, 1, 0,
                                              0, 0, 1))

assert.deepEqual(scalar(3, 3, 1), matrix(3, 3)(1, 1, 1,
                                               1, 1, 1,
                                               1, 1, 1))

assert.deepEqual(m32.multiply(2), matrix(3, 2)(2, 4,
                                               6, 8,
                                               10, 12))
assert.deepEqual(m32.multiply(m21), matrix(3, 1)(5,
                                                 11,
                                                 17))

assert.deepEqual(m23.multiply(m31), matrix(2, 1)(14,
                                                 32))

assert.deepEqual(m22.mirror(), m(2, 2)(2, 1,
                                       4, 3))

assert.deepEqual(m22.determinant(), -2)

assert.deepEqual(m(3, 3)(1, 2, 3,
                         4, 5, 6,
                         7, 8, 9).minors(), [
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

assert.deepEqual(m(3, 3)(1, 5, 3,
                         2, 4, 7,
                         4, 6, 2).determinant(), 74)

assert.deepEqual(m(3, 3)(1, 2, 3,
                         0, 1, 4,
                         5, 6, 0).adjugate(), m(3, 3)(-24, 18, 5,
                                                      20, -15, -4,
                                                      -5, 4, 1))
assert.deepEqual(m(3, 3)(1, 2, 3,
                         0, 1, 4,
                         5, 6, 0).determinant(), 1)

assert.deepEqual(m(3, 3)(1, 2, 3,
                         0, 1, 4,
                         5, 6, 0).inverse(), m(3, 3)(-24, 18, 5, 
                                                      20, -15, -4,
                                                      -5, 4, 1))

const e = m(3, 3)(1, 2, 0,
                  0, 5, 6,
                  7, 0, 9)
assert.deepEqual(e.inverse().multiply(e), identity(3, 3))

