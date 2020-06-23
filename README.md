# nodebb
##### NodeJs building blocks for distributed apps.

*"Sometimes, the elegant implementation is just a function. Not a method. Not a class. Not a framework. Just a function."*

## The blocks
  - [`message-bus`](./packages/message-bus#readme)

## Bootstrap
```javascript
yarn install
lerna bootstrap
```

## Test
```javascript
jest
```

## Publish
```javascript
lerna publish --contents build patch
lerna publish --contents build minor
lerna publish --contents build major
``` 
