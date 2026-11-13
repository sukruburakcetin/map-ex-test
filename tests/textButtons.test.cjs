/** Keep translated action labels on the shared layout path as new UI is added. */
const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):/\.tsx$/.test(e.name)?[path.join(dir,e.name)]:[]);}
const words=s=>/\p{L}{2}/u.test(s);
function visibleLabel(n){
 if(ts.isJsxText(n)||ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n))return words(n.text);
 if(ts.isIdentifier(n))return /^(label|title|text|caption|name|children|message|buttonText|buttonLabel)$/i.test(n.text);
 if(ts.isPropertyAccessExpression(n))return /^(label|caption|buttonText|buttonLabel)$/.test(n.name.text);
 if(ts.isJsxElement(n)||ts.isJsxSelfClosingElement(n)){const open=ts.isJsxElement(n)?n.openingElement:n,name=open.tagName.getText();if(/^(svg|path|title|i|Icon|.*Icon)$/.test(name))return false;if(/OwnedMessage|FormattedMessage/.test(name))return true;return ts.isJsxElement(n)&&n.children.some(visibleLabel);}
 if(ts.isJsxExpression(n))return !!n.expression&&visibleLabel(n.expression);
 if(ts.isCallExpression(n)&&/(?:\b|\.)(?:t|owned|text|_t|_owned|formatMessage)$/.test(n.expression.getText()))return true;
 if(ts.isConditionalExpression(n))return visibleLabel(n.whenTrue)||visibleLabel(n.whenFalse);
 if(ts.isBinaryExpression(n))return visibleLabel(n.left)||visibleLabel(n.right);
 if(ts.isParenthesizedExpression(n))return visibleLabel(n.expression);
 if(ts.isTemplateExpression(n))return words(n.head.text)||n.templateSpans.some(s=>words(s.literal.text)||visibleLabel(s.expression));return false;
}
test('owned translated actions use the shared policy; icon controls retain their own sizing',()=>{
 const missing=[];let labels=0,icons=0;
 for(const file of files(root+'/src')){const source=fs.readFileSync(file,'utf8'),sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);function visit(n){
  if(ts.isJsxElement(n)&&['button','Button'].includes(n.openingElement.tagName.getText(sf))){const cl=n.openingElement.attributes.properties.find(a=>ts.isJsxAttribute(a)&&a.name.getText(sf)==='className'),name=cl?.initializer?.getText(sf)||'';
   // Location title and symbol-only rails deliberately retain their navigation geometry.
   const excluded=/mly-rail-button|mly-info-toggle|mly-info-width-toggle|mly-utility-button|mly-dock-button/.test(name);
   if(!excluded&&n.children.some(visibleLabel)){labels++;if(!name.includes('mly-text-action'))missing.push(path.relative(root,file)+':'+(sf.getLineAndCharacterOfPosition(n.getStart(sf)).line+1));}
   if(excluded){icons++;assert(!name.includes('mly-text-action'));}
  }ts.forEachChild(n,visit);}visit(sf);
 }
 assert.deepEqual(missing,[],'Mark new text actions with mly-text-action, including callbacks with dynamic labels.');assert(labels>0);assert(icons>0);
});
test('both runtime and settings locale roots install the shared stylesheet for all languages',()=>{
 for(const file of ['WidgetLocale.tsx','SettingsLocale.tsx']){const source=fs.readFileSync(root+'/src/i18n/'+file,'utf8');assert.match(source,/import \{ textButtonCss \} from '\.\.\/styles\/textButtons'/);assert.match(source,/<style>\{textButtonCss\}<\/style>/);}
});
