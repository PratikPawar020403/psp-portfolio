export interface LogoItem {
  name: string;
  icon: string;
}

export interface CircularOrbitProps {
  creatorSkills: LogoItem[];
  builderSkills: LogoItem[];
}

export interface OrbitDimensions {
  containerWidth: number;
  curveDepth: number;
  logoSize: number;
}
