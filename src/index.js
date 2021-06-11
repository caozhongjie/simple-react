import React from './react/index'
function say() {
    console.log('执行了say方法')
}
const element = React.createElement('div', {name: 'xxx'}, 'hello',React.createElement(
    'button', {onClick: say}, '123'
))
console.log(element)
React.render(element,
    document.getElementById('root')
)