// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

describe("TopicRegistry tests", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules() // this is important - it clears the cache
        process.env = { ...OLD_ENV };
        delete process.env.NODE_ENV;
    });

    afterEach(() => {
        process.env = OLD_ENV;
    });

    test("topic registry with topic prefix", () => {
        //arrange
        const topicPrefix = 'some-prefix'
        process.env.Messaging__TopicPrefix = topicPrefix
        process.env.Messaging__Env = undefined
        const { getFullTopicName } = require("../topicRegistry")
        const topic = "some-topic"

        //act
        const actual = getFullTopicName(topic)

        //assert
        expect(actual).toBe(topicPrefix + topic)
    })

    test("topic registry with messaging env", () => {
        //arrange
        const messagingEnv = 'some-env'
        process.env.Messaging__TopicPrefix = undefined
        process.env.Messaging__Env = messagingEnv
        const { getFullTopicName } = require("../topicRegistry")
        const topic = "some-topic"

        //act
        const actual = getFullTopicName(topic)

        //assert
        expect(actual).toBe(messagingEnv + "." + topic)
    })

    test("topic registry without topic prefix or messaging env", () => {
        //arrange
        process.env.Messaging__TopicPrefix = undefined
        process.env.Messaging__Env = undefined
        const { getFullTopicName } = require("../topicRegistry")
        const topic = "some-topic"

        //act
        const actual = getFullTopicName(topic)

        //assert
        expect(actual).toBe(topic)
    })
})