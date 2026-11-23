const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const assert = require('node:assert/strict');
const test = require('node:test');
const ts = require(process.env.MAPILLARY_TYPESCRIPT || 'typescript');

function load(name) {
  const source = readFileSync(join(__dirname, '../src/features/field-notes', name + '.ts'), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const module = { exports: {} };
  new Function('module', 'exports', 'require', outputText)(
    module, module.exports, dependency => load(dependency.slice(2)),
  );
  return module.exports;
}

const { uploadEnterpriseNoteAttachment } = load('enterpriseAttachmentUpload');
const target = { globalId: '{123}', objectId: 42 };
const file = new File(['contents'], 'note.txt');

function writer({ objectId = 42, supported = true, failure } = {}) {
  const calls = [];
  const feature = { attributes: { OID: objectId } };
  const items = [{ id: 9, name: 'note.txt' }];
  const layer = {
    capabilities: { data: { supportsAttachment: supported } },
    fields: [{ type: 'global-id', name: 'GUID' }],
    objectIdField: 'OID',
    load: async () => calls.push('load'),
    queryFeatures: async query => {
      calls.push('lookup');
      assert.deepEqual(query, {
        where: "GUID = '{123}'", outFields: ['OID'], returnGeometry: false, num: 1,
      });
      return { features: [feature] };
    },
    addAttachment: async (actual, form) => {
      calls.push('write');
      assert.equal(actual, feature);
      assert.equal(form.get('attachment').name, file.name);
      assert.equal(await form.get('attachment').text(), 'contents');
      if (failure) throw failure;
      return {};
    },
    queryAttachments: async query => {
      calls.push('refresh');
      assert.deepEqual(query, { objectIds: [42] });
      return { 42: items };
    },
  };
  return { layer, items, calls };
}

test('upload checks the captured note and reloads attachments after one confirmed write', async () => {
  const { layer, items, calls } = writer();
  assert.equal(await uploadEnterpriseNoteAttachment(layer, target, async () => {
    calls.push('prepare');
    return file;
  }), items);
  assert.deepEqual(calls, ['load', 'prepare', 'lookup', 'write', 'refresh']);
});

test('an unsupported layer never prepares the image or writes an attachment', async () => {
  const { layer, calls } = writer({ supported: false });
  await assert.rejects(uploadEnterpriseNoteAttachment(layer, target, () => assert.fail()), /not enabled/);
  assert.deepEqual(calls, ['load']);
});

test('a changed object ID blocks the write', async () => {
  const { layer, calls } = writer({ objectId: 43 });
  await assert.rejects(uploadEnterpriseNoteAttachment(layer, target, () => file), /note changed/);
  assert.deepEqual(calls, ['load', 'lookup']);
});

test('a lost response does not retry or report a refreshed list', async () => {
  const { layer, calls } = writer({ failure: new Error('lost response') });
  await assert.rejects(uploadEnterpriseNoteAttachment(layer, target, () => file), /lost response/);
  assert.deepEqual(calls, ['load', 'lookup', 'write']);
});
