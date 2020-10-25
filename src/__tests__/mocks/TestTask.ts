import BaseTask from "../../BaseTask";

export default class TestTask extends BaseTask<Promise<string>|string> {
    executor = (): Promise<string> | string => {
        if (this.data.isPromise) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (this.data.throwError) {
                        reject('ERROR')
                    } else {
                        resolve('TESTED WELL')
                    }
                }, 100)
            })
        } else {
            if (this.data.throwError) {
                throw new Error('ERROR')
            }
            return 'TESTED WELL'
        }
    }
}