export interface TextRegion {
  id: string;
  type: "heading" | "subheading" | "body" | "bullet" | "caption";
  placeholder: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  textAlign: "left" | "center" | "right";
  lineHeight: number;
}

export interface ImageRegion {
  id: string;
  type: "background" | "logo" | "chart" | "decoration";
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  locked?: boolean;
}

export interface CanvasTemplate {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  backgroundColor: string;
  textRegions: TextRegion[];
  imageRegions: ImageRegion[];
  thumbnail?: string;
}

export interface AIContent {
  [key: string]: string;
}
