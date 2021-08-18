import React from "./index";
import $ from 'jquery'

class Unit {
    constructor(element) {
        this._currentElement = element
    }
}

// 渲染文本
class ReactTextUnit extends Unit {
    getMarkUp(rootId) { // 保存当前元素id
        this._rootId = rootId
        const markUp =  `<span data-react_id="${this._rootId}">${this._currentElement}</span>`
        return markUp
    }
    update(nextElement) {
        if(this._currentElement !== nextElement) {
            this._currentElement = nextElement
            $(`[data-react_id="${this._rootId}"]`).html(this._currentElement)
        }
    }
}

// 渲染标签
class ReactNativeUnit extends Unit {
    getMarkUp(rootId) { // 保存当前元素id
        this._rootId = rootId
        let {type, props} = this._currentElement
        let tagStart = `<${type} data-react_id="${this._rootId}"`
        let tagEnd = `</${type}>`
        let contentStr;
        for (const propName in props) {
            if (/^on[A-Z]/.test(propName)) { // 判断是否为onClick等事件
                const eventType = propName.slice(2).toLowerCase() // 获取click  change等事件
                // react里面的事件都是通过事件委托的方式来绑定,不能给字符串绑定事件，故使用事件委托
                $(document).delegate(`${type}`,`${eventType}.${this._rootId}`, props[propName]) // 用delegate为了方便之后卸载该事件
                // $(document).on(eventType, `[data-react_id="${this._rootId}"]`, props[propName])
            } else if (propName === 'children') { // 如果为子元素，则进行递归处理  深度优先
                if (props[propName].length > 0 && Array.isArray(props[propName])) {
                    contentStr = props[propName].map((child, idx) => {
                        let childInstance = createReactUnit(child)
                        return childInstance.getMarkUp(`${rootId}.${idx}`)
                    }).join('')
                }
            } else if (propName === 'style') { // 样式处理
                let styles = Object.entries(props[propName]).map(([attr, value]) => {
                    return `${attr.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}:${value}`; // 将大写转化为-小写的形式  backgroundColor: 'red' => background-color: 'red'
                }).join(';')
                tagStart += `style=${styles}`
            } else if(propName === 'className'){
                tagStart += `class=${props[propName]}`
            } else {
                tagStart += `${propName}=${props[propName]}`
            }
        }
        // console.log(tagStart + '>' + contentStr + tagEnd)
        return tagStart + '>' + contentStr + tagEnd
    }
}

// 负责渲染react组件
class ReactComponentUnit extends Unit {
    // 这里负责组件的更新操作
    update(nextElement, partialState) {
        // 先获取到新的元素
        this._currentElement = nextElement || this._currentElement
        // 获取新的状态   不管数据更新与否，状态会改变
        let nextState = this._componentInstance.state = Object.assign(this._componentInstance.state, partialState)
        // 新的属性对象
        let nextProps = this._currentElement.props
        if(this._componentInstance.shouldComponentUpdate && !this._componentInstance.shouldComponentUpdate(nextProps, nextState)) {
            return
        }
        // 下面要比较变更  看render的返回值是否一样
        let preRenderedUnitInstance = this._reactComponentUnitInstance // 上次渲染的render
        // console.log('**********', preRenderedUnitInstance, this)
        //  得到上次渲染的元素
        let preRenderedElement = preRenderedUnitInstance._currentElement
        // 将要渲染的render
        let nextRenderElement =  this._componentInstance.render()
        // 如果新旧两个元素类型一样，则可以进行深度比较，如果不一样，则直接干掉老的元素。新建新的
        if(shouldDeepCompare(preRenderedElement,nextRenderElement)) {
            // 如果可以进行深比较，则把更新的工作交给撒谎给你次渲染出来的那个element元素对应的unit来处理
            preRenderedUnitInstance.update(nextRenderElement)
            this._componentInstance.componentDidUpdate && this._componentInstance.componentDidUpdate()
        } else {
            this._renderedUnitInstance = createReactUnit(nextRenderElement)
            let nextMarkUp = this._renderedUnitInstance.getMarkUp(this._rootId)
            $(`[data-react_id="${this._rootId}"]`).replaceWith(nextMarkUp)
        }
    }
    getMarkUp(rootId) {
        this._rootId = rootId
        let {type: Component, props} = this._currentElement // 将props和type取出，并将type重命名为component
        let componentInstance = this._componentInstance = new Component(props) // type为class,类型为function,此处则可以将props挂载到React.Components原型上
        // 让组件的示例的currentUnit属性等于当前的unit
        componentInstance._currentUnit = this
        // 执行生命周期钩子
        componentInstance.componentWillMount && componentInstance.componentWillMount()
        // 调用组件的render方法，获取要渲染的元素
        let reactComponentRender = componentInstance.render() // class实例上定义了该render方法，获取到render的返回值

        // 得到这个元素对应的Unit. 将返回值重新递归渲染
        let reactComposeUnitInstance = this._reactComponentUnitInstance = createReactUnit(reactComponentRender)
        // console.log('this', this)
        // 通过Unit可以获得他的html标记
        let markup = reactComposeUnitInstance.getMarkUp(this._rootId)
        // 绑定事件 先序深度优先  有儿子就进去  树的遍历
        $(document).on('mounted', () => {
            componentInstance.componentDidMount && componentInstance.componentDidMount()
        })
        return markup
    }
}
// 判断两个元素的类型是否一样
function shouldDeepCompare(oldElement, newElement) {
    if(oldElement !== null && newElement !==null) {
        let oldType = typeof oldElement
        let newType = typeof newElement
        if((oldType === 'string' || oldType === 'number') && (newType === 'string' || newType === 'number')) {
            return true
        }
        if((oldElement instanceof Element) && (newElement instanceof Element)) {
            return oldElement.type === newElement.type
        }
    }
    return false
}
const createReactUnit = function (element) {
    if (typeof element === 'string' || typeof element === 'number') {
        return new ReactTextUnit(element)
    }
    if (typeof element === 'object' && typeof element.type === 'string') {
        return new ReactNativeUnit(element)
    }
    if (typeof element === 'object' && typeof element.type === 'function') {
        return new ReactComponentUnit(element)  // element => {type: Counter, props:{name: 'xxx}}
    }
}
export default createReactUnit;