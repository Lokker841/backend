import { Injectable, OnModuleInit } from '@nestjs/common';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import * as os from 'os';
import { join } from 'path';

@Injectable()
export class WorkerService implements OnModuleInit {
  private workerPool: Worker[] = [];
  private taskQueue: { task: any; resolve: Function; reject: Function }[] = [];
  private busyWorkers: Set<Worker> = new Set();
  private readonly maxWorkers: number;

  constructor() {
    // Use 75% of available CPU cores, minimum 2
    this.maxWorkers = Math.max(2, Math.floor(os.cpus().length * 0.75));
  }

  async onModuleInit() {
    // Initialize worker pool
    for (let i = 0; i < this.maxWorkers; i++) {
      this.createWorker();
    }
  }

  private createWorker() {
    const worker = new Worker(join(__dirname, 'worker.thread.js'));
    
    worker.on('message', (result) => {
      this.busyWorkers.delete(worker);
      this.processNextTask(worker);
      
      const task = this.taskQueue.find(t => t.task.id === result.id);
      if (task) {
        const index = this.taskQueue.indexOf(task);
        this.taskQueue.splice(index, 1);
        task.resolve(result.data);
      }
    });

    worker.on('error', (error) => {
      this.busyWorkers.delete(worker);
      const task = this.taskQueue[0];
      if (task) {
        this.taskQueue.shift();
        task.reject(error);
      }
      this.createWorker(); // Replace the failed worker
    });

    this.workerPool.push(worker);
    return worker;
  }

  private processNextTask(worker: Worker) {
    if (this.taskQueue.length > 0 && !this.busyWorkers.has(worker)) {
      const task = this.taskQueue[0];
      this.busyWorkers.add(worker);
      worker.postMessage(task.task);
    }
  }

  async executeTask(taskType: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const task = {
        id: Math.random().toString(36).substr(2, 9),
        type: taskType,
        data,
      };

      this.taskQueue.push({ task, resolve, reject });

      // Find available worker
      const availableWorker = this.workerPool.find(
        worker => !this.busyWorkers.has(worker)
      );

      if (availableWorker) {
        this.processNextTask(availableWorker);
      }
    });
  }

  async onModuleDestroy() {
    // Cleanup workers
    for (const worker of this.workerPool) {
      worker.terminate();
    }
  }
} 