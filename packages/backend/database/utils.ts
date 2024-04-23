export function preQuery(next: Function) {
    // @ts-ignore
    if (!this.getQuery().hasOwnProperty('deleted')) {
        // @ts-ignore
        this.where('deleted').equals(false)
    }
    next()
}
