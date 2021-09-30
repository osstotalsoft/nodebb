// Copyright (c) TotalSoft.
// This source code is licensed under the MIT license.

function timeout(prom, time, exception) {
  let timer
  return Promise.race([
    prom,
    new Promise(
      (_r, rej) => (timer = setTimeout(rej, time, exception)),
    ),
  ]).finally(() => clearTimeout(timer))
}

module.exports = {
  timeout,
}
