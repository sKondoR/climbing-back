export interface IRouteImg {
  id: string;
  url: string;
  imgUrl: string;
  imageData?: Buffer;
}

export interface IRouteImgError {
  id: string;
  error: string;
}

export interface ISearchRoute {
  name: string;
  region: string;
}