const path = require('path');
const url = require('url');
const fs = require('fs');

const customTitlebar = require('custom-electron-titlebar');

window.addEventListener('DOMContentLoaded', () => {
  new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#2f3241'),
	//menu: null
  });
  a = path.join(__dirname, 'menubar-styles.css');
  
  
	b = document.body
	
	insertHTML(fs.readFileSync(a, 'utf8'), b, true);

})

function insertHTML(html, dest, append=false){
    if(!append) dest.innerHTML = '';
    let container = document.createElement('div');
    container.innerHTML = html;
    let scripts = container.querySelectorAll('script');
    let nodes = container.childNodes;
    for( let i=0; i< nodes.length; i++) dest.appendChild( nodes[i].cloneNode(true) );
    for( let i=0; i< scripts.length; i++){
        let script = document.createElement('script');
        script.type = scripts[i].type || 'text/javascript';
        if( scripts[i].hasAttribute('src') ) script.src = scripts[i].src;
        script.innerHTML = scripts[i].innerHTML;
        document.head.appendChild(script);
        document.head.removeChild(script);
    }
    return true;
}

