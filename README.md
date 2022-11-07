# nodebb

##### NodeJs building blocks for distributed apps.

_"Sometimes, the elegant implementation is just a function. Not a method. Not a class. Not a framework. Just a function."_

## The blocks

- [`messaging-host`](./packages/messaging-host#readme)

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
yarn lerna run tslint
```

## Publish

```javascript
yarn lerna publish patch
yarn lerna publish minor
yarn lerna publish major
```

## License

NodeBB is licensed under the [MIT](LICENSE) license.

## Contributing

When using Visual Studio Code please use the extension [`Licenser`](https://marketplace.visualstudio.com/items?itemName=ymotongpoo.licenser) for applying the license header in files.
