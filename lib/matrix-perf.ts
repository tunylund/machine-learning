import * as path from 'path'
import * as fs from 'fs'
import { matrix } from './matrix'
import {
  miniBenchmark as mb,
  formatResult,
  TestResult
} from 'mini-benchmark'

const resultsPath = path.join(__dirname, 'mini-benchmark-results.json')

function log (result: TestResult) {
  console.log(formatResult(result))
}

function load () {
  return fs.existsSync(resultsPath) ?
    JSON.parse(fs.readFileSync(resultsPath, 'utf-8')) : []
}

function save (results: TestResult[]) {
  fs.writeFileSync(resultsPath, JSON.stringify(results))
}

const before = () => matrix(3, 3)(1, 2, 3,
                                  4, 5, 6,
                                  7, 8, 9)

save(mb(load(), before, (ctx: any) => {}, (test) => {
  log(test('transpose', m33 => m33.transpose()))
  log(test('determinant', m33 => m33.determinant()))
  log(test('minor', m33 => m33.minor(0, 0)))
  log(test('adjugate', m33 => m33.adjugate()))
  log(test('multiply', m33 => m33.multiply(m33)))
}))
