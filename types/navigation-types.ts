export interface NavLinkProps {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}

export interface HireMeButtonProps {
  onClick?: () => void;
  full?: boolean;
}
