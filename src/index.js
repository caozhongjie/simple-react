import React from './react/index'

class SubCounter{
    componentWillMount() {
        console.log('child组件被挂载')
    }
    componentDidMount() {
        console.log('子组件挂载完成')
    }
    render() {
        return 123
    }
}

class Counter extends React.Components {
    constructor(props) {
        super(props) // 继承父类属性
        this.state = {
            number: 1
        }
    }
    componentWillMount() {
        console.log('parent组件被挂载')
        console.log(this.props)
        this.setState()
    }
    componentDidMount() {
        console.log('父组件挂载完成')
    }
    say = () => {
        console.log('执行say方法')
    }
    render (){
        // return <SubCounter />
        return (
            React.createElement("div", {
                style: {
                    color: 'red',
                    background: 'black'
                }
            }, "123123", /*#__PURE__*/React.createElement("p", {className: 'diyText'}, this.props.text), React.createElement("button", {onClick: this.say}, "按钮点击"))
        )
    }
}




// function say() {
//     console.log('执行了say方法')
// }
// const element = React.createElement('div', {name: 'xxx'}, 'hello',React.createElement(
//     'button', {onClick: say}, '123'
// ))
const p = React.createElement("p", null, '这是p标签')
const btn = React.createElement("button", null, '点击')
// const element = React.createElement("div", {
//     style: {
//         color: 'red',
//         background: 'black'
//     }
// }, "12312312",p, btn )
// console.log(element) // {type: Counter, props: {name: 'asda', children: ['xx']}

/*
* 这里的第二个参数即为传递给该组件的值，通过 之后的 new Counter()，会把该属性挂载到React.Component。
* 通过super()会继承父类的属性。从而通过this.props拿到属性
* */
const element = React.createElement(Counter, {name: '张三', text: '这是传递进来的标签'}, 'xxxxxx')

React.render(element,
    document.getElementById('root')
)
// 第一天