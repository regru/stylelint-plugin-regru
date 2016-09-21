# stylelint-plugin-regru

Stylelint rules for REG.RU project

## stylelint-plugin-regru/function-space-quotes-inside

Add exception for `()` parens which contains ONLY string expression like:

```
//never-single-line-quotes
.block {
    background: url('hello.png'); //correct
    background: url( 'hello.png' ); //incorrect
}

//always-single-line-quotes
.block {
    background: url( 'hello.png' ); //correct
    background: url('hello.png'); //incorrect
}

```


```
//.stylelintrc
{
  "plugins": [
    "stylelint-plugin-regru"
  ],
  "rules": {
    "stylelint-plugin-regru/function-space-quotes-inside": "never-single-line-quotes"
  }
}

```
