type SubmarinedItem = {
  id: String
  createdAt: String
  cid: String
  name: String
  mimeType: String
  originalname: String
  size: Number
  metadata: any
  pinToIPFS: Boolean
  isDuplicate: Boolean
}

type PinataSubmarineInit = {
  submarineApiKey: String
  gatewayUrl: String
}

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

export {
  SubmarinedItem,
  PinataSubmarineInit,
  GetSubmarinedContentOptions
}