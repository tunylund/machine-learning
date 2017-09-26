import { matrix } from './matrix'
const { performance } = require('perf_hooks')

function test (name: string, setup: () => any, testFn: (context: any) => void) {

  const context = setup()

  for (let x = 0; x < 9; x++) {
    performance.mark(`${name}-${x}-A`)
    for (let i = 0; i < 100000; i++) {
      testFn(context)
    }
    performance.mark(`${name}-${x}-B`)
    performance.measure(`${name}`, `${name}-${x}-A`, `${name}-${x}-B`)
  }

  const avg = performance.getEntriesByName(`${name}`)
    .map((entry: any) => entry.duration)
    .sort((a: number, b: number) => a < b ? -1 : a > b ? 1 : 0)
    .slice(1, -1)
    .reduce((sum: number, x: number) => sum += x, 0) / 7

  console.log(avg.toFixed(2), name, 'average milliseconds')
}

const setup = () => matrix(3, 3)(1, 2, 3,
                                 4, 5, 6,
                                 7, 8, 9)

// 67
test('transpose', setup, m33 => m33.transpose())

// 378
test('determinant', setup, m33 => m33.determinant())

// 49
test('minor', setup, m33 => m33.minor(0, 0))

// 635
test('adjugate', setup, m33 => m33.adjugate())

// 75
test('multiply', setup, m33 => m33.multiply(m33))
