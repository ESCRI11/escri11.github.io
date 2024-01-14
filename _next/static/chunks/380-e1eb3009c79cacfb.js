"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[380],{622:function(e,r,t){var o=t(2265),n=Symbol.for("react.element"),l=(Symbol.for("react.fragment"),Object.prototype.hasOwnProperty),i=o.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,a={key:!0,ref:!0,__self:!0,__source:!0};r.jsx=function(e,r,t){var o,s={},c=null,d=null;for(o in void 0!==t&&(c=""+t),void 0!==r.key&&(c=""+r.key),void 0!==r.ref&&(d=r.ref),r)l.call(r,o)&&!a.hasOwnProperty(o)&&(s[o]=r[o]);if(e&&e.defaultProps)for(o in r=e.defaultProps)void 0===s[o]&&(s[o]=r[o]);return{$$typeof:n,type:e,key:c,ref:d,props:s,_owner:i.current}}},7437:function(e,r,t){e.exports=t(622)},3428:function(e,r,t){t.d(r,{Z:function(){return o}});function o(){return(o=Object.assign?Object.assign.bind():function(e){for(var r=1;r<arguments.length;r++){var t=arguments[r];for(var o in t)Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o])}return e}).apply(this,arguments)}},1908:function(e,r,t){t.d(r,{NY:function(){return v},Ee:function(){return h},fC:function(){return g}});var o=t(3428),n=t(2265);let l=(null==globalThis?void 0:globalThis.document)?n.useLayoutEffect:()=>{};t(4887);var i=t(3474);let a=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","span","svg","ul"].reduce((e,r)=>{let t=(0,n.forwardRef)((e,t)=>{let{asChild:l,...a}=e,s=l?i.g7:r;return(0,n.useEffect)(()=>{window[Symbol.for("radix-ui")]=!0},[]),(0,n.createElement)(s,(0,o.Z)({},a,{ref:t}))});return t.displayName=`Primitive.${r}`,{...e,[r]:t}},{}),s="Avatar",[c,d]=function(e,r=[]){let t=[],o=()=>{let r=t.map(e=>(0,n.createContext)(e));return function(t){let o=(null==t?void 0:t[e])||r;return(0,n.useMemo)(()=>({[`__scope${e}`]:{...t,[e]:o}}),[t,o])}};return o.scopeName=e,[function(r,o){let l=(0,n.createContext)(o),i=t.length;function a(r){let{scope:t,children:o,...a}=r,s=(null==t?void 0:t[e][i])||l,c=(0,n.useMemo)(()=>a,Object.values(a));return(0,n.createElement)(s.Provider,{value:c},o)}return t=[...t,o],a.displayName=r+"Provider",[a,function(t,a){let s=(null==a?void 0:a[e][i])||l,c=(0,n.useContext)(s);if(c)return c;if(void 0!==o)return o;throw Error(`\`${t}\` must be used within \`${r}\``)}]},function(...e){let r=e[0];if(1===e.length)return r;let t=()=>{let t=e.map(e=>({useScope:e(),scopeName:e.scopeName}));return function(e){let o=t.reduce((r,{useScope:t,scopeName:o})=>{let n=t(e)[`__scope${o}`];return{...r,...n}},{});return(0,n.useMemo)(()=>({[`__scope${r.scopeName}`]:o}),[o])}};return t.scopeName=r.scopeName,t}(o,...r)]}(s),[u,p]=c(s),f=(0,n.forwardRef)((e,r)=>{let{__scopeAvatar:t,...l}=e,[i,s]=(0,n.useState)("idle");return(0,n.createElement)(u,{scope:t,imageLoadingStatus:i,onImageLoadingStatusChange:s},(0,n.createElement)(a.span,(0,o.Z)({},l,{ref:r})))}),b=(0,n.forwardRef)((e,r)=>{let{__scopeAvatar:t,src:i,onLoadingStatusChange:s=()=>{},...c}=e,d=p("AvatarImage",t),u=function(e){let[r,t]=(0,n.useState)("idle");return l(()=>{if(!e){t("error");return}let r=!0,o=new window.Image,n=e=>()=>{r&&t(e)};return t("loading"),o.onload=n("loaded"),o.onerror=n("error"),o.src=e,()=>{r=!1}},[e]),r}(i),f=function(e){let r=(0,n.useRef)(e);return(0,n.useEffect)(()=>{r.current=e}),(0,n.useMemo)(()=>(...e)=>{var t;return null===(t=r.current)||void 0===t?void 0:t.call(r,...e)},[])}(e=>{s(e),d.onImageLoadingStatusChange(e)});return l(()=>{"idle"!==u&&f(u)},[u,f]),"loaded"===u?(0,n.createElement)(a.img,(0,o.Z)({},c,{ref:r,src:i})):null}),m=(0,n.forwardRef)((e,r)=>{let{__scopeAvatar:t,delayMs:l,...i}=e,s=p("AvatarFallback",t),[c,d]=(0,n.useState)(void 0===l);return(0,n.useEffect)(()=>{if(void 0!==l){let e=window.setTimeout(()=>d(!0),l);return()=>window.clearTimeout(e)}},[l]),c&&"loaded"!==s.imageLoadingStatus?(0,n.createElement)(a.span,(0,o.Z)({},i,{ref:r})):null}),g=f,h=b,v=m},3474:function(e,r,t){t.d(r,{g7:function(){return l}});var o=t(3428),n=t(2265);let l=(0,n.forwardRef)((e,r)=>{let{children:t,...l}=e,a=n.Children.toArray(t),c=a.find(s);if(c){let e=c.props.children,t=a.map(r=>r!==c?r:n.Children.count(e)>1?n.Children.only(null):(0,n.isValidElement)(e)?e.props.children:null);return(0,n.createElement)(i,(0,o.Z)({},l,{ref:r}),(0,n.isValidElement)(e)?(0,n.cloneElement)(e,void 0,t):null)}return(0,n.createElement)(i,(0,o.Z)({},l,{ref:r}),t)});l.displayName="Slot";let i=(0,n.forwardRef)((e,r)=>{let{children:t,...o}=e;return(0,n.isValidElement)(t)?(0,n.cloneElement)(t,{...function(e,r){let t={...r};for(let o in r){let n=e[o],l=r[o];/^on[A-Z]/.test(o)?n&&l?t[o]=(...e)=>{l(...e),n(...e)}:n&&(t[o]=n):"style"===o?t[o]={...n,...l}:"className"===o&&(t[o]=[n,l].filter(Boolean).join(" "))}return{...e,...t}}(o,t.props),ref:r?function(...e){return r=>e.forEach(e=>{"function"==typeof e?e(r):null!=e&&(e.current=r)})}(r,t.ref):t.ref}):n.Children.count(t)>1?n.Children.only(null):null});i.displayName="SlotClone";let a=({children:e})=>(0,n.createElement)(n.Fragment,null,e);function s(e){return(0,n.isValidElement)(e)&&e.type===a}},6061:function(e,r,t){t.d(r,{j:function(){return i}});var o=t(7042);let n=e=>"boolean"==typeof e?"".concat(e):0===e?"0":e,l=o.W,i=(e,r)=>t=>{var o;if((null==r?void 0:r.variants)==null)return l(e,null==t?void 0:t.class,null==t?void 0:t.className);let{variants:i,defaultVariants:a}=r,s=Object.keys(i).map(e=>{let r=null==t?void 0:t[e],o=null==a?void 0:a[e];if(null===r)return null;let l=n(r)||n(o);return i[e][l]}),c=t&&Object.entries(t).reduce((e,r)=>{let[t,o]=r;return void 0===o||(e[t]=o),e},{});return l(e,s,null==r?void 0:null===(o=r.compoundVariants)||void 0===o?void 0:o.reduce((e,r)=>{let{class:t,className:o,...n}=r;return Object.entries(n).every(e=>{let[r,t]=e;return Array.isArray(t)?t.includes({...a,...c}[r]):({...a,...c})[r]===t})?[...e,t,o]:e},[]),null==t?void 0:t.class,null==t?void 0:t.className)}},7042:function(e,r,t){t.d(r,{W:function(){return o}});function o(){for(var e,r,t=0,o="";t<arguments.length;)(e=arguments[t++])&&(r=function e(r){var t,o,n="";if("string"==typeof r||"number"==typeof r)n+=r;else if("object"==typeof r){if(Array.isArray(r))for(t=0;t<r.length;t++)r[t]&&(o=e(r[t]))&&(n&&(n+=" "),n+=o);else for(t in r)r[t]&&(n&&(n+=" "),n+=t)}return n}(e))&&(o&&(o+=" "),o+=r);return o}},4769:function(e,r,t){t.d(r,{m6:function(){return A}});let o=/^\[(.+)\]$/;function n(e,r){let t=e;return r.split("-").forEach(e=>{t.nextPart.has(e)||t.nextPart.set(e,{nextPart:new Map,validators:[]}),t=t.nextPart.get(e)}),t}let l=/\s+/;function i(){let e,r,t=0,o="";for(;t<arguments.length;)(e=arguments[t++])&&(r=function e(r){let t;if("string"==typeof r)return r;let o="";for(let n=0;n<r.length;n++)r[n]&&(t=e(r[n]))&&(o&&(o+=" "),o+=t);return o}(e))&&(o&&(o+=" "),o+=r);return o}function a(e){let r=r=>r[e]||[];return r.isThemeGetter=!0,r}let s=/^\[(?:([a-z-]+):)?(.+)\]$/i,c=/^\d+\/\d+$/,d=new Set(["px","full","screen"]),u=/^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,p=/\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,f=/^-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/,b=/^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;function m(e){return h(e)||d.has(e)||c.test(e)}function g(e){return O(e,"length",P)}function h(e){return!!e&&!Number.isNaN(Number(e))}function v(e){return O(e,"number",h)}function y(e){return!!e&&Number.isInteger(Number(e))}function w(e){return e.endsWith("%")&&h(e.slice(0,-1))}function x(e){return s.test(e)}function k(e){return u.test(e)}let z=new Set(["length","size","percentage"]);function E(e){return O(e,z,R)}function j(e){return O(e,"position",R)}let C=new Set(["image","url"]);function _(e){return O(e,C,$)}function S(e){return O(e,"",I)}function N(){return!0}function O(e,r,t){let o=s.exec(e);return!!o&&(o[1]?"string"==typeof r?o[1]===r:r.has(o[1]):t(o[2]))}function P(e){return p.test(e)}function R(){return!1}function I(e){return f.test(e)}function $(e){return b.test(e)}let A=function(e){let r,t,a;let s=function(l){var i;return t=(r={cache:function(e){if(e<1)return{get:()=>void 0,set:()=>{}};let r=0,t=new Map,o=new Map;function n(n,l){t.set(n,l),++r>e&&(r=0,o=t,t=new Map)}return{get(e){let r=t.get(e);return void 0!==r?r:void 0!==(r=o.get(e))?(n(e,r),r):void 0},set(e,r){t.has(e)?t.set(e,r):n(e,r)}}}((i=[].reduce((e,r)=>r(e),e())).cacheSize),splitModifiers:function(e){let r=e.separator,t=1===r.length,o=r[0],n=r.length;return function(e){let l;let i=[],a=0,s=0;for(let c=0;c<e.length;c++){let d=e[c];if(0===a){if(d===o&&(t||e.slice(c,c+n)===r)){i.push(e.slice(s,c)),s=c+n;continue}if("/"===d){l=c;continue}}"["===d?a++:"]"===d&&a--}let c=0===i.length?e:e.substring(s),d=c.startsWith("!"),u=d?c.substring(1):c;return{modifiers:i,hasImportantModifier:d,baseClassName:u,maybePostfixModifierPosition:l&&l>s?l-s:void 0}}}(i),...function(e){let r=function(e){var r;let{theme:t,prefix:o}=e,l={nextPart:new Map,validators:[]};return(r=Object.entries(e.classGroups),o?r.map(([e,r])=>[e,r.map(e=>"string"==typeof e?o+e:"object"==typeof e?Object.fromEntries(Object.entries(e).map(([e,r])=>[o+e,r])):e)]):r).forEach(([e,r])=>{(function e(r,t,o,l){r.forEach(r=>{if("string"==typeof r){(""===r?t:n(t,r)).classGroupId=o;return}if("function"==typeof r){if(r.isThemeGetter){e(r(l),t,o,l);return}t.validators.push({validator:r,classGroupId:o});return}Object.entries(r).forEach(([r,i])=>{e(i,n(t,r),o,l)})})})(r,l,e,t)}),l}(e),{conflictingClassGroups:t,conflictingClassGroupModifiers:l}=e;return{getClassGroupId:function(e){let t=e.split("-");return""===t[0]&&1!==t.length&&t.shift(),function e(r,t){if(0===r.length)return t.classGroupId;let o=r[0],n=t.nextPart.get(o),l=n?e(r.slice(1),n):void 0;if(l)return l;if(0===t.validators.length)return;let i=r.join("-");return t.validators.find(({validator:e})=>e(i))?.classGroupId}(t,r)||function(e){if(o.test(e)){let r=o.exec(e)[1],t=r?.substring(0,r.indexOf(":"));if(t)return"arbitrary.."+t}}(e)},getConflictingClassGroupIds:function(e,r){let o=t[e]||[];return r&&l[e]?[...o,...l[e]]:o}}}(i)}).cache.get,a=r.cache.set,s=c,c(l)};function c(e){let o=t(e);if(o)return o;let n=function(e,r){let{splitModifiers:t,getClassGroupId:o,getConflictingClassGroupIds:n}=r,i=new Set;return e.trim().split(l).map(e=>{let{modifiers:r,hasImportantModifier:n,baseClassName:l,maybePostfixModifierPosition:i}=t(e),a=o(i?l.substring(0,i):l),s=!!i;if(!a){if(!i||!(a=o(l)))return{isTailwindClass:!1,originalClassName:e};s=!1}let c=(function(e){if(e.length<=1)return e;let r=[],t=[];return e.forEach(e=>{"["===e[0]?(r.push(...t.sort(),e),t=[]):t.push(e)}),r.push(...t.sort()),r})(r).join(":");return{isTailwindClass:!0,modifierId:n?c+"!":c,classGroupId:a,originalClassName:e,hasPostfixModifier:s}}).reverse().filter(e=>{if(!e.isTailwindClass)return!0;let{modifierId:r,classGroupId:t,hasPostfixModifier:o}=e,l=r+t;return!i.has(l)&&(i.add(l),n(t,o).forEach(e=>i.add(r+e)),!0)}).reverse().map(e=>e.originalClassName).join(" ")}(e,r);return a(e,n),n}return function(){return s(i.apply(null,arguments))}}(function(){let e=a("colors"),r=a("spacing"),t=a("blur"),o=a("brightness"),n=a("borderColor"),l=a("borderRadius"),i=a("borderSpacing"),s=a("borderWidth"),c=a("contrast"),d=a("grayscale"),u=a("hueRotate"),p=a("invert"),f=a("gap"),b=a("gradientColorStops"),z=a("gradientColorStopPositions"),C=a("inset"),O=a("margin"),P=a("opacity"),R=a("padding"),I=a("saturate"),$=a("scale"),A=a("sepia"),M=a("skew"),T=a("space"),G=a("translate"),L=()=>["auto","contain","none"],Z=()=>["auto","hidden","clip","visible","scroll"],W=()=>["auto",x,r],V=()=>[x,r],F=()=>["",m,g],q=()=>["auto",h,x],B=()=>["bottom","center","left","left-bottom","left-top","right","right-bottom","right-top","top"],D=()=>["solid","dashed","dotted","double","none"],U=()=>["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity","plus-lighter"],Y=()=>["start","end","center","between","around","evenly","stretch"],H=()=>["","0",x],J=()=>["auto","avoid","all","avoid-page","page","left","right","column"],K=()=>[h,v],Q=()=>[h,x];return{cacheSize:500,separator:":",theme:{colors:[N],spacing:[m,g],blur:["none","",k,x],brightness:K(),borderColor:[e],borderRadius:["none","","full",k,x],borderSpacing:V(),borderWidth:F(),contrast:K(),grayscale:H(),hueRotate:Q(),invert:H(),gap:V(),gradientColorStops:[e],gradientColorStopPositions:[w,g],inset:W(),margin:W(),opacity:K(),padding:V(),saturate:K(),scale:K(),sepia:H(),skew:Q(),space:V(),translate:V()},classGroups:{aspect:[{aspect:["auto","square","video",x]}],container:["container"],columns:[{columns:[k]}],"break-after":[{"break-after":J()}],"break-before":[{"break-before":J()}],"break-inside":[{"break-inside":["auto","avoid","avoid-page","avoid-column"]}],"box-decoration":[{"box-decoration":["slice","clone"]}],box:[{box:["border","content"]}],display:["block","inline-block","inline","flex","inline-flex","table","inline-table","table-caption","table-cell","table-column","table-column-group","table-footer-group","table-header-group","table-row-group","table-row","flow-root","grid","inline-grid","contents","list-item","hidden"],float:[{float:["right","left","none","start","end"]}],clear:[{clear:["left","right","both","none","start","end"]}],isolation:["isolate","isolation-auto"],"object-fit":[{object:["contain","cover","fill","none","scale-down"]}],"object-position":[{object:[...B(),x]}],overflow:[{overflow:Z()}],"overflow-x":[{"overflow-x":Z()}],"overflow-y":[{"overflow-y":Z()}],overscroll:[{overscroll:L()}],"overscroll-x":[{"overscroll-x":L()}],"overscroll-y":[{"overscroll-y":L()}],position:["static","fixed","absolute","relative","sticky"],inset:[{inset:[C]}],"inset-x":[{"inset-x":[C]}],"inset-y":[{"inset-y":[C]}],start:[{start:[C]}],end:[{end:[C]}],top:[{top:[C]}],right:[{right:[C]}],bottom:[{bottom:[C]}],left:[{left:[C]}],visibility:["visible","invisible","collapse"],z:[{z:["auto",y,x]}],basis:[{basis:W()}],"flex-direction":[{flex:["row","row-reverse","col","col-reverse"]}],"flex-wrap":[{flex:["wrap","wrap-reverse","nowrap"]}],flex:[{flex:["1","auto","initial","none",x]}],grow:[{grow:H()}],shrink:[{shrink:H()}],order:[{order:["first","last","none",y,x]}],"grid-cols":[{"grid-cols":[N]}],"col-start-end":[{col:["auto",{span:["full",y,x]},x]}],"col-start":[{"col-start":q()}],"col-end":[{"col-end":q()}],"grid-rows":[{"grid-rows":[N]}],"row-start-end":[{row:["auto",{span:[y,x]},x]}],"row-start":[{"row-start":q()}],"row-end":[{"row-end":q()}],"grid-flow":[{"grid-flow":["row","col","dense","row-dense","col-dense"]}],"auto-cols":[{"auto-cols":["auto","min","max","fr",x]}],"auto-rows":[{"auto-rows":["auto","min","max","fr",x]}],gap:[{gap:[f]}],"gap-x":[{"gap-x":[f]}],"gap-y":[{"gap-y":[f]}],"justify-content":[{justify:["normal",...Y()]}],"justify-items":[{"justify-items":["start","end","center","stretch"]}],"justify-self":[{"justify-self":["auto","start","end","center","stretch"]}],"align-content":[{content:["normal",...Y(),"baseline"]}],"align-items":[{items:["start","end","center","baseline","stretch"]}],"align-self":[{self:["auto","start","end","center","stretch","baseline"]}],"place-content":[{"place-content":[...Y(),"baseline"]}],"place-items":[{"place-items":["start","end","center","baseline","stretch"]}],"place-self":[{"place-self":["auto","start","end","center","stretch"]}],p:[{p:[R]}],px:[{px:[R]}],py:[{py:[R]}],ps:[{ps:[R]}],pe:[{pe:[R]}],pt:[{pt:[R]}],pr:[{pr:[R]}],pb:[{pb:[R]}],pl:[{pl:[R]}],m:[{m:[O]}],mx:[{mx:[O]}],my:[{my:[O]}],ms:[{ms:[O]}],me:[{me:[O]}],mt:[{mt:[O]}],mr:[{mr:[O]}],mb:[{mb:[O]}],ml:[{ml:[O]}],"space-x":[{"space-x":[T]}],"space-x-reverse":["space-x-reverse"],"space-y":[{"space-y":[T]}],"space-y-reverse":["space-y-reverse"],w:[{w:["auto","min","max","fit","svw","lvw","dvw",x,r]}],"min-w":[{"min-w":[x,r,"min","max","fit"]}],"max-w":[{"max-w":[x,r,"none","full","min","max","fit","prose",{screen:[k]},k]}],h:[{h:[x,r,"auto","min","max","fit","svh","lvh","dvh"]}],"min-h":[{"min-h":[x,r,"min","max","fit","svh","lvh","dvh"]}],"max-h":[{"max-h":[x,r,"min","max","fit","svh","lvh","dvh"]}],size:[{size:[x,r,"auto","min","max","fit"]}],"font-size":[{text:["base",k,g]}],"font-smoothing":["antialiased","subpixel-antialiased"],"font-style":["italic","not-italic"],"font-weight":[{font:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black",v]}],"font-family":[{font:[N]}],"fvn-normal":["normal-nums"],"fvn-ordinal":["ordinal"],"fvn-slashed-zero":["slashed-zero"],"fvn-figure":["lining-nums","oldstyle-nums"],"fvn-spacing":["proportional-nums","tabular-nums"],"fvn-fraction":["diagonal-fractions","stacked-fractons"],tracking:[{tracking:["tighter","tight","normal","wide","wider","widest",x]}],"line-clamp":[{"line-clamp":["none",h,v]}],leading:[{leading:["none","tight","snug","normal","relaxed","loose",m,x]}],"list-image":[{"list-image":["none",x]}],"list-style-type":[{list:["none","disc","decimal",x]}],"list-style-position":[{list:["inside","outside"]}],"placeholder-color":[{placeholder:[e]}],"placeholder-opacity":[{"placeholder-opacity":[P]}],"text-alignment":[{text:["left","center","right","justify","start","end"]}],"text-color":[{text:[e]}],"text-opacity":[{"text-opacity":[P]}],"text-decoration":["underline","overline","line-through","no-underline"],"text-decoration-style":[{decoration:[...D(),"wavy"]}],"text-decoration-thickness":[{decoration:["auto","from-font",m,g]}],"underline-offset":[{"underline-offset":["auto",m,x]}],"text-decoration-color":[{decoration:[e]}],"text-transform":["uppercase","lowercase","capitalize","normal-case"],"text-overflow":["truncate","text-ellipsis","text-clip"],"text-wrap":[{text:["wrap","nowrap","balance","pretty"]}],indent:[{indent:V()}],"vertical-align":[{align:["baseline","top","middle","bottom","text-top","text-bottom","sub","super",x]}],whitespace:[{whitespace:["normal","nowrap","pre","pre-line","pre-wrap","break-spaces"]}],break:[{break:["normal","words","all","keep"]}],hyphens:[{hyphens:["none","manual","auto"]}],content:[{content:["none",x]}],"bg-attachment":[{bg:["fixed","local","scroll"]}],"bg-clip":[{"bg-clip":["border","padding","content","text"]}],"bg-opacity":[{"bg-opacity":[P]}],"bg-origin":[{"bg-origin":["border","padding","content"]}],"bg-position":[{bg:[...B(),j]}],"bg-repeat":[{bg:["no-repeat",{repeat:["","x","y","round","space"]}]}],"bg-size":[{bg:["auto","cover","contain",E]}],"bg-image":[{bg:["none",{"gradient-to":["t","tr","r","br","b","bl","l","tl"]},_]}],"bg-color":[{bg:[e]}],"gradient-from-pos":[{from:[z]}],"gradient-via-pos":[{via:[z]}],"gradient-to-pos":[{to:[z]}],"gradient-from":[{from:[b]}],"gradient-via":[{via:[b]}],"gradient-to":[{to:[b]}],rounded:[{rounded:[l]}],"rounded-s":[{"rounded-s":[l]}],"rounded-e":[{"rounded-e":[l]}],"rounded-t":[{"rounded-t":[l]}],"rounded-r":[{"rounded-r":[l]}],"rounded-b":[{"rounded-b":[l]}],"rounded-l":[{"rounded-l":[l]}],"rounded-ss":[{"rounded-ss":[l]}],"rounded-se":[{"rounded-se":[l]}],"rounded-ee":[{"rounded-ee":[l]}],"rounded-es":[{"rounded-es":[l]}],"rounded-tl":[{"rounded-tl":[l]}],"rounded-tr":[{"rounded-tr":[l]}],"rounded-br":[{"rounded-br":[l]}],"rounded-bl":[{"rounded-bl":[l]}],"border-w":[{border:[s]}],"border-w-x":[{"border-x":[s]}],"border-w-y":[{"border-y":[s]}],"border-w-s":[{"border-s":[s]}],"border-w-e":[{"border-e":[s]}],"border-w-t":[{"border-t":[s]}],"border-w-r":[{"border-r":[s]}],"border-w-b":[{"border-b":[s]}],"border-w-l":[{"border-l":[s]}],"border-opacity":[{"border-opacity":[P]}],"border-style":[{border:[...D(),"hidden"]}],"divide-x":[{"divide-x":[s]}],"divide-x-reverse":["divide-x-reverse"],"divide-y":[{"divide-y":[s]}],"divide-y-reverse":["divide-y-reverse"],"divide-opacity":[{"divide-opacity":[P]}],"divide-style":[{divide:D()}],"border-color":[{border:[n]}],"border-color-x":[{"border-x":[n]}],"border-color-y":[{"border-y":[n]}],"border-color-t":[{"border-t":[n]}],"border-color-r":[{"border-r":[n]}],"border-color-b":[{"border-b":[n]}],"border-color-l":[{"border-l":[n]}],"divide-color":[{divide:[n]}],"outline-style":[{outline:["",...D()]}],"outline-offset":[{"outline-offset":[m,x]}],"outline-w":[{outline:[m,g]}],"outline-color":[{outline:[e]}],"ring-w":[{ring:F()}],"ring-w-inset":["ring-inset"],"ring-color":[{ring:[e]}],"ring-opacity":[{"ring-opacity":[P]}],"ring-offset-w":[{"ring-offset":[m,g]}],"ring-offset-color":[{"ring-offset":[e]}],shadow:[{shadow:["","inner","none",k,S]}],"shadow-color":[{shadow:[N]}],opacity:[{opacity:[P]}],"mix-blend":[{"mix-blend":U()}],"bg-blend":[{"bg-blend":U()}],filter:[{filter:["","none"]}],blur:[{blur:[t]}],brightness:[{brightness:[o]}],contrast:[{contrast:[c]}],"drop-shadow":[{"drop-shadow":["","none",k,x]}],grayscale:[{grayscale:[d]}],"hue-rotate":[{"hue-rotate":[u]}],invert:[{invert:[p]}],saturate:[{saturate:[I]}],sepia:[{sepia:[A]}],"backdrop-filter":[{"backdrop-filter":["","none"]}],"backdrop-blur":[{"backdrop-blur":[t]}],"backdrop-brightness":[{"backdrop-brightness":[o]}],"backdrop-contrast":[{"backdrop-contrast":[c]}],"backdrop-grayscale":[{"backdrop-grayscale":[d]}],"backdrop-hue-rotate":[{"backdrop-hue-rotate":[u]}],"backdrop-invert":[{"backdrop-invert":[p]}],"backdrop-opacity":[{"backdrop-opacity":[P]}],"backdrop-saturate":[{"backdrop-saturate":[I]}],"backdrop-sepia":[{"backdrop-sepia":[A]}],"border-collapse":[{border:["collapse","separate"]}],"border-spacing":[{"border-spacing":[i]}],"border-spacing-x":[{"border-spacing-x":[i]}],"border-spacing-y":[{"border-spacing-y":[i]}],"table-layout":[{table:["auto","fixed"]}],caption:[{caption:["top","bottom"]}],transition:[{transition:["none","all","","colors","opacity","shadow","transform",x]}],duration:[{duration:Q()}],ease:[{ease:["linear","in","out","in-out",x]}],delay:[{delay:Q()}],animate:[{animate:["none","spin","ping","pulse","bounce",x]}],transform:[{transform:["","gpu","none"]}],scale:[{scale:[$]}],"scale-x":[{"scale-x":[$]}],"scale-y":[{"scale-y":[$]}],rotate:[{rotate:[y,x]}],"translate-x":[{"translate-x":[G]}],"translate-y":[{"translate-y":[G]}],"skew-x":[{"skew-x":[M]}],"skew-y":[{"skew-y":[M]}],"transform-origin":[{origin:["center","top","top-right","right","bottom-right","bottom","bottom-left","left","top-left",x]}],accent:[{accent:["auto",e]}],appearance:[{appearance:["none","auto"]}],cursor:[{cursor:["auto","default","pointer","wait","text","move","help","not-allowed","none","context-menu","progress","cell","crosshair","vertical-text","alias","copy","no-drop","grab","grabbing","all-scroll","col-resize","row-resize","n-resize","e-resize","s-resize","w-resize","ne-resize","nw-resize","se-resize","sw-resize","ew-resize","ns-resize","nesw-resize","nwse-resize","zoom-in","zoom-out",x]}],"caret-color":[{caret:[e]}],"pointer-events":[{"pointer-events":["none","auto"]}],resize:[{resize:["none","y","x",""]}],"scroll-behavior":[{scroll:["auto","smooth"]}],"scroll-m":[{"scroll-m":V()}],"scroll-mx":[{"scroll-mx":V()}],"scroll-my":[{"scroll-my":V()}],"scroll-ms":[{"scroll-ms":V()}],"scroll-me":[{"scroll-me":V()}],"scroll-mt":[{"scroll-mt":V()}],"scroll-mr":[{"scroll-mr":V()}],"scroll-mb":[{"scroll-mb":V()}],"scroll-ml":[{"scroll-ml":V()}],"scroll-p":[{"scroll-p":V()}],"scroll-px":[{"scroll-px":V()}],"scroll-py":[{"scroll-py":V()}],"scroll-ps":[{"scroll-ps":V()}],"scroll-pe":[{"scroll-pe":V()}],"scroll-pt":[{"scroll-pt":V()}],"scroll-pr":[{"scroll-pr":V()}],"scroll-pb":[{"scroll-pb":V()}],"scroll-pl":[{"scroll-pl":V()}],"snap-align":[{snap:["start","end","center","align-none"]}],"snap-stop":[{snap:["normal","always"]}],"snap-type":[{snap:["none","x","y","both"]}],"snap-strictness":[{snap:["mandatory","proximity"]}],touch:[{touch:["auto","none","manipulation"]}],"touch-x":[{"touch-pan":["x","left","right"]}],"touch-y":[{"touch-pan":["y","up","down"]}],"touch-pz":["touch-pinch-zoom"],select:[{select:["none","text","all","auto"]}],"will-change":[{"will-change":["auto","scroll","contents","transform",x]}],fill:[{fill:[e,"none"]}],"stroke-w":[{stroke:[m,g,v]}],stroke:[{stroke:[e,"none"]}],sr:["sr-only","not-sr-only"],"forced-color-adjust":[{"forced-color-adjust":["auto","none"]}]},conflictingClassGroups:{overflow:["overflow-x","overflow-y"],overscroll:["overscroll-x","overscroll-y"],inset:["inset-x","inset-y","start","end","top","right","bottom","left"],"inset-x":["right","left"],"inset-y":["top","bottom"],flex:["basis","grow","shrink"],gap:["gap-x","gap-y"],p:["px","py","ps","pe","pt","pr","pb","pl"],px:["pr","pl"],py:["pt","pb"],m:["mx","my","ms","me","mt","mr","mb","ml"],mx:["mr","ml"],my:["mt","mb"],size:["w","h"],"font-size":["leading"],"fvn-normal":["fvn-ordinal","fvn-slashed-zero","fvn-figure","fvn-spacing","fvn-fraction"],"fvn-ordinal":["fvn-normal"],"fvn-slashed-zero":["fvn-normal"],"fvn-figure":["fvn-normal"],"fvn-spacing":["fvn-normal"],"fvn-fraction":["fvn-normal"],"line-clamp":["display","overflow"],rounded:["rounded-s","rounded-e","rounded-t","rounded-r","rounded-b","rounded-l","rounded-ss","rounded-se","rounded-ee","rounded-es","rounded-tl","rounded-tr","rounded-br","rounded-bl"],"rounded-s":["rounded-ss","rounded-es"],"rounded-e":["rounded-se","rounded-ee"],"rounded-t":["rounded-tl","rounded-tr"],"rounded-r":["rounded-tr","rounded-br"],"rounded-b":["rounded-br","rounded-bl"],"rounded-l":["rounded-tl","rounded-bl"],"border-spacing":["border-spacing-x","border-spacing-y"],"border-w":["border-w-s","border-w-e","border-w-t","border-w-r","border-w-b","border-w-l"],"border-w-x":["border-w-r","border-w-l"],"border-w-y":["border-w-t","border-w-b"],"border-color":["border-color-t","border-color-r","border-color-b","border-color-l"],"border-color-x":["border-color-r","border-color-l"],"border-color-y":["border-color-t","border-color-b"],"scroll-m":["scroll-mx","scroll-my","scroll-ms","scroll-me","scroll-mt","scroll-mr","scroll-mb","scroll-ml"],"scroll-mx":["scroll-mr","scroll-ml"],"scroll-my":["scroll-mt","scroll-mb"],"scroll-p":["scroll-px","scroll-py","scroll-ps","scroll-pe","scroll-pt","scroll-pr","scroll-pb","scroll-pl"],"scroll-px":["scroll-pr","scroll-pl"],"scroll-py":["scroll-pt","scroll-pb"],touch:["touch-x","touch-y","touch-pz"],"touch-x":["touch"],"touch-y":["touch"],"touch-pz":["touch"]},conflictingClassGroupModifiers:{"font-size":["leading"]}}})}}]);