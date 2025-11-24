import{a as i,b as o,e as f,r as s,n as l}from"./index-C42HdEAO.js";import{L as h}from"./Loading-snV3B40Z.js";/**
 * @license lucide-react v0.545.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const g=[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]],k=i("mail",g);function m(){const{auth:e}=o(),r=f(),[c,t]=s.useState(!0),a=s.useRef(!1),n=s.useRef(!1);s.useEffect(()=>{if(e.loginStatus==="authenticated"){a.current=!0,t(!1),r({to:"/",replace:!0});return}if(a.current&&e.loginStatus==="unauthenticated"){t(!1);return}e.loginStatus==="unauthenticated"&&!a.current&&!n.current?(n.current=!0,l().then(()=>{a.current=!0,n.current=!1,t(!1)}).catch(()=>{a.current=!0,n.current=!1,t(!1)})):e.loginStatus==="checking"?t(!0):t(!1)},[e.loginStatus,r]);const u=c||e.loginStatus==="checking"||e.loginStatus==="authenticated";return{isLoading:u,LoadingComponent:u?h:null}}export{k as M,m as u};
