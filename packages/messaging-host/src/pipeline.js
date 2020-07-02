function empty(ctx, next) {
    return next();
}

function emptyFn() {
}

function concat(middleware, pipeline) {
    return (ctx, next) => pipeline(ctx, () => middleware(ctx, next))
}

function run(pipeline, ctx) {
    pipeline(ctx, emptyFn)
}

module.exports = {
    empty,
    concat,
    run
}