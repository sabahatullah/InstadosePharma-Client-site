!function(){function t(t,e,o){if(t)for(var i in t)"function"==typeof t[i]&&"function"==typeof o[i]&&r.test(t[i])?e[i]=n(t[i],o[i]):e[i]=t[i]}function n(t,n){return function(){var r=this._super;this._super=n;try{return t.apply(this,arguments)}finally{this._super=r}}}window.Class=function(){},Class.extend=function(n,r){function e(){this.init&&this.init.apply(this,arguments)}var o=[];"[object Array]"=={}.toString.apply(arguments[0])&&(o=arguments[0],n=arguments[1],r=arguments[2]),e.prototype=Class.inherit(this.prototype),e.prototype.constructor=e,e.extend=Class.extend,t(r,e,this);for(var i=0;i<o.length;i++)t(o[i],e.prototype,this.prototype);return t(n,e.prototype,this.prototype),e};var r=/xyz/.test(function(){xyz})?/\b_super\b/:/./;Class.inherit=Object.create||function(t){function n(){}return n.prototype=t,new n}}();
var MinimalClass=Class.extend({__className:"MinimalClass",init:function(n){this.delegate=!1,this.element=!1,this.opt={},this.pre(n),this.setOptions(n),this.create()},create:function(){},pre:function(n){},log:function(){"undefined"!=typeof window.console?window.console.log.apply(window.console,arguments):alert("Log:\n"+arguments.join("\n"))},setOptions:function(n){if("undefined"!=typeof n)for(var e in n)this.setOption(e,n[e])},setOption:function(n,e){return"element"===n?void(this.element=$(e)):"delegate"===n?void(this.delegate=e):"_"===n.substr(0,1)?(n=n.substr(1),void(this[n]=e)):void(this.opt[n]=e)},mouseWheelLocked:!1,onMouseWheelLock:function(n){n.preventDefault()},toggleMouseWheelLock:function(n){return n!==this.mouseWheelLocked&&(n?$(document).bind("mousewheel",this.onMouseWheelLock):$(document).unbind("mousewheel",this.onMouseWheelLock),this.mouseWheelLocked=n),this.mouseWheelLocked},in_array:function(n,e){for(var i=e.length,t=0;i>t;t++)if(e[t]==n)return!0;return!1},transitionEndEventName:function(){var n,e=document.createElement("div"),i={transition:"transitionend",OTransition:"otransitionend",MozTransition:"transitionend",WebkitTransition:"webkitTransitionEnd",msTransition:"MSTransitionEnd"};for(n in i)if(i.hasOwnProperty(n)&&"undefined"!==e.style[n])return i[n]},animationEndEventName:function(){var n,e=document.createElement("div"),i={animation:"animationend",OAnimation:"oAnimationEnd",WebkitAnimation:"webkitAnimationEnd",MozAnimation:"mozAnimationRnd",msAnimation:"MSAnimationEnd"};for(n in i)if(i.hasOwnProperty(n)&&"undefined"!==e.style[n])return i[n]}});