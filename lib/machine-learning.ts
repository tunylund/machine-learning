import * as assert from 'assert'
import { vector } from './matrix'

export interface Hypothesis {
  (x: number[]): number
}

export interface CostFunction {
  (x: number, y: number): number
}

function add (a: number, b: number) {
  return a + b
}

export function meanErrorCost (data: number[][], hypothesis: Hypothesis) {
  return (1 / (2 * data.length)) * data
    .map(x => Math.pow(hypothesis(x.slice(0, -1)) - x[x.length - 1], 2))
    .reduce(add, 0)
}

export function linearRegressionHypothesis (...θ: number[]): Hypothesis {
  const theta = vector(θ)
  return (x: number[]) => theta
    .transpose()
    .multiply(vector([1].concat(x)))
    .reduce(add, 0)
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
  const a = θj - learningRate * 1 / m * data
    .map(x => hypothesis(x.slice(0, -1)) - x[x.length - 1])
    .reduce(add, 0)

  const b = θi - learningRate * 1 / m * data
    .map(x => (hypothesis(x.slice(0, -1)) - x[x.length - 1]) * x.reduce(add, 0))
    .reduce(add, 0)

  if (originalθj - a < θj - a) {
    throw new Error(`No convergence found from ${originalθj}, ${originalθi}`)
  }

  if (θj === a) {
    return [θj, θi]
  }

  return linearRegressionGradientDescent(a, b, data, learningRate, originalθj, originalθi)
}

assert(isNaN(meanErrorCost([], y => y.reduce(add, 0))), 'meanError of [] should be NaN')
assert.equal(meanErrorCost([[1, 1]], y => y.reduce(add, 0)), 0)
assert.equal(meanErrorCost([[1, 1]], y => y.reduce(add, 0) * 2), 0.5)

assert.equal(meanErrorCost([[3, 4],
                            [2, 1],
                            [4, 3],
                            [0, 1]], linearRegressionHypothesis(0, 1)), 0.5)

assert.equal(meanErrorCost(
  [[0, 1, 2, 3],
   [0, 1, 2, 3],
   [0, 1, 2, 3],
   [0, 1, 2, 3]], linearRegressionHypothesis(0, 1, 2, 3)), 12.5)

const linear = [[1, 1],
                [2, 2],
                [3, 3],
                [4, 4]]

assert.deepEqual(linearRegressionGradientDescent(0, 1, linear, 0.1), [0, 1])
