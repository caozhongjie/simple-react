import $ from 'jquery'
import createReactUnit from './unit.js'
import createElement from './element'
const React = {
    render,
    createElement,
    nextRootIndex: 0
}

// 给每个元素添加属性，为了方便获取到这个元素
function render(element, container) {
    // 写一个工厂函数，来创建对应得react元素
    // 通过工厂函数来创建
    let createReactUnitInstance = createReactUnit(element)
    console.log(createReactUnitInstance)
    const markUp = createReactUnitInstance.getMarkUp(React.nextRootIndex)

    $(container).html(markUp)
}

export default React;