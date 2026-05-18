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

```
npm set //registry.npmjs.org/:_authToken=<your-granular-token>
```

```javascript
yarn lerna publish patch -- --no-verify-access
yarn lerna publish minor -- --no-verify-access
yarn lerna publish major -- --no-verify-access
```

When npm push fails:
```
git push origin --delete v2.5.1; git tag -d v2.5.1; git revert HEAD --no-edit; git push

```

## License

NodeBB is licensed under the [MIT](LICENSE) license.

## Contributing

When using Visual Studio Code please use the extension [`Licenser`](https://marketplace.visualstudio.com/items?itemName=ymotongpoo.licenser) for applying the license header in files.
