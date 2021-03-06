## 1. 项目基本准备工作

### 1.1 创建项目

利用`npx create-react-app my_react`命令创建项目

>项目已经放到github：https://github.com/caozhongjie/simple-react.git

https://www.cnblogs.com/cazj/p/15190651.html博客地址
>！！！在仓库代码中，将 react-dom.js 和 react.js 合并为了 src/react/index.js

### 1.2 项目结构

将一些用不到的文件删除后，目录变成这样

![image-20210820155943532](C:\Users\hz21036335\AppData\Roaming\Typora\typora-user-images\image-20210820155943532.png)


此时的index.js


```js
import React from 'react';
import ReactDOM from 'react-dom';

ReactDOM.render(
  "sunny",
  document.getElementById('root')
);

```

## 2.创建react.js和react-dom.js文件

![image-20210820160124468](C:\Users\hz21036335\AppData\Roaming\Typora\typora-user-images\image-20210820160124468.png)


我们就可以把需要引入react和react-dom的改成自己创建的文件啦


```js
import React from './react';
import ReactDOM from './react-dom';

ReactDOM.render(
  "sunny",
  document.getElementById('root')
);

```

## 3.完成react-dom

我们在index.js文件中 


```js
ReactDOM.render(
  "sunny",
  document.getElementById('root')
);
```

以这样的方式使用ReactDOM，说明他有render这个方法。

所以我们可以这样实现react-dom


```js
// react-dom.js
let ReactDOM = {
    render
}
function render(element,container){
    container.innerHTML = `<span>${element}</span>`
    
}

export default ReactDOM
```

我们看下运行结果



![image-20210820160409164](C:\Users\hz21036335\AppData\Roaming\Typora\typora-user-images\image-20210820160409164.png)


可喜可贺！万里长城迈出了第一步

好了，现在我们给每一个 元素打上 一个标记 ，这样的话 就可以通过这个标记 辨别出与其他 元素的关系，也可以直接通过这标记找到该元素了。

就像下面这张图一样，是不是就直接看出0.0和0.1的父节点就是0了呢？

![image-20210820160425513](C:\Users\hz21036335\AppData\Roaming\Typora\typora-user-images\image-20210820160425513.png)


```js
// react-dom.js
let ReactDOM = {
    render,
    rootIndex:0
}
function render(element,container){
    container.innerHTML = `<span data-react_id=${ReactDOM.rootIndex}>${element}</span>`
}

export default ReactDOM
```

如代码所示，我们给每一个元素添加了一个标记`data-react_id`

运行，发现确实标记成功了，哈哈哈

![image-20210820160447714](C:\Users\hz21036335\AppData\Roaming\Typora\typora-user-images\image-20210820160447714.png)

## 4. 重构render方法

我们前面的render方法
​

```js
function render(element,container){
    container.innerHTML = `<span data-react_id=${ReactDOM.rootIndex}>${element}</span>`
}
```

默认传入的element为字符串， 但是实际情况是有可能是 文本节点，也有可能是DOM节点，也有可能是 自定义组件。

所以我们实现一个createReactUnit方法，将element传入，让它来判断element是什么类型的节点，。根据不同的数据类型来执行不同的渲染逻辑，并且添加对应的方法和属性的对象 。例如，我们的element是字符串类型，那么就返回一个字符串类型的对象，而这个对象自身有element 属性和getMarkUp方法，这个getMarkUp方法，将element转化成真实的dom

**其实你也可以简单地认为createReactUnit 方法 就是 为 element 对象添加 一个getMarkUp方法**

```js
// react-dom.js
import $ from "jquery"
let ReactDOM = {
    render,
    rootIndex:0
}
function render(element,container){
    let unit = createReactUnit(element)
    let markUp = unit.getMarkUp();// 用来返回HTML标记
    $(container).html(markUp)
}
​
export default ReactDOM
```

如代码所示，将element传入createUnit方法，获得的unit是一个对象
​

```js
{
  _currentElement:element,
  getMarkUp(){
    ...
  }
}
```

再执行 unit的getMarkUp方法，获得到 真实的dom，然后就可以挂载到container上去啦！

注意，如果传入render的element是字符串"sunny"，
即

```js
import React from './react';
import ReactDOM from './react-dom';

ReactDOM.render(
  "sunny",
  document.getElementById('root')
);

```

也就是说传入createUnit的element是字符串"sunny"，那么返回的unit是

```javascript
{
	_currentElement:"sunny",
	getMarkUp(){
		
	}
}
```


那怎么写这个createUnit呢？
​

## 5. 实现createReactUnit方法

我们创建一个新的文件叫做unit.js

![image-20210820160907798](C:\Users\hz21036335\AppData\Roaming\Typora\typora-user-images\image-20210820160907798.png)

```js
// Unit.js
class Unit{
   
}
class ReactTextUnit extends Unit{
    
}

function createReactUnit(element){
    if(typeof element === 'string' || typeof element === "number"){
        return new ReactTextUnit(element)
    }
}

export {
    createReactUnit
}
```

如代码所示，createReactUnit判断element是字符串时就 new 一个ReactTextUnit的对象，然后返回出去，这个也就是我们上面讲到的unit对象了。

为什么要 ReactTextUnit 继承 于 Unit呢？

这是因为 element除了字符串 ，也有可能是 原生的标签，列如div，span等，也有可能是我们自定义的组件，所以我们先写 了一个 unit类，这个类实现 这几种element 所共有的属性。 然后 具体的 类 ，例如 ReactTextUnit 直接继承 Unit ，再实现自有的 属性就好了。

## 6. 实现Unit



new Unit 得到的对象应当是这样的

```js
{
  _currentElement:element,
  getMarkUp(){
    ...
  }
}
```

也就是说，这是所有的 种类都有的属性，所以我们可以这样实现 Unit

```js
class Unit{
    constructor(element){
        this._currentElement = element
    }
}
```

## 7. 实现ReactTextUnit

到这一步，我们只要重写getMarkUp方法就好了，不过不要忘记，给每一个元素添加一个 reactid,至于为什么，已经在上面说过了，也放了一张大图了哈。

```js
class ReactTextUnit extends Unit{
    getMarkUp(rootId) { // 保存当前元素id
        this._rootId = rootId
        const markUp = `<span data-react_id="${this._rootId}">${this._currentElement}</span>`
        return markUp
}
```

好了，到这里先看下完整的Unit.js长什么样子吧


```js
// Unit.js
class Unit{
    constructor(element){
        this._currentElement = element
    }
}
class ReactTextUnit extends Unit{
    getMarkUp(reactid){
        this._reactid = reactid
        return `<span data-react_id=${reactid}>${this._currentElement}</span>`
    }
}

function createReactUnit(element){
    if(typeof element === 'string' || typeof element === "number"){
         return new ReactTextUnit(element)
    }
}

export createReactUnit;
```

我们在react/index.js引入 unit测试下

```js
// index.js
import React from './react';
import ReactDOM from './react-dom';

ReactDOM.render(
  "sunny",
  document.getElementById('root')
);

```

```js
// react-dom.js
import createReactUnit from './unit.js'
import $ from "jquery"
let ReactDOM = {
    render,
    rootIndex:0
}
function render(element,container){
    let unit = createUnit(element)
    let markUp = unit.getMarkUp(ReactDOM.rootIndex);// 用来返回HTML标记
    $(container).html(markUp)
}

export default ReactDOM
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201118212632263.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80Mzk2NDE0OA==,size_16,color_FFFFFF,t_70#pic_center)


渲染成功

## 8. 理解React.creacteElement方法

在第一次学习react的时候，我总会带着许多疑问。比如看到下面的代码就会想：为什么我们只是引入了React,但是并没有明显的看到我们在其他地方用，这时我就会想着既然没有用到，那如果删除之后会不会受到影响呢？答案当然是不行的。

```javascript
import React from 'react';
import ReactDOM from 'react-dom';

let element = (
    <h1 id="title" className="bg" style={{color: 'red'}}>
        hello
        <span>world</span>
    </h1>
)

console.log({type: element.type, props:element.props})

ReactDOM.render(element,document.getElementById('root'));
```

当我们带着这个问题去研究的时候会发现其实在渲染element的时候调了**React.createElement()**，所以上面的问题就在这里找到了答案。

如下面代码所示，这就是从jsx语法到React.createElement的转化

```javascript
<h1 id="title" className="bg" style={{color: 'red'}}>
        hello
        <span>world</span>
</h1>

//上面的这段代码很简单，但是我们都知道react是所谓的虚拟dom,当然不可能就是我们看到的这样。当我们将上面的代码经过babel转译后，我们再看看

React.createElement("h1", {
  id: "title",
  className: "bg",
  style: {
    color: 'red'
  }
}, "hello", React.createElement("span", null, "world"));
```

document有createElement()方法，React也有createElement()方法，下面就来介绍React的createElement()方法。

```javascript
var reactElement = ReactElement.createElement(
  	... // 标签名称字符串/ReactClass,
  	... // [元素的属性值对对象],
  	... // [元素的子节点]
)
```

1、参数：

1）第一个参数：可以是一个html标签名称字符串，也可以是一个ReactClass（必须）；

2）第二个参数：元素的属性值对对象（可选），这些属性可以通过this.props.*来调用；

3）第三个参数开始：元素的子节点（可选）。

2、返回值：

**一个给定类型的ReactElement元素**

我们可以改下我们的index.js

```javascript
// index.js
import React from './react';
import ReactDOM from './react-dom';

var li1 = React.createElement('li', {onClick:()=>{alert("click")}}, 'First');
var li2 = React.createElement('li', {}, 'Second');
var li3 = React.createElement('li', {}, 'Third');
var ul = React.createElement('ul', {className: 'list'}, li1, li2, li3);
console.log(ul);
ReactDOM.render(ul,document.getElementById('root'))
```

可以就看下 ul 最终的打印 期待结果 
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201119170622291.png#pic_center)



由此 ，我们只知道了，React.createElement方法将生产一个**给定类型的ReactElement元素**，也就是Vnode。然后这个对象被传入 render方法，然后进行了上面讲到的 createUnit和getMarkUp操作。

## 9. 实现React.createElement方法

经过上面的讲解，我们大概已经知道React.createElement方法的作用了，现在就来看看是怎么实现的

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201119155241666.png#pic_center)
我们创建了一个新的文件element.js（目的是为了学习react的构建，不包括vnode的生成)

```javascript
// element.js
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
```

我们 定义了一个 Element 类 ，然后在createElement方法里创建了这个类的对象，
并且return出去了

没错，这个对象就是上面所说的**给定类型的ReactElement元素**,也就是下面这张图所显示的
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201123112051477.png#pic_center)


我们应当是这样**React.createElement**()调用这个方法的，所以我们要把这个方法挂载到react身上。

我们前面还没有实现react.js

其实，很简单，就是返回一个React对象，这个对象有createElement方法

```javascript
 // react.js
 import createElement from "./element"
 const React = {
    createElement
 }
 export default React
```

## 10. 实现ReactNativeUnit

上面实现了 createElement返回 给定类型的ReactElement元素 后，就将改元素传入，render方法，因此 就会经过 createReactUnit方法， createReactUnit方法判断是属于什么类型的 元素，如下面代码

```javascript
// Unit.js
class Unit {
    constructor(element) {
        this._currentElement = element
    }
}
class TextUnit extends Unit{
    getMarkUp(reactid){
        this._reactid = reactid
        return `<span data-react_id=${reactid}>${this._currentElement}</span>`
    }
}

function createReactUnit(element){
    // 
    if(typeof element === 'string' || typeof element === "number"){
        return new TextUnit(element)
    }
    // 新增代码
    if (typeof element === 'object' && typeof element.type === 'string') {
        return new ReactNativeUnit(element)
    }
}

export default createReactUnit;
```

好了，现在我们来实现ReactNativeUnit类，其实主要就是实现ReactNativeUnit的getMarkUp方法

```javascript
class ReactNativeUnit extends Unit{
    getMarkUp(reactid){
        this._reactid = reactid 
        let {type,props} = this._currentElement;
    }
}
```

要明确的一点是，ReactNativeUnit的getMarkUp方法，是要把
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201119171350921.png#pic_center)
这样一个element 对象转化为 真实的dom的

因此，我们可以这样完善getMarkUp方法

```javascript
class ReactNativeUnit extends Unit{
    getMarkUp(reactid){
        this._reactid = reactid 
        let {type,props} = this._currentElement;
        let tagStart = `<${type} `
        let childString = ''
        let tagEnd = `</${type}>`
        for(let propName in props){
            if(/^on[A-Z]/.test(propName)){ // 添加绑定事件
                
            }else if(propName === 'style'){ // 如果是一个样式对象

            }else if(propName === 'className'){ // 如果是一个类名

            }else if(propName === 'children'){ // 如果是子元素

            }else { // 其他 自定义的属性 例如 reactid
                tagStart += (` ${propName}=${props[propName]} `)
            }
        }
        return tagStart+'>' + childString +tagEnd
    }
}
```

这只是 大体上的 一个实现 ，其实就是 把标签 和属性 以及 子元素 拼接成 字符串，然后返回出去。

我们测试下，现在有没有 把ul 渲染出来

```javascript
// index.js
import React from './react';
import ReactDOM from './react-dom';

var li1 = React.createElement('li', {}, 'First');
var li2 = React.createElement('li', {}, 'Second');
var li3 = React.createElement('li', {}, 'Third');
var ul = React.createElement('ul', {className: 'list'}, li1, li2, li3);
console.log(ul);
ReactDOM.render(ul,document.getElementById('root'))
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201119174610269.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80Mzk2NDE0OA==,size_16,color_FFFFFF,t_70#pic_center)
发现确实成功渲染出来了，但是 属性和 子元素还没有，这是因为我们 还没实现 具体 的功能。

现在我们来实现事件绑定 功能

```javascript
class NativeUnit extends Unit{
    getMarkUp(reactid){
        this._reactid = reactid 
        let {type,props} = this._currentElement;
        let tagStart = `<${type} data-react_id="${this._reactid}"`
        let childString = ''
        let tagEnd = `</${type}>`
        for(let propName in props){
        	// 新增代码
            if(/^on[A-Z]/.test(propName)){ // 添加绑定事件
                let eventName = propName.slice(2).toLowerCase(); // 获取click
                $(document).delegate(`[data-react_id="${this._reactid}"]`,`${eventName}.${this._reactid}`,props[propName])
            }else if(propName === 'style'){ // 如果是一个样式对象
               
            }else if(propName === 'className'){ // 如果是一个类名
                
            }else if(propName === 'children'){ // 如果是子元素
               
            }else { // 其他 自定义的属性 例如 reactid
                
            }
        }
        return tagStart+'>' + childString +tagEnd
    }
}
```

在这里，我们是用了事件代理的模式，之所以用事件代理，是因为这些标签元素还没被渲染到页面上，但我们又必须提前绑定事件，所以需要用到事件代理

接下来，实现 样式对象的绑定

```java
class ReactNativeUnit extends Unit{
    getMarkUp(reactid){
        this._reactid = reactid 
        let {type,props} = this._currentElement;
        let tagStart = `<${type} data-react_id="${this._reactid}"`
        let childString = ''
        let tagEnd = `</${type}>`
        for(let propName in props){
            if(/^on[A-Z]/.test(propName)){ // 添加绑定事件
                ...
            }else if(propName === 'style'){ // 如果是一个样式对象
                let styleObj = props[propName]
                let styles = Object.entries(styleObj).map(([attr, value]) => {
                    return `${attr.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}:${value}`;
                }).join(';')
                tagStart += (` style="${styles}" `)
            }else if(propName === 'className'){ // 如果是一个类名
                
            }else if(propName === 'children'){ // 如果是子元素
               
            }else { // 其他 自定义的属性 例如 reactid
              
            }
        }
        return tagStart+'>' + childString +tagEnd
    }
}
```

这里 其实就是把

```javascript
{style:{backgroundColor:"red"}}
```

对象中的 style这个对象 属性拿出来，

然后把**backgroundColor** 通过正则 变化成**background-color**，

然后再拼接到tagStart中。


接下来再实现className，发现这个也太简单了吧

```javascript
class ReactNativeUnit extends Unit {
    getMarkUp(reactid) {
        this._reactid = reactid
        let { type, props } = this._currentElement;
        let tagStart = `<${type} data-react_id="${this._reactid}"`
        let childString = ''
        let tagEnd = `</${type}>`
        for (let propName in props) {
            if (/^on[A-Z]/.test(propName)) { // 添加绑定事件
              	...
            } else if (propName === 'style') { // 如果是一个样式对象
                ...
            } else if (propName === 'className') { // 如果是一个类名
                tagStart += (` class="${props[propName]}"`)
            } else if (propName === 'children') { // 如果是子元素
               ...
            } else { // 其他 自定义的属性 例如 reactid
                ...
            }
        }
        return tagStart + '>' + childString + tagEnd
    }
}
```

为什么这么简单呢？ 因为只需要把

```javascript
className: 'list'
```

中的className变化成 class就可以了。OMG！！

接下来，是时候实现子元素的拼接了哈

```javascript
class ReactNativeUnit extends Unit {
    getMarkUp(reactid) {
        this._reactid = reactid
        let { type, props } = this._currentElement;
        let tagStart = `<${type} data-react_id="${this._reactid}"`
        let childString = ''
        let tagEnd = `</${type}>`
        for (let propName in props) {
            if (/^on[A-Z]/.test(propName)) { // 添加绑定事件
                ...
            } else if (propName === 'style') { // 如果是一个样式对象
                ...
            } else if (propName === 'className') { // 如果是一个类名
                ...
            } else if (propName === 'children') { // 如果是子元素
                let children = props[propName];
                children.forEach((child, index) => {
                    let childUnit = createUnit(child); // 可能是字符串 ，也可能是原生标签，也可能是自定义属性
                    let childMarkUp = childUnit.getMarkUp(`${this._reactid}.${index}`)
                    childString += childMarkUp;
                })
            } else { // 其他 自定义的属性 例如 reactid
                
            }
        }
        return tagStart + '>' + childString + tagEnd
    }
}
```

发现子元素 ，其实只要进行递归操作，也就是将子元素传进createUnit，把返回的childUnit 通过getMarkUp方法变成 真实DOM，再拼接到childString 就好了。 其实想想也挺简单，递归深度优先。

好了，接下来就是 其他属性了

```javascript
class ReactNativeUnit extends Unit {
    getMarkUp(reactid) {
        this._reactid = reactid
        let { type, props } = this._currentElement;
        let tagStart = `<${type} data-react_id="${this._reactid}"`
        let childString = ''
        let tagEnd = `</${type}>`
        for (let propName in props) {
            if (/^on[A-Z]/.test(propName)) { // 添加绑定事件
               ...
            } else if (propName === 'style') { // 如果是一个样式对象
               ...
            } else if (propName === 'className') { // 如果是一个类名
               ...
            } else if (propName === 'children') { // 如果是子元素
                ...
            } else { // 其他 自定义的属性 例如 reactid
                tagStart += (` ${propName}=${props[propName]} `)
            }
        }
        return tagStart + '>' + childString + tagEnd
    }
}
```

其他属性直接就拼上去就好了哈哈哈



好了。现在我们已经完成了ReactNativeUnit的getMarkUp方法。我们来测试一下是否成功了没有吧！
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201120142936634.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80Mzk2NDE0OA==,size_16,color_FFFFFF,t_70#pic_center)
害，不出所料地成功了。

## 11. 完成React.Component

接下来我们看看自定义组件是怎么被渲染的，例如下面的Counter组件

```javascript
// index.js
class Counter extends React.Component{
    constructor(props){
        super(props)
        this.state = {number:0};
    }
    render(){
        let p = React.createElement('p',{style:{color:'red'}},this.state.number);
        let button = React.createElement('button',{},"+")
        return React.createElement('div',{id:'counter'},p,button)
    }
}
let element = React.createElement(Counter,{name:"计时器"})
ReactDOM.render(element,document.getElementById('root'))
```

我们发现自定义组件好像需要继承React.Component。这是为什么呢？

我之前一直误认为所有的生命周期都是从Component继承过来的，也许有很多小伙伴都和我一样有这样的误解，直到我看了Component源码才恍然大悟，原来我们用的setState和forceUpdate方法是来源于这里

知道这个原因后，我们就可以先简单地实现React.Component了

```javascript
// component.js
class Component{
    constructor(props){
        this.props = props
    }
}

export default Component
```

然后再引入react中即可

```javascript
 // react.js
 import createElement from "./element"
 import Component from "./component"
 const React = {
    createElement,
    Component
 }
 export default React
```

跟 处理ReactNativeUnit一样，先通过createReactUnit判断element是属于什么类型，如果是自定义组件就 return  ReactComponentUnit()

```javascript
// Unit.js
import Element from "./element" // 新增代码
import $ from "jquery"
class Unit {
    constructor(element) {
        this._currentElement = element
    }
    getMarkUp() {
        throw Error("此方法应该被重写，不能直接被使用")
    }
}
class ReactTextUnit extends Unit {
    
}

class ReactNativeUnit extends Unit {
   
}

function CreateUnit(element) {
    if (typeof element === 'string' || typeof element === "number") {
        return new ReactTextUnit(element)
    }
    if (element instanceof Element && typeof element.type === "string") {
        return new ReactNativeUnit(element)
    }
    // 新增代码
    if(element instanceof Element && typeof element.type === 'function'){
       return new ReactComponentUnit(element)
    }

}


export default CreateUnit
```

为什么是用 ```typeof element.type === 'function'```来判断 呢？ 因为Counter是 一个类，而类在js中的本质就是function


好了，接下来实现一下ReactComponentUnit类

```javascript
class ReactComponentUnit extends Unit{
    getMarkUp(reactid){
      this._rootId = rootId
      let {type:Component,props} = this._currentElement // 实际上，在例子中type === Counter
      let componentInstance = new Component(props); // 获取class（即组件）实例
      let reactComponentRender = componentInstance.render() // 获取组件render数据
      // render返回的数据执行createReactUnit
      let reactComposeUnitInstance = createReactUnit(reactComponentRender)
      let markup = reactComposeUnitInstance.getMarkUp(this._rootId)
      return markup
    }
}
```

咦，好简短 啊，不过 没那么 简单，但是让 我的三寸不烂之舌来讲解一下，包懂

此时的_currentElement 是：

```javascript
{
	type:Counter,
	props:{}
}
```

```let {type:Component,props} = this._currentElement ```// 实际上，在例子中type就是Counter
```new Component(props);```其实就是```new Counter```。

也就是我们上面例子中写的

```javascript
class Counter extends React.Component{
    constructor(props){
        super(props)
        this.state = {number:0};
    }
    render(){
        let p = React.createElement('p',{style:{color:'red'}},this.state.number);
        let button = React.createElement('button',{},"+")
        return React.createElement('div',{id:'counter'},p,button)
    }
}
let element = React.createElement(Counter,{name:"计时器"})
ReactDOM.render(element,document.getElementById('root'))
```

可想而知 ，通过new Counter就获得了Counter的实例

也就是componentInstance ，而每一个Counter的实例都会有render方法，所以执行```componentInstance.render()```

就获得一个**给定类型的reactComponentRender元素**（好熟悉的一句话，对，我们在上面讲到过)。

然后就把这个reactComponentRender元素对象传给createReactUnit，获得一个具有getMarkUp的对象，
然后就可以执行```renderUnit.getMarkUp(this._reactid)```获得真实dom，就可以返回了。


其实，仔细想想，就会发现，在

```javascript
let renderUnit = createReactUnit(reactComponentRender);
```

之前，我们是在处理自定义组件Counter。

而到了 

```javascript
let renderUnit = createReactUnit(reactComponentRender);
```

这一步，其实就是在处理ReactNativeUnit。（细思极恐。。）

好了，测试一下![在这里插入图片描述](https://img-blog.csdnimg.cn/20201120161756299.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80Mzk2NDE0OA==,size_16,color_FFFFFF,t_70#pic_center)
发现确实成功了。

## 12. 实现 componentWillMount

我们在之前的例子上添加个componentWillMount 生命周期函数吧

```javascript
// index.js
import React from './react';
import ReactDOM from './react-dom';

class Counter extends React.Component{
    constructor(props){
        super(props)
        this.state = {number:0};
    }
    componentWillMount(){
        console.log("阳光你好，我是componentWillMount");
    }
    render(){
        let p = React.createElement('p',{style:{color:'red'}},this.state.number);
        let button = React.createElement('button',{},"+")
        return React.createElement('div',{id:'counter'},p,button)
    }
}
let element = React.createElement(Counter,{name:"计时器"})
ReactDOM.render(element,document.getElementById('root'))
```

我们知道componentWillMount 实在组件渲染前执行的，所以我们可以在render之前执行这个生命周期函数

```javascript
class ReactComponentUnit extends Unit{
    getMarkUp(reactid){
      this._reactid = reactid
      let {type:Component,props} = this._currentElement // 实际上，在例子中type === Counter
      let componentInstance = new Component(props);
      componentInstance.componentWillMount && componentInstance.componentWillMount() // 添加生命周期函数
      let reactComponentRender = componentInstance.render();
      let reactComposeUnitInstance = createReactUnit(reactComponentRender);
      return reactComposeUnitInstance.getMarkUp(reactComposeUnitInstance)
    }
}
```

可能聪明的小伙伴会问，不是说componentWillMount是在组件重新渲染前执行的吗？那组件没挂到页面上应该都是渲染前，所以componentWillMount也可以在```return reactComposeUnitInstance.getMarkUp(this._reactid)```前执行啊。

其实要回答这个问题，倒不如回答另一个问题：

父组件的componentWillMount和子组件的componentWillMount哪个先执行。

答案是父组件先执行。

这是因为在父组件中会先执行 父组件的componentWillMount ，然后执行```componentInstance.render();```的时候，会解析子组件，然后又进入子组件的getMarkUp。又执行子组件的componentWillMount 。

若要回答 为什么componentWillMount 要在 render函数执行前执行，只能说，react就是这么设计的哈哈哈




## 13. 实现componentDidMount

众所周知，componentDidMount是在组件渲染，也就是挂载到页面后才执行的。

所以，我们可以在返回组件的真实dom之前 就监听 一个mounted事件，这个事件执行componentDidMount方法。

```javascript
class CompositeUnit extends Unit{
   getMarkUp(reactid){
      this._reactid = reactid
      let {type:Component,props} = this._currentElement // 实际上，在例子中type === Counter
      let componentInstance = new Component(props);
      componentInstance.componentWillMount && componentInstance.componentWillMount() // 添加生命周期函数
      let reactComponentRender = componentInstance.render();
      let reactComposeUnitInstance = createReactUnit(reactComponentRender);
      $(document).on('mounted', () => {
         componentInstance.componentDidMount && componentInstance.componentDidMount()
      })
      return reactComposeUnitInstance.getMarkUp(reactComposeUnitInstance)
    }
}
```

然后 再在 把组件的dom挂载到 页面上后再触发这个 mounted事件

```javascript
// react-dom.js
import {createUnit} from './unit'
import $ from "jquery"
let ReactDOM = {
    render,
    rootIndex:0
}
function render(element,container){
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

export default ReactDOM
```


由此依赖，就实现了，componentDidMount 生命周期函数，哈哈哈。

测试一下，成功了没有哈
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201120181832809.png#pic_center)
啊，一如既往的成功，可能好奇的你问我为什么每次测试都成功，那是因为，不成功也被我调试到成功了。

为了下面 实现 setState 功能，我们 修改一下 ReactComponentUnit的getMarkUp方法。

```javascript
class ReactComponentUnit extends Unit{
        getMarkUp(rootId) {
        // 将传进来的id绑定到生成的实例上
        this._rootId = rootId
        // 将props和type取出，并将type重命名为component
        let {type: Component, props} = this._currentElement
        // type为class,类型为function,此处则可以将props挂载到React.Components原型上
        // type（Component）为实际传进来的组件，通过new生成componentInstance组件实例
        let componentInstance = this._componentInstance = new Component(props)
        // 让组件实例的currentUnit属性等于当前的unit，把ReactComponentUnit实例绑定在当前组件实例上，之后setState时，则可以获取该ReactComponentUnit上的所有属性和方法（getMarkUp, update）
        componentInstance._currentUnit = this
        // 执行生命周期钩子
        componentInstance.componentWillMount && componentInstance.componentWillMount()
        // 调用组件的render方法，获取要渲染的元素
        let reactComponentRender = componentInstance.render() // class实例上定义了该render方法，获取到render的返回值

        // 得到这个元素对应的Unit. 将返回值重新递归渲染
        let reactComposeUnitInstance = this._reactComponentUnitInstance = createReactUnit(reactComponentRender)
        // 通过Unit可以获得他的html标记
        let markup = reactComposeUnitInstance.getMarkUp(this._rootId)
        // 绑定事件 先序深度优先  有儿子就进去  树的遍历
        $(document).on('mounted', () => {
            componentInstance.componentDidMount && componentInstance.componentDidMount()
        })
        return markup
    }
}
```

我们为这个 ReactComponentUnit的实例添加了

1. _componentInstance ：用了表示 当前组件的实例 （我们所写的Counter组件）
2. _reactComponentUnitInstance： 当前组件的render,用于之后对比新旧render出来的结果的变化

另外，我们也通过

```javascript
componentInstance._currentUnit = this // 把 unit 挂到 实例componentInstance 
```

把当前 的unit 挂载到了 组件实例componentInstance身上。

**可见 组件的实例保存了 当前 unit，当前的unit也保存了组件实例**



## 14. 实现setState

我们看下面的例子，每隔一秒钟就number+1

```javascript
// index.js
import React from './react';
import ReactDOM from './react-dom';
import $ from 'jquery'
class Counter extends React.Component{
    constructor(props){
        super(props)
        this.state = {number:0};
    }
    componentWillMount(){
        console.log("阳光你好，我是componentWillMount");
        $(document).on("mounted",()=>{
            console.log(456);
            
        })
    }
    componentDidMount(){
        setInterval(()=>{
            this.setState({number:this.state.number+1})
        },1000)
    }
    render(){
        
        return this.state.number
    }
}
let element = React.createElement(Counter,{name:"计时器"})
ReactDOM.render(element,document.getElementById('root'))
```


前面说到，setState方法是从Component组件继承过来的。所以我们给Component组件添加setState方法

```javascript
// component.js
class Component {
    constructor(props) {
        this.props = props
    }
    setState(partialState) {
        // 第一个参数是新的元素   第二个参数是新的状态
        this._currentUnit.update(null, partialState)
    }
}
export default Component
```

我们发现原来是在setState方法里调用了当前实例的对应的unit的update方法，它传进去了 部分state的值。

看到这里，我们就知道了，我们需要回到 ReactComponentUnit类添加一个update方法。

```javascript
class ReactComponentUnit extends Unit{
    update(nextElement,partialState){
        // 有传新元素的话就更新currentElement为新的元素
        this._currentElement = nextElement || this._currentElement; 
        // 获取新的状态,并且更新组件的state
        let nextState = this._componentInstance.state = Object.assign(this._componentInstance.state,partialState);
        // 新的属性对象
        let nextProps = this._currentElement.props
    }
    getMarkUp(reactid){
     ...
    }
}
```

我们首先 更换了_currentElement的值，这里为什么会有 有或者没有nextElement的情况呢？

（主要就是因为，如果 _currentElement  是 字符串或者数字的话，那么它就需要 传nextElement 来替换掉旧的 _currentElement  。而如果不是字符串或者数字的话，是不需要传的。而ReactComponentUnit必定是组件的，所以不用传nextElement ）。

接着，我们 通过下面这句代码获取了最新的state，并且更新了组件的state

```javascript
 let nextState = this._componentInstance.state = Object.assign(this._componentInstance.state,partialState);
```

获取 最新的 props跟获取state的方式不一样，props是跟_currentElement  绑定在一起的，所以获取最新的props是通过

```javascript
let nextProps = this._currentElement.props
```


接下来，我们要先获取新旧的渲染元素，然后拿来比较，怎么获取呢？

```javascript
class ReactComponentUnit extends Unit{
    update(nextElement,partialState){
        // 有传新元素的话就更新currentElement为新的元素
        this._currentElement = nextElement || this._currentElement; 
        // 获取新的状态,并且更新组件的state
        let nextState = this._componentInstance.state = Object.assign(this._componentInstance.state,partialState);
        // 新的属性对象
        let nextProps = this._currentElement.props
        // 下面要进行比较更新
        // 先得到上次渲染的unit
        let preRenderedUnitInstance = this._reactComponentUnitInstance // 上次渲染的render
        // 通过上次渲染的unit得到上次渲染的元素
        let preRenderElement = preRenderedUnitInstance._currentElement
        // 得到最新的渲染元素
        let nextRenderElement =  this._componentInstance.render()

    }
    getMarkUp(reactid){
     	
    }
}
```

我们先得到上次渲染的unit，再通过上次渲染的unit得到上次渲染的元素preRenderedElement，

再通过```this._componentInstance.render()```得到下次渲染的元素nextRenderElement。

接下来就可以进行比较这两个元素了

我们首先会判断要不要进行深度比较。

如果不用进行深度比较就非常简单

直接获取新的渲染unit，然后通过getMarkUp获得要渲染的dom，接着就把当前的组件里的dom元素替换掉

```javascript
class ReactComponentUnit extends Unit{
    update(nextElement,partialState){
        // 先获取到新的元素
        this._currentElement = nextElement || this._currentElement
        // 获取新的状态   不管数据更新与否，状态会改变
        let nextState = this._componentInstance.state = Object.assign(this._componentInstance.state, partialState)
        // 新的属性对象
        let nextProps = this._currentElement.props
        if (this._componentInstance.shouldComponentUpdate && !this._componentInstance.shouldComponentUpdate(nextProps, nextState)) {
            return
        }
        // 下面要比较变更  看render的返回值是否一样
        let preRenderedUnitInstance = this._reactComponentUnitInstance // 上次渲染的render
        //  得到上次渲染的元素
        let preRenderedElement = preRenderedUnitInstance._currentElement
        // 将要渲染的render
        let nextRenderElement = this._componentInstance.render()
        // 如果新旧两个元素类型一样，则可以进行深度比较，如果不一样，则直接干掉老的元素。新建新的
        if (shouldDeepCompare(preRenderedElement, nextRenderElement)) {
            // 如果可以进行深比较，则把更新的工作交给上次渲染出来的那个element元素对应的unit来处理
            preRenderedUnitInstance.update(nextRenderElement)
            this._componentInstance.componentDidUpdate && this._componentInstance.componentDidUpdate()
        } else {
            // 重新渲染时清除已经绑定的事件
            $(document).undelegate(`.${this._rootId}`);
            this._renderedUnitInstance = createReactUnit(nextRenderElement)
            let nextMarkUp = this._renderedUnitInstance.getMarkUp(this._rootId)
            $(`[data-react_id="${this._rootId}"]`).replaceWith(nextMarkUp)
        }

    }
    getMarkUp(reactid){
     
    }
}
```

我们先简单地写一下shouldDeepCompare方法，直接return false，来测试一下 非深度比较，是否能够正确执行

```javascript
function shouldDeepCompare(){
    return false
}
class ReactComponentUnit extends Unit{
    update(nextElement,partialState){
        // 有传新元素的话就更新currentElement为新的元素
        this._currentElement = nextElement || this._currentElement; 
        // 获取新的状态,并且更新组件的state
        let nextState = this._componentInstance.state = Object.assign(this._componentInstance.state,partialState);
        // 新的属性对象
        let nextProps = this._currentElement.props
        // 下面要进行比较更新
        // 先得到上次渲染的unit
        let preRenderedUnitInstance = this._renderUnit;
        // 通过上次渲染的unit得到上次渲染的元素
        let preRenderElement = preRenderedUnitInstance._currentElement
        // 得到最新的渲染元素
        let nextRenderElement = this._componentInstance.render()
        // 如果新旧两个元素类型一样，则可以进行深度比较，如果不一样，直接干掉老的元素，新建新的
        if(shouldDeepCompare(preRenderElement,nextRenderElement)){

        }else{
            this._renderUnit = createUnit(nextRenderElement)
            let nextMarkUp = this._renderUnit.getMarkUp(this._reactid)
            $(`[data-react_id="${this._reactid}"]`).replaceWith(nextMarkUp)
        }

    }
    getMarkUp(reactid){
     
    }
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201121164429884.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80Mzk2NDE0OA==,size_16,color_FFFFFF,t_70#pic_center)

发现确实成功了。


如果可以进行深度比较呢？

```javascript
class ReactComponentUnit extends Unit {
    // 这里负责组件的更新操作
    update(nextElement, partialState) {
        // 先获取到新的元素
        this._currentElement = nextElement || this._currentElement
        // 获取新的状态   不管数据更新与否，状态会改变
        let nextState = this._componentInstance.state = Object.assign(this._componentInstance.state, partialState)
        // 新的属性对象
        let nextProps = this._currentElement.props
        if (this._componentInstance.shouldComponentUpdate && !this._componentInstance.shouldComponentUpdate(nextProps, nextState)) {
            return
        }
        // 下面要比较变更  看render的返回值是否一样
        let preRenderedUnitInstance = this._reactComponentUnitInstance // 上次渲染的render
        //  得到上次渲染的元素
        let preRenderedElement = preRenderedUnitInstance._currentElement
        // 将要渲染的render
        let nextRenderElement = this._componentInstance.render()
        // 如果新旧两个元素类型一样，则可以进行深度比较，如果不一样，则直接干掉老的元素。新建新的
        if (shouldDeepCompare(preRenderedElement, nextRenderElement)) {
            // 如果可以进行深比较，则把更新的工作交给撒谎给你次渲染出来的那个element元素对应的unit来处理
            preRenderedUnitInstance.update(nextRenderElement)
            this._componentInstance.componentDidUpdate && this._componentInstance.componentDidUpdate()
        } else {
            // 重新渲染时清除已经绑定的事件
            $(document).undelegate(`.${this._rootId}`);
            this._renderedUnitInstance = createReactUnit(nextRenderElement)
            let nextMarkUp = this._renderedUnitInstance.getMarkUp(this._rootId)
            $(`[data-react_id="${this._rootId}"]`).replaceWith(nextMarkUp)
        }
    }

    getMarkUp(rootId) {
        // 将传进来的id绑定到生成的实例上
        this._rootId = rootId
        // 将props和type取出，并将type重命名为component
        let {type: Component, props} = this._currentElement
        // type为class,类型为function,此处则可以将props挂载到React.Components原型上
        // type（Component）为实际传进来的组件，通过new生成componentInstance组件实例
        let componentInstance = this._componentInstance = new Component(props)
        // 让组件实例的currentUnit属性等于当前的unit，把ReactComponentUnit实例绑定在当前组件实例上，之后setState时，则可以获取该ReactComponentUnit上的所有属性和方法（getMarkUp, update）
        componentInstance._currentUnit = this
        // 执行生命周期钩子
        componentInstance.componentWillMount && componentInstance.componentWillMount()
        // 调用组件的render方法，获取要渲染的元素
        let reactComponentRender = componentInstance.render() // class实例上定义了该render方法，获取到render的返回值

        // 得到这个元素对应的Unit. 将返回值重新递归渲染
        let reactComposeUnitInstance = this._reactComponentUnitInstance = createReactUnit(reactComponentRender)
        // 通过Unit可以获得他的html标记
        let markup = reactComposeUnitInstance.getMarkUp(this._rootId)
        // 绑定事件 先序深度优先  有儿子就进去  树的遍历
        $(document).on('mounted', () => {
            componentInstance.componentDidMount && componentInstance.componentDidMount()
        })
        return markup
    }
}
```

如果可以深度，就执行

```javascript
 preRenderedUnitInstance.update(nextRenderElement)
```

这是什么意思？

我们当前是在执行渲染Counter的话，那preRenderedUnitInstance 是什么呢？

没错！它是Counter组件 执行render方法 ，再执行createReactUnit获得的 

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201121172736116.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80Mzk2NDE0OA==,size_16,color_FFFFFF,t_70#pic_center)

这个字符串的 unit

然后调用了这个 unit的 update方法

注意，这里 的unit是字符串的 unit，也就是说是 ReactTextUnit

所以我们需要实现 TextUnit 的update 方法


```javascript
class ReactTextUnit extends Unit {
   getMarkUp(rootId) { // 保存当前元素id
        this._rootId = rootId
        const markUp = `<span data-react_id="${this._rootId}">${this._currentElement}</span>`
        return markUp
    }

    update(nextElement) {
        if (this._currentElement !== nextElement) {
            this._currentElement = nextElement
            $(`[data-react_id="${this._rootId}"]`).html(this._currentElement)
        }
    }
}
```

ReactTextUnit 的update方法非常简单，先判断 渲染内容有没有变化，有的话就 替换点字符串的内容

并把当前unit 的_currentElement  替换成最新的nextElement

我们简单的把shouldDeepCompare 改成 return true，测试一下深度比较

```javascript
function shouldDeepCompare(){
    return true
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201121180510313.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80Mzk2NDE0OA==,size_16,color_FFFFFF,t_70#pic_center)
一如既往成功

## 15. 实现shouldComponentUpdate方法

我们知道有个shouldComponentUpdate，用来决定要不要 重渲染 该组件的

```javascript
shouldComponentUpdate(nextProps, nextState) {
  return nextState.someData !== this.state.someData
}
```

显然，它要我们传入 两个参数，分别是 组件更新后的nextProps和nextState

而在 还是上面，实现 update的过程中，我们已经得到了nextState 和nextProps 

```javascript
class ReactComponentUnit extends Unit{
    update(nextElement,partialState){
        。。。
        // 获取新的状态,并且更新组件的state
        let nextState = this._componentInstance.state = Object.assign(this._componentInstance.state,partialState);
        // 新的属性对象
        let nextProps = this._currentElement.props
        // 下面要进行比较更新
        。。。

    }
}
```

所以，我们可以在update里执行shouldComponentUpdate方法，来确定要不要重新渲染组件

```javascript
class ReactComponentUnit extends Unit{
        // 这里负责组件的更新操作
    update(nextElement, partialState) {
        // 先获取到新的元素
        this._currentElement = nextElement || this._currentElement
        // 获取新的状态   不管数据更新与否，状态会改变
        let nextState = this._componentInstance.state = Object.assign(this._componentInstance.state, partialState)
        // 新的属性对象
        let nextProps = this._currentElement.props
        if (this._componentInstance.shouldComponentUpdate && !this._componentInstance.shouldComponentUpdate(nextProps, nextState)) {
            return
        }
        // 下面要比较变更  看render的返回值是否一样
        let preRenderedUnitInstance = this._reactComponentUnitInstance // 上次渲染的render
        //  得到上次渲染的元素
        let preRenderedElement = preRenderedUnitInstance._currentElement
        // 将要渲染的render
        let nextRenderElement = this._componentInstance.render()
        // 如果新旧两个元素类型一样，则可以进行深度比较，如果不一样，则直接干掉老的元素。新建新的
        if (shouldDeepCompare(preRenderedElement, nextRenderElement)) {
            // 如果可以进行深比较，则把更新的工作交给撒谎给你次渲染出来的那个element元素对应的unit来处理
            preRenderedUnitInstance.update(nextRenderElement)
            this._componentInstance.componentDidUpdate && this._componentInstance.componentDidUpdate()
        } else {
            // 重新渲染时清除已经绑定的事件
            $(document).undelegate(`.${this._rootId}`);
            this._renderedUnitInstance = createReactUnit(nextRenderElement)
            let nextMarkUp = this._renderedUnitInstance.getMarkUp(this._rootId)
            $(`[data-react_id="${this._rootId}"]`).replaceWith(nextMarkUp)
        }
    }

}
```


## 16. 实现componentDidUpdate生命周期函数

只要在更新后触发这个事件就好了

```javascript
class ReactComponentUnit extends Unit{
    update(nextElement,partialState){
        
        if(this._componentInstance.shouldComponentUpdate && !this._componentInstance.shouldComponentUpdate(nextProps,nextState)){
            return;
        }
   
         if (shouldDeepCompare(preRenderedElement, nextRenderElement)) {
            // 如果可以进行深比较，则把更新的工作交给撒谎给你次渲染出来的那个element元素对应的unit来处理
            preRenderedUnitInstance.update(nextRenderElement)
            this._componentInstance.componentDidUpdate && this._componentInstance.componentDidUpdate()
        } else {
            // 重新渲染时清除已经绑定的事件
            $(document).undelegate(`.${this._rootId}`);
            this._renderedUnitInstance = createReactUnit(nextRenderElement)
            let nextMarkUp = this._renderedUnitInstance.getMarkUp(this._rootId)
            $(`[data-react_id="${this._rootId}"]`).replaceWith(nextMarkUp)
        }

    }
    getMarkUp(reactid){
     
    }
}
```

## 17. 实现shouDeepCompare

判断是否需要深比较极其简单，只需要判断 oldElement 和newElement 是否 都是字符串或者数字，这种类型的就走深比较

接着判断 oldElement 和newElement 是否 都是 Element类型，不是的话就return false，是的 再判断 type是否相同（即判断是否是同个组件，是的话 return true）

其他情况都return false

```javascript
function shouldDeepCompare(oldElement,newElement){
    if(oldElement != null && newElement != null){
        let oldType = typeof oldElement
        let newType = typeof newElement
        if((oldType === 'string' || oldType === "number")&&(newType === "string" || newType === "number")){
            return true
        }
        if(oldElement instanceof Element && newElement instanceof Element){
            return oldElement.type === newElement.type
        }
    }
    return false
}
```
