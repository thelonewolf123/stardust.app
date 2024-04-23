export function preQuery(next: Function) {
    // @ts-ignore
    if (!this.getQuery().hasOwnProperty('deleted')) {
        // @ts-ignore
        this.where('deleted').equals(false)
    }

    next()
}

export function preUpdateQuery(next: Function) {
    // @ts-ignore
    this.setQuery({
        updatedAt: new Date(),
        // @ts-ignore
        ...this.getQuery()
    })

    next()
}
