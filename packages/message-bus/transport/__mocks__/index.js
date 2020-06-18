const publish = jest.fn(async (_subject, _msg) => { 
    
})
const subscribe = jest.fn(async (_subject, handler, _opts) => {
    setTimeout(1000, () => {
        handler({ payload: {}, headers: {} })
    })
})

module.exports = {
    publish,
    subscribe
}