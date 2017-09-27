import { matrix } from './matrix'
import { miniBenchmark as mb, formatResult } from 'mini-benchmark'

const before = () => matrix(3, 3)(1, 2, 3,
                                  4, 5, 6,
                                  7, 8, 9)

mb([], before, (ctx: any) => {}, (test) => {
  // 67
  test('transpose', m33 => m33.transpose())

  // 378
  test('determinant', m33 => m33.determinant())

  // 49
  test('minor', m33 => m33.minor(0, 0))

  // 635
  test('adjugate', m33 => m33.adjugate())

  // 75
  test('multiply', m33 => m33.multiply(m33))
}).map(formatResult)
  .map(x => console.log(x))
