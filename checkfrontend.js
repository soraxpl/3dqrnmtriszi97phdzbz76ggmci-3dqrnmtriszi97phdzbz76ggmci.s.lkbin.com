(async () => {

const old = document.getElementById("audit-panel");
if(old) old.remove();

const panel = document.createElement("div");

panel.id = "audit-panel";

panel.style = `
position:fixed;
top:10px;
right:10px;
width:500px;
height:90vh;
overflow:auto;
background:#05070d;
color:#00ff88;
font-family:monospace;
padding:20px;
z-index:999999999;
border:2px solid #ff0040;
border-radius:12px;
box-shadow:0 0 25px rgba(255,0,64,.5);
`;

document.body.appendChild(panel);

function section(title){
    return `
    <h2 style="
        color:#ff3b6b;
        margin-top:20px;
        margin-bottom:10px;
    ">
    ${title}
    </h2>
    `;
}

function item(k,v){
    return `
    <div style="
        border-bottom:1px solid rgba(255,255,255,.07);
        padding:6px 0;
    ">
        <span style="color:#7dffcb">${k}</span><br>
        <span style="word-break:break-word">
            ${v}
        </span>
    </div>
    `;
}

const start = performance.now();

try{
    await fetch(location.href,{
        cache:"no-store"
    });
}catch(e){}

const end = performance.now();

const scripts = [...document.scripts]
.map(s => ({
    src:s.src || "[inline]",
    async:s.async,
    defer:s.defer
}));

const forms = [...document.forms]
.map(f => ({
    action:f.action,
    method:f.method
}));

const inputs = [
    ...document.querySelectorAll("input")
].map(i => ({
    type:i.type,
    name:i.name,
    autocomplete:i.autocomplete
}));

const links = [...document.links]
.map(a => a.href);

const iframes = [
    ...document.querySelectorAll("iframe")
].map(i => i.src);

const comments = [];

const iterator =
document.createNodeIterator(
    document.documentElement,
    NodeFilter.SHOW_COMMENT
);

let current;

while(current = iterator.nextNode()){

    comments.push(
        current.nodeValue.trim()
    );
}

const inlineEvents = [];

document.querySelectorAll("*")
.forEach(el => {

    [...el.attributes]
    .forEach(attr => {

        if(attr.name.startsWith("on")){

            inlineEvents.push({
                tag:el.tagName,
                event:attr.name
            });

        }

    });

});

const metaTags = [
    ...document.querySelectorAll("meta")
].map(m => ({
    name:
        m.getAttribute("name") ||
        m.getAttribute("http-equiv"),
    content:m.content
}));

const storage = {
    local:{...localStorage},
    session:{...sessionStorage}
};

const suspicious = [];

Object.values(storage.local)
.forEach(v => {

    if(
        /token|jwt|secret|bearer|key/i
        .test(v)
    ){
        suspicious.push(v);
    }

});

const report = {

    URL: location.href,

    Title: document.title,

    Response_Time:
        Math.round(end-start) + " ms",

    User_Agent:
        navigator.userAgent,

    Platform:
        navigator.platform,

    Cookies:
        document.cookie || "None",

    CSP_Meta:
        document.querySelector(
            'meta[http-equiv="Content-Security-Policy"]'
        )?.content || "Missing",

    Scripts:scripts,

    Forms:forms,

    Inputs:inputs,

    Links:links.slice(0,20),

    Iframes:iframes,

    Comments:comments.slice(0,20),

    Inline_Events:inlineEvents,

    Storage:storage,

    Suspicious_Storage:suspicious,

    Meta:metaTags
};

let html = `
<h1 style="color:#ff0040">
[!] ADVANCED SECURITY AUDIT
</h1>
`;

for(const key in report){

    html += section(key);

    let value = report[key];

    if(typeof value === "object"){
        value =
            JSON.stringify(
                value,
                null,
                2
            );
    }

    html += item(key, value);
}

html += `
<button id="exportAudit"
style="
margin-top:20px;
width:100%;
padding:12px;
background:#ff0040;
border:none;
color:white;
cursor:pointer;
font-weight:bold;
border-radius:8px;
">
EXPORT REPORT
</button>
`;

panel.innerHTML = html;

document
.getElementById("exportAudit")
.onclick = () => {

    const blob = new Blob(
        [
            JSON.stringify(
                report,
                null,
                2
            )
        ],
        {
            type:"application/json"
        }
    );

    const a =
        document.createElement("a");

    a.href =
        URL.createObjectURL(blob);

    a.download =
        "advanced-security-report.json";

    a.click();
};

console.log(report);

})();

fetch(location.href)
.then(r => {
    for (const [k,v] of r.headers.entries()) {
        console.log(k, v);
    }
});