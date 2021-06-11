import React from "./index";
import $ from 'jquery'
class Unit {
    constructor(element) {
        this.currentElement = element
    }
}
class  ReactTextUnit extends Unit{
    getMarkUp(rootId) { // 保存当前元素id
        this._rootId = rootId
        const markUp = `<span react_id="${this._rootId}">
            ${this.currentElement}
        </span>`
        return markUp
    }
}
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
                // react里面的事件都是通过事件委托的方式来绑定
                $(document).on(eventType, `[data-react_id="${this._rootId}"]`, props[propName])
                console.log(propName)
            }else if(propName === 'children') {
                if(props[propName].length > 0) {
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
const createReactUnit = function (element) {
    if(typeof element === 'string' || typeof element === 'number') {
        return new ReactTextUnit(element)
    }
    if(typeof element === 'object' && typeof element.type === 'string') {
        return new ReactNativeUnit(element)
    }
}
export default createReactUnit;