#!/usr/bin/env node
"use strict";
const fs = require("node:fs"),
  path = require("node:path"),
  zlib = require("node:zlib");
const data = JSON.parse(
  zlib.gunzipSync(
    Buffer.from(
      "H4sIAFel0GoC/+1dC3fbNrL+K4hztpK6FOVHYqdy5GySJmfd3qTZ2LvtuXHOGiIhCTFFsnzYVmX99zszAPiWbLfJvdlbtnmZeA1mBjPfDEhguSX8JJIi3hqyD8utifQE/GsrjpyBE8zDwIfieHDsT4IXwbWdxNdbFtsae4FzoVuMxSSIqI2E6lHClux9kCbiZQD9Bl5sqR/fBdJPzDO2YpMomLOObQ8mgidpJOJBBNWkPx2UWncOcTw+SUT05YY487N+VR9ekLrPXR4m8tJUswpFJwn01zxCiJX6DtYaVBucCCeRga+m5PGx8HBK7/IWLKZ6A66HZiF0Cfzn2IwpGrdWFisy/ek4TZLAP/NZ4b9kEYrR2ZYu2mJAP/4cX8nEmcHPPJK878yEcyHc0fLBg2QmYzuMghD+rDFgVe6b2hL10KOpw2JH+IK5Mg49vjjbqpAjExq/ufaQTcSViPRDGj9mVzNQRObzSznlKLJDNkk9j7ki4dKDUuEDs4IwFK7NnvvcW8QyZkmAgo+wjl+sb1cJCvyXnnQuRstuj42OWGH6gd+gATPuT8Uzu7uZT70Ko+JkAbNeLtWURPTqEpfSkJ1t8TQJzkAJ5jyaSv80CIfskcWupJvMhuy7fSiQ/t+FnM6SIduFH8fB9Yn8DbiAjcdB5IqoD8+wi4yHZ1sTT9Aj7smpf5yIOY0FTIWx8fmnNE7kZIH6DM+wLA65I/pjkVwJ4WOVKVekhNx19XCPw2u2H1LHauT33JUpdP3YPMBaO1ArDjzpsmg65t3dx48t83vb3nnco+bcuZjCCvTdIdvISPYMelT97Fs7299Z+/vQyxPshQ1N0d5jS/3atg9U/07gBVFWXibhia6SRrGqo2WCDyfAEGCvGLIn6oefNev3t7fZanVUlupTYJp/9Pz75+9Oj//16umAfmyootbJTLqu8EH1kygVQH6mE1rYOwcWm+nhvoPRQYQns0j6F0O2XWX4/n1Z+HDvwH38ZFdz7eHBLv6PM87Eu7NBt3DqaiYZ0QVlIw+AfemJFOZxUCUclGj7L1UNONuCJZ4IfJxE3I/Bns3vMimq7PFE/NJ9El4blSg83e5lfUq0m1kxjsB2drfnMRM8FjRDNjhqEOHTgbKcRyXf83Stb2B1WkfLzTaVrTc0pabrqyHtdUfSRF7NZbjyMnMJ5HGKmrnWWhXs0waDVLZpdzEk+3/EkJjVvm2pX7DUi8agUQjHPiIbTyR6mUwmjvNk3ywTDotmLGqGwZO+MDZ5x35UNwzNAn8XiUsZAFj45htGfM/4rBj1IgBFmxOvKqanYNByCmHUrEc551PBCDg8HUDXRxX/81Q5v7hCJ9qndA6jL7Rfbib8RNVZ5QSvNZ4Ve0nN17CjwvqQR4nknma9F3BXuGdbK1iSavQ66Q0sNLoWXIpo4gVXP0foxUBv/QXghEgt9KPNs1QMrPBv0MzAtTTs3TqODfZTJl2g6Czd3h4fAJU9eyJ9t4ucQCiCf9vSd7zUFTFWvJSxHHswiV7vmR0JsL+OKD23oBNQlSiSbhCxMIHF3Gucz60SQRVVhq8GIA2Cey8S0Ju5jGNY1egPHOT6YuAGVz6KLz6EJQfIjiecjVN3KgDKAeoAJMbD0ANgiG040O2uUbv/gk6g61UO0UrGkMbPDd2q5lDBgmwrZ1PEUNtVu7TJ55es1h7Yo8faapXMzsPdnUeP93Zzc1a2Xg/39558d/Cobu0eFde1uye4Oy4ik01MoSVzxWWi10thGQaA5GSyuLX9tr0PTXfWK2pxKGI2/HCW7m7vKvvY7NTAQbzjaSxc3QxWr9A0Uh+0pLVLXZUdLarpOi+rw6zaKrrNYjUp9+g27S82MyZ2tNmmF5tovt2m1U1MWwcVsgq4GCqKf9uyWAsNFE+3Vh8JExSjfVpJOoClqiY+hqD/1pgf7QV7L7iT6Jg4wn83B+9Ud6lrmxj6k5ynfbBiohId/z2IE12VCFStm0PhM38FoXxpSPXozB98+y0rBtqu5FMfupZOzLjvMhNx9zXEhTWqJn/IuPNrKhWUHEwCDxwMG4sZBKZgbSMxh1ATQs7UT+Rc9MEKYkD67eDMF9c02UnqU9DPwBSWsNkLWg4nOKduHR8OwWoAQAPwfcPA4AjwEcLtDRUn7JcnJ+9A8gKcp4iBlRDxppHP2kizASB+5eHlIVvdriunEUzoM6vKHw9Av1DUeTeOzNL5+DNz5MtHt/8bIe1G9inr/5JHbpV3uSP83KbnPzFs/NyxYlEo4FnApTlFIPGCA1ImiTSzecR+b7h42DSszkYruHTLsHcL+jYM872Koe40u7tEchuG+pcKie4+1F6xuzWLhaBVdbVoPPfHTO9/eqjyu+KTjUEJLZMS/HvZuC2ikKCSG2JZaOEA4EzE8eSNCk2xbR3zkX3va2ineolt9upaxrjFwDwx5c5CP9fYjsEviGhlxIJIglS4x+aBm3pCobw7QtoWgrYQtIWgLQRtIWgLQVsI2kLQFoJ+9RCUe4AoXQMgmvFkC+BaANcCuBbAtQCuBXAtgGsBXAvgvhYAV9rddgMnHhy/ff3Ti59+6Z+8enl6/NPbE3vurt/VvmHv8M3r6FK47PnghXkp+Yad1180P8cU4TnuoG9+zRzfnT/HLgqb7boiFGEJ6Z70YI6MNrBB2nHqwbgO6Edk6RebgaQrviCKKDEqCHwiuaDI3PNQbuwGM46lnfD/D1O6YSofbJD2QCWGDQX3eQm/ifTGVx+w0jGsy1DAH0DfZT6jaQpOMLZYzMG6oxoS7VYxMKAZRotBRO/EgFXXCovz04GAmnAmsMbUN8OgIIpnMmSgzNCT+SZgp/4OhGpnYg8aKUhm+H69mrl5IQvCDwFyRj9T+c7AZ+ZzD/bqGjCCk2AKfM44iC2YiRgxh+7fA9Fl/SoJSx/dd0BvDunUOawx7hUkK7AGEOC7HszqEObE/CBhc7DZLPC9BRR5ExZMoDKj5c+VVYVoyU2B1Q52pLoDYjlzZtJz7ZrK57xQL8cNgAo5jtQs/8QMup+K7dZV7DVUwLe96AsSmFYk2Hki4iQeAJXiFL/CyJYZPLadT/G5lVWBhT9e3FLp15TjErulFr18yKfCfAByGsnpVER3qPlemaGGmlHZwJlyEkuxSslg5vVsdjoTCyauReTIuKI4lCVQkgJmXoH1QBW4kskMZOShR74iv8x+OPkFRBz5IlYvVC6Ix6gC4yi4AivOIMgAKlDgGG+QgQSUgFie+45gc4DyYApRirHNXqKcjM6y2EG9hJEt5vMI+hvMgzF+baP6VCsC3+LkcRw4EpSoYE5AnV5dw0hS4DAvUtAroEYpNr3iqawbMCDRStm0Lv+ECmTdRXuKWhauc1ytqt2qavezcHtVC3deQjnn2DBmGtjU2Yz0C7OHfE4O4VTOxTvpXIjoHJAOTM5mxzBbapr0YeTUYIXvf3oDEGECgQlMEuAChhHgChKA7yKxAG2IK4oswkCF7QY8eDCegOkQkPLTUPmGJIBW6MogDqGPRFybPo2EVpVtb+iAvBsAoBpuU+9wh0S/RmggjYQYmM+U/A6shoEhrZ+DJD0G8BO1jaPEJnrJYxGxkbgCGsyyz0yRJxEM4wfEbAFj/5riWlA+GoUARXMeovqAJO1Mzy6ECGNFNTwn1iSEcqtojXqiAWOgrxH60uY9dgWwTmRSN5v+SLAnJ8JZAONZnEoik7txkWfUBTLMF1dMo1KG0QgIyHyeiMUZL4k5FpSmzqwfQ6CmFAsMHb5Yr82kXTGjrZa2WvpVaqnB3dn7OplJ1+/U0CSBy+MFO8/dnE69gKdUH/8W91eyl3Ey6XmLYjcceO6LeZiUetTpKeUpaZqlZaFfIAI6XRSZmADDEtJu8lmMNmeUbEFB+VU5sDNRBahsCnJMwA1Z2D9l4/rq4yygF7G4WYOUBxqo7yMGJhQMIxlEFCBH2odjjG6z5/mekfmUxspZamJOy4SRkvZJTOAMA1R3mMwGExaDJmuNk8LYlfv5zEdrX7t6mOm70SkT/6BmmDJaJ6S/BBFIRTATEOWZu/zzItxTCOgzcPbPY7XMEI1Rs7lZ2DZ7XRkPZuqISix2yT0QqFpgOrNgcI8OslCVkbAr6ZJxO/n+RzJwFMvrlV7EQjHoPaw6tEo4wRumgRrTGRfDMShQ9gaeg6j9RO305WKiBEe/32cNf2LRayk8VNRE1DMeEyzrU9ngbQ1C11MdVB8rmhTHcx8aK0LBiIDJx74YqbZFZrxopAhcAvcpbB28QhMLWgwQFDOVXPGeSH5LUB04HRKZNbJplcCSeNsA6etEF4C/Scxg+34sPGiEws1IzDItA7U6tR8Dp7dA9zP1KE2j1Yvmk8nTCQIEy1poOIt/qFiCmRigNg1TMPhHU9RRn0gxOKknysisWUxX0uLI5jgGYq2clEiMERgrjcayvpoeNAB4TrZTJc50gz43hyV4HN3v+rm8XBcb1edTDY70nE7TaBwMLmszm0tfztM5+y0AB+SKCYdICkybIQwCGidF1sE0McLwvNyCmvRhaU5gNYMplMSDrPiuk8rCuDtPqi4oNSh981immFQMv5XkHgpwOq/kD2lC2nNnLpJm9r729POkY6k6Qw8jAccNQP8j8iF59pXUjGhX0xoY3polpHc66glaTXqbZf7as8zGKOegjKBeOUAgy3zsntexaTH7afZfEPxANHAhKHpwhEshOy4g6pZs8CH7TUTBQH87PAC8pjz3pS7PQJ46M0NhNu3KVdJTJzIUbshex9b2zkjQZm8NlAN7D3gnsrIwpGjztS9HV47bXzgKdIaBzlXEwxDztJiCABa5KUyoAGvbdHKeTn74kP0cRBeElrFE04ZFP0K0Q/FDdbIkvSuKEbOoI1C5HaBV0hfjBJR0XR8iHFe/8z/hc+ktAI0LCNNYPAMgZYqS4EIAU2g+dD6QgXoEq2GqMDiuLYm8IW8pvABZFuRxFCg7eF3FbNx+zawZm8FKGyAUdHjscBf1z0WFygxH5m+t7BN3xTKKmAIvkaGGnYGfqRt9zU9uwU0jCuAERsREIkpHRVNttrTNln6pbCka2SokzFMdJhxVJtdJI4xbCLcphsdZFDtFTdcOp8lKQ/CZr5V8jdI7lnmGJD8qAl93OE8QQL6R/n8jUByxnf3zjAVUNABXIYoeKltbIB0Ny3TAWEKS2tHEIuRgvnW+JGcM2EcRk1AxM8AZxgKXIl/WPEkiOUYkBVJWGSywD+jsTCyXsTYDIhlLI/TwUZxhVjUjif4ClVGlO1DzUIuAazqXpiUEA2rTaYAj2RiVuDtXfWvwmMOsjO8IrtEqkuaQEKQWgSHU0hqDLMYUlnKuuYBMnq0kWw1t+wVBGOoMZIhRUMmM50jLMsqlcW5mEzWFGeI3Cc0szDe0+ABrKkmyIrSsD3lYxjh1ZBNnSJEE2CZY2wRrm2BtE6yfKcFa/6KgTZW2qdI2VdqmSttUaZsqbVOlbaq0TZW2qdI2VdqmSttUaZsqbVOlbaq0TZW2qdI2VdqmSv9cqVJ6sVRpT8OlVPeNKTHzisgG2k+4Fwt8abV8psvfPsXXDH/jkStrDg3M1QZ9QaORl1FRJephaenAQH1WoEXjNh4YWD5ZUI+H34KX7p2CX4VburBy+TqrDSfGWBuOCLE2HJZhrTsJwlp3IIG17sgAa91H/ta6T/KttV/WV7iyNoOgDmPUqRni7tp7UxS3Rwz90tOiBCzWqR/D0WE3rLP+upbOUXYK5GsF+8puMFtNCkccZpqXJTNwOak7sqqrKSwkyUsnB6njDdZO0Jwy8Prl081MOAIuhIobR2yJJ/irnpcNx5FYG662ASHpjg6xE32aQffM/yy3mP0Zry7bfF/ZnS8pu9/JUr0vcinWvU4s6lUup7rX4T692+59woe9Q3N5QLOxUAbobjYiPwGGrET9KonKY50srDzNb4TQtqZy7UPniH1TWpLa1g6BSZQyKdyFoLAHaz7JTMelJYxwSCBTQRB09BCkJzraAH1cIEDB7ReT+1JfjrgMj1zZaJIUGxstUYHDdzFAerZW48k7VsP1Hlb9JBGr8YYOq34Bx3pLtuFyrfscoVRbY8vbL5Va43+/xJ1R6y+KWuPrs3uhvsxlUGuAxOpo+fkue1qDSZrG+L+96OlruN1p05VO6+9xuvu5Sb0S22+5tujz3VVU9AzlU4bullwthCPo/crRiLZpWL4aoa2Vkeh2fDCrQ3zWwYFVHR5DaJZU6qiHAzT2TrHyJK5UnMSdnhXyZFZ5jo+g5HJeeX45h6dJoRcKNJxIhsVhIJQZdbHEIrto2bZNux+ATXujo+4yLxrSnzc3y5Vlaqx6VpAmYZqMlsjay7kNIeKx/1Zc0fsy10kXc+J4Xl0I/H5D0WF3EtuYSXgNT04WvtNF+u1PIIHuv//tygh3QyyMB35P3Agz7qTJ5An8vcQ1BGNEP4WUMB0uVXQ6BJIUJT/CyrZfBvN54P9wYqlUFJaeEI9O6Wf71Qno47YFbMKiH+LrV3OZ2CoOhIev4e8AnHUH/t1ZrXq24scpxvJLnR4YqmeWFsRQuqMj+D0aFWLHZ0vqcgjMhZ5Ww0xomhGb9lY7vVUuTxR9PPJHRw/8mxsUXjBh/gMYKxh/Aj51nn34OHweRXxhy5j+7vq9Z7498Xjyhoddat4bfvBREeiHrp8rxMdsGBQujmJGwNkovNJ55jcNMIfOsVFPibrT6Q39Z1nPz0hZCiMNOxjy4frpdqpZoELWnjuOiMnSFnYDSwl63D2MYqE2y1ROGHcz0aR1rC6oOOISaNHVS9SMBZP6kJ3sZqkkBK79j70lGGbV3aiT+pTLAmx3qPkSCTFS8rbXRmfdZcPRlWZka31wMPSR60dqbPw3yF2ZD1vgDlcXR9fXiyGYsToq6uqsrfahUwzHOh+tBw8MHZU2NKhVmHDvsDCadhLdxkaFLsE2k64qwdZxrJEsizBZpnx7LSdGsaDOcGq/mmfQcqEqgWgYMursPR7sHYDg0zjB7Qnt4Xe2aSj904Hx2+bBO4VuhmyXTYCW2+Ss7FG3jiyGmgyrDgeHqFXAFK1/njdSyw5HuFW8NF4u3uCiq6wuts1xSqcJSXZ6ld5haAV2YFmDMUW0gYtaEd7p6YEJdVj66W0Dm2q3EnhQgkidUoMHSFgczEWZMOXtsWqDTtHrIlmeb2PWtLqdXXp1Uu+oJ4smW/FBdwVOmeIN0suPZDk+KIOh/uzQ+LC4PuRmBB8iOfiUfjYPiyio81FbGyQnHm1rHTHEjZAkKvrrX3+nWnZUCGo1HgdLJNWPvsxm3QDPhpoVNaw4NERnmq7kV1T2Bu0zQq6sA1QhVdRTXK9UUGVaY414LU34prrajlmG2kpdYra13TuUk+4D092yqYduY8ud3spYQLzM8X8AeusD3MaBAAA=",
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
    if (!fs.existsSync(file)) {
      if (entry.createIfMissing) {
        writes.push({ file, content: entry.createIfMissing });
        continue;
      }
      throw Error("Required file missing: " + entry.file + ". No files changed.");
    }
    const original = fs.readFileSync(file, "utf8");
    let updated = normalize(original);
    if (entry.alreadyContent && updated.includes(normalize(entry.alreadyContent))) continue;
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
    console.log("Point-cloud status controls extraction is already installed. No files changed.");
    process.exit(0);
  }
  if (dry) {
    console.log("Dry run passed. Would update: " + writes.map((x) => path.relative(root, x.file)).join(", "));
    process.exit(0);
  }
  const backup = path.join(root, ".refactor-backups", "point-cloud-status-controls-" + Date.now() + "-" + process.pid);
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
  console.log("Point-cloud status controls extraction installed. Backup: " + path.relative(root, backup));
  console.log("Rebuild Experience Builder and check Adaptive on/off, cloud details/previous label and Retry/Resume/loading behavior.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
