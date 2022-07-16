# Pinata Submarine 

![Submarine](https://ipfs.submarine.me/ipfs/QmeveDgcyWtCLnQJHEAemY1JjB9ys1pJQMaxNGtTaY1frt)

**Do not try to use this SDK in the browser or your Submarine API key will be exposed**

- [Pinata Submarine](#pinata-submarine)
  - [What is this?](#what-is-this)
  - [Getting Started](#getting-started)
  - [Methods](#methods)
    - [uploadFileOrFolder](#uploadfileorfolder)
    - [uploadJson](#uploadjson)
    - [getSubmarinedContentByCid](#getsubmarinedcontentbycid)
    - [getSubmarinedContent](#getsubmarinedcontent)
    - [listFolderContent](#listfoldercontent)
    - [generateAccessLink](#generateaccesslink)
    - [updateFileName](#updatefilename)
    - [updateFileMetadata](#updatefilemetadata)
    - [makeFilePublic](#makefilepublic)
    - [deleteContent](#deletecontent)
  - [getEVMMessageToSign](#getevmmessagetosign)
  - [verifyEVMNFT](#verifyevmnft)
  - [Additional Info](#additional-info)
    - [Querying Metadata](#querying-metadata)

## What is this?

Pinata Submarine started as a simple idea. What if you could prove something was what you said it was going to be before anyone could actually see the thing? This concept soon expanded as the [Pinata](https://pinata.cloud) team talked with customers (mostly those building in the NFT space). Almost universally, the biggest complaint people had was the inability to share private data with specific people. 

If an artist sold an NFT, how could they share a high-resolution version of the art without exposing it to the rest of the world? How could they do this in a way that was both a great user experience and verifiable? 

If a project or company wanted to share media with their company based on certain criteria, how could they do this? How could they combine NFT ownership with serving private media? How could they share links that would not suddenly expose the media to the public at large? And how could they do this while maintaining the cryptographically verifiable content identifier of the media that [IPFS](https://ipfs.io) (the protocol that powers Pinata and Submarine). 

These interviews and these questions resulted in Pinata releasing the Submarine API. Months later, that API was used to build a non-technical creator's tool for using Submarine. It's called [submarine.me](https://submarine.me).

This SDK is designed to make working with the Pinata Submarine API so simple that any developer can build their own submarine.me. Or better yet, they can build something better. 

## Getting Started 

The first step is to install the Pinata Submarine SDK. 

Yarn: 

`yarn add pinata-submarine` 

NPM: 

`npm i pinata-submarine` 

Once installed, the SDK can be imported and used like this: 

```js
import { Submarine } from "pinata-submarine";
const submarine = new Submarine("YOUR PINATA API KEY", "YOUR PINATA GATEWAY URL");

const findByCid = await submarine.getSubmarinedContentByCid("CID FOR SUBMARINED FILE");
console.log(findByCid);
```

You'll notice this SDK requires the Pinata Submarine API Key and a Dedicated Gateway. These two things can only be had on paid Pinata accounts. 

The Dedicated Gateway URL should be formatted like this: 

`https://mydedicatedgatewayurl.com`

## Methods 

### uploadFileOrFolder

This method expects a filepath. Since this SDK should only be used in the Node.js environment, the expectation is your client has already uploaded the file to you and you are storing it either in memory or in a temp directory on disk. 

```js
import { Submarine } from "pinata-submarine";
const submarine = new Submarine("YOUR PINATA API KEY", "YOUR PINATA GATEWAY URL");

const res = await submarine.uploadFileOrFolder("./yourFilePath.some_extension");
console.log(res);
```

The method optionally allows you to pass in a custom name for the file and specify the [CID version](https://docs.ipfs.io/concepts/content-addressing/) (0 or 1 in number format).

The response will look like this: 

```json
{
  "status": 200,
  "totalItems": 0,
  "items": [
    {
      "id": "string",
      "createdAt": "2022-05-20T20:01:26.679Z",
      "cid": "string",
      "name": "string",
      "mimeType": "string",
      "originalname": "string",
      "size": 0,
      "metadata": {},
      "pinToIPFS": false,
      "isDuplicate": false
    }
  ]
}
```

As indicated by this method's name, it takes a path to a folder or a file. You don't have to do anything on your end to differentiate between the two. Just give it a path and the SDK handles the rest. 

### uploadJson

You can create your own object that gets converted to a JSON file and Submarined with this method. 

```js
import { Submarine } from "pinata-submarine";
const submarine = new Submarine("YOUR PINATA API KEY", "YOUR PINATA GATEWAY URL");

const content = {
  key: "value"
}
const res = await submarine.uploadJson(content, "testJson.json");
console.log(res);
```

The response will look like this: 

```json
{
  "status": 200,
  "statusText": "string",
  "totalItems": 0,
  "item": {
    "id": "string",
    "createdAt": "2022-05-20T20:01:26.679Z",
    "cid": "string",
    "name": "string",
    "mimeType": "string",
    "originalname": "string",
    "size": 0,
    "metadata": {},
    "pinToIPFS": false,
    "isDuplicate": false
  }
}
```

Notice that unlike file uploads, there will not be an array of `items` in the response. There will only be a single `item` object.

### getSubmarinedContentByCid

When searching for content that has previously been Submarined, this helper method makes it easy to find by passing in one argument—the CID.  

```js
import { Submarine } from "pinata-submarine";
const submarine = new Submarine("YOUR PINATA API KEY", "YOUR PINATA GATEWAY URL");

const content = await submarine.getSubmarinedContentByCid("YOUR CID");
console.log(contnet)
```

The response will look like this: 

```json
{
  "status": 200,

  "totalItems": 0,
  "items": [
    {
      "id": "string",
      "createdAt": "2022-05-20T19:33:36.340Z",
      "cid": "string",
      "name": "string",
      "mimeType": "string",
      "originalname": "string",
      "size": 0,
      "metadata": {},
      "pinToIPFS": false,
      "isDuplicate": false
    }
  ]
}
```

### getSubmarinedContent

This method is a more general purpose version of the previous one. It will allow paginating through a list of Submarined file, or it will allow you to pass through an options object that specifies parameters to use. 

**Options**

```ts
type GetSubmarinedContentOptions = {
  offset?: String
  limit?: String
  submarinedCid?: String
  name?: String
  originalName?: String
  fileSizeMinimum?: String
  fileSizeMaximum?: String
  createdAtStart?: String
  createdAtEnd?: String
  metadata?: string
  order?: String
}
```

Each option is optional. Pass through as many or as few as you'd like. If you'd like to just list all content, pass through an empty object. 

Object properties definitions: 

`offset` - This represents how many items to skip when returning the results (useful for pagination)
`limit` - This represents how many items to return (default = 50, max = 100)
`submarinedCid` - A CID to search for
`name` - A Submarined file's custom name to search for 
`originalname` - A Submarined file's original file name from disk
`fileSizeMinimum` - The minimum size of files to return (in bytes)
`fileSizeMaximum` - The maximum size of files to return (in bytes)
`createdAtStart` - The minimum created date for a file (ISO String format)
`createdAtEnd` - The maximum created date for a file (ISO String format)
`metadata` - See [metadata querying](#querying-metadata) for more info
`order` - Order ascending or descending (value = ASC or DESC)

**Example**

```js
import { Submarine } from "pinata-submarine";
const submarine = new Submarine("YOUR PINATA API KEY", "YOUR PINATA GATEWAY URL");

const options = {
  name: "Some file name"
}

const content = await submarine.getSubmarinedContent(options);
console.log(content);
```

The response will look like this: 

```json
{
  "status": 200,

  "totalItems": 0,
  "items": [
    {
      "id": "string",
      "createdAt": "2022-05-20T19:33:36.340Z",
      "cid": "string",
      "name": "string",
      "mimeType": "string",
      "originalname": "string",
      "size": 0,
      "metadata": {},
      "pinToIPFS": false,
      "isDuplicate": false
    }
  ]
}
```

**Example With Metadata Query**

```js
const options = {
  metadata: JSON.stringify({
    uuid: {
      value: IDENTIFIER, 
      op: "eq"
    }
  })
}

const content = await submarine.getSubmarinedContent(options);
```

The response will look like this: 

```json
{
  "status": 200,

  "totalItems": 0,
  "items": [
    {
      "id": "string",
      "createdAt": "2022-05-20T19:33:36.340Z",
      "cid": "string",
      "name": "string",
      "mimeType": "string",
      "originalname": "string",
      "size": 0,
      "metadata": {},
      "pinToIPFS": false,
      "isDuplicate": false
    }
  ]
}
```

### listFolderContent

When uploading folders, it is possible to query one level deep into those folders with this method. This method accepts one argument—the file's ID, not the CID. The below example shows how to get the ID by searching with the CID then uses the `listFolderContent` method to list the content in the folder.

```js
import { Submarine } from "pinata-submarine";
const submarine = new Submarine("YOUR PINATA API KEY", "YOUR PINATA GATEWAY URL");
const foundContent = await submarine.getSubmarinedContentByCid("YOUR CID");
const folder = foundContent.items[0];
const folderId = folder.id;

const content = await submarine.listFolderContent(folderID);
console.log(content);
```

The response will look like this: 

```json
{
  "status": 200,

  "totalItems": 0,
  "items": [
    {
      "id": "string",
      "createdAt": "2022-05-20T19:33:36.340Z",
      "cid": "string",
      "name": "string",
      "mimeType": "string",
      "originalname": "string",
      "size": 0,
      "metadata": {},
      "pinToIPFS": false,
      "isDuplicate": false
    }
  ]
}
```

### generateAccessLink

When sharing Submarined content, you must use a link that is made up of your Dedicated Gateway URL, the Submarined file's CID, and an access token. This method allows you to generate an access token that is valid for as many seconds as you specify. It requires both the CID and the ID of the file. 

```js
import { Submarine } from "pinata-submarine";
const submarine = new Submarine("YOUR PINATA API KEY", "YOUR PINATA GATEWAY URL");

const cid = "YOUR CID";
const foundContent = await submarine.getSubmarinedContentByCid(cid);
const folder = foundContent.items[0];
const folderId = folder.id;
const timeInSeconds = 3600 //one hour

const link = await submarine.generateAccessLink(timeInSeconds, folderId, cid);
console.log(link);
```

The response will look like this: 

```
GATEWAY_URL/ipfs/CID?accessToken=TOKEN
```

This method also takes an optional path argument. If you pass in the file path (which is the file name of a file within the folder), the access token will be generated for the whole folder, but the link will be specific to that one file. 

```js
import { Submarine } from "pinata-submarine";
const submarine = new Submarine("YOUR PINATA API KEY", "YOUR PINATA GATEWAY URL");

const cid = "YOUR CID";
const path = "image.png";
const foundContent = await submarine.getSubmarinedContentByCid(cid);
const folder = foundContent.items[0];
const folderId = folder.id;
const timeInSeconds = 3600 //one hour

const link = await submarine.generateAccessLink(timeInSeconds, id, cid, path);
console.log(link);
```

The response will look like this: 

```
GATEWAY_URL/ipfs/CID/path?accessToken=TOKEN
```

If you have uploaded a website or a web app, there will be an `index.html` file in the folder. You do not need to specify the path to load your site or app. This method will automatically look for an `index.html` file and generate a link that loads the full site or app. 

### updateFileName 

As mentioned previously, you can pass in a custom name for your files, folders, and JSON. You can update that name with this method. 

```js
import { Submarine } from "pinata-submarine";
const submarine = new Submarine("YOUR PINATA API KEY", "YOUR PINATA GATEWAY URL");

const cid = "YOUR CID";
const foundContent = await submarine.getSubmarinedContentByCid(cid);
const item = foundContent.items[0];
const id = item.id;
const res = await submarine.updateFileName(id, "newName");
console.log(res);
```

Response will look like this: 

```json
{
  "status": 200,
  "statusText": "string",
  "totalItems": 0,
  "item": {
    "id": "string",
    "createdAt": "2022-05-20T20:01:26.679Z",
    "cid": "string",
    "name": "string",
    "mimeType": "string",
    "originalname": "string",
    "size": 0,
    "metadata": {},
    "pinToIPFS": false,
    "isDuplicate": false
  }
}
```

### updateFileMetadata

Just like with the Submarined file's name, you can update the Submarined file's metadata. It's important to understand that this is a complete overwrite function. You can't set just one keyvalue for the metadata without passing in the old values that you don't want changed also. 

```js
import { Submarine } from "pinata-submarine";
const submarine = new Submarine("YOUR PINATA API KEY", "YOUR PINATA GATEWAY URL");

const cid = "YOUR CID";
const foundContent = await submarine.getSubmarinedContentByCid(cid);
const item = foundContent.items[0];
const id = item.id;

const newMetadata = {
    new: "value"
  }
const res = await submarine.updateFileMetadata(id, newMetadata);
console.log(res);
```

Response will look like this: 

```json
{
  "status": 200,
  "statusText": "string",
  "totalItems": 0,
  "item": {
    "id": "string",
    "createdAt": "2022-05-20T20:01:26.679Z",
    "cid": "string",
    "name": "string",
    "mimeType": "string",
    "originalname": "string",
    "size": 0,
    "metadata": {},
    "pinToIPFS": false,
    "isDuplicate": false
  }
}
```

### makeFilePublic

If you ever need to move a file from being Submarined onto the public IPFS network, this method will do it for you. Note that this process is not immediate. It is queued, and depending on the size of the file or folder, the process can take a few seconds to a few hours. 

```js
import { Submarine } from "pinata-submarine";
const submarine = new Submarine("YOUR PINATA API KEY", "YOUR PINATA GATEWAY URL");

const cid = "YOUR CID";
const foundContent = await submarine.getSubmarinedContentByCid(cid);
const item = foundContent.items[0];
const id = item.id;

const res = await submarine.makeFilePublic(id);
console.log(res);
```

Response will look like this: 

```json
{
  "status": 200,
  "totalItems": 0,
  "items": [
    {
      "id": "string",
      "createdAt": "2022-05-20T20:01:26.679Z",
      "cid": "string",
      "name": "string",
      "mimeType": "string",
      "originalname": "string",
      "size": 0,
      "metadata": {},
      "pinToIPFS": true,
      "isDuplicate": false
    }
  ]
}
```

### deleteContent

This method will allow you to delete Submarined files. 

```js
import { Submarine } from "pinata-submarine";
const submarine = new Submarine("YOUR PINATA API KEY", "YOUR PINATA GATEWAY URL");

const cid = "YOUR CID";
const foundContent = await submarine.getSubmarinedContentByCid(cid);
const item = foundContent.items[0];
const id = item.id;

const res = await submarine.deleteContent(id);
console.log(res);
```

Response will look like this: 

```json
{ "status": 200 }
```

## getEVMMessageToSign

This method will return a `personal_sign` message that can be used to be signed during an NFT verification flow. 

```js
const message = await submarine.getEVMMessageToSign(
  process.env.BLOCKCHAIN,
  process.env.CONTRACT_ADDRESS
);
```

For the Blockchain argument, the following options are valid: 

* Ethereum
* Avalanche
* Polygon

The Contract Address should represent the address of the contract that minted the NFT you want to verify. 

The response will look like this: 

```json
{
  "session": {
    "id": "string", // uuid
    "contract": "string", // smart contract address
    "shortId": "string" // Only used in the submarine.me app
  }, 
  "message": "string" //  message that the user will sign
}
```

The message will be used in the `personal_sign` method when usings EVM-compatible wallets. 

## verifyEVMNFT

Using the signature that results from signing the message coming from the `getEVMMessageToSign` method, this method can be called to verify whether the signer owns a particular EVM-based NFT. 

```js
const ownsNFT = await submarine.verifyEVMNFT(
  signature,
  address,
  messageId,
  process.env.BLOCKCHAIN,
  process.env.CONTRACT_ADDRESS,
  process.env.NETWORK
);
```

The method expects a signature that results from an ETH wallet's `personal_sign` method and expects that the message signed was generated by the `getEVMMessageToSign` method of this SDK. The method also takes the user's wallet address, the message ID (also generated by the `getEVMMessageToSign` method), the Blockchain name, the NFT smart contract address, and the network (ie. Mainnet). The available blockchains are: 

* Ethereum
* Avalanche
* Polygon

The response will either be true or false indicating whether or not the user owns the NFT in question. 

## Additional Info

### Querying Metadata

Pinata supports the concept of metadata associated with files. Please do not confuse this with NFT metadata. This metadata is a grouping of keyvalue pairs that allow you to more easily find files. 

To query by metadata, you will first need to build your metadata object with keyvalues pairs. Then, you will need to stringify it and add it as an options property within your options object. 

**Example**

```js
import { Submarine } from "pinata-submarine";
const submarine = new Submarine("YOUR PINATA API KEY", "YOUR PINATA GATEWAY URL");

const metadata = { 
  customer_name: "Alice", 
  customer_type: "Free"
}

const options = {
  metadata: JSON.stringify(metadata)
}

const content = await submarine.getSubmarinedContent(options)
console.log(content);
```
