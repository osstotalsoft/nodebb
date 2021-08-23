// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

// eslint-disable-next-line node/no-extraneous-require
require('jest-extended')
const { empty, concat, run } = require("../pipeline")

describe("Pipeline tests", () => {
    test("concat with empty", async () => {
        //Arrange
        const middleware = jest.fn(async (_ctx, next) => { await next() })
        const pipeline = concat(empty, middleware)
        const ctx = {}

        //Act
        await run(pipeline, ctx)

        //Assert
        expect(middleware).toHaveBeenCalled()
        expect(middleware.mock.calls[0][0]).toBe(ctx)
    })

    test("concat two middlewares", async () => {
        //Arrange
        const firstMiddleware = jest.fn(async (_ctx, next) => { await next() })
        const secondMiddleware = jest.fn(async (_ctx, next) => { await next() })
        const pipeline = concat(secondMiddleware, firstMiddleware)
        const ctx = {}

        //Act
        await run(pipeline, ctx)

        //Assert
        expect(firstMiddleware).toHaveBeenCalled()
        expect(secondMiddleware).toHaveBeenCalled()
        expect(firstMiddleware).toHaveBeenCalledBefore(secondMiddleware)
        expect(firstMiddleware.mock.calls[0][0]).toBe(ctx)
        expect(secondMiddleware.mock.calls[0][0]).toBe(ctx)
    })
})