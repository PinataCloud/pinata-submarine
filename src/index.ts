import { GetSubmarinedContentOptions, PinataSubmarineInit, SubmarinedItem } from './types';
import FormData from 'form-data';
import fs from 'fs';
import PathLike = fs.PathLike;
import axios from 'axios';

const rfs = require("recursive-fs");
const path = require("path");
const url = `https://managed.mypinata.cloud/api/v1`;
const nftVerifyUrl = process.env.NODE_ENV === 'production' ? 'https://app.submarine.me/api' : 'http://localhost:3001/api'

const EVMChains = ["Ethereum", "Polygon", "Avalanche"];

const getFromAPI = async (endpoint: String, key: any) => {
  try {
    const response = await axios.get(`${url}/${endpoint}`, {
      headers: {
        "Content-Type": `application/json`,
        "x-api-key": key,
      },
    })
    return response.data;
  } catch (error) {
    throw error;
  }
}

const postToAPI = async (endpoint: String, data: any, key: any) => {
  let response;
  if (typeof data !== 'object') {
    response = await axios.post(`${url}/${endpoint}`, data, {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data.getBoundary()}`,
        "x-api-key": key,
      },
    })
  } else {
    response = await axios.post(`${url}/${endpoint}`, data, {
      headers: {
        "Content-Type": `application/json`,
        "x-api-key": key,
      },
    })
  }

  return response.data;
}

const deleteFromAPI = async (endpoint: String, key: any) => {
  const response = await axios.delete(`${url}/${endpoint}`, {
    headers: {
      "Content-Type": `application/json`,
      "x-api-key": key,
    }
  })

  return response.data;
}

const putToAPI = async (endpoint: String, data: any, key: any) => {
  let response;

  if (typeof data !== 'object') {
    response = await axios.put(`${url}/${endpoint}`, data, {
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data.getBoundary()}`,
        "x-api-key": key,
      },
    })
  } else {
    response = await axios.put(`${url}/${endpoint}`, data, {
      headers: {
        "Content-Type": `application/json`,
        "x-api-key": key,
      },
    })
  }

  return response.data;
}

const isDirectory = async (filepath: PathLike) => {
  const stats = fs.statSync(filepath);
  if (stats.isDirectory()) {
    return true;
  }
  return false;
}

export class Submarine {
  submarineKey: String
  gatewayUrl: String

  constructor(submarineApiKey: String, gatewayUrl: String) {
    this.submarineKey = submarineApiKey;
    this.gatewayUrl = gatewayUrl;
  }

  async getSubmarinedContentByCid(submarinedCid: String) {
    const response = await getFromAPI(`content?cidContains=${submarinedCid}`, this.submarineKey);
    return response;
  }

  async getSubmarinedContent(options: GetSubmarinedContentOptions) {
    try {
      if (!this.submarineKey) {
        throw "No Submarine key provided"
      }

      let queryString = `content?`;

      if (options.limit) {
        queryString = queryString + `limit=${options.limit}&`;
      }

      if (options.offset) {
        queryString = queryString + `offset=${options.offset}&`;
      }

      if (options.name) {
        queryString = queryString + `name=${options.name}&`;
      }

      if (options.originalName) {
        queryString = queryString + `originalname=${options.originalName}&`;
      }

      if (options.submarinedCid) {
        queryString = queryString + `cidContains=${options.submarinedCid}&`;
      }

      if (options.createdAtStart) {
        queryString = queryString + `createdAtStart=${options.createdAtStart}&`;
      }

      if (options.createdAtEnd) {
        queryString = queryString + `createdAtEnd=${options.createdAtEnd}&`;
      }

      if (options.fileSizeMaximum) {
        queryString = queryString + `pinSizeMax=${options.fileSizeMaximum}&`;
      }

      if (options.fileSizeMinimum) {
        queryString = queryString + `pinSizeMin=${options.fileSizeMinimum}&`;
      }

      if (options.order) {
        queryString = queryString + `order=${options.order}&`;
      }

      if (options.metadata) {
        queryString = queryString + `metadata[keyvalues]=${options.metadata}`
      }

      const { items } = await getFromAPI(queryString, this.submarineKey);

      return items;
    } catch (error) {
      throw error
    }
  }

  async listFolderContent(itemId: String, offset: String = "0") {
    const listData = await getFromAPI(`content/${itemId}/list?includePaths=true&limit=10&offset=${offset}`, this.submarineKey);
    const { items: directoryItems } = listData;
    const indexHtml = directoryItems.filter((i: SubmarinedItem) => i.originalname.includes("index.html"));
    const hasIndexHtml = indexHtml.length > 0;
    const childContent = directoryItems;
    return {
      childContent,
      hasIndexHtml
    };
  }

  async generateAccessLink(timeoutSeconds: Number, contentId: string, submarinedCid: String, filepath?: String) {
    const body = {
      timeoutSeconds,
      contentIds: [contentId],
    };
    const tokenRes = await postToAPI('auth/content/jwt', body, this.submarineKey);

    if (filepath) {
      return `${this.gatewayUrl}/ipfs/${submarinedCid}/${filepath}?accessToken=${tokenRes}`;
    }

    const folderCheck = await this.listFolderContent(contentId);

    if (folderCheck.hasIndexHtml) {
      return `${this.gatewayUrl}/ipfs/${submarinedCid}/index.html?accessToken=${tokenRes}`;
    }
    return `${this.gatewayUrl}/ipfs/${submarinedCid}?accessToken=${tokenRes}`;
  }

  async uploadFileOrFolder(filepath: PathLike, name?: String, metadata?: any, cidVersion?: Number) {
    try {
      let data = new FormData();

      const directory = await isDirectory(filepath);

      if (directory) {
        const { files } = await rfs.read(filepath);

        for (const file of files) {
          const content = fs.readFileSync(file);
          data.append(`files`, content, {
            filepath: path.join(filepath, path.relative(filepath, file)),
          });
        }

      } else {
        data.append("files", fs.createReadStream(filepath));
      }

      data.append("cidVersion", cidVersion && (cidVersion === 1 || cidVersion === 0) ? cidVersion.toString() : "0");
      data.append("pinToIPFS", "false");
      data.append("wrapWithDirectory", "false");
      if (name) {
        data.append("name", name);
      }

      if (metadata) {
        data.append("metadata", JSON.stringify(metadata));
      }

      const response = await postToAPI("content", data, this.submarineKey);

      return response;
    } catch (error) {
      throw error;
    }
  }

  async uploadJson(content: any, name: string, cidVersion?: Number, metadata?: any) {
    const body = {
      content: JSON.stringify(content),
      name,
      pinToIPFS: false,
      metadata: metadata ? JSON.stringify(metadata) : "{}",
      cidVersion: cidVersion && (cidVersion === 1 || cidVersion === 0) ? cidVersion.toString() : 0
    }

    return await postToAPI("content/json", body, this.submarineKey);
  }

  async updateFileName(contentId: String, name: String) {
    const body = {
      name,
      pinToIPFS: false
    }

    return await putToAPI(`content/${contentId}`, body, this.submarineKey);
  }

  async updateFileMetadata(contentId: String, metadata: any) {
    return await putToAPI(`content/${contentId}/metadata`, metadata, this.submarineKey);
  }

  async makeFilePublic(contentId: String) {
    const body = {
      pinToIPFS: true
    }

    return await putToAPI(`content/${contentId}`, body, this.submarineKey);
  }

  async deleteContent(contentId: String) {
    return await deleteFromAPI(`content/${contentId}`, this.submarineKey);
  }

  async verifyEVMNFT(signature: string, address: string, messageId: string, blockchain: string, contractAddress: string, network: string, tokenId?: string) {
    if (EVMChains.includes(blockchain)) {
      console.log({ messageId });
      const response = await axios.post(`${nftVerifyUrl}/verify`, {
        contractAddress: contractAddress,
        network,
        signature,
        blockchain,
        messageId,
        address,
        tokenId: tokenId
      });
      if (response.data === true) {
        return true;
      } else {
        return false;
      }
    } else {
      throw "Non EVM chain submitted"
    }
  }

  async getEVMMessageToSign(blockchain: string, contractAddress: string) {
    if (EVMChains.includes(blockchain)) {
      const response = await axios.get(`${nftVerifyUrl}/verify?contract=${contractAddress}`);
      return response.data;
    } else if (blockchain === "Solana") {
      const response = await axios.get(`${nftVerifyUrl}/verifySol?updateAuthority=${contractAddress}`);
      return response.data;
    }
  }
}
