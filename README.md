# nodebb
##### NodeJs building blocks for distributed apps.

*"Sometimes, the elegant implementation is just a function. Not a method. Not a class. Not a framework. Just a function."*

## The blocks
  - [`message-bus`](./packages/message-bus#readme)
  - [`messaging-host`](./packages/messaging-host#readme)
  - [`knex-filters`](./packages/knex-filters#readme)

## Bootstrap
```javascript
yarn install
lerna bootstrap
```

## Test
```javascript
yarn test
```

## Ts lint
```javascript
yarn tslint
```

## Publish
```javascript
lerna publish patch
lerna publish minor
lerna publish major
``` 

## License

NodeBB is licensed under the [MIT](LICENSE) license.