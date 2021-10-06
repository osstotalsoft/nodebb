// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

function empty(ctx, next) {
    return next();
}

function emptyFn() {
}

function concat(middleware, pipeline) {
    return (ctx, next) => pipeline(ctx, () => middleware(ctx, next))
}

function run(pipeline, ctx) {
    return pipeline(ctx, emptyFn)
}

module.exports = {
    empty,
    concat,
    run
}