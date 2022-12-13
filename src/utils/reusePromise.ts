/**
 * Use this utility helps to avoid simultaneous duplicate requests.
 * It executes the method and stores the promise and execution arguments in memory.
 * Until the promise is resolved, calling the same method with the same arguments will reuse the existing promise.
 * This method is not always guaranteed to work because it compares the arguments using `===`.
 */
export function reusePromise<T extends (...args: any[]) => any>(method: T) {
  const executions: { args: Parameters<T>; promise: Promise<ReturnType<T>> }[] = []

  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const existingExecution = executions.find(
      (execution) =>
        (execution.args.length === 0 && args.length === 0) ||
        execution.args.every((arg, i) => arg === args[i]),
    )
    if (existingExecution) {
      return await existingExecution.promise
    }

    const promise = Promise.resolve(method(...args)).finally(() => {
      const index = executions.findIndex((execution) => execution.promise === promise)
      if (index !== -1) {
        executions.splice(index, 1)
      }
    })

    executions.push({ args, promise })
    return await promise
  }
}
