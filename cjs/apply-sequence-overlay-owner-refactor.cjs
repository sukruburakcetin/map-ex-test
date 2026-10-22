#!/usr/bin/env node
"use strict";
const fs = require("node:fs"),
  path = require("node:path"),
  zlib = require("node:zlib");
const data = JSON.parse(
  zlib.gunzipSync(
    Buffer.from(
      "H4sIAJO/0GoC/+1ca3PbxtX+K2t3piJTELTT5osY2aPYjuvWuYydpu+M5UmXwJJEDQLMLiCJlfnf3+ec3cWNACXFctMPyodEIfZy7uc5i8W5eqiyQifKPDwW764eLpJU4a+HRkdTXWZFslbTiyReqiIszOXDQDycp3n0wY2eq0WuefxGJ+eyUOIXGRXJuXqrfi1VFqnXcqv0sfjlF2V0Er7UcrNKIsO/io8iK9NUnPB/ZmeZEAOL/JgnWWFooLoQ38nN1wYEZ8ugs+yT0fjQKj8n6qKiBKvQ/4MG98PbSGXK/dQkiziWi0LpA0z+cK50KrfH4rTv56/7mO/SHlxP2JMeylI5VylR5vcUud1UaGXyUtMPF5nSZpVsHu4C0acxlZlSq9N9tY3Obyax8YB+r0gZQiQLMSpWiQl79CEenJwI2mYseEiUKqn7SLGatYs96FuNh439nkIM7mj3mx0aZ8m35sbPT3X08tXb7/K4TJVpczm6Ekl8LM4eruUmSVOptxO72MS41c6gqCIpUkWjLG+iUtertVwqQ0PSxBTYgUetkpinqVRBRUmevcoW+bG4Ems3IM8mxUpNljovs/jsodiJnZfQriEo4jQEYWFKpJowyaK0jJUZDXL9YDwW1SwZx4dGug2jPDOFSCX+dSK6OyJuvCrU+rR4Go66z1KVLYuVmIjHY/H06d7UIj/VWm5H43fDE983zIIpIHs6YB7VSlrlOob2htkLxAF63bZaFaXOhjd8wON2vTHkc7tdH1EuIkHa1rh749Voo/ON0gVSgjh5cjMnqKeMm556gIbw/Le4/wGB+3WtXFmI41r8w4Ey0opdTMhYbkhHA2FymLa2xEHgPH+W5kZ5EYVY6oWMVqMlyfOKJYO/pREy247DX+yUb6RRb7freZ6OxTI0/Bcc6tDAWe31Q9L2YXEwHj4lC38Kf1hDIAeWmA1buZt8mqajg8MQeAqdb2nQbthGq+BLOe5QGB8eYPGCtabR+IAP/m/r9ICVPw3jxGxAz+hGNm4Hy3TIxpP1JtcF2GDJgdEyPqWR2Pg5ptISO7HQ+VocheF0AYeBi5nphkZPIho+HZx51IZQn3ers6xavze29a6dUA7W22nvjKMhnEWwStjduuKE7r4Qz7W8gJKFKRBeImTJFE9jwYyIUawWskwLMU9LNRY5hTQl4IniIilWeVmwBXxhDRRQV+R4rsXSW5/4SS6XWA1mZLrKBhU8Lys3YUv0vOILDo+8XTWT85sAh3m2NKLI+WlUao3KgMOzpwrxd14maUwUJUDkFT2O3L9u5zqJhTN0yLbItQ2ukMLWiMTy6eqKmdtYZjFY1x+UniRZrC4BhRaKBjiSPEUs8rCljmcAXMli6xYahLoW6l0XI7vCuj6JPbXQwM2NAMYKzH18wGAILJXrfQ8U7h8LpjZakdip5BkOp5XwK6AUongD+TYmLUNZoEyal4UyT0Ov61/c0uNZD7c33L7N/F3QcReSuy49fYd4O/KcDbB/A24HF/tUHg5ap/jjHw+kQsK8UgNq8/9i6K0gPxD/jRBxIAaw8J4ob+Y1QzxVo84/jbmOj17PZXvCQXa9sr/8BIP9NIVb1HzzeuZwOdPrDXetxluQ3FXFdbR/qvMdQJEe6NkMxWhvT1oHWdgcXOfTQ5+N2eoyMQXl5ZNDzMCNRh/UtlfhN1rHcfXAc9Va8NN5UalRDk0DISkgkHgs/F/hpjQA3DbdoIjgwTYq00lF/eCAAIylNxD16F2PLD4fHV0BDhF0O1m+Z2n6s1tk2sJMubB4DSgVbQEHQ/oxjP5taHH6GwMLXarBA11rDodx+gkw3q9lgnKbADUdGd8OsIeFOerY4n9v27PM7zVUKhzY52DNULM1pDlSwEDxEIYhk//ikp6aYJCLoCW3m0/rJTk4RK0BQp/nl/suawVINczJCskYIB+TetPPrPE8RmXE5P3TVhVvCFIh5IweBY+Cd/SvL7/6Knj8PjgCWoQgpTFKFyGWk+mINguTQq3hOsl/VPC48/wdBLHyaeJcYrQZjd8Dg44mj8cBl1vd4HcjLtoZ6X+OncPhonoZwHY3GIJbO69CqlxNSC5A8SR41CHtGo13uGrL/K526oDz/S3vRC6tqujEquQGvL9/9+h9mxG3RKMi2iuIAgrKXXHdhoA+kXwqJXdjXRcyKUSDcLPKL54BEqm4StJ25xF7SvA44DPqOeLZszwrdJ6mdDQH/S4zmd7OGgM6Ldyzwt+Jog6AfvqUzzIbJN6JvMUnxKhbBPZOMP3cm3bi8N1JS9zKnGzkvS6Ud5Hlb7KPW+x1h9FudbKSOlMG6Wb2exjSf5+Kz2ZZNyI8fET/PO6jPziSbR4OJwBX6VRggWL/b3HSu6PIw+LNAGV3aLasu5OLfgtzLpR/GNkjoV6TG1ihYx29S90JHxd9Rz509nGyfx9FXBx6u9qedJcI0bPtX+mhOm7Hpz041oV0F4ey9OGRJI8bDfQlv9u/F4F+Bk460fsmlDa1dqsJm30WP1MOsL9cNOLn7OKWcbgZNQ766arHfA9lhv8ObXsV4Of1sThX5vu8+Gml84vRaHzyZBViSqEui9C/3Ytkmo7cK93xeHZTk3YzboGTfyeKej3pt8u5fUgW55GZvnnx7emzn3548+r7l5M3P5w+/+70x3AdD99y/INg3E8VU64nWsk4IRsUOpcxLOEsO8t+WiVGmHKzSdVa0bXF5h4/vj79Hhvw+1T7KlStZZLReWusUrCut4JPxUPxqhCJfX+sy6gotaQXqgsIKNciX/Dk6qzWXs0RLy43Sicsg2/oNa3S0zcKM4S9wBmILC+wojvEwnIXGoEtFG8U1GcUiWqRLEv3ypZeyz575SgkQtRGaro1keJfWhTSfAiJ4T9AKO5d8SY3Cc2ln5/R+2i5VEKmyxz7rNYmEO7YTPhSfxonJqKB20AUWmaGX96vVApGMFy5wywIYZsqsZDrJKVrSfzGuIxWJIhFotJ4As4UFcgGZDD5U6CMJLacZPmFWMlzVXG+dpeYxLf1ZPJmsAU+IDcSKm1CUt7gF/p/d3DPC4GwNImSonvNMhQ/rUADnoObiDYHsdiwNGpRpoGA3dCaWxHnrIwFdG+sJUgdraANUrU6br4mdxowkLteqkBcrGDBgm4EfpNfMm9Rvqa7IIYUaIvSuGLVKEcGm1xEd30hmP9gBB26lJDtIs8L9xbeQPKpFTZYeVPt371KWpFEZGZgFotEpZmJFO4g2Dst38QjUZcqVkRE9qYTCRuHWDW8ak3RWqxhfiCW/YVt6u0agcTbgRM56J2nkBZIJ8fGf+Z0+1HS3WWWu6XkItcfwEheprFQ681KUnL0RNQmwDLL2EGJ80py2A5GTpctipXMxFKBZclOtkYMEJgyWZQZy1RQKMHWL7wbenojTJwrQbczN6SKUvOCFyvF9x8SDfokXQapBTpXIIg0SBc+Zt48KHblbMYkI63SLd2FwMwSQqPdray9G76pggmxrQz9/FH8QPFEfBT/JMF8RADrqgN/faSBk8lEtP5NPz7G/3xrrbThaTXhbDZwhqKyyD3L+yiQNcBb0z3h0tEK5E6TGD8lBUICeSQv17E3NiQYCPOOqCwpZL1A3tEbnRgyT0mRjmMZQiPciLKMv3aSwI4ypWJaunbbWt3eiLZhxcBG50vQYBCOIfA+56pYI7yB7SkOgViSfJlBTbJoeODf3v5fyBLwK1iOyHUWiUaGcqvNBOVCiAJxGkYwx3/5RL8xjYQDKEP7LEAJXB82ZdeCUcWKQhXCP4VIGOI6KUKrxC+hgxc2JInIxeVANN6V8NI+ODd9AfMk4mxDXuDT8OUfryZLl79idmzhk7EXmsl78Gd1sivk3AZ08lJ+RBFGOx+kk7dG3EF4uJAamkP01BB1QSmG7a3gy3vwzyWN/5HsSiNE4PdUTfh9s1b/tlINyBsjhDVndk5udjXIANTOZfSBzRFJwQd+pLoi4ZRryhRBSXwHsQkZ/VomNsVZii3sgWEiva7oRXWeqaawJOVbYsYp4s8Q6FufR+vcTxe/ityrWGYy3ZqEhP/GansaVcnUPQvEGlMxb4q8kppIKwXmYlU4y4R/5cgX0+oGubtltanubNmoyvGmMlXKDlvhiopG/K+D/YvLb/h6Fr9TnDpF5IAsSSaBTELxd6UQFEqMxeTIpWKrkfo2WOWHMtI54JPfvxnQWV5/4YBVB0Gbmqb2zRnQAzCcCxl0K4c89xwxNiaXjPJYUezy0Yhn1rEeruBEQCojggmkSL6dv8rpctoyzeewgLfP/w4PTRUBLzL6gtBQJE2EqOOx2hs+JIbvw1Ldzpxu3d0/Ry6ZYpqStdGfe1gr3mbANxG2WCZVAPOWRXswixSO8GieUKTwAAk8IFIxYK/wroGFLDUHywZmFSwy4HDE/rkNQsnaQVW6T9gAIU4FX0GIP0snf74Y6FNpBUchkH3oSdarbBylVLNSYBtuZawO5qghyKsNEAkUnhsbl8SXz6d/fi4MpAdC6BOfdQ5WVcPKKb7AKxBf8mxZfWRROXIVNNnrp9bdp1ZOPrBajEBkNNKIRZAUNZliM1WxTRQLmCpsTRYF4pOFKJxEKYj7XaeZKmjR6RpaggvNFUwrgWjYDKSYIx0TNprBRrAqv6AHMCbTc6meTRdPbVSLm/DIKeI1w+6Ph9H6R/ENzCdrGgRf9ayLiIr3VY7c00DJxI+MIoVKLA7Fc0tWQqGM4QZf/Jwix6T5dm3BPgSzpSuoFCwpBUqAFKIffp82IDDTzwDlrVzA3rLIQr3KEenpRDxb5cizWCTKkQbID2E8wGjGGzvnqAwOXpCIKQUl2aYkv4I92D9sQGqBCH+ZNKQ9qlRhzyAD68BsaN43RY1I7Mt/VjlqEa1zenF/aXOQU3itac7lLv7NSyTo5BLxJtf1CJew6kKqzFIqHn00TKu6CAogap8DVLOgsjyb5HMsUppG9EIupZhXAhVHwoNSM3XFTSDs7TgLShIbfupMyExUMC4Up+d5QlLbQFgcBMlcJ/PtxEH6tQfnIMtWqtDUskR+hrE++9tbhkKSkx7bfKy3ExQwQeVBzZRMci43DAw2iM/CwC6cgmUdX+QCeQaymDDOFgT/4Qv/MDYMESg4MlyMEoaigjshaGa1zlhbNjc/VxL5NdbJomAukN1s1UIR20YnazeUMTOaUQUvUyb0glQ8tzi/5JKNXZhZXefRByyCRDF9+Vq4IxFjL5qnNp+0PM3D9eeKyj9WBpwnRjCgB6dWwy5cUylhMW9duIPrf7xCspeFbKDmKiu7Sxv+yjYZSxuY2tOACsTa2omLfF9xEgWc8umUZj1PAUWZh3qPBgzz2Z/4aJZOPqlX+UW67b7PBUu9GmBc/o5nraqQ9jhPDEBx7UMUpFhbKva3yYky5sEuleXsenHDILlIEjx7nkAeiB5reZmsy7UtoqhCPG7WqVjGlaTIVNvaTZBAQMbSQUmP/qJca8iSD4KYZkSUBdmip9or3N/EaSHv2F1r4k1o4L9ufZnpXxaU20DPxBGLFxI5lO+xQrQcRuro+JdHj8SaIlFRgH/G4NYMvAU4fzLWgBnSM4ybEkxtLNQ6hnKsTBDQvOvYJIGEaZOy/5zBgVGL1fngZwE9uW9a+N6cu+1Px2A+btq35V5e9SYW/sya6DxwQM1/cIFQs1RAdQRvKa9bRXn05I64HO8T2jkmcYCKxDQKNYanfslJqzhrVpJB99jDHdfN6ZTQIjQ/hev0sP8wxyXQm53lNA9uzrLW8e39meX9meX9meX9meX9meX9meX9meX9meX9meX9meX9meX9meX9meX9meX9meX9meX9meX9meX9meX9meXvfGZpra3dOq/qadNjaNd9gdswsE5DPuGaCgA8A3bAU10ZzIqtm9EIbkZD2jSuWdvUK3sjUbp+QNb0Cq6BVp2eeamqctEOATXAsTdbrveZ2JrCnE5pl5R14BCNQi/wxFWmwbDI9t2pKq79BjzONLy6hYxjDjt1leuKWjrl8vUlgQV3mjz0abA7RKbLte8xzOXx/VaiN1abvd7LlS7NnX7xxZ5RWJFXTYK6Gps1+WrxU4sxFF9MzzLrS1xXa5QFdVtGR06jn16jxdmxINjBbbeqjmbVb7vrV6XvF75+/cSuS83Xjn2zMXsKQX0eq8Ymqe2f+ho7zBHFELxnwja/OBZZuZ4rjaKv6rE4YgH4J5hTZh/gn5hT9eapfnv3XuxcozHqWtDYyE/yLfe4M9yB57aNhx8QiCEiuFGZa2JqRVUJK0qpyOpvn/qaoorKYK996gnEy0D8PDTEydoJ25PY03nW9lz8uecJHdVxZbIZ6kL7stt4tprCvQV9D9xGk8RjFETIwHG1hBPRkzH1BXk9I8m479KpBsr16DeuVHX+a8wHB43/4158tBt7GocxPl1YJTFqigkdiDmHc124KtTKWbaKmRQNBZ2OMMC37crcZ+uuOdgzSok+zhqfOG2EztN4rxmYtSNhL9+7No3UDIzfQMGnIwYIfnUCApGFThUOkHXzMqrz5Iaipy3Smy8rjkwNB5CfIfY4cZiXlp7SfxpdJWEmYzKibnvbvoaW7S59zfa1aV+/2vOhBrWpU1xXl6777NFg89mjqvfsUX/r2aNm59kjajx7NNh39qjVdvaop+us/YCGjuzqVrAPmrwPNm9qNmmq+s66b+t6+swOtJgd7i7b21j2lj1lnc72mhcd7he137nUfkDE4bD2PXdWxhUYu0QDnUD3bL0eRFSogs/gbBLiSdZOFB0oJgTgpFVGrAr+qj101lyZpc1be6actrqGnve3CU2bfUHTgUag6aHOn+l+q8/zvd6em55mnpw8Go1sFiiTVU8LnP6P5pqdcBpQw3WDoae7k6rxS0aWT781OsbYb5c6Y+yPU4rDUXPwVW9Wa+zwG1rLnGXV+zyUQ+VmNL6ym9nQEJ+8ez/zrviBP5g8oe+1rhrftxka44zyyr3+gIqP3d/HV949j9OTJ12PTccBVePWyrG5W6dl/LugcszjxC/xLnkfOPc7JorcDIOCC9a4C+D5jf24zxL2smZFDxwHyUlFEVLEDwsMmiWLUfLk5NHYL7nhNZPgMZZ13no8SgOeQbJoj9tbjz6p7yxFz4JHQTre7XaznRMwe+fJTZopt+V/clU/Cdi4VXz8KKi+kMPfDW+6qtsjq/hPf9oFlUfZJ9U0PANl1gqc/KybNlU021X/f8X0B25G4M0F/J1lZPXc+KLVc4pHmgGM4JEAvW3jrqb5pqd36FHA1ghX9t9yOisOuL/JKvRk4BcrrFVoS+tWc+ee73RrmYZJHBxIi9fN9jkxsCnxuuGthBmueWI7WY5nnA+bln2F1H3ESOlot9c7ZJ/fwGmyM9Ar23rdXgOh5q6ua1CVVTl7Wy13DjWsOfVhM7ZB4yHaWhHGd7cBGKc1oNmwmvlooq1nw7ir/Rt27mqeZ1IvCPtro4kaGeoxx86j4Grnv+V1XWy7y9jdOqLCdrUj7QmSnjoH3Htmz9Fb4a/xnXiWFy94mCOG+BrQd+d77t4x/JG4Z6ClxKrNs8MJpgEU+LUKLzCpEcHav532r0sbZ9t35KQ30FT7O2o/oYbO+7/0OOOw4uzzIdX5xQc/1m+J/cDzjuqcYjrd9nbvd/8PXz3MIXBlAAA=",
      "base64",
    ),
  ),
);
const root = process.cwd(),
  dry = process.argv.includes("--dry-run"),
  skipTests = process.argv.includes("--skip-tests");
const normalize = (s) =>
  s
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
function replaceOnce(text, block) {
  if (block.flexibleIndent) {
    const pattern = (value) =>
      new RegExp(
        value
          .split("\n")
          .map((line) => "^[\\t \\u00a0]*" + line.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[\\t \\u00a0]*$")
          .join("\n"),
        "gm",
      );
    const previous = pattern(block.before),
      next = pattern(block.after);
    const oldMatches = [...text.matchAll(previous)],
      newMatches = [...text.matchAll(next)];
    if (newMatches.length === 1 && oldMatches.length === 0) return text;
    if (oldMatches.length !== 1 || newMatches.length !== 0) throw Error("Conflict in " + block.label + ". No files changed.");
    return text.replace(previous, () => block.after);
  }
  const count = (value) => text.split(value).length - 1;
  const expected = block.count || 1;
  if (count(block.after) === expected) return text;
  if (count(block.before) !== expected || count(block.after) !== 0)
    throw Error("Conflict in " + block.label + ". No files changed. Preserve local edits; merge from review source.");
  return text.split(block.before).join(block.after);
}
try {
  for (const arg of process.argv.slice(2))
    if (!["--dry-run", "--skip-tests"].includes(arg)) throw Error("Unknown option: " + arg + ". Supported options: --dry-run, --skip-tests (plural).");
  if (!fs.existsSync(path.join(root, "src/runtime/widget.tsx"))) throw Error("Run from the widget project root.");
  for (const relative of data.requiredFiles || [])
    if (!fs.existsSync(path.join(root, relative))) throw Error("Required earlier step missing: " + relative + ". Apply apply-field-notes-editor-component-refactor-v2.cjs first.");
  const writes = [];
  for (const entry of data.entries) {
    const file = path.join(root, entry.file);
    if (entry.test && (skipTests || !fs.existsSync(file))) {
      console.log("Test adapter preserved/skipped: " + entry.file + ". Merge it before running local lifecycle tests.");
      continue;
    }
    if (!fs.existsSync(file)) throw Error("Required file missing: " + entry.file + ". No files changed.");
    const original = fs.readFileSync(file, "utf8");
    let updated = normalize(original);
    for (const block of entry.blocks) updated = replaceOnce(updated, block);
    for (const block of entry.optionalBlocks || []) {
      if (updated.split(block.before).length === 2) updated = updated.replace(block.before, block.after);
    }
    if (updated !== normalize(original))
      writes.push({ file, content: (original.startsWith("\uFEFF") ? "\uFEFF" : "") + updated.replace(/\n/g, original.includes("\r\n") ? "\r\n" : "\n") });
  }
  for (const module of data.modules || []) {
    if (module.test && skipTests) {
      console.log("Test module skipped: " + module.file);
      continue;
    }
    const target = path.join(root, module.file);
    if (fs.existsSync(target)) {
      if (normalize(fs.readFileSync(target, "utf8")) !== normalize(module.content)) throw Error("Conflict in " + module.file + ". No files changed.");
    } else writes.push({ file: target, content: module.content });
  }
  if (!writes.length) {
    console.log("Active-sequence overlay owner extraction is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log("Dry run passed. Would update: " + writes.map((x) => path.relative(root, x.file)).join(", "));
    process.exit(0);
  }
  const backup = path.join(root, ".refactor-backups", "sequence-overlay-owner-" + Date.now() + "-" + process.pid);
  fs.mkdirSync(backup, { recursive: true });
  const originals = writes.map((x) => ({ ...x, bytes: fs.existsSync(x.file) ? fs.readFileSync(x.file) : null }));
  for (const x of originals)
    if (x.bytes !== null) {
      const dest = path.join(backup, path.relative(root, x.file));
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, x.bytes);
    }
  fs.writeFileSync(
    path.join(backup, "changes.json"),
    JSON.stringify(
      originals.map((x) => ({ file: path.relative(root, x.file), created: x.bytes === null })),
      null,
      2,
    ),
  );
  try {
    for (const x of writes) {
      fs.mkdirSync(path.dirname(x.file), { recursive: true });
      fs.writeFileSync(x.file, x.content);
    }
  } catch (error) {
    for (const x of originals)
      if (x.bytes === null) {
        if (fs.existsSync(x.file)) fs.unlinkSync(x.file);
      } else fs.writeFileSync(x.file, x.bytes);
    throw error;
  }
  console.log("Active-sequence overlay owner extraction installed. Backup: " + path.relative(root, backup));
  console.log("Rebuild Experience Builder and check sequence selection, marker reuse, hybrid coverage and view switching.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
