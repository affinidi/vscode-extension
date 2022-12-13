type Promisified<T> = Promise<Awaited<T>>

function areArraysStrictEqual(a: unknown[], b: unknown[]) {
  return (a.length === 0 && b.length === 0) || a.every((v, i) => v === b[i])
}

function removeFromArray<T>(array: T[], condition: (item: T) => boolean) {
  const index = array.findIndex(condition)
  if (index !== -1) {
    array.splice(index, 1)
  }
}

/**
 * This utility helps to avoid simultaneous duplicate requests.
 * It executes the method and stores the promise and arguments in memory.
 * Until the promise is settled, calling the same method with the same arguments will reuse the existing promise.
 * 
 * This method is not always guaranteed to avoid duplicate requests because it compares the arguments using `===`.
 */
export function reusePromise<T extends (...args: Parameters<T>) => Promisified<ReturnType<T>>>(method: T) {
  const executions: { args: Parameters<T>; promise: Promisified<ReturnType<T>> }[] = []

  return (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const existingExecution = executions.find((execution) =>
      areArraysStrictEqual(execution.args, args),
    )

    if (existingExecution) {
      return existingExecution.promise
    }

    const promise = method(...args).finally(() => {
      removeFromArray(executions, (execution) => execution.promise === promise)
    })

    executions.push({ args, promise })
    return promise
  }
}
