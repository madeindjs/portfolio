import React from "react";
import Footer from "./Footer";
// @ts-ignore
import * as styles from "./Layout.module.scss";
import NavBar from "./NavBar";

const Layout: React.FC = ({ children }) => {
  const heapScript = `window.heap=window.heap||[],heap.load=function(e,t){window.heap.appid=e,window.heap.config=t=t||{};var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src="https://cdn.heapanalytics.com/js/heap-"+e+".js";var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a);for(var n=function(e){return function(){heap.push([e].concat(Array.prototype.slice.call(arguments,0)))}},p=["addEventProperties","addUserProperties","clearEventProperties","identify","resetIdentity","removeEventProperty","setEventProperties","track","unsetEventProperty"],o=0;o<p.length;o++)heap[p[o]]=n(p[o])};heap.load("3480706133");`;

  return (
    <div className={styles.layout}>
      <header>
        <NavBar />
      </header>
      <main className={styles.grid}>{children}</main>
      <Footer />
      <script type="text/javascript" dangerouslySetInnerHTML={{ __html: heapScript }}></script>
    </div>
  );
};

export default Layout;
