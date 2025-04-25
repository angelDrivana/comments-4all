export interface ElementDescriptor {
  tagName: string;
  id: string;
  className: string;
}

export interface ScreenInfo {
  screenSize: {
    x: number;
    y: number;
  };
  scrollPosition: number;
}

export interface OriginalElementInfo {
  originalTagName: string;
  originalId: string;
  originalClassName: string;
}

export interface BoundElement {
  xPath: string;
  fullXPath: string;
  elementDescriptor: ElementDescriptor;
  percentagePositionInRect: {
    x: number;
    y: number;
  };
  positionInRect: {
    x: number;
    y: number;
  };
  position: {
    x: number;
    y: number;
  };
  screenInfo: ScreenInfo;
  _id?: string;
  dimensions: {
    width: number;
    height: number;
  };
  originalElement?: OriginalElementInfo | null;
}

export interface Comment {
  id?: string;
  userId: string;
  user?: {
    username: string;
    profile_photo?: string;
  };
  comment: string;
  created_at?: string;
  coordinates: [number, number];
  web_title: string;
  current_location: string;
  boundElement: BoundElement;
  pathname?: string;
}

export interface PageInfo {
  url: string;
  title: string;
} 