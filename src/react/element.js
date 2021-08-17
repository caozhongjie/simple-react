class Element{
    constructor(type, props) {
        this.type = type
        this.props = props
    }
}
function createElement(type, props, ...children) {
    const currentProp = props || {}
    currentProp['children'] = children
    return new Element(type, currentProp)
}
// 该方法返回vNode,用对象来描述元素
export default createElement;