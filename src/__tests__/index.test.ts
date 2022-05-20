import 'dotenv/config'
import test from "ava";
import { Submarine } from "../index";

const submarine = new Submarine(process.env.SUBMARINE_API_KEY, process.env.GATEWAY_URL);
//  Using your own account, you will need to hard code these things
let testCid = "QmTLR9kNoFLd8qGxKiorxRRkfikWdVd4mdGC8t8y1uxvfW";
let testId = "d0d0134d-a6ce-4ea0-b61f-4a728a182799";
let folderID = "89a0ff98-ffac-4242-bd85-8e0a63cf6e32";
let folderCid = "QmZaAodcdcCruSZSFCmT9gcA7ajaFC7xH5ctbG8KHGAms7";
let fileName = "mapFile";

test("upload file", async (t) => {
  const res = await submarine.uploadFileOrFolder("./googlemaps.png", fileName);
  t.true(res.items[0].cid.length > 10);
})

test("upload folder", async (t) => {
  const res = await submarine.uploadFileOrFolder("./folderTest");
  t.true(res.items[0].cid.length > 10);
})

test("upload json content", async (t) => {
  const content = {
    key: "value"
  }
  const res = await submarine.uploadJson(content, "testJson.json")

  t.true(res.item.cid.length > 10);
})

test("delete file or folder", async (t) => {
  const files = await submarine.getSubmarinedContent({});
  const id = files[0].id;
  const res = await submarine.deleteContent(id);
  t.true(res.status === 200)
})

test("find content by CID", async (t) => {
  const { items } = await submarine.getSubmarinedContentByCid(testCid);
  t.is(items[0].cid, testCid);
});

test("list content", async (t) => {
  const options = {}
  const items = await submarine.getSubmarinedContent(options)
  t.true(items.length > -1);
})

test("list content by name", async (t) => {
  const options = {
    name: fileName
  }

  const items = await submarine.getSubmarinedContent(options)
  t.true(items.length > -1);
})

test("list folder content", async (t) => {
  const items = await submarine.listFolderContent(folderID);
  t.true(items.childContent.length > -1);
})

test("generates access link for single file", async (t) => {
  const link = await submarine.generateAccessLink(100, testId, testCid);
  t.true(link.includes("accessToken"));
})

test("generates link to a single file in the folder", async (t) => {
  const link = await submarine.generateAccessLink(100, folderID, folderCid, "googlemaps.png");
  t.true(link.includes("accessToken"));
})

test("generates link for html content with no path provided", async (t) => {
  const res = await submarine.uploadFileOrFolder("./htmlTest", "htmlSubmarine");
  const id = res.items[0].id;
  const cid = res.items[0].cid;
  const link = await submarine.generateAccessLink(100, id, cid);
  t.true(link.includes("accessToken"));
})

test("update file name", async (t) => {
  const files = await submarine.getSubmarinedContent({});
  const id = files[0].id;
  const res = await submarine.updateFileName(id, "newNameTest");
  t.true(res.status === 200)
})

test("update file metadata", async (t) => {
  const newMetadata = {
    test: "update"
  }
  const res = await submarine.updateFileMetadata(testId, newMetadata);
  t.true(res.status === 200)
})

test("make file public", async (t) => {
  const content = {
    delete: "me"
  }
  const res = await submarine.uploadJson(content, "delete.json")
  const id = res.item.id;

  const response = await submarine.makeFilePublic(id);
  t.true(response.status === 200)
})
