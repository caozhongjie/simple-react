import React from "./index";
import $ from 'jquery'
class Unit {
    constructor(element) {
        this.currentElement = element
    }
}
// 渲染文本
class  ReactTextUnit extends Unit{
    getMarkUp(rootId) { // 保存当前元素id
        this._rootId = rootId
        const markUp = `<span react_id="${this._rootId}">
            ${this.currentElement}
        </span>`
        return markUp
    }
}
// 渲染标签
class ReactNativeUnit extends Unit{
    getMarkUp(rootId) { // 保存当前元素id
        this._rootId = rootId
        let {type, props} = this.currentElement
        let tagStart = `<${type} data-react_id="${this._rootId}"`
        let tagEnd = `</${type}>`
        let contentStr;
        for(const propName in props) {
            if(/^on[A-Z]/.test(propName)) { // 判断是否为onClick等事件
                const eventType = propName.slice(2).toLowerCase() // 获取click  change等事件
                // react里面的事件都是通过事件委托的方式来绑定,不能给字符串绑定事件，故使用事件委托
                $(document).on(eventType, `[data-react_id="${this._rootId}"]`, props[propName])
                console.log(propName)
            }else if(propName === 'children') {
                if(props[propName].length > 0 && Array.isArray(props[propName])) {
                    contentStr = props[propName].map((child, idx) => {
                        let childInstance = createReactUnit(child)
                        return childInstance.getMarkUp(`${rootId}.${idx}`)
                    }).join('')
                }
            } else {
                tagStart += `${propName}=${props[propName]}`
            }
        }
        console.log(tagStart + '>' + contentStr + tagEnd)
        return tagStart + '>' + contentStr + tagEnd
    }
}

// 负责渲染react组件
class ReactComposeUnit extends Unit{
    getMarkUp(rootId) {
        this._rootId = rootId
        let {type:Component, props} = this.currentElement // 将props和type取出，并将type重命名为component
        let componentInstance = new Component(props) // type为class,类型为function
        componentInstance.componentWillMount && componentInstance.componentWillMount()
        let reactComponentRender = componentInstance.render() // class示例上定义了该render方法，获取到render的返回值
        console.log('22222redner', reactComponentRender)
        // 将返回值重新递归渲染
        let reactComposeUnitInstance = createReactUnit(reactComponentRender)
        // console.log('1111111', reactComposeUnitInstance)
        let markup = reactComposeUnitInstance.getMarkUp(this._rootId)
        return markup
    }
}

const createReactUnit = function (element) {
    if(typeof element === 'string' || typeof element === 'number') {
        return new ReactTextUnit(element)
    }
    if(typeof element === 'object' && typeof element.type === 'string') {
        return new ReactNativeUnit(element)
    }
    if(typeof element === 'object' && typeof element.type === 'function') {
        return  new ReactComposeUnit(element)  // element => {type: Counter, props:{name: 'xxx}}
    }
}
export default createReactUnit;