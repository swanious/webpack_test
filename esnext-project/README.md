# babel과 webpack을 이용한 ES6+/ES.NEXT 개발 환경 구축

> 모던 자바스크립트 Deep Dive 학습 내용을 정리한 자료입니다.
>
> node.js : 14.17.1
>
> npm: 6.14.11

## babel을 사용하는 이유?

크롬, 사파리, 파이어폭스, 엣지 같은 [에버그린 브라우저](https://www.techopedia.com/definition/31094/evergreen-browser)의 ES6 지원율은 98%로 거의 대부분 사양을 지원하지만, 구형 브라우저(IE 11)의 지원율은 약 11%다. 이처럼 ES6와 그 이후 문법은 IE에서 지원하지 않기때문에 컴파일 과정에서 babel을 통해 트랜스파일하여 IE가 이해해먹을 수 있도록 변환해야한다. 그 역할을 babel녀석이 하는 것



## babel

- arrow Func(es6), 지수 연산자(es7)은 IE에서 사용할 수 없으므로, babel을 통해 트랜스파일 해주어야 한다.

```javascript
[1,2,3].map(n => n ** n);
```

- babeljs.io에서 트랜스파일의 결과를 확인해볼 수 있는데, 결과는 다음과 같다.

```javascript
"use strict";

[1, 2, 3].map(function (n) {
  return Math.pow(n, n);
});
```

### babel 설치

```bash
# 프로젝트 폴더 생성
$ mkdir esnext-project && cd esnext-project
# package.json 생성
$ npm init -y
# babel-core, babel-cli 설치
$ npm install --save-dev @babel/core @babel/cli
```

- package.json

```json
{
  ...
  "devDependencies": {
    "@babel/cli": "^7.14.5",
    "@babel/core": "^7.14.6",
    "@babel/preset-env": "^7.14.7"
  }
}

```

혹시 지정한 버전의 dependency를 설치하고싶으면 `@[version]`을 써주면 된다.

```bash
# 버전 지정 설치
npm install --save-dev @babel/core@7.10.3 @babel/cli@7.10.3
```



### Babel 프리셋 설치와 babel.config.json 설정 파일 작성

babel을 사용하려면 @babel/preset-env를 설치해야한다. 이는 함께 사용되어야 하는 Babel 플러그인을 모아 둔 것으로 Babel이 제공하는 공식 Babel 프리셋은 다음과 같다.

- @babel/preset-env
- @babel/preset-flow
- @babel/preset-react
- @babel/preset-typescript

@babel/preset-env는 필요한 플러그인들을 프로젝트 지원 환경에 맞춰 동적으로 결정해준다. 프로젝트 지원 환경은 [Browserslist](https://github.com/browserslist/browserslist)형식으로 `.browserslistrc` 파일에서 설정할 수 있다.(생략하면 기본값으로 세팅)

일단 기본 설정으로 진행하자. 기본 설정은 모든 ES6+/ES.NEXT 사양의 소스코드를 변환한다.

```bash
# @babel/preset-env 설치
$ npm install --save-dev @babel/preset-env
```

설치가 완료되면 루트 폴더에 `babel.config.json` 설정 파일을 생성하고 다음과 같이 작성한다. 지금 설치한 `@babel/preset-env`를 사용하겠다는 의미다.

```json
{
    "presets": ["@babel/preset-env"]
}
```



### 트랜스파일링

Babel을 사용하여 ES6+/ES.NEXT 사양의 소스코드를 ES5 사양의 소스코드로 트랜스파일링 하기 위해 `package.json`의 npm script에 Babel CLI 명령어를 등록하여 사용한다.

- package.json

```json
{
    ...
    "scripts": {
        "build" : "babel src/js -w -d dist/js"
    }
}
```

위 npm scripts의 build는 src/js 폴더에 있는 모든 자바스크립트 파일들을 트랜스파일링한 후, 그 결과물을 `dist/js`폴더에 저장한다. 옵션의 의미는 다음과 같다.

- `-w` : 타깃 폴더에 있는 모든 js파일들의 변경을 감지하여 자동으로 트랜스파일링한다.(--watch 옵션 축약)
- `-d` : 트랜스파일링된 결과물이 저장될 폴더를 지정한다. 만약 지정된 폴더가 존재하지 않으면 자동 생성한다. (--out-dir 옵션 축약)

`src/js` 폴더에 main.js, lib.js 파일을 생성한다.

- lib.js

``` javascript
export const pi = Math.PI; // es6 모듈

export function power(x, y) {
  return x ** y; // es7 지수 연산자
}

// es6 클래스
export class Foo {
  #private = 10; // stage 3: 클래스 필드 정의 제안

  foo() {
    // stage 4: 객체 Rest/Spread 프로퍼티 제안
    const { a, b, ...x } = { ...{ a: 1, b: 2 }, c: 3, d: 4 };
    return { a, b, x };
  }

  bar() {
    return this.#private
}
```



- main.js

```javascript
import { pi, power, Foo } from "./lib";

console.log(pi);
console.log(power(pi, pi));

const f = new Foo();
console.log(f.foo());
console.log(f.bar());
```

터미널에서 build를 통해 트랜스파일링을 실행하면 책(2021년 1월) 상에서는 `TC39 프로세스`의 stage 3(candidate) 단계에 있던 `#private` 는 사용할 수 없어서 오류가 발생한다. 그래서 private fields를 사용할 수 있도록 `@babel/plugin-proposal-class-properties`라는 plugin을 설치해줘야했다.

그러나, 21.07.15 현재 plugin이 없이 build를 해봤으나 별다른 문제없이 아래와 같이 트랜스파일링이 잘 이루어진다. 어찌된 영문인지는 찾아봐야할듯하다..

- dist/js/lib.js

```javascript
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.power = power;
exports.Foo = exports.pi = void 0;
var _excluded = ["a", "b"];

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _classPrivateFieldGet(receiver, privateMap) { var descriptor = _classExtractFieldDescriptor(receiver, privateMap, "get"); return _classApplyDescriptorGet(receiver, descriptor); }

function _classExtractFieldDescriptor(receiver, privateMap, action) { if (!privateMap.has(receiver)) { throw new TypeError("attempted to " + action + " private field on non-instance"); } return privateMap.get(receiver); }

function _classApplyDescriptorGet(receiver, descriptor) { if (descriptor.get) { return descriptor.get.call(receiver); } return descriptor.value; }

var pi = Math.PI; // es6 모듈

exports.pi = pi;

function power(x, y) {
  return Math.pow(x, y); // es7 지수 연산자
} // es6 클래스


var _private = /*#__PURE__*/new WeakMap();

var Foo = /*#__PURE__*/function () {
  function Foo() {
    _classCallCheck(this, Foo);

    _private.set(this, {
      writable: true,
      value: 10
    });
  }

  _createClass(Foo, [{
    key: "foo",
    value: // stage 3: 클래스 필드 정의 제안
    function foo() {
      // stage 4: 객체 Rest/Spread 프로퍼티 제안
      var _a$b$c$d = _objectSpread(_objectSpread({}, {
        a: 1,
        b: 2
      }), {}, {
        c: 3,
        d: 4
      }),
          a = _a$b$c$d.a,
          b = _a$b$c$d.b,
          x = _objectWithoutProperties(_a$b$c$d, _excluded);

      return {
        a: a,
        b: b,
        x: x
      };
    }
  }, {
    key: "bar",
    value: function bar() {
      return _classPrivateFieldGet(this, _private);
    }
  }]);

  return Foo;
}();

exports.Foo = Foo;
```

- `node dist/js/main` 실행결과

![image-20210715171055115](%5Bwebpack%5Dbabel%EA%B3%BC%20webpack%EC%9D%84%20%EC%9D%B4%EC%9A%A9%ED%95%9C%20ES6+ES.NEXT%20%EA%B0%9C%EB%B0%9C%20%ED%99%98%EA%B2%BD%20%EA%B5%AC%EC%B6%95.assets/image-20210715171055115.png)



### 브라우저에서 모듈 로딩 테스트

앞서서 babel 테스트를 통해 트랜스파일링도 무사히 실행됐고, es6 모듈 시스템인 import와 export 키워드도 트랜스파일링되어 정상 동작한다. 하지만, 예제는 Node.js가 기본 지원하는 CommonJS 방식의 모듈 로딩 시스템 때문이지, 브라우저에서는 제대로 동작하지 않는다.

root폴더에 index.html을 생성하여 생성했던 파일을 불러보자.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script src="dist/js/lib.js"></script>
    <script src="dist/js/main.js"></script>
  </head>
  <body></body>
</html>
```

script 태그를 통해 파일을 불러서 브라우저 개발자 도구의 console탭을 보면 에러가 발생한다.

![image-20210715171935478](%5Bwebpack%5Dbabel%EA%B3%BC%20webpack%EC%9D%84%20%EC%9D%B4%EC%9A%A9%ED%95%9C%20ES6+ES.NEXT%20%EA%B0%9C%EB%B0%9C%20%ED%99%98%EA%B2%BD%20%EA%B5%AC%EC%B6%95.assets/image-20210715171935478.png)

브라우저의 ES6 모듈(ESM)을 사용하도록 Babel을 설정할 수도 있지만, ESM 사용은 다음과 같은 문제를 발생시킬 수 있다.

1. IE를 포함한 구형 브라우저는 ESM을 지원하지 않는다.
2. ESM을 사용하더라도 트랜스파일링이나 번들링이 필요한 것은 변함이 없다.
3. ESM이 아직 지원하지 않는 기능(bare import 등)이 있고 점차 해결되고는 있지만 아직 몇 가지 이슈가 존재한다고 한다.

하지만, Webpack을 통해 위의 문제를 해결할 수 있다.



## webpack

### webpack 설치

```bash
$ npm install --save-dev webpack webpack-cli
```

### babel-loader 설치

webpack이 모듈을 번들링할 때 Babel을 사용하여 ES6+/ES.NEXT 사양의 소스코드를 ES5 사양의 소스코드로 트랜스파일링하도록 `babel-loader`를 설치한다.

```bash
$ npm install --save-dev babel-loader
```

이제 npm scripts로 babel을 실행하는 것이 아닌 webpack을 실행하도록 수정한다.

- package.json

```json
{
  ...  
  "scripts": {
    "build": "webpack -w",
  },
}
```



### webpack.config.js 설정 파일 작성

`webpack.config.js`는 webpack이 실행될 때 참조하는 설정 파일이다. 다음과 같이 작성한다.

```javascript
const path = require("path");
module.exports = {
  // entry file - webpack이 실행될 파일
  // https://v4.webpack.js.org/configuration/entry/
  entry: "./src/js/main.js",
  // 번들링된 js 파일의 이름(filename)과 저장될 경로(path)를 지정
  // https://v4.webpack.js.org/configuration/output/
  output: {
    path: path.join(__dirname, "dist/js"),
    filename: "bundle.js",
  },
  // https://v4.webpack.js.org/configuration/module/
  module: {
    rules: [
      {
        test: /\.js?$/,
        include: [path.resolve(__dirname, "src/js")],
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  devtool: "source-map",
  // https://v4.webpack.js.org/configuration/mode/
  mode: "development",
};

```

이제 webpack을 실행하여 트랜스파일링 및 번들링을 실행한다.

```bash
$ npm run build
```

빌드 성공하면 아래와 같이 build 파일 사이즈와 성공 메시지와 함께 dist파일에 빌드 파일이 생성된다.

![image-20210715220822906](%5Bwebpack%5Dbabel%EA%B3%BC%20webpack%EC%9D%84%20%EC%9D%B4%EC%9A%A9%ED%95%9C%20ES6+ES.NEXT%20%EA%B0%9C%EB%B0%9C%20%ED%99%98%EA%B2%BD%20%EA%B5%AC%EC%B6%95.assets/image-20210715220822906.png)

![image-20210715220939731](%5Bwebpack%5Dbabel%EA%B3%BC%20webpack%EC%9D%84%20%EC%9D%B4%EC%9A%A9%ED%95%9C%20ES6+ES.NEXT%20%EA%B0%9C%EB%B0%9C%20%ED%99%98%EA%B2%BD%20%EA%B5%AC%EC%B6%95.assets/image-20210715220939731.png)

이후, `index.html` 에서 build 후 생성된 `bundle.js` 파일을 부르고 브라우저를 실행해보면,

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <script src="dist/js/bundle.js"></script>
  </head>
  <body></body>
</html>
```

아래와 같이 결과물이 잘 출력된다. 이는 webpack을 통해 모듈을 번들링하고, 브라우저에서 실행할 수 있도록 변환해주었기 때문이다.

![image-20210715221108385](%5Bwebpack%5Dbabel%EA%B3%BC%20webpack%EC%9D%84%20%EC%9D%B4%EC%9A%A9%ED%95%9C%20ES6+ES.NEXT%20%EA%B0%9C%EB%B0%9C%20%ED%99%98%EA%B2%BD%20%EA%B5%AC%EC%B6%95.assets/image-20210715221108385.png)

### babel-polyfill 설치

Babel을 사용하여 ES6+/ES.NEXT 사양의 소스코드를 ES5 사양의 소스코드로 트랜스파일링해도 브라우저가 지원하지 않는 코드가 남아 있을 수 있다. 예로, ES6에서 추가된 `Promise`, `Object.assign`, `Array.from` 등은 ES5 사양으로 트랜스파일링해도 ES5 사양에 대체할 기능이 없기 때문에 트랜스파일링되지 못하고 그대로 남는다.

테스트를 위해 아래와 같이 코드를 바꾸고 webpack을 통해 번들링을 시도해보자.

- src/js/main.js

```javascript
import { pi, power, Foo } from "./lib";

console.log(pi);
console.log(power(pi, pi));

const f = new Foo();
console.log(f.foo());
console.log(f.bar());

// polyfill이 필요한 코드
console.log(
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(1), 1000);
  })
);
// polyfill이 필요한 코드
console.log(Object.assign({}, { x: 1, y: 3 }));

// polyfill이 필요한 코드
console.log(Array.from([1, 2, 3], (v) => v + v));
```

- dist/js/main.js

```javascript
// polyfill이 필요한 코드
console.log(new Promise(function (resolve, reject) {
  setTimeout(function () {
    return resolve(1);
  }, 1000);
})); 

// polyfill이 필요한 코드
console.log(Object.assign({}, {
  x: 1,
  y: 3
})); 

// polyfill이 필요한 코드
console.log(Array.from([1, 2, 3], function (v) {
  return v + v;
}));
})();
```

결과를 보면 `Promise`, `Object.assign`, `Array.from` 은 대체할 코드가 없어서 변환이 이루어지지 않은 것을 볼 수 있다. 이를 위해서 `@babel/polyfill`을 설치하여 해결한다. 하지만 이는 문제가 발생할 것이다. (이유는 30초 후 공개)

```bash
$ npm install @babel/polyfill
```

여기서 주의할 점은 `@babel/polyfill`은 개발 환경에서만 사용하느 것이 아니라 실제 운영환경에서도 사용해야하므로 `--save-dev` 옵션을 지정하지 않는다. 

이후, ES6의 import를 사용하는 경우에는 진입점의 선두에서 폴리필을 로드하도록 한다.

- src/js/main.js

```javascript
import "@babel/polyfill"
import {pi, power, Foo} from './lib'
...
```

webpack을 사용한다면 위 방법이 아닌 `webpack.config.js`에서 entry(진입점)배열에서 polyfill을 추가한다.

```javascript
const path = require('path')

module.exports = {
    entry: ["@babel/polyfill", "./src/js/main.js"],
    ...
}
```

이후, webpack을 통해 다시 build를 시도했으나......

오류가 발생했다.

### deprecated `@babel/polyfill`...?

책이 쓰인 시점과 현재 상황이 좀 달라졌는데, 당시에는 위처럼 `@babel/polyfill`을 추가해줘서 사용하면 폴리필이 추가돼서 사용할 수 있었다. 하지만 현재는 에러가 발생해서 공식문서를 들어가보니 아래의 글이 보인다.

![image-20210716135718997](%5Bwebpack%5Dbabel%EA%B3%BC%20webpack%EC%9D%84%20%EC%9D%B4%EC%9A%A9%ED%95%9C%20ES6+ES.NEXT%20%EA%B0%9C%EB%B0%9C%20%ED%99%98%EA%B2%BD%20%EA%B5%AC%EC%B6%95.assets/image-20210716135718997.png)

> Babel 7.4.0부터 이 패키지는 core-js/stable과 regenerator-runtime/runtime을 직접 포함하기 위해 더 이상 사용되지 않습니다.
>
> Babel에는 regenerator runtime 및 core-js가 포함된 폴리필이 포함됩니다.
>
> 이는 전체 ES2015+ 환경을 에뮬레이트하며 라이브러리/툴이 아닌 애플리케이션에서 사용하기 위한 것입니다. (이 폴리필은 바벨 노드를 사용할 때 자동으로 로드됩니다.)
>
> 즉, Promise 또는 WeakMap과 같은 새로운 built-ins, Array.from 또는 Object.assign과 같은 정적 메서드, Array.protype.includes와 같은 인스턴스 메서드 및 generator functions(regenerator plugin을 사용하는 경우)을 사용할 수 있습니다. 이를 위해 폴리필은 String과 같은 네이티브 프로토타입뿐만 아니라 글로벌 범위에 추가됩니다.

짧게 요약하면, @babel/polyfill을 더이상 지원하지 않으며, 현재는 `core-js/stable`과 `regenerator-runtime/runtime` 패키지를 직접 전역 스코프에 삽입한다. 하지만 패키지를 프로젝트의 root에서 두 패키지를 import하여 사용하기 때문에 위의 방식도 **전역 오염** 문제가 있다. 이 문제에 대해 [카카오 기술블로그 글](https://tech.kakao.com/2020/12/01/frontend-growth-02/)을 찾았다! 

블로그 글을 참고하여 다음과 같이 전역오염을 막고, plugin을 사용해서 polyfill을 사용하여 빌드에 성공했다.

### @babel/transform-runtime & core-js@3

- 설치

```bash
npm install --save-dev @babel/plugin-transform-runtime
npm install @babel/runtime-corejs3
```

- package.json

```json
{
  "devDependencies" : {
    "@babel/plugin-transform-runtime": "^7.14.5",
    ...
  },
  "dependencies": {
    "@babel/runtime-corejs3": "^7.14.7"
    ...
  }
}
```



- .babelrc.json에서 babel환경설정을 다음과 같이 변경한다.
  - `@babel/plugin-transform-runtime`

```json
// https://babeljs.io/docs/en/babel-plugin-transform-runtime
{
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "corejs": 3,
        "regenerator": true
      }
    ]
  ]
}
```

이후 npm run build를 통해 build를 수행하면 아래와 같이 트랜스파일링이 동작한다.

![image-20210716143833398](%5Bwebpack%5Dbabel%EA%B3%BC%20webpack%EC%9D%84%20%EC%9D%B4%EC%9A%A9%ED%95%9C%20ES6+ES.NEXT%20%EA%B0%9C%EB%B0%9C%20%ED%99%98%EA%B2%BD%20%EA%B5%AC%EC%B6%95.assets/image-20210716143833398.png)

- src/js/main.js

```javascript
import { pi, power, Foo } from "./lib";

console.log(pi);
console.log(power(pi, pi));

const f = new Foo();
console.log(f.foo());
console.log(f.bar());

// polyfill이 필요한 코드
console.log(
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(1), 1000);
  })
);
// polyfill이 필요한 코드
console.log(Object.assign({}, { x: 1, y: 3 }));

// polyfill이 필요한 코드
console.log(Array.from([1, 2, 3], (v) => v + v));

// polyfill이 필요한 코드
console.log([1, 2, 3].includes(1));
```

- dist/js/bundle.js

```javascript
// polyfill이 필요한 코드
console.log(new _babel_runtime_corejs3_core_js_stable_promise__WEBPACK_IMPORTED_MODULE_0___default.a(function (resolve, reject) {
  _babel_runtime_corejs3_core_js_stable_set_timeout__WEBPACK_IMPORTED_MODULE_1___default()(function () {
    return resolve(1);
  }, 1000);
})); 
// polyfill이 필요한 코드
console.log(_babel_runtime_corejs3_core_js_stable_object_assign__WEBPACK_IMPORTED_MODULE_2___default()({}, {
  x: 1,
  y: 3
})); 
// polyfill이 필요한 코드
console.log(_babel_runtime_corejs3_core_js_stable_array_from__WEBPACK_IMPORTED_MODULE_3___default()([1, 2, 3], function (v) {
  return v + v;
}));


// polyfill이 필요한 코드
console.log(_babel_runtime_corejs3_core_js_stable_instance_includes__WEBPACK_IMPORTED_MODULE_4___default()(_context = [1, 2, 3]).call(_context, 1));
```

하지만 `transform-runtime` 플러그인은 `preset-env`와 다르게 `target` 옵션을 지원하지 않아 브라우저 상황에 맞게 폴리필 최적화를 할 수 없다고 한다. (이후 지원한다는 계획이 있다고 하니까 업데이트되면 사용해봐도 좋을듯)



## 마치며

babel과 webpack에 대해 전혀 모르다가 책을 통해 *왜 사용하는가?* 와 사용법을 알게돼서 좋았다. 

babel과 webpack을 하나씩 더해가면서 실습하니까 이해하기 좋았고, 더불어  책이 쓰여진 시점과 현재의 상황이 달라서 발생하는 오류를 직접 마주치면서 시간에 따라 업데이트되고 변화하는 기술에 대해 깨어있어야 한다는 점을 알게됐다. 

FE개발자로써 꼭 알아야할 지식이라고 생각한다. 관심을 지속하자 !
