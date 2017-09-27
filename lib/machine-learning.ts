import * as assert from 'assert'

export interface Hypothesis {
  (x: number): number
}

export interface CostFunction {
  (x: number, y: number): number
}

function sum (data: number[][], fn: CostFunction): number {
  return data
    .map((x: number[]) => fn(x[0], x[1]))
    .reduce((sum: number, value: number) => sum += value, 0)
}

export function meanErrorCost (data: number[][], hypothesis: Hypothesis) {
  return (1 / (2 * data.length)) *
    sum(data, (x: number, y: number) => Math.pow(hypothesis(x) - y, 2))
}

export function linearRegressionHypothesis (θj: number, θi: number): Hypothesis {
  return (x: number) => θj + θi * x
}

// function gradientDescent (
//   θj: number,
//   θi: number,
//   learningRate: number,
//   costFunction: CostFunction) {
//   let a = θj - learningRate * (d / d(θj) * costFunction(θj, θi)
//   let b = θi - learningRate * (d / d(θi) * costFunction(θj, θi)
//   if (θj === a) {
//     return θj
//   } else {
//     return gradientDescent(a, b, learningRate, costFunction)
//   }
// }

function linearRegressionGradientDescent (
  θj: number,
  θi: number,
  data: number[][],
  learningRate: number,
  originalθj?: number,
  originalθi?: number): number[] {

  if (originalθj === undefined) originalθj = θj
  if (originalθi === undefined) originalθi = θi

  const hypothesis = linearRegressionHypothesis(θj, θi)
  const m = data.length
  const a = θj - learningRate * 1 / m * sum(data, (x, y) => hypothesis(x) - y)
  const b = θi - learningRate * 1 / m * sum(data, (x, y) => (hypothesis(x) - y) * x)

  if (originalθj - a < θj - a) {
    throw new Error(`No convergence found from ${originalθj}, ${originalθi}`)
  }

  if (θj === a) {
    return [θj, θi]
  }

  return linearRegressionGradientDescent(a, b, data, learningRate, originalθj, originalθi)
}

assert.equal(sum([], (x, y) => x + y), 0, 'sum of [] should be 0')
assert.equal(sum([[1, 2]], (x, y) => x + y), 3, 'sum of [1, 2] should be 3')

assert(isNaN(meanErrorCost([], y => y)), 'meanError of [] should be NaN')
assert.equal(meanErrorCost([[1, 1]], y => y), 0)
assert.equal(meanErrorCost([[1, 1]], y => y * 2), 0.5)

const set = [[3, 4],
             [2, 1],
             [4, 3],
             [0, 1]]

assert.equal(meanErrorCost(set, linearRegressionHypothesis(0, 1)), 0.5)

const linear = [[1, 1],
                [2, 2],
                [3, 3],
                [4, 4]]

assert.deepEqual(linearRegressionGradientDescent(0, 1, linear, 0.1), [0, 1])
