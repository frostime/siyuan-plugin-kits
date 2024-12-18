
export function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(func: F, wait: number) {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    return function (...args: Parameters<F>) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

export function throttle<T extends (...args: any[]) => any>(func: T, wait: number = 500) {
    let previous = 0;
    return function (...args: Parameters<T>) {
        let now = Date.now(), context = this;
        if (now - previous > wait) {
            func.apply(context, args);
            previous = now;
        }
    }
}

export class PromiseLimitPool<T> {
    private maxConcurrent: number;
    private currentRunning = 0;
    private queue: (() => void)[] = [];
    private promises: Promise<T>[] = [];

    constructor(maxConcurrent: number) {
        this.maxConcurrent = maxConcurrent;
    }

    add(fn: () => Promise<T>): void {
        const promise = new Promise<T>((resolve, reject) => {
            const run = async () => {
                try {
                    this.currentRunning++;
                    const result = await fn();
                    resolve(result);
                } catch (error) {
                    reject(error);
                } finally {
                    this.currentRunning--;
                    this.next();
                }
            };

            if (this.currentRunning < this.maxConcurrent) {
                run();
            } else {
                this.queue.push(run);
            }
        });
        this.promises.push(promise);
    }

    async awaitAll(): Promise<T[]> {
        return Promise.all(this.promises);
    }

    /**
     * Handles the next task in the queue.
     */
    private next(): void {
        if (this.queue.length > 0 && this.currentRunning < this.maxConcurrent) {
            const nextRun = this.queue.shift()!;
            nextRun();
        }
    }
}

