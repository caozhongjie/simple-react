import $ from 'jquery'
import createReactUnit from './unit.js'
import createElement from './element'
import Components from './component'
const React = {
    render,
    createElement,
    nextRootIndex: 0,
    Components
}

// 给每个元素添加属性，为了方便获取到这个元素
function render(element, container) {
    // 写一个工厂函数，来创建对应得react元素
    // 通过工厂函数来创建
    let createReactUnitInstance = createReactUnit(element)
    // console.log('createReactUnit生成的实例', createReactUnitInstance)
    const markUp = createReactUnitInstance.getMarkUp(React.nextRootIndex)
    // console.log('result', markUp)
    $(container).html(markUp)
    // 此处触发mounted
    $(document).trigger('mounted')
}

export default React;