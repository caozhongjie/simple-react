import React from './react/index'

class SubCounter{
    componentWillMount() {
        console.log('child组件被挂载')
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
    }
    render (){
        return <SubCounter />
        // return (
        //     <div>123</div>
        // )
    }
}



// function say() {
//     console.log('执行了say方法')
// }
// const element = React.createElement('div', {name: 'xxx'}, 'hello',React.createElement(
//     'button', {onClick: say}, '123'
// ))
const element = React.createElement(Counter, {name: 'asda'}, 'xx')
console.log(element)
React.render(element,
    document.getElementById('root')
)
// 第一天