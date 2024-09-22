import 'cookie';
import { bold, red, yellow, dim, blue } from 'kleur/colors';
import './astro/server_BKWigTq4.mjs';
import 'clsx';
import 'html-escaper';
import { compile } from 'path-to-regexp';

const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});
const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  silent: 90
};
function log(opts, level, label, message, newLine = true) {
  const logLevel = opts.level;
  const dest = opts.dest;
  const event = {
    label,
    level,
    message,
    newLine
  };
  if (!isLogLevelEnabled(logLevel, level)) {
    return;
  }
  dest.write(event);
}
function isLogLevelEnabled(configuredLogLevel, level) {
  return levels[configuredLogLevel] <= levels[level];
}
function info(opts, label, message, newLine = true) {
  return log(opts, "info", label, message, newLine);
}
function warn(opts, label, message, newLine = true) {
  return log(opts, "warn", label, message, newLine);
}
function error(opts, label, message, newLine = true) {
  return log(opts, "error", label, message, newLine);
}
function debug(...args) {
  if ("_astroGlobalDebug" in globalThis) {
    globalThis._astroGlobalDebug(...args);
  }
}
function getEventPrefix({ level, label }) {
  const timestamp = `${dateTimeFormat.format(/* @__PURE__ */ new Date())}`;
  const prefix = [];
  if (level === "error" || level === "warn") {
    prefix.push(bold(timestamp));
    prefix.push(`[${level.toUpperCase()}]`);
  } else {
    prefix.push(timestamp);
  }
  if (label) {
    prefix.push(`[${label}]`);
  }
  if (level === "error") {
    return red(prefix.join(" "));
  }
  if (level === "warn") {
    return yellow(prefix.join(" "));
  }
  if (prefix.length === 1) {
    return dim(prefix[0]);
  }
  return dim(prefix[0]) + " " + blue(prefix.splice(1).join(" "));
}
if (typeof process !== "undefined") {
  let proc = process;
  if ("argv" in proc && Array.isArray(proc.argv)) {
    if (proc.argv.includes("--verbose")) ; else if (proc.argv.includes("--silent")) ; else ;
  }
}
class Logger {
  options;
  constructor(options) {
    this.options = options;
  }
  info(label, message, newLine = true) {
    info(this.options, label, message, newLine);
  }
  warn(label, message, newLine = true) {
    warn(this.options, label, message, newLine);
  }
  error(label, message, newLine = true) {
    error(this.options, label, message, newLine);
  }
  debug(label, ...messages) {
    debug(label, ...messages);
  }
  level() {
    return this.options.level;
  }
  forkIntegrationLogger(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
}
class AstroIntegrationLogger {
  options;
  label;
  constructor(logging, label) {
    this.options = logging;
    this.label = label;
  }
  /**
   * Creates a new logger instance with a new label, but the same log options.
   */
  fork(label) {
    return new AstroIntegrationLogger(this.options, label);
  }
  info(message) {
    info(this.options, this.label, message);
  }
  warn(message) {
    warn(this.options, this.label, message);
  }
  error(message) {
    error(this.options, this.label, message);
  }
  debug(message) {
    debug(this.label, message);
  }
}

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getRouteGenerator(segments, addTrailingSlash) {
  const template = segments.map((segment) => {
    return "/" + segment.map((part) => {
      if (part.spread) {
        return `:${part.content.slice(3)}(.*)?`;
      } else if (part.dynamic) {
        return `:${part.content}`;
      } else {
        return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      }
    }).join("");
  }).join("");
  let trailing = "";
  if (addTrailingSlash === "always" && segments.length) {
    trailing = "/";
  }
  const toPath = compile(template + trailing);
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    const path = toPath(sanitizedParams);
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware(_, next) {
      return next();
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes
  };
}

const manifest = deserializeManifest({"adapterName":"@astrojs/vercel/serverless","routes":[{"file":"projects/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/projects","isIndex":true,"type":"page","pattern":"^\\/projects\\/?$","segments":[[{"content":"projects","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/projects/index.astro","pathname":"/projects","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"robots.txt","links":[],"scripts":[],"styles":[],"routeData":{"route":"/robots.txt","isIndex":false,"type":"endpoint","pattern":"^\\/robots\\.txt\\/?$","segments":[[{"content":"robots.txt","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/robots.txt.ts","pathname":"/robots.txt","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"rss.xml","links":[],"scripts":[],"styles":[],"routeData":{"route":"/rss.xml","isIndex":false,"type":"endpoint","pattern":"^\\/rss\\.xml\\/?$","segments":[[{"content":"rss.xml","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/rss.xml.ts","pathname":"/rss.xml","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"tags/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/tags","isIndex":true,"type":"page","pattern":"^\\/tags\\/?$","segments":[[{"content":"tags","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/tags/index.astro","pathname":"/tags","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"work/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/work","isIndex":true,"type":"page","pattern":"^\\/work\\/?$","segments":[[{"content":"work","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/work/index.astro","pathname":"/work","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/api/keystatic/[...params]","pattern":"^\\/api\\/keystatic(?:\\/(.*?))?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"keystatic","dynamic":false,"spread":false}],[{"content":"...params","dynamic":true,"spread":true}]],"params":["...params"],"component":"node_modules/@keystatic/astro/internal/keystatic-api.js","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/keystatic-astro-page.CqnA1qiQ.css"}],"routeData":{"type":"page","isIndex":false,"route":"/keystatic/[...params]","pattern":"^\\/keystatic(?:\\/(.*?))?\\/?$","segments":[[{"content":"keystatic","dynamic":false,"spread":false}],[{"content":"...params","dynamic":true,"spread":true}]],"params":["...params"],"component":"node_modules/@keystatic/astro/internal/keystatic-astro-page.astro","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"site":"https://astro-nano-demo.vercel.app","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/pages/blog/[...page].astro",{"propagation":"in-tree","containsHead":true}],["/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/pages/blog/[...slug].astro",{"propagation":"in-tree","containsHead":true}],["/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/pages/index.astro",{"propagation":"in-tree","containsHead":true}],["/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/pages/projects/[...slug].astro",{"propagation":"in-tree","containsHead":true}],["/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/pages/projects/index.astro",{"propagation":"in-tree","containsHead":true}],["/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/pages/tags/[tag].astro",{"propagation":"in-tree","containsHead":true}],["/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/pages/tags/index.astro",{"propagation":"in-tree","containsHead":true}],["/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/pages/work/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/blog/[...page]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/blog/[...slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/projects/[...slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/projects/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/pages/rss.xml.ts",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/rss.xml@_@ts",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/tags/[tag]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/tags/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/work/index@_@astro",{"propagation":"in-tree","containsHead":false}]],"renderers":[],"clientDirectives":[["idle","(()=>{var i=t=>{let e=async()=>{await(await t())()};\"requestIdleCallback\"in window?window.requestIdleCallback(e):setTimeout(e,200)};(self.Astro||(self.Astro={})).idle=i;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astro-page:node_modules/@keystatic/astro/internal/keystatic-api@_@js":"pages/api/keystatic/_---params_.astro.mjs","\u0000@astro-page:node_modules/@keystatic/astro/internal/keystatic-astro-page@_@astro":"pages/keystatic/_---params_.astro.mjs","\u0000@astro-page:src/pages/blog/[...page]@_@astro":"pages/blog/_---page_.astro.mjs","\u0000@astro-page:src/pages/blog/[...slug]@_@astro":"pages/blog/_---slug_.astro.mjs","\u0000@astro-page:src/pages/projects/index@_@astro":"pages/projects.astro.mjs","\u0000@astro-page:src/pages/projects/[...slug]@_@astro":"pages/projects/_---slug_.astro.mjs","\u0000@astro-page:src/pages/robots.txt@_@ts":"pages/robots.txt.astro.mjs","\u0000@astro-page:src/pages/rss.xml@_@ts":"pages/rss.xml.astro.mjs","\u0000@astro-page:src/pages/tags/[tag]@_@astro":"pages/tags/_tag_.astro.mjs","\u0000@astro-page:src/pages/tags/index@_@astro":"pages/tags.astro.mjs","\u0000@astro-page:src/pages/work/index@_@astro":"pages/work.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astro-renderers":"renderers.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/node_modules/astro/dist/env/setup.js":"chunks/astro/env-setup_Cr6XTFvb.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/node_modules/@astrojs/react/vnode-children.js":"chunks/vnode-children_BkR_XoPb.mjs","/node_modules/astro/dist/assets/endpoint/generic.js":"chunks/generic_CH5yyVyY.mjs","/node_modules/@keystatic/astro/internal/keystatic-api.js":"chunks/keystatic-api_DchqXAoY.mjs","/node_modules/@keystatic/astro/internal/keystatic-astro-page.astro":"chunks/keystatic-astro-page_upfsdGFa.mjs","/src/pages/blog/[...page].astro":"chunks/_...page__AD_7YTCP.mjs","/src/pages/blog/[...slug].astro":"chunks/_...slug__BUzBAa26.mjs","/src/pages/projects/index.astro":"chunks/index_whFnlZSa.mjs","/src/pages/projects/[...slug].astro":"chunks/_...slug__DY4WgVtL.mjs","/src/pages/robots.txt.ts":"chunks/robots.txt_DRHYD5u_.mjs","/src/pages/rss.xml.ts":"chunks/rss.xml_CGqjqjZb.mjs","/src/pages/tags/[tag].astro":"chunks/_tag__CkZd8FaF.mjs","/src/pages/tags/index.astro":"chunks/index_JSrJ3tUd.mjs","/src/pages/work/index.astro":"chunks/index_4ySULJNM.mjs","/src/pages/index.astro":"chunks/index_DI3WZakY.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/01-getting-started/index.md?astroContentCollectionEntry=true":"chunks/index_BQfpr-6R.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/02-blog-collection/index.md?astroContentCollectionEntry=true":"chunks/index_De-v_ejP.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/03-projects-collection/index.md?astroContentCollectionEntry=true":"chunks/index_Sw-mG3Pf.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/04-work-collection/index.md?astroContentCollectionEntry=true":"chunks/index_8UqsXNmf.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/05-markdown-syntax/index.md?astroContentCollectionEntry=true":"chunks/index_DdZVmouJ.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/06-mdx-syntax/index.mdx?astroContentCollectionEntry=true":"chunks/index_BwShnhsk.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/07-year-sorting-example/index.md?astroContentCollectionEntry=true":"chunks/index_B_OM4bmh.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/08-draft-example/index.md?astroContentCollectionEntry=true":"chunks/index_DQsJaZh4.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/something.mdx?astroContentCollectionEntry=true":"chunks/something_CQyrH1f8.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/tag-test.mdx?astroContentCollectionEntry=true":"chunks/tag-test_UYFcT6XZ.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/old1_blog/something-2.mdx?astroContentCollectionEntry=true":"chunks/something-2_DvmniPOh.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/projects/project-1/index.md?astroContentCollectionEntry=true":"chunks/index_CjH6me30.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/projects/project-2/index.md?astroContentCollectionEntry=true":"chunks/index_CIuiVdLe.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/work/apple.md?astroContentCollectionEntry=true":"chunks/apple_CJYpXSi-.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/work/facebook.md?astroContentCollectionEntry=true":"chunks/facebook_D1AFBOlv.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/work/google.md?astroContentCollectionEntry=true":"chunks/google_CODU5cXq.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/work/mcdonalds.md?astroContentCollectionEntry=true":"chunks/mcdonalds_BihzEFAY.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/01-getting-started/index.md?astroPropagatedAssets":"chunks/index_D9zHrdhw.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/02-blog-collection/index.md?astroPropagatedAssets":"chunks/index_DeVjJknM.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/03-projects-collection/index.md?astroPropagatedAssets":"chunks/index_Dl9B5JiK.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/04-work-collection/index.md?astroPropagatedAssets":"chunks/index_B0EEFKAm.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/05-markdown-syntax/index.md?astroPropagatedAssets":"chunks/index_BqfDKYI4.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/06-mdx-syntax/index.mdx?astroPropagatedAssets":"chunks/index_BkkijfTr.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/07-year-sorting-example/index.md?astroPropagatedAssets":"chunks/index_HTtniQ-8.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/08-draft-example/index.md?astroPropagatedAssets":"chunks/index_DK703juO.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/something.mdx?astroPropagatedAssets":"chunks/something_DrFp0xh7.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/tag-test.mdx?astroPropagatedAssets":"chunks/tag-test_D1NXUjKS.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/old1_blog/something-2.mdx?astroPropagatedAssets":"chunks/something-2_BCeEAZym.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/projects/project-1/index.md?astroPropagatedAssets":"chunks/index_CmFSDLsJ.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/projects/project-2/index.md?astroPropagatedAssets":"chunks/index_DhSqjN36.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/work/apple.md?astroPropagatedAssets":"chunks/apple_CqBNK9wD.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/work/facebook.md?astroPropagatedAssets":"chunks/facebook_D3iNZsZO.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/work/google.md?astroPropagatedAssets":"chunks/google_B88ajDTE.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/work/mcdonalds.md?astroPropagatedAssets":"chunks/mcdonalds_Un-8NP5W.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/01-getting-started/index.md":"chunks/index_ssQclpPu.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/02-blog-collection/index.md":"chunks/index_DfHAW0F5.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/03-projects-collection/index.md":"chunks/index_VCEzd1a-.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/04-work-collection/index.md":"chunks/index_Dymkjmz1.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/05-markdown-syntax/index.md":"chunks/index_By4YbqgN.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/06-mdx-syntax/index.mdx":"chunks/index_BF5FQ5Rn.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/07-year-sorting-example/index.md":"chunks/index_CkTFQStr.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/08-draft-example/index.md":"chunks/index_Dm3Qm3OC.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/something.mdx":"chunks/something_D3SGSm39.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/blog/tag-test.mdx":"chunks/tag-test_4nmyBgZ1.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/old1_blog/something-2.mdx":"chunks/something-2_Dfwudk72.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/projects/project-1/index.md":"chunks/index_Btp9DTEB.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/projects/project-2/index.md":"chunks/index_IgRCciRc.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/work/apple.md":"chunks/apple_C_rBmz5C.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/work/facebook.md":"chunks/facebook_CSufOTOt.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/work/google.md":"chunks/google_DyHQwj5x.mjs","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/src/content/work/mcdonalds.md":"chunks/mcdonalds_DqfQC0nv.mjs","\u0000@astrojs-manifest":"manifest_5FZBlm1g.mjs","@astrojs/react/client.js":"_astro/client.ib7v9FQf.js","/astro/hoisted.js?q=0":"_astro/hoisted.BMnUj_RX.js","/Users/ayanchoudhury/astro-blog/ayan-choudhury-blog/node_modules/@keystatic/astro/internal/keystatic-page.js":"_astro/keystatic-page.D9mHKM7w.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/spongebob.DNKR31Tf.webp","/_astro/lora-latin-400-normal.CvHVDnm4.woff2","/_astro/inter-latin-600-normal.B2Ssfs8e.woff2","/_astro/inter-latin-400-normal.BT1H-PT_.woff2","/_astro/lora-latin-600-normal.DUWh3m6k.woff2","/_astro/inter-latin-400-normal.Cdi8t5Mu.woff","/_astro/lora-math-400-normal.QoQvadwx.woff2","/_astro/lora-cyrillic-400-normal.DXyCOuTk.woff2","/_astro/inter-latin-600-normal.Dbvh0wvx.woff","/_astro/lora-symbols-400-normal.DmcY0X7a.woff2","/_astro/lora-vietnamese-400-normal.vaWCr7o2.woff2","/_astro/lora-cyrillic-ext-400-normal.CXkJfJTd.woff2","/_astro/lora-latin-ext-400-normal.Zaohh3s8.woff2","/_astro/lora-latin-400-normal.BGMs03OI.woff","/_astro/lora-cyrillic-600-normal.GE5bhziV.woff2","/_astro/lora-cyrillic-ext-600-normal.C7TDeNoj.woff2","/_astro/lora-math-600-normal.CU8J3siK.woff2","/_astro/lora-vietnamese-600-normal.BVdSWJ2U.woff2","/_astro/lora-symbols-600-normal.DaMEG5Dn.woff2","/_astro/lora-latin-ext-600-normal.D_NIiHfu.woff2","/_astro/lora-latin-600-normal.31JvEFhQ.woff","/_astro/lora-math-400-normal.Gsx8lQXW.woff","/_astro/lora-cyrillic-400-normal.D1XS6rs-.woff","/_astro/lora-vietnamese-400-normal.DhDIvpTE.woff","/_astro/lora-symbols-400-normal.BQXsqyo4.woff","/_astro/lora-latin-ext-400-normal.C_gIiBKz.woff","/_astro/lora-cyrillic-600-normal.D9Zbnu3d.woff","/_astro/lora-cyrillic-ext-400-normal.CFh4TfQj.woff","/_astro/lora-vietnamese-600-normal.BNxtpOks.woff","/_astro/lora-symbols-600-normal.BBvEw2tW.woff","/_astro/lora-math-600-normal.Bpm_vvix.woff","/_astro/lora-cyrillic-ext-600-normal.DJ36qKL9.woff","/_astro/lora-latin-ext-600-normal.CIEFHufk.woff","/_astro/_page_.DyxOl908.css","/_astro/keystatic-astro-page.CqnA1qiQ.css","/astro-nano.png","/astro-sphere.jpg","/deploy_netlify.svg","/deploy_vercel.svg","/favicon-dark.svg","/favicon-light.svg","/lighthouse.png","/patrick.webp","/_astro/client.ib7v9FQf.js","/_astro/hoisted.BMnUj_RX.js","/_astro/index.6UxExMu4.js","/_astro/keystatic-page.D9mHKM7w.js","/fonts/MonaSans-Light.woff2","/fonts/MonaSans-Regular.woff2","/fonts/MonaSans-SemiBold.woff2","/fonts/atkinson-bold.woff","/fonts/atkinson-regular.woff","/fonts/sentient/Sentient-Bold.eot","/fonts/sentient/Sentient-Bold.ttf","/fonts/sentient/Sentient-Bold.woff","/fonts/sentient/Sentient-Bold.woff2","/fonts/sentient/Sentient-BoldItalic.eot","/fonts/sentient/Sentient-BoldItalic.ttf","/fonts/sentient/Sentient-BoldItalic.woff","/fonts/sentient/Sentient-BoldItalic.woff2","/fonts/sentient/Sentient-Extralight.eot","/fonts/sentient/Sentient-Extralight.ttf","/fonts/sentient/Sentient-Extralight.woff","/fonts/sentient/Sentient-Extralight.woff2","/fonts/sentient/Sentient-ExtralightItalic.eot","/fonts/sentient/Sentient-ExtralightItalic.ttf","/fonts/sentient/Sentient-ExtralightItalic.woff","/fonts/sentient/Sentient-ExtralightItalic.woff2","/fonts/sentient/Sentient-Italic.eot","/fonts/sentient/Sentient-Italic.ttf","/fonts/sentient/Sentient-Italic.woff","/fonts/sentient/Sentient-Italic.woff2","/fonts/sentient/Sentient-Light.eot","/fonts/sentient/Sentient-Light.ttf","/fonts/sentient/Sentient-Light.woff","/fonts/sentient/Sentient-Light.woff2","/fonts/sentient/Sentient-LightItalic.eot","/fonts/sentient/Sentient-LightItalic.ttf","/fonts/sentient/Sentient-LightItalic.woff","/fonts/sentient/Sentient-LightItalic.woff2","/fonts/sentient/Sentient-Medium.eot","/fonts/sentient/Sentient-Medium.ttf","/fonts/sentient/Sentient-Medium.woff","/fonts/sentient/Sentient-Medium.woff2","/fonts/sentient/Sentient-MediumItalic.eot","/fonts/sentient/Sentient-MediumItalic.ttf","/fonts/sentient/Sentient-MediumItalic.woff","/fonts/sentient/Sentient-MediumItalic.woff2","/fonts/sentient/Sentient-Regular.eot","/fonts/sentient/Sentient-Regular.ttf","/fonts/sentient/Sentient-Regular.woff","/fonts/sentient/Sentient-Regular.woff2","/fonts/sentient/Sentient-Variable.eot","/fonts/sentient/Sentient-Variable.ttf","/fonts/sentient/Sentient-Variable.woff","/fonts/sentient/Sentient-Variable.woff2","/fonts/sentient/Sentient-VariableItalic.eot","/fonts/sentient/Sentient-VariableItalic.ttf","/fonts/sentient/Sentient-VariableItalic.woff","/fonts/sentient/Sentient-VariableItalic.woff2","/projects/index.html","/robots.txt","/rss.xml","/tags/index.html","/work/index.html","/index.html"],"buildFormat":"directory","checkOrigin":false,"rewritingEnabled":false,"experimentalEnvGetSecretEnabled":false});

export { AstroIntegrationLogger as A, Logger as L, getEventPrefix as g, levels as l, manifest as m };
